import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { debug, info, warn, progress } from '../utils/logger.js';
import type { TranscribeResult, TranscriptSegment } from '../types.js';

/**
 * Extract auto-generated captions from a YouTube video using yt-dlp.
 * This is the fallback transcription method for when usetranscribe.io
 * is unavailable or the video exceeds 90 minutes.
 */
export async function fallbackTranscribe(videoId: string): Promise<TranscribeResult> {
  info('Using fallback transcription (yt-dlp auto-captions)');

  // Check if yt-dlp is installed
  try {
    execSync('yt-dlp --version', { stdio: 'pipe' });
  } catch {
    throw new Error(
      'yt-dlp is required for fallback transcription.\n' +
      'Install via: brew install yt-dlp'
    );
  }

  const tempDir = tmpdir();
  const outputPath = resolve(tempDir, videoId);
  const vttPath = `${outputPath}.en.vtt`;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Download auto-generated captions
    progress('Downloading auto-generated captions...');
    execSync(
      `yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "${outputPath}" "${url}"`,
      { stdio: 'pipe', timeout: 60000 }
    );

    if (!existsSync(vttPath)) {
      throw new Error('No English captions available for this video');
    }

    // Parse VTT and deduplicate rolling captions
    const vttContent = readFileSync(vttPath, 'utf-8');
    const segments = parseVTT(vttContent);

    // Get video title via yt-dlp
    let title = 'Untitled';
    try {
      title = execSync(
        `yt-dlp --print title --skip-download "${url}"`,
        { stdio: 'pipe', timeout: 15000 }
      ).toString().trim();
    } catch {
      debug('Could not fetch video title');
    }

    // Get duration
    let durationSeconds = 0;
    try {
      const durStr = execSync(
        `yt-dlp --print duration --skip-download "${url}"`,
        { stdio: 'pipe', timeout: 15000 }
      ).toString().trim();
      durationSeconds = parseInt(durStr, 10) || 0;
    } catch {
      debug('Could not fetch video duration');
    }

    return {
      source: 'yt-dlp-captions',
      title,
      duration_seconds: durationSeconds,
      segments,
    };
  } finally {
    // Clean up temp file
    if (existsSync(vttPath)) {
      unlinkSync(vttPath);
    }
  }
}

/**
 * Parse a WebVTT file and deduplicate rolling captions.
 *
 * YouTube auto-generated VTT uses rolling captions where each cue
 * contains the previous line plus a new line. This deduplication
 * algorithm tracks the last emitted text and only emits new content.
 */
export function parseVTT(vttContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = vttContent.split('\n');
  let lastEmitted = '';

  let currentTimestamp: string | null = null;
  let currentText = '';

  for (const line of lines) {
    // Skip headers and empty lines
    if (line.startsWith('WEBVTT') || line.startsWith('Kind:') ||
        line.startsWith('Language:') || line.startsWith('NOTE')) {
      continue;
    }

    // Match timestamp lines: "00:00:01.234 --> 00:00:03.456"
    const timestampMatch = line.match(
      /^(\d{2}:\d{2}:\d{2})\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}/
    );

    if (timestampMatch) {
      // Process previous cue if we have one
      if (currentTimestamp && currentText) {
        const deduped = deduplicateText(currentText, lastEmitted);
        if (deduped) {
          segments.push({
            timestamp: formatVTTTimestamp(currentTimestamp),
            text: deduped,
          });
          lastEmitted = currentText.split('\n').pop() ?? currentText;
        }
      }
      currentTimestamp = timestampMatch[1];
      currentText = '';
      continue;
    }

    // Skip cue identifiers (numeric lines)
    if (/^\d+$/.test(line.trim())) continue;

    // Accumulate text, stripping VTT tags like <c> and position metadata
    const cleaned = line
      .replace(/<[^>]+>/g, '')  // Strip VTT tags
      .replace(/\s*align:start\s*position:\d+%/g, '')  // Strip position metadata
      .trim();

    if (cleaned && currentTimestamp) {
      currentText += (currentText ? '\n' : '') + cleaned;
    }
  }

  // Process last cue
  if (currentTimestamp && currentText) {
    const deduped = deduplicateText(currentText, lastEmitted);
    if (deduped) {
      segments.push({
        timestamp: formatVTTTimestamp(currentTimestamp),
        text: deduped,
      });
    }
  }

  return segments;
}

/**
 * Deduplicate rolling caption text by removing previously emitted content.
 * Returns only the new content, or empty string if fully duplicated.
 */
function deduplicateText(text: string, lastEmitted: string): string {
  if (!lastEmitted) return text;

  // If the text starts with what we last emitted, only keep the new part
  if (text.startsWith(lastEmitted)) {
    const newPart = text.slice(lastEmitted.length).trim();
    return newPart;
  }

  // Check line-by-line for overlap: leading lines of text matching trailing lines of lastEmitted
  const textLines = text.split('\n');
  const lastLines = lastEmitted.split('\n');

  // Sliding window: check if the first N lines of textLines match the last N lines of lastLines
  let overlapLines = 0;
  const maxOverlap = Math.min(textLines.length, lastLines.length);
  for (let overlap = 1; overlap <= maxOverlap; overlap++) {
    let matches = true;
    for (let j = 0; j < overlap; j++) {
      if (textLines[j].trim() !== lastLines[lastLines.length - overlap + j]?.trim()) {
        matches = false;
        break;
      }
    }
    if (matches) {
      overlapLines = overlap;
    }
  }

  if (overlapLines > 0) {
    const remaining = textLines.slice(overlapLines).join('\n').trim();
    return remaining;
  }

  return text;
}

/**
 * Format a VTT timestamp (HH:MM:SS) to our standard format.
 * Strips leading zeros from hours if zero.
 */
function formatVTTTimestamp(timestamp: string): string {
  const parts = timestamp.split(':');
  if (parts.length === 3 && parts[0] === '00') {
    return `${parts[1]}:${parts[2]}`;
  }
  return timestamp;
}
