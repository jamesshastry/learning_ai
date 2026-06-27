/**
 * Synthesis helper tests — source collection, section extraction, context building.
 *
 * Tests the pure functions in synthesize.ts that gather and organize
 * cross-course content for synthesis generation.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { writeYaml, writeText, ensureDir, appendLine } from '../src/utils/files.js';
import {
  collectSources,
  extractRelevantSections,
  buildSynthesisContext,
  type SourceExcerpt,
} from '../src/cli/synthesize.js';

const TMP = resolve(tmpdir(), `learn-synth-test-${process.pid}`);

beforeEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  ensureDir(TMP);
});

afterEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
});

function createCourseWithNotes(courseName: string, lectures: Array<{ id: string; slug: string; notes: string }>): void {
  const courseDir = resolve(TMP, 'courses', courseName);
  ensureDir(courseDir);
  writeYaml(resolve(courseDir, 'course.yaml'), {
    name: courseName, title: courseName, lectures: lectures.map(l => ({ id: l.id, title: l.slug, status: 'completed' })),
  });
  for (const lec of lectures) {
    const lecDir = resolve(courseDir, 'lectures', `${lec.id}-${lec.slug}`);
    ensureDir(lecDir);
    writeText(resolve(lecDir, 'notes.md'), lec.notes);
  }
}

// ── collectSources ─────────────────────────────────────────────────

describe('collectSources', () => {
  it('finds sources across multiple courses', () => {
    createCourseWithNotes('cs1', [{
      id: '01', slug: 'intro',
      notes: '# Intro\n## Attention\nThe attention mechanism is fundamental.\n',
    }]);
    createCourseWithNotes('cs2', [{
      id: '01', slug: 'deep',
      notes: '# Deep Learning\n## Models\nModels use attention for sequence tasks.\n',
    }]);

    const sources = collectSources(TMP, 'attention');
    expect(sources.length).toBe(2);
    expect(sources.map(s => s.course)).toContain('cs1');
    expect(sources.map(s => s.course)).toContain('cs2');
  });

  it('returns empty when no matches', () => {
    createCourseWithNotes('cs1', [{
      id: '01', slug: 'intro', notes: '# Intro\nNothing relevant here.\n',
    }]);
    const sources = collectSources(TMP, 'quantum computing');
    expect(sources).toEqual([]);
  });

  it('is case-insensitive', () => {
    createCourseWithNotes('cs1', [{
      id: '01', slug: 'intro', notes: '# Intro\nTRANSFORMER architecture is powerful.\n',
    }]);
    const sources = collectSources(TMP, 'transformer');
    expect(sources.length).toBe(1);
  });

  it('skips synthesis directory', () => {
    createCourseWithNotes('cs1', [{
      id: '01', slug: 'intro', notes: '# Transformers are great\n',
    }]);
    // Create a synthesis dir with matching content
    const synthDir = resolve(TMP, 'courses', 'synthesis');
    ensureDir(synthDir);
    writeText(resolve(synthDir, 'transformers.md'), 'Transformers everywhere');

    const sources = collectSources(TMP, 'transformers');
    expect(sources.every(s => s.course !== 'synthesis')).toBe(true);
  });

  it('caps excerpt length at 3000 chars', () => {
    const longContent = '# Topic\n## Attention\n' + 'attention '.repeat(500);
    createCourseWithNotes('cs1', [{ id: '01', slug: 'long', notes: longContent }]);

    const sources = collectSources(TMP, 'attention');
    expect(sources[0].excerpt.length).toBeLessThanOrEqual(3000);
  });

  it('returns empty for project with no courses dir', () => {
    expect(collectSources(TMP, 'anything')).toEqual([]);
  });
});

// ── extractRelevantSections ────────────────────────────────────────

describe('extractRelevantSections', () => {
  it('extracts sections mentioning the topic', () => {
    const content = `# Lecture
## Introduction
This is about general things.

## Attention Mechanism
The attention mechanism allows focusing on relevant parts.

## Conclusion
Wrapping up.`;

    const result = extractRelevantSections(content, 'attention');
    expect(result).toContain('Attention Mechanism');
    expect(result).toContain('focusing on relevant parts');
    expect(result).not.toContain('general things');
    expect(result).not.toContain('Wrapping up');
  });

  it('includes sections where topic appears in body (not heading)', () => {
    const content = `# Lecture
## Architecture
The transformer uses attention to process sequences.`;

    const result = extractRelevantSections(content, 'attention');
    expect(result).toContain('Architecture');
    expect(result).toContain('attention');
  });

  it('returns empty string when no matches', () => {
    const content = `# Lecture\n## Intro\nNothing here.\n`;
    expect(extractRelevantSections(content, 'quantum')).toBe('');
  });

  it('caps output at 3000 chars', () => {
    const content = '# Topic\n## Attention\n' + 'attention is important. '.repeat(200);
    const result = extractRelevantSections(content, 'attention');
    expect(result.length).toBeLessThanOrEqual(3000);
  });
});

// ── buildSynthesisContext ──────────────────────────────────────────

describe('buildSynthesisContext', () => {
  it('groups sources by course', () => {
    const sources: SourceExcerpt[] = [
      { course: 'cs1', lectureId: '01', lectureTitle: 'intro', type: 'notes', excerpt: 'Content A' },
      { course: 'cs1', lectureId: '02', lectureTitle: 'deep', type: 'notes', excerpt: 'Content B' },
      { course: 'cs2', lectureId: '01', lectureTitle: 'start', type: 'notes', excerpt: 'Content C' },
    ];

    const context = buildSynthesisContext(sources, []);
    expect(context).toContain('### Course: cs1');
    expect(context).toContain('### Course: cs2');
    expect(context).toContain('Content A');
    expect(context).toContain('Content C');
  });

  it('includes concept list when provided', () => {
    const sources: SourceExcerpt[] = [
      { course: 'cs1', lectureId: '01', lectureTitle: 'intro', type: 'notes', excerpt: 'Content' },
    ];
    const concepts = ['Transformer', 'Attention', 'BERT'];

    const context = buildSynthesisContext(sources, concepts);
    expect(context).toContain('Related Concepts');
    expect(context).toContain('- Transformer');
    expect(context).toContain('- BERT');
  });

  it('omits concept section when empty', () => {
    const sources: SourceExcerpt[] = [
      { course: 'cs1', lectureId: '01', lectureTitle: 'intro', type: 'notes', excerpt: 'Content' },
    ];
    const context = buildSynthesisContext(sources, []);
    expect(context).not.toContain('Related Concepts');
  });

  it('handles empty sources', () => {
    const context = buildSynthesisContext([], ['Transformer']);
    expect(context).toContain('Transformer');
  });
});
