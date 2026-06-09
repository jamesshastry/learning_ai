import { debug, info, warn } from '../utils/logger.js';
import type { PlaylistVideo } from '../types.js';

/**
 * Extract video IDs and titles from a YouTube playlist URL.
 * Scrapes the playlist page HTML and parses ytInitialData.
 */
export async function resolvePlaylist(playlistUrl: string): Promise<PlaylistVideo[]> {
  info(`Resolving playlist: ${playlistUrl}`);

  // Extract playlist ID from URL
  const url = new URL(playlistUrl);
  const listId = url.searchParams.get('list');
  if (!listId) {
    throw new Error(`Invalid playlist URL: no 'list' parameter found in ${playlistUrl}`);
  }

  // Fetch the playlist page
  const response = await fetch(
    `https://www.youtube.com/playlist?list=${listId}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Extract ytInitialData from the page
  const match = html.match(/var\s+ytInitialData\s*=\s*({.+?});\s*<\/script>/s);
  if (!match) {
    throw new Error('Could not find ytInitialData in playlist page HTML');
  }

  let data: unknown;
  try {
    data = JSON.parse(match[1]);
  } catch (e) {
    throw new Error(`Failed to parse ytInitialData JSON: ${(e as Error).message}`);
  }

  // Navigate the nested structure to find playlist items
  const videos = extractVideosFromData(data);

  if (videos.length === 0) {
    warn('No videos found in playlist. The playlist may be empty or private.');
  } else {
    info(`Found ${videos.length} videos in playlist`);
  }

  return videos;
}

/**
 * Navigate the ytInitialData structure to extract video entries.
 */
function extractVideosFromData(data: unknown): PlaylistVideo[] {
  const videos: PlaylistVideo[] = [];

  try {
    // Navigate: contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
    //           .content.sectionListRenderer.contents[0].itemSectionRenderer
    //           .contents[0].playlistVideoListRenderer.contents
    const root = data as Record<string, unknown>;
    const contents = getNestedValue(root, [
      'contents',
      'twoColumnBrowseResultsRenderer',
      'tabs', '0',
      'tabRenderer',
      'content',
      'sectionListRenderer',
      'contents', '0',
      'itemSectionRenderer',
      'contents', '0',
      'playlistVideoListRenderer',
      'contents',
    ]) as unknown[] | undefined;

    if (!contents) {
      debug('Could not navigate to playlistVideoListRenderer.contents');
      // Try alternative: fall back to regex extraction
      return extractVideosFromDataFallback(data);
    }

    for (const item of contents) {
      const renderer = (item as Record<string, unknown>)?.playlistVideoRenderer as
        Record<string, unknown> | undefined;
      if (!renderer) continue;

      const videoId = renderer.videoId as string;
      const titleRuns = getNestedValue(renderer, ['title', 'runs']) as
        Array<{ text: string }> | undefined;
      const title = titleRuns?.map(r => r.text).join('') ?? 'Untitled';
      const index = parseInt(
        (getNestedValue(renderer, ['index', 'simpleText']) as string) ?? '0',
        10
      );

      if (videoId) {
        videos.push({ videoId, title, index: index || videos.length + 1 });
      }
    }
  } catch (e) {
    debug(`Error parsing ytInitialData: ${(e as Error).message}`);
    return extractVideosFromDataFallback(data);
  }

  return videos;
}

/**
 * Fallback: use regex to find video entries in the serialized data.
 * Extracts both videoId and title by finding playlistVideoRenderer blocks.
 */
function extractVideosFromDataFallback(data: unknown): PlaylistVideo[] {
  const json = JSON.stringify(data);
  const videos: PlaylistVideo[] = [];
  const seen = new Set<string>();

  // Match playlistVideoRenderer blocks with videoId and title
  const rendererRegex = /"playlistVideoRenderer"\s*:\s*\{[^}]*?"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"[^}]*?"title"\s*:\s*\{[^}]*?"runs"\s*:\s*\[\s*\{[^}]*?"text"\s*:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = rendererRegex.exec(json)) !== null) {
    const videoId = match[1];
    const title = match[2];
    if (!seen.has(videoId)) {
      seen.add(videoId);
      videos.push({
        videoId,
        title: title || `Video ${videos.length + 1}`,
        index: videos.length + 1,
      });
    }
  }

  // If the more precise regex didn't work, fall back to simple videoId extraction
  // with title extraction from nearby context
  if (videos.length === 0) {
    const simpleRegex = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
    while ((match = simpleRegex.exec(json)) !== null) {
      const videoId = match[1];
      if (!seen.has(videoId)) {
        seen.add(videoId);

        // Try to find the title near this videoId
        const contextStart = Math.max(0, match.index - 500);
        const contextEnd = Math.min(json.length, match.index + 500);
        const context = json.substring(contextStart, contextEnd);
        const titleMatch = context.match(/"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : `Video ${videos.length + 1}`;

        videos.push({
          videoId,
          title,
          index: videos.length + 1,
        });
      }
    }
  }

  if (videos.length > 0) {
    debug(`Fallback extraction found ${videos.length} videos`);
  }

  return videos;
}

/**
 * Safely navigate a nested object using a path of keys.
 */
function getNestedValue(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = parseInt(key, 10);
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Create a URL-friendly slug from a video title.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}
