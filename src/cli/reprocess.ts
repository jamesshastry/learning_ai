import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig, defaultModel, type LLMProvider } from '../utils/config.js';
import { readYaml, writeYaml, readText, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, warn, progress } from '../utils/logger.js';
import { analyzeLecture } from '../pipeline/analyze.js';
import { analyzeLectureGemini } from '../pipeline/analyze-gemini.js';
import type { CourseConfig, TranscriptSegment } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn reprocess` command.
 *
 * Reprocess lecture notes (e.g., with a better model or after transcript correction)
 * and show a diff of what changed before overwriting.
 */
export function reprocessCommand(program: Command): void {
  program
    .command('reprocess <course> <lecture-id>')
    .description('Regenerate notes and show diff of changes (after transcript correction or model upgrade)')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .option('--apply', 'Apply changes without prompting', false)
    .option('--dry-run', 'Show diff only, don\'t save', false)
    .action(async (courseName: string, lectureId: string, opts: {
      provider?: string;
      apply: boolean;
      dryRun: boolean;
    }) => {
      try {
        const config = loadConfig();
        const provider = (opts.provider ?? config.llmProvider) as LLMProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider)
          : config.model;

        if (provider === 'none') {
          error('Reprocessing requires an LLM provider.');
          process.exit(1);
        }

        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
        if (!existsSync(lecturesDir)) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
          return;
        }

        const paddedId = lectureId.padStart(2, '0');
        const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
        const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found.`);
          process.exit(1);
          return;
        }

        const lectureDir = resolve(lecturesDir, matchingDir);
        const transcriptPath = resolve(lectureDir, 'transcript.txt');
        const notesPath = resolve(lectureDir, 'notes.md');

        const transcript = readText(transcriptPath);
        if (!transcript) {
          error('No transcript found. Process the lecture first.');
          process.exit(1);
          return;
        }

        const oldNotes = readText(notesPath);

        // Parse transcript back to segments
        const segments: TranscriptSegment[] = transcript
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
            return match
              ? { timestamp: match[1], text: match[2] }
              : { timestamp: '00:00', text: line };
          });

        // Get lecture title from the course config
        const courseConfig = readYaml<CourseConfig>(
          resolve(config.projectRoot, 'courses', courseName, 'course.yaml')
        );
        const lecture = courseConfig?.lectures.find(l => l.id === paddedId);
        const title = lecture?.title ?? matchingDir.replace(/^\d+-/, '').replace(/-/g, ' ');

        // Reprocess
        progress(`Reprocessing with ${provider}...`);
        const analyzeConfig = { ...config, model: effectiveModel };
        const analysis = provider === 'gemini'
          ? await analyzeLectureGemini(
              segments, title, courseConfig?.name ?? courseName,
              courseConfig?.title ?? courseName, config.projectRoot, analyzeConfig,
              lecture?.video_id
            )
          : await analyzeLecture(
              segments, title, courseConfig?.name ?? courseName,
              courseConfig?.title ?? courseName, config.projectRoot, analyzeConfig,
              lecture?.video_id
            );

        if (!analysis.notes) {
          error('Reprocessing produced empty notes.');
          process.exit(1);
          return;
        }

        // Show diff
        if (oldNotes) {
          const diff = generateDiff(oldNotes, analysis.notes);
          if (diff.changes === 0) {
            info('No changes detected — notes are identical.');
            return;
          }

          console.log(chalk.bold(`\n📝 Changes detected: ${diff.changes} section(s) modified\n`));
          console.log(diff.output);

          if (opts.dryRun) {
            info('Dry run — no files changed.');
            return;
          }
        } else {
          info('No existing notes — this is a fresh generation.');
        }

        if (!opts.dryRun) {
          // Save old notes as backup
          if (oldNotes) {
            writeText(resolve(lectureDir, 'notes.md.prev'), oldNotes);
            info('Previous notes saved to notes.md.prev');
          }

          // Write new notes and concepts
          writeText(notesPath, analysis.notes);
          writeYaml(resolve(lectureDir, 'concepts.yaml'), { concepts: analysis.concepts });

          success(`Reprocessed: ${title}`);
          info(`New concepts: ${analysis.concepts.length}`);
        }
      } catch (e) {
        error(`Reprocess failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Generate a simple section-level diff between old and new notes.
 */
function generateDiff(
  oldText: string,
  newText: string
): { output: string; changes: number } {
  const oldSections = splitSections(oldText);
  const newSections = splitSections(newText);

  const lines: string[] = [];
  let changes = 0;

  // Find modified/new sections
  for (const [header, content] of newSections) {
    const oldContent = oldSections.get(header);
    if (oldContent === undefined) {
      lines.push(chalk.green(`+ NEW SECTION: ${header}`));
      lines.push(chalk.green(content.substring(0, 200).split('\n').map(l => `  + ${l}`).join('\n')));
      lines.push('');
      changes++;
    } else if (oldContent.trim() !== content.trim()) {
      lines.push(chalk.yellow(`~ MODIFIED: ${header}`));
      // Show first few lines of difference
      const oldLines = oldContent.trim().split('\n').slice(0, 3);
      const newLines = content.trim().split('\n').slice(0, 3);
      for (const l of oldLines) lines.push(chalk.red(`  - ${l.substring(0, 100)}`));
      for (const l of newLines) lines.push(chalk.green(`  + ${l.substring(0, 100)}`));
      lines.push('');
      changes++;
    }
  }

  // Find removed sections
  for (const [header] of oldSections) {
    if (!newSections.has(header)) {
      lines.push(chalk.red(`- REMOVED: ${header}`));
      changes++;
    }
  }

  return { output: lines.join('\n'), changes };
}

/**
 * Split markdown into sections by ## headers.
 */
function splitSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  const parts = text.split(/^(##\s+.+)$/m);

  let currentHeader = '(preamble)';
  let currentContent = '';

  for (const part of parts) {
    if (part.startsWith('## ')) {
      if (currentContent.trim()) {
        sections.set(currentHeader, currentContent);
      }
      currentHeader = part.trim();
      currentContent = '';
    } else {
      currentContent += part;
    }
  }

  if (currentContent.trim()) {
    sections.set(currentHeader, currentContent);
  }

  return sections;
}
