/**
 * Pipeline function tests — VTT parsing, slugify, duration parsing, import parsers.
 *
 * Tests the pure transformation functions in the pipeline layer. No network calls.
 */
import { describe, it, expect } from 'vitest';
import { slugify } from '../src/pipeline/playlist.js';
import { parseVTT } from '../src/pipeline/fallback.js';

// ── slugify ────────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify("What's Next? AI & ML!")).toBe('whats-next-ai-ml');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('a---b   c')).toBe('a-b-c');
  });

  it('truncates to 60 characters', () => {
    const long = 'a'.repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });

  it('strips leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles lecture titles with numbers', () => {
    expect(slugify('Lecture 01 - Attention Mechanisms')).toBe('lecture-01-attention-mechanisms');
  });
});

// ── parseVTT ───────────────────────────────────────────────────────

describe('parseVTT', () => {
  it('parses basic VTT content', () => {
    const vtt = `WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:03.000
Hello world

00:00:03.000 --> 00:00:05.000
This is a test
`;
    const segments = parseVTT(vtt);
    expect(segments.length).toBe(2);
    expect(segments[0].text).toBe('Hello world');
    expect(segments[0].timestamp).toMatch(/00:01/);
    expect(segments[1].text).toBe('This is a test');
  });

  it('strips VTT tags like <c> and position metadata', () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
<c>Hello</c> world align:start position:20%
`;
    const segments = parseVTT(vtt);
    expect(segments[0].text).toBe('Hello world');
  });

  it('deduplicates rolling captions', () => {
    // YouTube auto-captions often repeat text in overlapping cues
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
hello world

00:00:02.000 --> 00:00:04.000
hello world
this is new

00:00:03.000 --> 00:00:05.000
this is new
more text
`;
    const segments = parseVTT(vtt);
    // Should not have duplicate "hello world" or "this is new" lines
    const allText = segments.map(s => s.text).join(' ');
    expect(allText).not.toMatch(/hello world.*hello world/);
  });

  it('skips WEBVTT header and NOTE blocks', () => {
    const vtt = `WEBVTT
NOTE This is a comment

00:00:01.000 --> 00:00:03.000
Actual content
`;
    const segments = parseVTT(vtt);
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe('Actual content');
  });

  it('skips numeric cue identifiers', () => {
    const vtt = `WEBVTT

1
00:00:01.000 --> 00:00:03.000
First cue

2
00:00:03.000 --> 00:00:05.000
Second cue
`;
    const segments = parseVTT(vtt);
    expect(segments.length).toBe(2);
    expect(segments[0].text).toBe('First cue');
    expect(segments[1].text).toBe('Second cue');
  });

  it('handles empty VTT content', () => {
    expect(parseVTT('WEBVTT\n')).toEqual([]);
  });
});
