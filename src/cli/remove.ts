import { Command } from 'commander';
import { resolve } from 'path';
import { rmSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';

/**
 * Register the `learn remove` command.
 *
 * Remove a lecture from a course (YAML entry + files on disk).
 */
export function removeCommand(program: Command): void {
  program
    .command('remove <course> <lecture-id>')
    .description('Remove a lecture from a course')
    .option('--keep-files', 'Remove from YAML but keep files on disk', false)
    .action(async (courseName: string, lectureId: string, opts: { keepFiles: boolean }) => {
      try {
        const config = loadConfig();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseConfig>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
          return;
        }

        const paddedId = lectureId.padStart(2, '0');
        const lectureIndex = courseConfig.lectures.findIndex(l => l.id === paddedId);

        if (lectureIndex === -1) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          process.exit(1);
          return;
        }

        const lecture = courseConfig.lectures[lectureIndex];
        const title = lecture.title;

        // Remove from YAML
        courseConfig.lectures.splice(lectureIndex, 1);
        writeYaml(courseYamlPath, courseConfig);

        // Remove files from disk
        if (!opts.keepFiles) {
          const { readdirSync, existsSync } = await import('fs');
          const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
          if (existsSync(lecturesDir)) {
            const matchingDirs = readdirSync(lecturesDir).filter(d =>
              d.split('-')[0] === paddedId
            );
            for (const dir of matchingDirs) {
              rmSync(resolve(lecturesDir, dir), { recursive: true });
              info(`Deleted: ${dir}`);
            }
          }
        }

        success(`Removed lecture ${paddedId}: ${title}`);
        if (opts.keepFiles) info('Files kept on disk (use without --keep-files to delete)');
      } catch (e) {
        error(`Remove failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
