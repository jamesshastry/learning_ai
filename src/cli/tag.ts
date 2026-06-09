import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml } from '../utils/files.js';
import { success, error, info } from '../utils/logger.js';
import type { CourseConfig, ConceptsYaml } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn tag` command.
 *
 * Manually tag a lecture for topic-based filtering.
 */
export function tagCommand(program: Command): void {
  program
    .command('tag <course> <lecture-id>')
    .description('Add or view tags on a lecture')
    .option('--add <tags>', 'Add tags (comma-separated)')
    .option('--remove <tags>', 'Remove tags (comma-separated)')
    .action(async (courseName: string, lectureId: string, opts: { add?: string; remove?: string }) => {
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
          error(`Lecture ${lectureId} not found.`);
          process.exit(1);
          return;
        }

        // Initialize tags array on the lecture if needed
        const lectureTags = lecture.tags;
        let currentTags = new Set(lectureTags ?? []);

        // Auto-derive tags from concepts if no manual tags exist
        if (currentTags.size === 0 && !opts.add) {
          const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
          const matchingDir = readdirSync(lecturesDir).find(d => d.split('-')[0] === paddedId);
          if (matchingDir) {
            const concepts = readYaml<ConceptsYaml>(resolve(lecturesDir, matchingDir, 'concepts.yaml'));
            if (concepts?.concepts) {
              for (const concept of concepts.concepts) {
                for (const tag of concept.tags) {
                  currentTags.add(tag);
                }
              }
            }
          }
        }

        if (opts.add) {
          const newTags = opts.add.split(',').map(t => t.trim().toLowerCase());
          for (const tag of newTags) currentTags.add(tag);
          lecture.tags = Array.from(currentTags);
          writeYaml(courseYamlPath, courseConfig);
          success(`Tags updated for lecture ${paddedId}: ${Array.from(currentTags).join(', ')}`);
        } else if (opts.remove) {
          const removeTags = opts.remove.split(',').map(t => t.trim().toLowerCase());
          for (const tag of removeTags) currentTags.delete(tag);
          lecture.tags = Array.from(currentTags);
          writeYaml(courseYamlPath, courseConfig);
          success(`Tags updated for lecture ${paddedId}: ${Array.from(currentTags).join(', ')}`);
        } else {
          // Display current tags
          info(`Tags for lecture ${paddedId} "${lecture.title}":`);
          if (currentTags.size > 0) {
            console.log(`  ${Array.from(currentTags).map(t => chalk.cyan(t)).join(', ')}`);
          } else {
            console.log('  (no tags)');
          }
        }
      } catch (e) {
        error(`Tag operation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Register the `learn lectures` command.
 *
 * List and filter lectures across courses by tag, watched status, etc.
 */
export function lecturesCommand(program: Command): void {
  program
    .command('lectures')
    .description('List and filter lectures across all courses')
    .option('--tag <tag>', 'Filter by topic tag')
    .option('--unwatched', 'Show only unwatched lectures', false)
    .option('--course <name>', 'Limit to a specific course')
    .action(async (opts: { tag?: string; unwatched: boolean; course?: string }) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const courseDirs = opts.course
          ? [opts.course]
          : readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'));

        const tagLower = opts.tag?.toLowerCase();
        let totalMatches = 0;

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          const matches: typeof courseConfig.lectures = [];

          for (const lecture of courseConfig.lectures) {
            // Unwatched filter
            if (opts.unwatched && lecture.watched) continue;

            // Tag filter — check manual tags on lecture + auto-tags from concepts
            if (tagLower) {
              const manualTags = (lecture.tags as string[]) ?? [];
              const hasManualTag = manualTags.some(t => t.toLowerCase().includes(tagLower));

              if (!hasManualTag) {
                // Check concept tags
                const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
                const matchingDir = readdirSync(lecturesDir).find(d =>
                  d.split('-')[0] === lecture.id
                );
                if (matchingDir) {
                  const concepts = readYaml<ConceptsYaml>(
                    resolve(lecturesDir, matchingDir, 'concepts.yaml')
                  );
                  const hasConceptTag = concepts?.concepts?.some(c =>
                    c.tags.some(t => t.toLowerCase().includes(tagLower)) ||
                    c.name.toLowerCase().includes(tagLower)
                  );
                  if (!hasConceptTag) continue;
                } else {
                  continue;
                }
              }
            }

            matches.push(lecture);
          }

          if (matches.length === 0) continue;

          console.log(chalk.bold(`\n${courseConfig.name.toUpperCase()} ${courseConfig.title}`));
          for (const lecture of matches) {
            const watchIcon = lecture.watched ? chalk.green('✓') : chalk.dim('○');
            const confIcon = lecture.confidence
              ? ` ${confidenceIcon(lecture.confidence)}`
              : '';
            console.log(`  ${watchIcon} ${lecture.id} ${lecture.title}${confIcon}`);
            totalMatches++;
          }
        }

        if (totalMatches === 0) {
          info('No matching lectures found.');
        } else {
          console.log();
          info(`${totalMatches} lecture(s) found`);
        }
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

function confidenceIcon(level: string): string {
  switch (level) {
    case 'high': return chalk.green('🟢');
    case 'medium': return chalk.yellow('🟡');
    case 'low': return chalk.red('🟠');
    case 'none': return chalk.red('🔴');
    default: return '';
  }
}
