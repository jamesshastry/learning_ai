import { debug, info, warn } from '../utils/logger.js';

/**
 * Detect the duration of a YouTube video in seconds.
 * Fetches the watch page and extracts lengthSeconds from ytInitialPlayerResponse.
 */
export async function detectDuration(videoId: string): Promise<number | null> {
  debug(`Detecting duration for video: ${videoId}`);

  try {
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      warn(`Failed to fetch video page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Try ytInitialPlayerResponse first
    const playerMatch = html.match(
      /var\s+ytInitialPlayerResponse\s*=\s*({.+?});\s*(?:var|<\/script>)/s
    );
    if (playerMatch) {
      try {
        const data = JSON.parse(playerMatch[1]) as Record<string, unknown>;
        const details = data.videoDetails as Record<string, unknown> | undefined;
        const lengthStr = details?.lengthSeconds as string | undefined;
        if (lengthStr) {
          const seconds = parseInt(lengthStr, 10);
          if (!isNaN(seconds)) {
            debug(`Duration detected: ${seconds}s`);
            return seconds;
          }
        }
      } catch {
        debug('Failed to parse ytInitialPlayerResponse');
      }
    }

    // Fallback: try to find lengthSeconds in the page
    const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (lengthMatch) {
      const seconds = parseInt(lengthMatch[1], 10);
      if (!isNaN(seconds)) {
        debug(`Duration detected (fallback): ${seconds}s`);
        return seconds;
      }
    }

    warn('Could not detect video duration');
    return null;
  } catch (e) {
    warn(`Duration detection failed: ${(e as Error).message}`);
    return null;
  }
}

/**
 * Maximum duration (in seconds) supported by usetranscribe.io.
 */
export const MAX_TRANSCRIBE_DURATION = 5400; // 90 minutes

/**
 * Check if a video exceeds the transcription service limit.
 */
export function exceedsLimit(durationSeconds: number | null): boolean {
  if (durationSeconds === null) return false; // Unknown duration — try primary
  return durationSeconds > MAX_TRANSCRIBE_DURATION;
}
