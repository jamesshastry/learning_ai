import { Command } from 'commander';
import { resolve } from 'path';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface CourseWithSchedule extends CourseConfig {
  schedule?: {
    day?: string;        // e.g., "Tuesday"
    time?: string;       // e.g., "12:00 PM"
    frequency?: string;  // e.g., "weekly"
    next_check?: string; // ISO date for next playlist refresh
  };
}

/**
 * Register the `learn schedule` command.
 *
 * Track course release schedules and check for new lectures.
 */
export function scheduleCommand(program: Command): void {
  program
    .command('schedule <course>')
    .description('Set or view a course release schedule')
    .option('--day <day>', 'Day of week new lectures appear (e.g., Tuesday)')
    .option('--time <time>', 'Time of release (e.g., "12:00 PM")')
    .option('--frequency <freq>', 'Release frequency: weekly, biweekly, daily', 'weekly')
    .option('--clear', 'Remove schedule', false)
    .action(async (courseName: string, opts: {
      day?: string;
      time?: string;
      frequency: string;
      clear: boolean;
    }) => {
      try {
        const config = loadConfig();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseWithSchedule>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
          return;
        }

        if (opts.clear) {
          delete courseConfig.schedule;
          writeYaml(courseYamlPath, courseConfig);
          success(`Schedule cleared for ${courseName}`);
          return;
        }

        if (opts.day || opts.time) {
          courseConfig.schedule = {
            ...(courseConfig.schedule ?? {}),
            ...(opts.day && { day: opts.day }),
            ...(opts.time && { time: opts.time }),
            frequency: opts.frequency,
          };
          writeYaml(courseYamlPath, courseConfig);
          success(`Schedule set: ${opts.day ?? courseConfig.schedule?.day ?? '?'} ${opts.time ?? courseConfig.schedule?.time ?? ''} (${opts.frequency})`);
          return;
        }

        // Display current schedule
        if (courseConfig.schedule) {
          console.log(chalk.bold(`\n📅 Schedule: ${courseConfig.title}\n`));
          console.log(`  Day: ${courseConfig.schedule.day ?? 'not set'}`);
          console.log(`  Time: ${courseConfig.schedule.time ?? 'not set'}`);
          console.log(`  Frequency: ${courseConfig.schedule.frequency ?? 'weekly'}`);
          if (courseConfig.schedule.next_check) {
            console.log(`  Next check: ${courseConfig.schedule.next_check}`);
          }
          console.log();
          info(`Run \`learn refresh ${courseName}\` to check for new lectures now.`);
        } else {
          info(`No schedule set for ${courseName}.`);
          info(`Set one with: learn schedule ${courseName} --day Tuesday --time "12:00 PM"`);
        }
      } catch (e) {
        error(`Schedule failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn due — check all courses for new lectures based on schedules
  program
    .command('due')
    .description('Check which courses might have new lectures based on their schedules')
    .action(async () => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');
        const { existsSync, readdirSync } = await import('fs');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        let anyDue = false;

        console.log(chalk.bold(`\n📅 Schedule Check (${dayName})\n`));

        for (const courseDir of readdirSync(coursesDir).filter(d => !d.startsWith('.'))) {
          const courseConfig = readYaml<CourseWithSchedule>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig?.schedule?.day) continue;

          if (courseConfig.schedule.day.toLowerCase() === dayName.toLowerCase()) {
            console.log(`  🔔 ${chalk.bold(courseConfig.title)} — new lecture expected today!`);
            console.log(`     Run: ${chalk.dim(`learn refresh ${courseDir}`)}`);
            anyDue = true;
          }
        }

        if (!anyDue) {
          info('No courses have new lectures scheduled for today.');
        }
        console.log();
      } catch (e) {
        error(`Due check failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
