import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml } from '../utils/files.js';
import { error, info } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface ScoredLecture {
  course: string;
  courseTitle: string;
  lecture: CourseConfig['lectures'][0];
  score: number;
  reasons: string[];
}

/**
 * Register the `learn next` command.
 *
 * Recommend the next lecture to watch based on:
 * - Unwatched lectures with processed notes (ready to watch)
 * - Course balance (don't fall too far behind in any course)
 * - Revisit flags (prioritize shaky material)
 * - Sequential ordering (prerequisite assumption)
 */
export function nextCommand(program: Command): void {
  program
    .command('next')
    .description('Suggest the next lecture to watch')
    .option('--focus <topic>', 'Prioritize a specific topic')
    .option('--count <n>', 'Number of suggestions', '3')
    .action(async (opts: { focus?: string; count: string }) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const count = parseInt(opts.count, 10) || 3;
        const candidates: ScoredLecture[] = [];

        const courseDirs = readdirSync(coursesDir)
          .filter(d => d !== 'synthesis' && !d.startsWith('.'));

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          const totalLectures = courseConfig.lectures.length;
          const watchedCount = courseConfig.lectures.filter(l => l.watched).length;
          const progressPct = totalLectures > 0 ? watchedCount / totalLectures : 0;

          for (const lecture of courseConfig.lectures) {
            // Skip watched lectures (unless flagged for revisit)
            if (lecture.watched && !lecture.revisit) continue;

            let score = 0;
            const reasons: string[] = [];

            // Prioritize revisit-flagged lectures
            if (lecture.revisit) {
              score += 30;
              reasons.push('flagged for revisit');
            }

            // Prioritize low-confidence lectures
            if (lecture.confidence === 'low' || lecture.confidence === 'none') {
              score += 25;
              reasons.push('low confidence — needs review');
            }

            // Prioritize courses where you're falling behind
            if (progressPct < 0.3 && !lecture.watched) {
              score += 20;
              reasons.push(`only ${Math.round(progressPct * 100)}% through this course`);
            }

            // Prioritize lectures with notes ready (processed content)
            if (lecture.status === 'completed') {
              score += 15;
              reasons.push('notes ready');
            } else if (lecture.status === 'partial') {
              score += 10;
              reasons.push('transcript ready');
            } else {
              score += 5;
              reasons.push('not yet processed');
            }

            // Sequential ordering: earlier lectures first
            const lectureNum = parseInt(lecture.id, 10);
            score += Math.max(0, 10 - lectureNum); // First lecture gets +9, second +8, etc.

            // Find the first unwatched lecture in this course (sequential bonus)
            const firstUnwatched = courseConfig.lectures.find(l => !l.watched);
            if (firstUnwatched && firstUnwatched.id === lecture.id) {
              score += 15;
              reasons.push('next in sequence');
            }

            // Topic focus bonus
            if (opts.focus) {
              const focusLower = opts.focus.toLowerCase();
              if (lecture.title.toLowerCase().includes(focusLower)) {
                score += 40;
                reasons.push(`matches focus: "${opts.focus}"`);
              }
            }

            candidates.push({
              course: courseDir,
              courseTitle: courseConfig.title,
              lecture,
              score,
              reasons,
            });
          }
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);
        const top = candidates.slice(0, count);

        if (top.length === 0) {
          info('🎉 All caught up! No lectures need attention.');
          return;
        }

        console.log(chalk.bold('\n🎯 Recommended Next:\n'));

        for (let i = 0; i < top.length; i++) {
          const c = top[i];
          const medal = i === 0 ? '👉' : `  ${i + 1}.`;
          const duration = c.lecture.duration_seconds
            ? chalk.dim(` (${Math.floor(c.lecture.duration_seconds / 60)} min)`)
            : '';

          console.log(`${medal} ${chalk.bold(c.lecture.title)}${duration}`);
          console.log(`   ${chalk.dim(c.course.toUpperCase())} ${c.courseTitle}`);
          console.log(`   ${chalk.dim('Why:')} ${c.reasons.join(', ')}`);
          console.log();
        }
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
