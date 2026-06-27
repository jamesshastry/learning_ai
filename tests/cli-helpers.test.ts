/**
 * CLI helper function tests — extractVideoId, timestampToSeconds, escapeAnki, duration limits.
 *
 * Tests the pure utility functions embedded in CLI command files.
 */
import { describe, it, expect } from 'vitest';
import { extractVideoId } from '../src/cli/add.js';
import { timestampToSeconds } from '../src/cli/bookmark.js';
import { escapeAnki } from '../src/cli/export.js';
import { exceedsLimit, MAX_TRANSCRIBE_DURATION } from '../src/pipeline/duration.js';

// ── extractVideoId ─────────────────────────────────────────────────

describe('extractVideoId', () => {
  it('extracts from standard youtube.com URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts from youtu.be short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts from embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts from URL with extra params', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120&list=PLxyz')).toBe('dQw4w9WgXcQ');
  });

  it('accepts raw 11-char video ID', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid URLs', () => {
    expect(extractVideoId('https://example.com')).toBe(null);
    expect(extractVideoId('not-a-url')).toBe(null);
    expect(extractVideoId('')).toBe(null);
  });

  it('returns null for youtube.com without v param', () => {
    expect(extractVideoId('https://www.youtube.com/playlist?list=PLxyz')).toBe(null);
  });
});

// ── timestampToSeconds ─────────────────────────────────────────────

describe('timestampToSeconds', () => {
  it('converts MM:SS format', () => {
    expect(timestampToSeconds('1:30')).toBe(90);
    expect(timestampToSeconds('0:45')).toBe(45);
    expect(timestampToSeconds('10:00')).toBe(600);
  });

  it('converts HH:MM:SS format', () => {
    expect(timestampToSeconds('1:00:00')).toBe(3600);
    expect(timestampToSeconds('1:30:45')).toBe(5445);
    expect(timestampToSeconds('0:05:30')).toBe(330);
  });

  it('returns 0 for single number', () => {
    expect(timestampToSeconds('42')).toBe(0);
  });

  it('handles zero timestamps', () => {
    expect(timestampToSeconds('0:00')).toBe(0);
    expect(timestampToSeconds('0:00:00')).toBe(0);
  });
});

// ── escapeAnki ─────────────────────────────────────────────────────

describe('escapeAnki', () => {
  it('replaces tabs with spaces', () => {
    expect(escapeAnki('col1\tcol2')).toBe('col1 col2');
  });

  it('replaces newlines with <br>', () => {
    expect(escapeAnki('line1\nline2')).toBe('line1<br>line2');
  });

  it('escapes double quotes', () => {
    expect(escapeAnki('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('handles combined escaping', () => {
    expect(escapeAnki('"hello"\tworld\nnewline')).toBe('&quot;hello&quot; world<br>newline');
  });

  it('handles empty string', () => {
    expect(escapeAnki('')).toBe('');
  });
});

// ── Duration limits ────────────────────────────────────────────────

describe('exceedsLimit', () => {
  it('returns false for null (unknown duration)', () => {
    expect(exceedsLimit(null)).toBe(false);
  });

  it('returns false for short videos', () => {
    expect(exceedsLimit(600)).toBe(false);
    expect(exceedsLimit(3600)).toBe(false);
  });

  it('returns false at exactly the limit', () => {
    expect(exceedsLimit(MAX_TRANSCRIBE_DURATION)).toBe(false);
  });

  it('returns true for videos over 90 minutes', () => {
    expect(exceedsLimit(MAX_TRANSCRIBE_DURATION + 1)).toBe(true);
    expect(exceedsLimit(7200)).toBe(true);
  });

  it('MAX_TRANSCRIBE_DURATION is 5400 seconds (90 min)', () => {
    expect(MAX_TRANSCRIBE_DURATION).toBe(5400);
  });
});
