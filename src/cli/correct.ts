import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { loadConfig } from '../utils/config.js';
import { readText, writeText } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';

/**
 * Register the `learn correct` command.
 *
 * Open a transcript for manual correction in the editor.
 * Creates a backup before editing so changes can be diffed.
 */
export function correctCommand(program: Command): void {
  program
    .command('correct <course> <lecture-id>')
    .description('Open a transcript for manual correction (creates backup first)')
    .option('--show-diff', 'Show diff of corrections after editing', false)
    .action(async (courseName: string, lectureId: string, opts: { showDiff: boolean }) => {
      try {
        const config = loadConfig();
        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');

        if (!existsSync(lecturesDir)) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
        }

        const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
        const paddedId = lectureId.padStart(2, '0');
        const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          process.exit(1);
          return;
        }

        const lectureDir = resolve(lecturesDir, matchingDir);
        const transcriptPath = resolve(lectureDir, 'transcript.txt');
        const backupPath = resolve(lectureDir, 'transcript.txt.bak');

        if (!existsSync(transcriptPath)) {
          error('No transcript found. Process the lecture first.');
          process.exit(1);
          return;
        }

        // Create backup if one doesn't exist
        if (!existsSync(backupPath)) {
          const original = readText(transcriptPath)!;
          writeText(backupPath, original);
          info(`Backup created: transcript.txt.bak`);
        }

        // Open in editor
        info(`Opening transcript in ${config.editor}...`);
        info('Tip: fix technical terms (CUDA, GPT-4, etc.) and speaker names');
        try {
          execSync(`${config.editor} "${transcriptPath}"`, { stdio: 'inherit' });
        } catch {
          warn(`Could not open editor. Edit directly: ${transcriptPath}`);
          return;
        }

        // Show diff if requested
        if (opts.showDiff) {
          info('\nChanges made:');
          try {
            const diff = execSync(
              `diff "${backupPath}" "${transcriptPath}" || true`,
              { encoding: 'utf-8' }
            );
            if (diff.trim()) {
              console.log(diff);
            } else {
              info('No changes detected.');
            }
          } catch {
            warn('Could not generate diff.');
          }
        }

        success('Transcript updated. Run `learn process --force` to regenerate notes from the corrected transcript.');
      } catch (e) {
        error(`Correction failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
