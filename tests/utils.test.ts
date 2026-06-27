/**
 * Utility function tests — files.ts, playlist slugify, config helpers.
 *
 * Tests the pure utility functions that the rest of the project depends on.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import {
  readYaml, writeYaml, readText, writeText, readJson, writeJson,
  ensureDir, appendLine, readLines, coursePath, lecturePath,
} from '../src/utils/files.js';

const TMP = resolve(tmpdir(), `learn-utils-test-${process.pid}`);

beforeEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  mkdirSync(TMP, { recursive: true });
});

afterEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
});

// ── YAML read/write ────────────────────────────────────────────────

describe('readYaml / writeYaml', () => {
  it('round-trips an object through YAML', () => {
    const data = { name: 'cs153', title: 'Frontier Systems', lectures: [{ id: '01' }] };
    const file = resolve(TMP, 'course.yaml');
    writeYaml(file, data);
    const result = readYaml<typeof data>(file);
    expect(result).toEqual(data);
  });

  it('returns undefined for missing files', () => {
    expect(readYaml(resolve(TMP, 'nope.yaml'))).toBeUndefined();
  });

  it('creates parent directories', () => {
    const file = resolve(TMP, 'deep', 'nested', 'data.yaml');
    writeYaml(file, { key: 'value' });
    expect(existsSync(file)).toBe(true);
  });

  it('writes atomically (via .tmp rename)', () => {
    // Write twice — if atomic, no corruption risk
    const file = resolve(TMP, 'atomic.yaml');
    writeYaml(file, { v: 1 });
    writeYaml(file, { v: 2 });
    expect(readYaml<{ v: number }>(file)?.v).toBe(2);
    // .tmp file should not be left behind
    expect(existsSync(file + '.tmp')).toBe(false);
  });
});

// ── Text read/write ────────────────────────────────────────────────

describe('readText / writeText', () => {
  it('round-trips text content', () => {
    const file = resolve(TMP, 'notes.md');
    writeText(file, '# Lecture 1\nSome content');
    expect(readText(file)).toBe('# Lecture 1\nSome content');
  });

  it('returns undefined for missing files', () => {
    expect(readText(resolve(TMP, 'missing.md'))).toBeUndefined();
  });

  it('handles empty content', () => {
    const file = resolve(TMP, 'empty.md');
    writeText(file, '');
    expect(readText(file)).toBe('');
  });

  it('preserves unicode content', () => {
    const file = resolve(TMP, 'unicode.md');
    const content = '# Aufmerksamkeitsmechanismus 🧠\n注意力机制';
    writeText(file, content);
    expect(readText(file)).toBe(content);
  });
});

// ── JSON read/write ────────────────────────────────────────────────

describe('readJson / writeJson', () => {
  it('round-trips JSON data', () => {
    const file = resolve(TMP, 'data.json');
    const data = { nodes: [{ id: 'a' }], edges: [{ from: 'a', to: 'b' }] };
    writeJson(file, data);
    expect(readJson(file)).toEqual(data);
  });

  it('returns undefined for missing files', () => {
    expect(readJson(resolve(TMP, 'nope.json'))).toBeUndefined();
  });
});

// ── ensureDir ──────────────────────────────────────────────────────

describe('ensureDir', () => {
  it('creates nested directories', () => {
    const dir = resolve(TMP, 'a', 'b', 'c');
    ensureDir(dir);
    expect(existsSync(dir)).toBe(true);
  });

  it('is idempotent', () => {
    const dir = resolve(TMP, 'exists');
    ensureDir(dir);
    ensureDir(dir); // Should not throw
    expect(existsSync(dir)).toBe(true);
  });
});

// ── appendLine / readLines ─────────────────────────────────────────

describe('appendLine / readLines', () => {
  it('appends lines to a new file', () => {
    const file = resolve(TMP, 'log.txt');
    appendLine(file, 'line 1');
    appendLine(file, 'line 2');
    expect(readLines(file)).toEqual(['line 1', 'line 2']);
  });

  it('filters empty lines on read', () => {
    const file = resolve(TMP, 'sparse.txt');
    writeText(file, 'a\n\n\nb\n\nc\n');
    expect(readLines(file)).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for missing file', () => {
    expect(readLines(resolve(TMP, 'nope.txt'))).toEqual([]);
  });
});

// ── Path builders ──────────────────────────────────────────────────

describe('path builders', () => {
  it('coursePath builds correct path', () => {
    expect(coursePath('/project', 'cs153')).toBe('/project/courses/cs153');
  });

  it('lecturePath pads ID and includes slug', () => {
    expect(lecturePath('/project', 'cs153', '3', 'attention'))
      .toBe('/project/courses/cs153/lectures/03-attention');
  });

  it('lecturePath handles already-padded IDs', () => {
    expect(lecturePath('/project', 'cs153', '03', 'attention'))
      .toBe('/project/courses/cs153/lectures/03-attention');
  });
});
