import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readText } from '../utils/files.js';
import { error, info } from '../utils/logger.js';

/**
 * Register the `learn notes` command.
 *
 * Display generated notes for a specific lecture.
 */
export function notesCommand(program: Command): void {
  program
    .command('notes <course> [lecture-id]')
    .description('View notes for a course lecture')
    .action(async (courseName: string, lectureId?: string) => {
      try {
        const config = loadConfig();
        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');

        if (!existsSync(lecturesDir)) {
          error(`Course "${courseName}" not found or has no lectures.`);
          process.exit(1);
        }

        const lectureDirs = readdirSync(lecturesDir)
          .filter(d => !d.startsWith('.'))
          .sort();

        if (lectureDirs.length === 0) {
          info('No lectures processed yet. Run `learn process` or `learn ingest` first.');
          return;
        }

        if (!lectureId) {
          // List available lectures
          info(`Available lectures for ${courseName}:`);
          for (const dir of lectureDirs) {
            const notesPath = resolve(lecturesDir, dir, 'notes.md');
            const hasNotes = existsSync(notesPath);
            console.log(`  ${hasNotes ? '📝' : '⏳'} ${dir}`);
          }
          info('\nRun `learn notes ' + courseName + ' <id>` to view notes.');
          return;
        }

        // Find the lecture directory matching the ID
        const paddedId = lectureId.padStart(2, '0');
        const matchingDir = lectureDirs.find(d => d.startsWith(paddedId + '-'));

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          info('Available lectures:');
          for (const dir of lectureDirs) {
            console.log(`  ${dir}`);
          }
          process.exit(1);
        }

        const notesPath = resolve(lecturesDir, matchingDir, 'notes.md');
        const notes = readText(notesPath);

        if (!notes) {
          error(`Notes not yet generated for lecture ${lectureId}. Run \`learn process\` first.`);
          process.exit(1);
        }

        // Output the notes
        console.log(notes);
      } catch (e) {
        error(`Failed to read notes: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // Also register `learn transcript`
  program
    .command('transcript <course> <lecture-id>')
    .description('View raw transcript for a course lecture')
    .action(async (courseName: string, lectureId: string) => {
      try {
        const config = loadConfig();
        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
        const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
        const paddedId = lectureId.padStart(2, '0');
        const matchingDir = lectureDirs.find(d => d.startsWith(paddedId + '-'));

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          process.exit(1);
        }

        const transcriptPath = resolve(lecturesDir, matchingDir, 'transcript.txt');
        const transcript = readText(transcriptPath);

        if (!transcript) {
          error(`Transcript not yet generated for lecture ${lectureId}.`);
          process.exit(1);
        }

        console.log(transcript);
      } catch (e) {
        error(`Failed to read transcript: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
