import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { loadConfig } from '../utils/config.js';
import { readText, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';

/**
 * Register the `learn annotate` command.
 *
 * Open or create a personal annotations file for a lecture.
 * This file is NEVER overwritten by the pipeline — it's the learner's space.
 */
export function annotateCommand(program: Command): void {
  program
    .command('annotate <course> <lecture-id>')
    .description('Open personal annotations for a lecture (preserved across reprocessing)')
    .action(async (courseName: string, lectureId: string) => {
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
        const annotationsPath = resolve(lectureDir, 'annotations.md');

        // Create template if file doesn't exist
        if (!existsSync(annotationsPath)) {
          const template = `# Personal Notes — ${matchingDir}

## My Takeaways


## Questions I Have


## Connections I See


## Things to Revisit

`;
          writeText(annotationsPath, template);
          info(`Created annotations file: ${annotationsPath}`);
        }

        // Open in editor
        info(`Opening annotations in ${config.editor}...`);
        try {
          execSync(`${config.editor} "${annotationsPath}"`, { stdio: 'inherit' });
        } catch {
          warn(`Could not open editor "${config.editor}". File is at: ${annotationsPath}`);
        }
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
