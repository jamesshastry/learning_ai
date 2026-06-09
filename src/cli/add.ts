import { Command } from 'commander';
import { resolve } from 'path';
import { resolvePlaylist, slugify } from '../pipeline/playlist.js';
import { readYaml, writeYaml, ensureDir } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';
import { success, error, info } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';

/**
 * Register the `learn add` command.
 *
 * Resolves a YouTube playlist URL, extracts video IDs and titles,
 * and creates a course.yaml file with all lectures in 'pending' status.
 */
export function addCommand(program: Command): void {
  program
    .command('add <playlist-url>')
    .description('Add a course from a YouTube playlist URL')
    .requiredOption('--name <name>', 'Short name for the course (e.g., cs153)')
    .option('--title <title>', 'Human-readable course title')
    .option('--university <university>', 'University name')
    .option('--website <url>', 'Course website URL')
    .option('--tags <tags>', 'Comma-separated tags', '')
    .action(async (playlistUrl: string, opts: {
      name: string;
      title?: string;
      university?: string;
      website?: string;
      tags: string;
    }) => {
      try {
        const config = loadConfig();
        const courseName = opts.name.toLowerCase().replace(/\s+/g, '-');

        // Check if course already exists
        const courseDir = resolve(config.projectRoot, 'courses', courseName);
        const courseYamlPath = resolve(courseDir, 'course.yaml');
        const existing = readYaml<CourseConfig>(courseYamlPath);
        if (existing) {
          error(`Course "${courseName}" already exists at ${courseDir}`);
          process.exit(1);
        }

        // Resolve playlist
        const videos = await resolvePlaylist(playlistUrl);
        if (videos.length === 0) {
          error('No videos found in playlist');
          process.exit(1);
        }

        // Create course config
        const courseConfig: CourseConfig = {
          schema_version: 1,
          name: courseName,
          title: opts.title ?? courseName,
          ...(opts.university && { university: opts.university }),
          ...(opts.website && { website: opts.website }),
          playlist: playlistUrl,
          tags: opts.tags ? opts.tags.split(',').map(t => t.trim()) : [],
          added: new Date().toISOString().split('T')[0],
          lectures: videos.map((video, idx) => ({
            id: String(idx + 1).padStart(2, '0'),
            title: video.title,
            video_id: video.videoId,
            status: 'pending' as const,
          })),
        };

        // Write course.yaml
        ensureDir(courseDir);
        writeYaml(courseYamlPath, courseConfig);

        // Create lectures directory
        ensureDir(resolve(courseDir, 'lectures'));

        success(`Added course "${courseName}" with ${videos.length} lectures`);
        info(`Course directory: ${courseDir}`);
        info('Run `learn process <youtube-url> --course ' + courseName + '` to process a lecture');
        info('Run `learn ingest ' + courseName + ' --auto` to process all lectures');
      } catch (e) {
        error(`Failed to add course: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
