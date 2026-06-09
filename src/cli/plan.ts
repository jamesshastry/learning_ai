import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml } from '../utils/files.js';
import { error, info, success } from '../utils/logger.js';
import { formatDuration } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface PlanItem {
  type: 'watch' | 'review' | 'quiz';
  course: string;
  lectureId: string;
  title: string;
  duration: number; // minutes
  reason: string;
}

/**
 * Register the `learn plan` command.
 *
 * Build a time-boxed study plan based on available time,
 * current progress, and learning priorities.
 */
export function planCommand(program: Command): void {
  program
    .command('plan')
    .description('Build a study plan for a time-boxed session')
    .requiredOption('--hours <n>', 'Available study time in hours')
    .option('--focus <topic>', 'Focus on a specific topic')
    .option('--course <name>', 'Limit to a specific course')
    .action(async (opts: { hours: string; focus?: string; course?: string }) => {
      try {
        const config = loadConfig();
        const availableMinutes = Math.round(parseFloat(opts.hours) * 60);

        if (isNaN(availableMinutes) || availableMinutes <= 0) {
          error('Please specify valid study time (e.g., --hours 2)');
          process.exit(1);
        }

        const coursesDir = resolve(config.projectRoot, 'courses');
        if (!existsSync(coursesDir)) {
          error('No courses found.');
          process.exit(1);
        }

        const courseDirs = opts.course
          ? [opts.course]
          : readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'));

        const items: PlanItem[] = [];
        const focusLower = opts.focus?.toLowerCase();

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          for (const lecture of courseConfig.lectures) {
            // Topic filter
            if (focusLower && !lecture.title.toLowerCase().includes(focusLower)) {
              continue;
            }

            const lectureMins = lecture.duration_seconds
              ? Math.ceil(lecture.duration_seconds / 60)
              : 60; // Assume 60 min if unknown

            // Priority 1: Revisit-flagged lectures (review, ~15 min)
            if (lecture.revisit && lecture.watched) {
              items.push({
                type: 'review',
                course: courseDir,
                lectureId: lecture.id,
                title: lecture.title,
                duration: Math.min(15, lectureMins),
                reason: 'Flagged for revisit',
              });
            }

            // Priority 2: Low-confidence lectures (review, ~20 min)
            if (lecture.watched && (lecture.confidence === 'low' || lecture.confidence === 'none')) {
              items.push({
                type: 'review',
                course: courseDir,
                lectureId: lecture.id,
                title: lecture.title,
                duration: 20,
                reason: `Low confidence — needs review`,
              });
            }

            // Priority 3: Unwatched lectures with notes ready
            if (!lecture.watched && lecture.status === 'completed') {
              items.push({
                type: 'watch',
                course: courseDir,
                lectureId: lecture.id,
                title: lecture.title,
                duration: lectureMins,
                reason: 'Notes ready — watch and learn',
              });
            }

            // Priority 4: Unwatched lectures without notes (use TL;DR)
            if (!lecture.watched && lecture.status === 'partial') {
              items.push({
                type: 'watch',
                course: courseDir,
                lectureId: lecture.id,
                title: lecture.title,
                duration: lectureMins,
                reason: 'Transcript available',
              });
            }
          }
        }

        // Sort: reviews first (quick wins), then watches by course diversity
        items.sort((a, b) => {
          const typeOrder = { review: 0, quiz: 1, watch: 2 };
          return (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
        });

        // Build the plan within time budget
        let usedMinutes = 0;
        const plan: PlanItem[] = [];
        const usedCourses = new Set<string>();

        // First pass: reviews (quick, high value)
        for (const item of items) {
          if (item.type !== 'review') continue;
          if (usedMinutes + item.duration > availableMinutes) continue;
          plan.push(item);
          usedMinutes += item.duration;
        }

        // Second pass: watches (balance across courses)
        for (const item of items) {
          if (item.type !== 'watch') continue;
          if (usedMinutes + item.duration > availableMinutes) continue;

          // Prefer courses not yet in the plan for diversity
          if (usedCourses.has(item.course) && items.some(i =>
            i.type === 'watch' && !usedCourses.has(i.course) &&
            usedMinutes + i.duration <= availableMinutes
          )) {
            continue; // Skip — another course needs attention
          }

          plan.push(item);
          usedMinutes += item.duration;
          usedCourses.add(item.course);
        }

        // Fill remaining time with more watches from any course
        for (const item of items) {
          if (item.type !== 'watch') continue;
          if (plan.includes(item)) continue;
          if (usedMinutes + item.duration > availableMinutes) continue;
          plan.push(item);
          usedMinutes += item.duration;
        }

        // Add a quiz if there's 10+ min remaining and enough material
        if (availableMinutes - usedMinutes >= 10 && plan.length > 0) {
          plan.push({
            type: 'quiz',
            course: plan[0].course,
            lectureId: plan[0].lectureId,
            title: 'Quiz yourself',
            duration: 10,
            reason: 'Active recall on today\'s material',
          });
          usedMinutes += 10;
        }

        // Display the plan
        if (plan.length === 0) {
          info('🎉 Nothing to study! All caught up.');
          return;
        }

        console.log(chalk.bold(`\n📅 Study Plan (${opts.hours} hours)\n`));

        let runningTime = 0;
        for (const item of plan) {
          const icon = item.type === 'watch' ? '📺' : item.type === 'review' ? '📖' : '📝';
          const timeRange = `${formatMinutes(runningTime)} – ${formatMinutes(runningTime + item.duration)}`;
          console.log(`  ${icon} ${chalk.dim(timeRange)}  ${chalk.bold(item.title)}`);
          console.log(`     ${chalk.dim(item.course.toUpperCase())} · ${item.reason}`);

          if (item.type === 'watch') {
            console.log(`     ${chalk.dim(`→ learn notes ${item.course} ${item.lectureId}`)}`);
          } else if (item.type === 'review') {
            console.log(`     ${chalk.dim(`→ learn notes ${item.course} ${item.lectureId}`)}`);
          } else if (item.type === 'quiz') {
            console.log(`     ${chalk.dim(`→ learn quiz ${item.course}`)}`);
          }
          console.log();
          runningTime += item.duration;
        }

        const unusedMin = availableMinutes - usedMinutes;
        console.log(chalk.bold(`Total: ${usedMinutes} min planned`));
        if (unusedMin > 5) {
          console.log(chalk.dim(`${unusedMin} min unplanned — use for breaks or exploration`));
        }
        console.log();
      } catch (e) {
        error(`Plan failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`;
  return `0:${String(m).padStart(2, '0')}`;
}
