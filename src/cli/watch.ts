import { Command } from 'commander';
import { resolve } from 'path';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';
import type { CourseConfig, ConfidenceLevel } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn watch` command.
 *
 * Mark a lecture as watched with optional confidence level and notes.
 * This tracks the LEARNER's state, separate from pipeline processing status.
 */
export function watchCommand(program: Command): void {
  program
    .command('watch <course> <lecture-id>')
    .description('Mark a lecture as watched with optional confidence level')
    .option('--confidence <level>', 'Your understanding level: none, low, medium, high')
    .option('--revisit', 'Flag this lecture for later review', false)
    .option('--note <text>', 'Add a personal note about this lecture')
    .option('--unwatch', 'Mark as not watched', false)
    .action(async (courseName: string, lectureId: string, opts: {
      confidence?: string;
      revisit: boolean;
      note?: string;
      unwatch: boolean;
    }) => {
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
        const lecture = courseConfig.lectures.find(l => l.id === paddedId);

        if (!lecture) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          process.exit(1);
          return;
        }

        if (opts.unwatch) {
          lecture.watched = false;
          lecture.watched_date = undefined;
          writeYaml(courseYamlPath, courseConfig);
          success(`Unmarked: ${lecture.title}`);
          return;
        }

        // Mark as watched
        lecture.watched = true;
        lecture.watched_date = new Date().toISOString().split('T')[0];

        // Set confidence if provided
        if (opts.confidence) {
          const valid: ConfidenceLevel[] = ['none', 'low', 'medium', 'high'];
          if (!valid.includes(opts.confidence as ConfidenceLevel)) {
            error(`Invalid confidence level: "${opts.confidence}". Use: none, low, medium, high`);
            process.exit(1);
            return;
          }
          lecture.confidence = opts.confidence as ConfidenceLevel;
        } else if (!lecture.confidence) {
          lecture.confidence = 'medium'; // Default confidence
        }

        // Set revisit flag
        if (opts.revisit) {
          lecture.revisit = true;
        }

        // Append personal note
        if (opts.note) {
          lecture.personal_notes = lecture.personal_notes
            ? lecture.personal_notes + '\n' + opts.note
            : opts.note;
        }

        writeYaml(courseYamlPath, courseConfig);

        const confIcon = confidenceIcon(lecture.confidence ?? 'medium');
        success(`Watched: ${lecture.title} ${confIcon}`);
        if (opts.revisit) info('Flagged for review');
        if (opts.note) info(`Note: ${opts.note}`);
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Register the `learn review` command.
 *
 * Show lectures flagged for review or with low confidence.
 */
export function reviewCommand(program: Command): void {
  program
    .command('review')
    .description('Show lectures that need review (low confidence or flagged)')
    .option('--course <name>', 'Limit to a specific course')
    .action(async (opts: { course?: string }) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');
        const { readdirSync, existsSync } = await import('fs');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const courseDirs = opts.course
          ? [opts.course]
          : readdirSync(coursesDir).filter(d => !d.startsWith('.'));

        let totalReview = 0;

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          const needsReview = courseConfig.lectures.filter(l =>
            l.revisit ||
            l.confidence === 'low' ||
            l.confidence === 'none' ||
            (l.watched && !l.confidence)
          );

          if (needsReview.length === 0) continue;

          console.log(chalk.bold(`\n${courseConfig.name.toUpperCase()} ${courseConfig.title}`));

          for (const lecture of needsReview) {
            const confIcon = confidenceIcon(lecture.confidence ?? 'none');
            const revisitTag = lecture.revisit ? chalk.red(' [REVISIT]') : '';
            const noteSnippet = lecture.personal_notes
              ? chalk.dim(` — "${lecture.personal_notes.split('\n')[0].substring(0, 50)}"`)
              : '';
            console.log(`  ${confIcon} ${lecture.id} ${lecture.title}${revisitTag}${noteSnippet}`);
            totalReview++;
          }
        }

        if (totalReview === 0) {
          info('No lectures need review. 🎉');
        } else {
          console.log();
          info(`${totalReview} lecture(s) need review`);
        }
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Register the `learn progress` command.
 *
 * Show a dashboard of watched/total per course.
 */
export function progressCommand(program: Command): void {
  program
    .command('progress')
    .description('Show learning progress across all courses')
    .action(async () => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');
        const { readdirSync, existsSync } = await import('fs');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const courseDirs = readdirSync(coursesDir)
          .filter(d => existsSync(resolve(coursesDir, d, 'course.yaml')));

        let totalWatched = 0;
        let totalLectures = 0;

        console.log(chalk.bold('\n📊 Learning Progress\n'));

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          const total = courseConfig.lectures.length;
          const watched = courseConfig.lectures.filter(l => l.watched).length;
          const highConf = courseConfig.lectures.filter(l => l.confidence === 'high').length;
          const lowConf = courseConfig.lectures.filter(l =>
            l.confidence === 'low' || l.confidence === 'none'
          ).length;
          const toRevisit = courseConfig.lectures.filter(l => l.revisit).length;

          totalWatched += watched;
          totalLectures += total;

          const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
          const bar = progressBar(pct, 20);

          console.log(`  ${chalk.bold(courseConfig.name.toUpperCase())} ${courseConfig.title}`);
          console.log(`  ${bar} ${watched}/${total} watched (${pct}%)`);

          const details: string[] = [];
          if (highConf > 0) details.push(chalk.green(`${highConf} confident`));
          if (lowConf > 0) details.push(chalk.yellow(`${lowConf} shaky`));
          if (toRevisit > 0) details.push(chalk.red(`${toRevisit} to revisit`));
          if (details.length > 0) {
            console.log(`  ${details.join(' | ')}`);
          }
          console.log();
        }

        const overallPct = totalLectures > 0
          ? Math.round((totalWatched / totalLectures) * 100) : 0;
        console.log(chalk.bold(`Overall: ${totalWatched}/${totalLectures} lectures watched (${overallPct}%)`));
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Render a text progress bar.
 */
function progressBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
}

/**
 * Get an icon for a confidence level.
 */
function confidenceIcon(level: ConfidenceLevel): string {
  switch (level) {
    case 'high': return chalk.green('🟢');
    case 'medium': return chalk.yellow('🟡');
    case 'low': return chalk.red('🟠');
    case 'none': return chalk.red('🔴');
    default: return chalk.dim('⚪');
  }
}
