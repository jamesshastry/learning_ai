import { parseSSE, fetchWithRedirects, recordTranscription, isRateLimited } from '../utils/http.js';
import { debug, info, progress, warn } from '../utils/logger.js';
import type { TranscribeResult, TranscriptSegment } from '../types.js';

const BASE_URL = 'https://www.usetranscribe.io';

/**
 * Check if a transcript is already cached on usetranscribe.io.
 * Returns the permalink path if cached, null if not.
 */
async function checkCache(videoId: string): Promise<string | null> {
  debug(`Checking transcript cache for: ${videoId}`);

  try {
    const response = await fetch(
      `${BASE_URL}/api/check?platform=youtube&id=${videoId}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      debug(`Cache check returned ${response.status}`);
      return null;
    }

    const data = await response.json() as { cached: boolean; permalink?: string };
    if (data.cached && data.permalink) {
      debug(`Cache hit: ${data.permalink}`);
      return data.permalink;
    }

    debug('Cache miss');
    return null;
  } catch (e) {
    debug(`Cache check failed: ${(e as Error).message}`);
    return null;
  }
}

/**
 * Fetch a cached transcript using the permalink from /api/check.
 */
async function fetchCached(permalink: string): Promise<TranscribeResult> {
  const url = `${BASE_URL}${permalink}?format=json`;
  info(`Fetching cached transcript: ${permalink}`);

  const response = await fetchWithRedirects(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch cached transcript: ${response.status}`);
  }

  const data = await response.json() as Record<string, unknown>;

  // Cached response schema: summary, transcript.segments
  const transcript = data.transcript as Record<string, unknown> | undefined;
  const segments = (transcript?.segments ?? []) as Array<{
    start: number;
    text: string;
  }>;

  return {
    source: 'usetranscribe',
    title: (data.title as string) ?? 'Untitled',
    duration_seconds: (data.duration_seconds as number) ?? 0,
    segments: segments.map(seg => ({
      timestamp: formatTimestamp(seg.start),
      text: seg.text.trim(),
    })),
    raw: data,
  };
}

/**
 * Trigger a new transcription via the SSE endpoint.
 */
async function triggerTranscription(videoId: string): Promise<TranscribeResult> {
  const url = `${BASE_URL}/transcribe?url=https://www.youtube.com/watch?v=${videoId}&summarize=1`;
  info('Starting transcription (this may take a few minutes)...');

  const response = await fetch(url, {
    headers: { Accept: 'text/event-stream' },
    signal: AbortSignal.timeout(600000), // 10 minute timeout for long videos
  });

  if (!response.ok) {
    throw new Error(`Transcription request failed: ${response.status} ${response.statusText}`);
  }

  let result: TranscribeResult | null = null;

  for await (const event of parseSSE(response)) {
    debug(`SSE event: ${event.event}`);

    switch (event.event) {
      case 'validating':
        progress('Validating video URL...');
        break;
      case 'resolving':
        progress('Resolving video metadata...');
        break;
      case 'transcribing':
        progress('Transcribing audio...');
        break;
      case 'summarizing':
        progress('Generating summary...');
        break;
      case 'done': {
        // SSE done event schema: summary_md, top-level segments
        const data = JSON.parse(event.data) as Record<string, unknown>;
        const segments = (data.segments ?? []) as Array<{
          start: number;
          text: string;
        }>;

        result = {
          source: 'usetranscribe',
          title: (data.title as string) ?? 'Untitled',
          duration_seconds: (data.duration_seconds as number) ?? 0,
          segments: segments.map(seg => ({
            timestamp: formatTimestamp(seg.start),
            text: seg.text.trim(),
          })),
          raw: data,
        };
        break;
      }
      case 'error': {
        const errorData = JSON.parse(event.data) as { message?: string };
        throw new Error(`Transcription error: ${errorData.message ?? 'Unknown error'}`);
      }
    }
  }

  if (!result) {
    throw new Error('Transcription stream ended without a result');
  }

  // Record usage
  const remaining = recordTranscription();
  debug(`Transcription credits remaining today: ${remaining}`);

  return result;
}

/**
 * Transcribe a YouTube video using usetranscribe.io.
 * Checks cache first, then triggers new transcription.
 * Returns null if rate limited (caller should use fallback).
 */
export async function transcribeVideo(videoId: string): Promise<TranscribeResult | null> {
  // Check rate limit before attempting
  if (isRateLimited()) {
    warn('Daily transcription limit (50) reached. Use yt-dlp fallback.');
    return null;
  }

  try {
    // Step 1: Check cache
    const permalink = await checkCache(videoId);
    if (permalink) {
      return await fetchCached(permalink);
    }

    // Step 2: Trigger new transcription
    return await triggerTranscription(videoId);
  } catch (e) {
    warn(`Transcription failed: ${(e as Error).message}`);
    return null;
  }
}

/**
 * Format a time in seconds to [HH:MM:SS] or [MM:SS] format.
 */
function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
