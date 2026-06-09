import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml, ensureDir } from '../utils/files.js';
import { success, error, info } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface Reading {
  title: string;
  url?: string;
  type: string;      // paper, slides, textbook, video, link
  lecture_id?: string;
}

interface CourseWithReadings extends CourseConfig {
  readings?: Reading[];
}

/**
 * Register the `learn add-reading` command.
 *
 * Link supplementary materials (papers, slides, URLs) to a course or lecture.
 */
export function addReadingCommand(program: Command): void {
  program
    .command('add-reading <course>')
    .description('Add a reading or resource to a course')
    .requiredOption('--title <title>', 'Title of the reading/resource')
    .option('--url <url>', 'URL of the resource')
    .option('--type <type>', 'Resource type: paper, slides, textbook, video, link', 'link')
    .option('--lecture <id>', 'Associate with a specific lecture')
    .action(async (courseName: string, opts: {
      title: string;
      url?: string;
      type: string;
      lecture?: string;
    }) => {
      try {
        const config = loadConfig();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseWithReadings>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
          return;
        }

        // Initialize readings array if needed
        if (!courseConfig.readings) {
          courseConfig.readings = [];
        }

        const reading: Reading = {
          title: opts.title,
          type: opts.type,
        };
        if (opts.url) reading.url = opts.url;
        if (opts.lecture) reading.lecture_id = opts.lecture.padStart(2, '0');

        courseConfig.readings.push(reading);
        writeYaml(courseYamlPath, courseConfig);

        const lectureNote = opts.lecture ? ` (linked to lecture ${opts.lecture})` : '';
        success(`Added reading: ${opts.title}${lectureNote}`);
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // Also register `learn readings` to list them
  program
    .command('readings [course]')
    .description('List readings and resources for a course')
    .action(async (courseName?: string) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const courseDirs = courseName
          ? [courseName]
          : readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'));

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseWithReadings>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig?.readings?.length) continue;

          console.log(chalk.bold(`\n${courseConfig.name.toUpperCase()} ${courseConfig.title}`));

          for (const reading of courseConfig.readings) {
            const typeIcon = {
              paper: '📄', slides: '📊', textbook: '📚', video: '🎥', link: '🔗',
            }[reading.type] ?? '📎';
            const url = reading.url ? chalk.dim(` — ${reading.url}`) : '';
            const lecture = reading.lecture_id ? chalk.dim(` [Lecture ${reading.lecture_id}]`) : '';
            console.log(`  ${typeIcon} ${reading.title}${lecture}${url}`);
          }
        }
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
