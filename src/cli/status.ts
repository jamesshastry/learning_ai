import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml } from '../utils/files.js';
import { error, info, formatStatus, formatDuration } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn status` command.
 *
 * Show processing status for all courses or a specific course.
 */
export function statusCommand(program: Command): void {
  program
    .command('status [course]')
    .description('Show processing status for courses')
    .action(async (courseName?: string) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (!existsSync(coursesDir)) {
          info('No courses found. Run `learn add` to add a course.');
          return;
        }

        if (courseName) {
          // Show status for a specific course
          const courseYamlPath = resolve(coursesDir, courseName, 'course.yaml');
          const courseConfig = readYaml<CourseConfig>(courseYamlPath);
          if (!courseConfig) {
            error(`Course "${courseName}" not found.`);
            process.exit(1);
          }
          printCourseStatus(courseConfig);
        } else {
          // Show status for all courses
          const courseDirs = readdirSync(coursesDir)
            .filter(d => {
              const yamlPath = resolve(coursesDir, d, 'course.yaml');
              return existsSync(yamlPath);
            })
            .sort();

          if (courseDirs.length === 0) {
            info('No courses found. Run `learn add` to add a course.');
            return;
          }

          for (const dir of courseDirs) {
            const courseConfig = readYaml<CourseConfig>(
              resolve(coursesDir, dir, 'course.yaml')
            );
            if (courseConfig) {
              printCourseStatus(courseConfig);
              console.log(); // Blank line between courses
            }
          }
        }
      } catch (e) {
        error(`Failed to get status: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Print formatted status for a single course.
 */
function printCourseStatus(course: CourseConfig): void {
  const university = course.university ? ` (${course.university})` : '';
  console.log(chalk.bold(`${course.name.toUpperCase()} ${course.title}${university}`));

  const counts = {
    completed: 0,
    partial: 0,
    error: 0,
    pending: 0,
    processing: 0,
  };

  for (const lecture of course.lectures) {
    switch (lecture.status) {
      case 'completed': counts.completed++; break;
      case 'partial': counts.partial++; break;
      case 'error': counts.error++; break;
      case 'pending': counts.pending++; break;
      case 'transcribing':
      case 'analyzing': counts.processing++; break;
    }
  }

  const total = course.lectures.length;
  const parts = [
    `${total} total`,
    counts.completed > 0 ? chalk.green(`${counts.completed} completed`) : null,
    counts.partial > 0 ? chalk.yellow(`${counts.partial} partial`) : null,
    counts.processing > 0 ? chalk.cyan(`${counts.processing} processing`) : null,
    counts.error > 0 ? chalk.red(`${counts.error} error`) : null,
    counts.pending > 0 ? chalk.dim(`${counts.pending} pending`) : null,
  ].filter(Boolean);

  console.log(`  Lectures: ${parts.join(' | ')}`);

  for (const lecture of course.lectures) {
    const status = formatStatus(lecture.status);
    const source = lecture.transcript_source
      ? chalk.dim(` (${lecture.transcript_source})`)
      : '';
    const duration = lecture.duration_seconds
      ? chalk.dim(` ${formatDuration(lecture.duration_seconds)}`)
      : '';
    const errorMsg = lecture.error
      ? chalk.red(` — ${lecture.error}`)
      : '';

    console.log(`  ${status} ${lecture.id} ${lecture.title}${duration}${source}${errorMsg}`);
  }
}
