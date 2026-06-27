/**
 * Import parser tests — SRT, plain text, and timestamp formatting.
 *
 * Tests the transcript import parsers that handle non-YouTube content
 * (Coursera, edX, conference talks, etc.).
 */
import { describe, it, expect } from 'vitest';
import { parseSRT, parsePlainText, formatTimestamp } from '../src/cli/import.js';

// ── SRT parsing ────────────────────────────────────────────────────

describe('parseSRT', () => {
  it('parses standard SRT content', () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:03,500 --> 00:00:06,000
This is a test

3
00:01:00,000 --> 00:01:05,000
One minute in
`;
    const segments = parseSRT(srt);
    expect(segments.length).toBe(3);
    expect(segments[0].text).toBe('Hello world');
    expect(segments[1].text).toBe('This is a test');
    expect(segments[2].text).toBe('One minute in');
  });

  it('strips HTML tags from SRT text', () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
<i>Hello</i> <b>world</b>
`;
    const segments = parseSRT(srt);
    expect(segments[0].text).toBe('Hello world');
  });

  it('joins multi-line subtitle text', () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
First line
Second line
Third line
`;
    const segments = parseSRT(srt);
    expect(segments[0].text).toBe('First line Second line Third line');
  });

  it('strips leading 00: from timestamps', () => {
    const srt = `1
00:00:45,000 --> 00:00:50,000
Short timestamp
`;
    const segments = parseSRT(srt);
    // formatTimestamp strips leading 00: hours
    expect(segments[0].timestamp).toBe('00:45');
  });

  it('preserves hour timestamps', () => {
    const srt = `1
01:30:00,000 --> 01:35:00,000
Long video
`;
    const segments = parseSRT(srt);
    expect(segments[0].timestamp).toBe('01:30:00');
  });

  it('skips malformed blocks', () => {
    const srt = `1
bad timestamp
Some text

2
00:00:01,000 --> 00:00:03,000
Good text
`;
    const segments = parseSRT(srt);
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe('Good text');
  });

  it('handles empty content', () => {
    expect(parseSRT('')).toEqual([]);
  });

  it('handles content with only whitespace', () => {
    expect(parseSRT('  \n\n  \n')).toEqual([]);
  });
});

// ── Plain text parsing ─────────────────────────────────────────────

describe('parsePlainText', () => {
  it('parses lines with [MM:SS] timestamps', () => {
    const text = `[00:01] Hello world
[00:30] Second point
[01:00] Third point`;
    const segments = parsePlainText(text);
    expect(segments.length).toBe(3);
    expect(segments[0].timestamp).toBe('00:01');
    expect(segments[0].text).toBe('Hello world');
    expect(segments[2].timestamp).toBe('01:00');
  });

  it('parses lines with HH:MM:SS timestamps (no brackets)', () => {
    const text = `1:30:00 This is late in the video
1:30:30 Still going`;
    const segments = parsePlainText(text);
    expect(segments.length).toBe(2);
    expect(segments[0].timestamp).toBe('1:30:00');
  });

  it('assigns 00:00 to lines without timestamps', () => {
    const text = `No timestamp here
Also no timestamp`;
    const segments = parsePlainText(text);
    expect(segments.length).toBe(2);
    expect(segments[0].timestamp).toBe('00:00');
    expect(segments[0].text).toBe('No timestamp here');
  });

  it('skips empty lines', () => {
    const text = `Line one

Line two

`;
    const segments = parsePlainText(text);
    expect(segments.length).toBe(2);
  });

  it('handles empty content', () => {
    expect(parsePlainText('')).toEqual([]);
  });
});

// ── formatTimestamp ────────────────────────────────────────────────

describe('formatTimestamp', () => {
  it('strips leading 00: hours', () => {
    expect(formatTimestamp('00:01:30')).toBe('01:30');
  });

  it('preserves non-zero hours', () => {
    expect(formatTimestamp('01:30:00')).toBe('01:30:00');
  });

  it('passes through MM:SS timestamps', () => {
    expect(formatTimestamp('05:30')).toBe('05:30');
  });
});
