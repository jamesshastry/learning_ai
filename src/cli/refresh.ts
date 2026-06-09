import { Command } from 'commander';
import { resolve } from 'path';
import { loadConfig } from '../utils/config.js';
import { readYaml, writeYaml } from '../utils/files.js';
import { resolvePlaylist } from '../pipeline/playlist.js';
import { success, error, info, warn } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';

/**
 * Register the `learn refresh` command.
 *
 * Re-resolves a course's YouTube playlist and adds any new videos
 * that aren't already in course.yaml.
 */
export function refreshCommand(program: Command): void {
  program
    .command('refresh <course>')
    .description('Check for new lectures in a course playlist')
    .action(async (courseName: string) => {
      try {
        const config = loadConfig();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseConfig>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
          return;
        }

        if (!courseConfig.playlist) {
          error('No playlist URL configured for this course.');
          process.exit(1);
          return;
        }

        // Resolve current playlist
        const videos = await resolvePlaylist(courseConfig.playlist);
        const existingIds = new Set(courseConfig.lectures.map(l => l.video_id));

        // Find new videos
        const newVideos = videos.filter(v => !existingIds.has(v.videoId));

        if (newVideos.length === 0) {
          info('No new lectures found in playlist.');
          return;
        }

        // Add new lectures with sequential IDs
        let nextId = courseConfig.lectures.length + 1;
        for (const video of newVideos) {
          courseConfig.lectures.push({
            id: String(nextId).padStart(2, '0'),
            title: video.title,
            video_id: video.videoId,
            status: 'pending',
          });
          nextId++;
        }

        writeYaml(courseYamlPath, courseConfig);
        success(`Added ${newVideos.length} new lecture(s):`);
        for (const video of newVideos) {
          info(`  + ${video.title}`);
        }
        info(`Run \`learn ingest ${courseName} --auto\` to process them.`);
      } catch (e) {
        error(`Refresh failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
