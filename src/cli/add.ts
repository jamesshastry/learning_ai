import { Command } from 'commander';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { resolvePlaylist, slugify } from '../pipeline/playlist.js';
import { readYaml, writeYaml, ensureDir } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';
import { success, error, info, progress } from '../utils/logger.js';
import type { CourseConfig, PlaylistVideo } from '../types.js';

/**
 * Register the `learn add` command.
 *
 * Add a course from:
 * - A YouTube playlist URL
 * - A YouTube channel URL (scrapes all videos from the channel)
 * - --empty flag (creates an empty course for manual video addition)
 */
export function addCommand(program: Command): void {
  program
    .command('add [url]')
    .description('Add a course from a YouTube playlist, channel URL, or create empty')
    .requiredOption('--name <name>', 'Short name for the course (e.g., cs153)')
    .option('--title <title>', 'Human-readable course title')
    .option('--university <university>', 'University name')
    .option('--website <url>', 'Course website URL')
    .option('--tags <tags>', 'Comma-separated tags', '')
    .option('--empty', 'Create an empty course (add videos later with learn add-video)', false)
    .action(async (url: string | undefined, opts: {
      name: string;
      title?: string;
      university?: string;
      website?: string;
      tags: string;
      empty: boolean;
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

        let videos: PlaylistVideo[] = [];
        let sourceUrl = url ?? '';

        if (opts.empty || !url) {
          // Empty course — no videos yet
          info('Creating empty course (add videos with `learn add-video`)');
        } else if (url.includes('/playlist') || url.includes('list=')) {
          // Playlist URL
          videos = await resolvePlaylist(url);
        } else if (url.includes('/@') || url.includes('/channel/') || url.includes('/c/')) {
          // Channel URL
          videos = await resolveChannel(url);
        } else if (url.match(/youtube\.com|youtu\.be/)) {
          // Single video URL — treat as a 1-video course
          const videoId = extractVideoId(url);
          if (videoId) {
            const title = await fetchVideoTitle(videoId);
            videos = [{ videoId, title, index: 1 }];
          }
        } else {
          error('Unrecognized URL format. Provide a YouTube playlist, channel, or video URL.');
          process.exit(1);
        }

        // Create course config
        const courseConfig: CourseConfig = {
          schema_version: 1,
          name: courseName,
          title: opts.title ?? courseName,
          ...(opts.university && { university: opts.university }),
          ...(opts.website && { website: opts.website }),
          playlist: sourceUrl,
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
        ensureDir(resolve(courseDir, 'lectures'));

        if (videos.length > 0) {
          success(`Added course "${courseName}" with ${videos.length} lectures`);
        } else {
          success(`Created empty course "${courseName}"`);
        }
        info(`Course directory: ${courseDir}`);
        if (videos.length > 0) {
          info(`Run \`learn ingest ${courseName} --auto\` to process all lectures`);
        } else {
          info(`Add videos with: learn add-video ${courseName} <youtube-url>`);
        }
      } catch (e) {
        error(`Failed to add course: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn add-video — add individual videos to an existing course
  program
    .command('add-video <course> <youtube-url>')
    .description('Add a single YouTube video to an existing course')
    .option('--title <title>', 'Override the video title')
    .action(async (courseName: string, youtubeUrl: string, opts: { title?: string }) => {
      try {
        const config = loadConfig();
        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseConfig>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found. Run \`learn add --name ${courseName} --empty\` first.`);
          process.exit(1);
          return;
        }

        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
          error(`Invalid YouTube URL: ${youtubeUrl}`);
          process.exit(1);
          return;
        }

        // Check for duplicate
        if (courseConfig.lectures.find(l => l.video_id === videoId)) {
          error(`Video already exists in ${courseName}.`);
          process.exit(1);
          return;
        }

        const title = opts.title ?? await fetchVideoTitle(videoId);
        const nextId = String(courseConfig.lectures.length + 1).padStart(2, '0');

        courseConfig.lectures.push({
          id: nextId,
          title,
          video_id: videoId,
          status: 'pending',
        });

        writeYaml(courseYamlPath, courseConfig);
        success(`Added lecture ${nextId}: ${title}`);
        info(`Process with: learn process "${youtubeUrl}" --course ${courseName}`);
      } catch (e) {
        error(`Failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Resolve videos from a YouTube channel URL.
 */
async function resolveChannel(channelUrl: string): Promise<PlaylistVideo[]> {
  info(`Resolving channel: ${channelUrl}`);

  // Ensure URL ends with /videos
  let videosUrl = channelUrl;
  if (!videosUrl.endsWith('/videos')) {
    videosUrl = videosUrl.replace(/\/$/, '') + '/videos';
  }

  const response = await fetch(videosUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch channel: ${response.status}`);
  }

  const html = await response.text();

  // Extract video IDs from the page
  const videoIds = new Set<string>();
  const idRegex = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
  let match: RegExpExecArray | null;

  while ((match = idRegex.exec(html)) !== null) {
    videoIds.add(match[1]);
  }

  if (videoIds.size === 0) {
    throw new Error('No videos found on channel page');
  }

  // Fetch titles via oembed for each video
  const videos: PlaylistVideo[] = [];
  let index = 1;

  for (const videoId of videoIds) {
    const title = await fetchVideoTitle(videoId);
    videos.push({ videoId, title, index });
    index++;
  }

  // Sort by title (often includes "Class #N" or "Lecture N")
  videos.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  videos.forEach((v, i) => { v.index = i + 1; });

  info(`Found ${videos.length} videos on channel`);
  return videos;
}

/**
 * Fetch a video title via the YouTube oembed API.
 */
async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) return `Video ${videoId}`;
    const data = await response.json() as { title?: string };
    return data.title ?? `Video ${videoId}`;
  } catch {
    return `Video ${videoId}`;
  }
}

/**
 * Extract a YouTube video ID from various URL formats.
 */
export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v');
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  }
}
