import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml, readText } from '../utils/files.js';
import { success, error, info } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface Bookmark {
  timestamp: string;
  note: string;
  added: string;
}

interface LectureWithBookmarks {
  bookmarks?: Bookmark[];
}

/**
 * Register the `learn bookmark` command.
 *
 * Bookmark a timestamp in a lecture with a note.
 * Stored in course.yaml per lecture — survives reprocessing.
 */
export function bookmarkCommand(program: Command): void {
  program
    .command('bookmark <course> <lecture-id> [timestamp] [note]')
    .description('Bookmark a lecture timestamp (e.g., learn bookmark cs153 3 23:45 "great explanation")')
    .option('--remove <timestamp>', 'Remove a bookmark at this timestamp')
    .option('--list', 'List all bookmarks for this lecture', false)
    .action(async (
      courseName: string,
      lectureId: string,
      timestamp: string | undefined,
      note: string | undefined,
      opts: { remove?: string; list: boolean }
    ) => {
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
        const lecture = courseConfig.lectures.find(l => l.id === paddedId) as
          (CourseConfig['lectures'][0] & LectureWithBookmarks) | undefined;

        if (!lecture) {
          error(`Lecture ${lectureId} not found.`);
          process.exit(1);
          return;
        }

        if (!lecture.bookmarks) {
          lecture.bookmarks = [];
        }

        if (opts.list || (!timestamp && !opts.remove)) {
          // List bookmarks
          if (lecture.bookmarks.length === 0) {
            info(`No bookmarks for lecture ${paddedId}.`);
            return;
          }

          console.log(chalk.bold(`\n🔖 Bookmarks: ${lecture.title}\n`));
          for (const bm of lecture.bookmarks.sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
            const videoUrl = lecture.video_id
              ? ` → https://youtube.com/watch?v=${lecture.video_id}&t=${timestampToSeconds(bm.timestamp)}`
              : '';
            console.log(`  ${chalk.yellow(`[${bm.timestamp}]`)} ${bm.note}${chalk.dim(videoUrl)}`);
          }
          console.log();
          return;
        }

        if (opts.remove) {
          const before = lecture.bookmarks.length;
          lecture.bookmarks = lecture.bookmarks.filter(b => b.timestamp !== opts.remove);
          if (lecture.bookmarks.length === before) {
            warn(`No bookmark found at ${opts.remove}`);
          } else {
            writeYaml(courseYamlPath, courseConfig);
            success(`Removed bookmark at ${opts.remove}`);
          }
          return;
        }

        if (!timestamp) {
          error('Provide a timestamp. Usage: learn bookmark cs153 3 23:45 "your note"');
          process.exit(1);
          return;
        }

        // Add bookmark
        lecture.bookmarks.push({
          timestamp,
          note: note ?? '',
          added: new Date().toISOString().split('T')[0],
        });

        // Sort by timestamp
        lecture.bookmarks.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        writeYaml(courseYamlPath, courseConfig);

        const videoUrl = lecture.video_id
          ? `\n  → https://youtube.com/watch?v=${lecture.video_id}&t=${timestampToSeconds(timestamp)}`
          : '';
        success(`Bookmarked [${timestamp}] in lecture ${paddedId}${videoUrl}`);
      } catch (e) {
        error(`Bookmark failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

function warn(msg: string) { console.log(chalk.yellow('⚠'), msg); }

/**
 * Convert a MM:SS or HH:MM:SS timestamp to seconds.
 */
export function timestampToSeconds(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}
