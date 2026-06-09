import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { loadConfig, defaultModel, type LLMProvider } from '../utils/config.js';
import { readYaml, writeYaml, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, step, warn } from '../utils/logger.js';
import { analyzeLecture } from '../pipeline/analyze.js';
import { analyzeLectureGemini } from '../pipeline/analyze-gemini.js';
import { parseVTT } from '../pipeline/fallback.js';
import { slugify } from '../pipeline/playlist.js';
import type { CourseConfig, TranscriptSegment, AnalysisResult } from '../types.js';

/**
 * Register the `learn import` command.
 *
 * Import a pre-existing transcript file (SRT, VTT, or plain text)
 * and run it through the analysis pipeline. No YouTube URL needed.
 * Unlocks non-YouTube content: Coursera, edX, conference talks, etc.
 */
export function importCommand(program: Command): void {
  program
    .command('import <transcript-file>')
    .description('Import an external transcript file (SRT, VTT, or TXT) and generate notes')
    .requiredOption('--course <name>', 'Course to add this lecture to')
    .requiredOption('--title <title>', 'Lecture title')
    .option('--id <id>', 'Lecture ID (auto-assigned if omitted)')
    .option('--transcribe-only', 'Just import the transcript, skip note generation', false)
    .option('--provider <provider>', 'LLM provider: claude, gemini, or none')
    .action(async (transcriptFile: string, opts: {
      course: string;
      title: string;
      id?: string;
      transcribeOnly: boolean;
      provider?: string;
    }) => {
      try {
        const config = loadConfig();
        const filePath = resolve(transcriptFile);

        if (!existsSync(filePath)) {
          error(`File not found: ${filePath}`);
          process.exit(1);
        }

        // Determine provider
        const provider: LLMProvider = opts.transcribeOnly
          ? 'none'
          : (opts.provider as LLMProvider | undefined) ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider)
          : config.model;

        if (provider === 'claude' && !config.anthropicApiKey) {
          error('Claude selected but ANTHROPIC_API_KEY not set.');
          process.exit(1);
        }
        if (provider === 'gemini' && !config.geminiApiKey) {
          error('Gemini selected but GEMINI_API_KEY not set.');
          process.exit(1);
        }

        // Load or create course config
        const courseName = opts.course.toLowerCase();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseConfig>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found. Run \`learn add\` first.`);
          process.exit(1);
          return;
        }

        // Determine lecture ID
        const lectureId = opts.id
          ? opts.id.padStart(2, '0')
          : String(courseConfig.lectures.length + 1).padStart(2, '0');

        // Check for existing lecture with same ID
        if (courseConfig.lectures.find(l => l.id === lectureId)) {
          error(`Lecture ${lectureId} already exists in ${courseName}. Use a different --id.`);
          process.exit(1);
          return;
        }

        const totalSteps = provider === 'none' ? 3 : 4;

        // Step 1: Parse the transcript file
        step(1, totalSteps, 'Parsing transcript file...');
        const rawContent = readFileSync(filePath, 'utf-8');
        const ext = filePath.toLowerCase().split('.').pop();
        let segments: TranscriptSegment[];

        if (ext === 'vtt') {
          segments = parseVTT(rawContent);
          info(`Parsed VTT: ${segments.length} segments`);
        } else if (ext === 'srt') {
          segments = parseSRT(rawContent);
          info(`Parsed SRT: ${segments.length} segments`);
        } else {
          // Plain text — try to detect timestamps, otherwise treat as unformatted
          segments = parsePlainText(rawContent);
          info(`Parsed text: ${segments.length} segments`);
        }

        if (segments.length === 0) {
          error('No content found in transcript file.');
          process.exit(1);
          return;
        }

        // Step 2: Normalize and write transcript
        step(2, totalSteps, 'Writing transcript...');
        const titleSlug = slugify(opts.title);
        const lectureDir = resolve(
          config.projectRoot, 'courses', courseName, 'lectures',
          `${lectureId}-${titleSlug}`
        );
        ensureDir(lectureDir);

        const transcriptText = segments
          .map(seg => `[${seg.timestamp}] ${seg.text}`)
          .join('\n') + '\n';
        writeText(resolve(lectureDir, 'transcript.txt'), transcriptText);

        // Step 3: Analyze (if not transcribe-only)
        let analysis: AnalysisResult | null = null;
        if (provider !== 'none') {
          const providerLabel = provider === 'claude' ? 'Claude' : 'Gemini';
          step(3, totalSteps, `Analyzing with ${providerLabel}...`);

          const analyzeConfig = { ...config, model: effectiveModel };
          if (provider === 'gemini') {
            analysis = await analyzeLectureGemini(
              segments, opts.title, courseConfig.name, courseConfig.title,
              config.projectRoot, analyzeConfig
            );
          } else {
            analysis = await analyzeLecture(
              segments, opts.title, courseConfig.name, courseConfig.title,
              config.projectRoot, analyzeConfig
            );
          }

          if (analysis) {
            writeText(resolve(lectureDir, 'notes.md'), analysis.notes);
            writeYaml(resolve(lectureDir, 'concepts.yaml'), { concepts: analysis.concepts });
          }
        }

        // Step 4: Update course.yaml
        step(totalSteps, totalSteps, 'Updating course config...');
        courseConfig.lectures.push({
          id: lectureId,
          title: opts.title,
          video_id: '',  // No video for imported transcripts
          status: analysis ? 'completed' : 'partial',
          transcript_source: 'manual',
        });
        writeYaml(courseYamlPath, courseConfig);

        success(`Imported: ${opts.title}`);
        info(`Transcript: ${resolve(lectureDir, 'transcript.txt')}`);
        if (analysis) {
          info(`Notes: ${resolve(lectureDir, 'notes.md')}`);
          info(`Concepts: ${analysis.concepts.length} extracted`);
        }
      } catch (e) {
        error(`Import failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Parse an SRT subtitle file into transcript segments.
 */
function parseSRT(content: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    // Line 1: sequence number (skip)
    // Line 2: timestamp range "00:01:23,456 --> 00:01:25,789"
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}),\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}/);
    if (!timeMatch) continue;

    const timestamp = timeMatch[1];
    // Lines 3+: text content
    const text = lines.slice(2).join(' ').replace(/<[^>]+>/g, '').trim();

    if (text) {
      segments.push({
        timestamp: formatTimestamp(timestamp),
        text,
      });
    }
  }

  return segments;
}

/**
 * Parse plain text, detecting optional timestamps.
 */
function parsePlainText(content: string): TranscriptSegment[] {
  const lines = content.split('\n').filter(l => l.trim());
  const segments: TranscriptSegment[] = [];

  for (const line of lines) {
    // Try to match [HH:MM:SS] or [MM:SS] prefix
    const match = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.+)/);
    if (match) {
      segments.push({ timestamp: match[1], text: match[2].trim() });
    } else {
      // No timestamp — assign 00:00 and accumulate
      segments.push({ timestamp: '00:00', text: line.trim() });
    }
  }

  return segments;
}

/**
 * Format a timestamp, stripping leading 00: hours.
 */
function formatTimestamp(ts: string): string {
  if (ts.startsWith('00:')) return ts.slice(3);
  return ts;
}
