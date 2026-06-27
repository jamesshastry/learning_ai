/**
 * Knowledge graph merge algorithm tests.
 *
 * Tests concept merging, deduplication, ambiguity detection, and paper linking.
 * Uses a temporary project structure with synthetic course data.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { writeYaml, writeText, ensureDir } from '../src/utils/files.js';
import { mergeAllConcepts } from '../src/graph/merge.js';
import type { ConceptsYaml } from '../src/types.js';

const TMP = resolve(tmpdir(), `learn-graph-test-${process.pid}`);

beforeEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  mkdirSync(TMP, { recursive: true });
});

afterEach(() => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
});

/** Create a minimal course with concepts */
function createCourse(
  name: string,
  lectures: Array<{ id: string; slug: string; concepts: ConceptsYaml['concepts'] }>
): void {
  const courseDir = resolve(TMP, 'courses', name);
  ensureDir(courseDir);

  writeYaml(resolve(courseDir, 'course.yaml'), {
    name,
    title: name.toUpperCase(),
    lectures: lectures.map(l => ({ id: l.id, title: l.slug, status: 'completed' })),
  });

  for (const lec of lectures) {
    const lecDir = resolve(courseDir, 'lectures', `${lec.id}-${lec.slug}`);
    ensureDir(lecDir);
    writeYaml(resolve(lecDir, 'concepts.yaml'), { concepts: lec.concepts });
  }
}

// ── Basic merge ────────────────────────────────────────────────────

describe('mergeAllConcepts', () => {
  it('loads concepts from a single course', () => {
    createCourse('test', [{
      id: '01', slug: 'intro',
      concepts: [{
        name: 'Transformer',
        aliases: [],
        definition: 'A neural network architecture',
        tags: ['architecture'],
        relations: [],
        timestamps: ['0:01:00'],
      }],
    }]);

    const result = mergeAllConcepts(TMP);
    const concepts = result.concepts.filter(c => c.nodeType === 'concept');
    expect(concepts.length).toBe(1);
    expect(concepts[0].name).toBe('Transformer');
    expect(concepts[0].sources.length).toBe(1);
    expect(concepts[0].sources[0].course).toBe('test');
  });

  it('merges same concept from different lectures', () => {
    createCourse('cs1', [{
      id: '01', slug: 'intro',
      concepts: [{
        name: 'Attention',
        aliases: ['Self-Attention'],
        definition: 'A mechanism',
        tags: ['nlp'],
        relations: [],
        timestamps: ['0:05:00'],
      }],
    }]);

    createCourse('cs2', [{
      id: '01', slug: 'transformers',
      concepts: [{
        name: 'Attention',
        aliases: [],
        definition: 'A mechanism that allows focusing on relevant parts of the input',
        tags: ['architecture'],
        relations: [{ target: 'Transformer', type: 'part_of' }],
        timestamps: ['0:10:00'],
      }],
    }]);

    const result = mergeAllConcepts(TMP);
    const concepts = result.concepts.filter(c => c.nodeType === 'concept');
    const attention = concepts.find(c => c.name === 'Attention');

    expect(attention).toBeDefined();
    expect(attention!.sources.length).toBe(2);
    // Should keep the longer definition
    expect(attention!.definition).toContain('focusing on relevant parts');
    // Should union aliases
    expect(attention!.aliases).toContain('Self-Attention');
    // Should union tags
    expect(attention!.tags).toContain('nlp');
    expect(attention!.tags).toContain('architecture');
    // Should union relations
    expect(attention!.relations.length).toBe(1);
    expect(attention!.relations[0].target).toBe('Transformer');
  });

  it('merges by alias match', () => {
    createCourse('c1', [{
      id: '01', slug: 'a',
      concepts: [{
        name: 'Reinforcement Learning from Human Feedback',
        aliases: ['RLHF'],
        definition: 'A training technique',
        tags: ['rl'], relations: [], timestamps: [],
      }],
    }]);

    createCourse('c2', [{
      id: '01', slug: 'b',
      concepts: [{
        name: 'RLHF',
        aliases: [],
        definition: 'Reinforcement Learning from Human Feedback aligns models',
        tags: ['alignment'], relations: [], timestamps: [],
      }],
    }]);

    const result = mergeAllConcepts(TMP);
    const concepts = result.concepts.filter(c => c.nodeType === 'concept');
    // Should be merged into one concept, not two
    const rlhf = concepts.filter(c =>
      c.name.includes('RLHF') || c.name.includes('Reinforcement Learning from Human Feedback')
    );
    expect(rlhf.length).toBe(1);
    // Should keep the longer name
    expect(rlhf[0].name).toBe('Reinforcement Learning from Human Feedback');
    expect(rlhf[0].sources.length).toBe(2);
  });

  it('keeps distinct concepts separate', () => {
    createCourse('c1', [{
      id: '01', slug: 'intro',
      concepts: [
        { name: 'CNN', aliases: [], definition: 'Convolutional Neural Network', tags: [], relations: [], timestamps: [] },
        { name: 'RNN', aliases: [], definition: 'Recurrent Neural Network', tags: [], relations: [], timestamps: [] },
      ],
    }]);

    const result = mergeAllConcepts(TMP);
    const concepts = result.concepts.filter(c => c.nodeType === 'concept');
    expect(concepts.length).toBe(2);
  });

  it('detects near-duplicate ambiguities', () => {
    createCourse('c1', [{
      id: '01', slug: 'a',
      concepts: [
        { name: 'Transformer Architecture', aliases: [], definition: 'A', tags: [], relations: [], timestamps: [] },
        { name: 'Transformer Architectures', aliases: [], definition: 'B', tags: [], relations: [], timestamps: [] },
      ],
    }]);

    const result = mergeAllConcepts(TMP);
    // These should be flagged as near-duplicates
    const nearDups = result.ambiguities.filter(a => a.type === 'near_duplicate');
    expect(nearDups.length).toBeGreaterThan(0);
  });

  it('returns empty result for project with no courses', () => {
    ensureDir(resolve(TMP, 'courses'));
    const result = mergeAllConcepts(TMP);
    expect(result.concepts.length).toBe(0);
    expect(result.ambiguities.length).toBe(0);
  });
});

// ── Paper integration ──────────────────────────────────────────────

describe('paper nodes', () => {
  it('loads papers as nodeType paper', () => {
    ensureDir(resolve(TMP, 'courses'));
    const paperDir = resolve(TMP, 'papers', 'foundations');
    ensureDir(paperDir);

    writeText(resolve(paperDir, 'attention-is-all-you-need.md'), `---
type: paper
title: "Attention Is All You Need"
authors: [Vaswani et al.]
year: 2017
venue: NeurIPS
tags: [transformer, attention, architecture]
---

# Summary
The paper that introduced the Transformer architecture.

## Key Contributions
- Self-attention mechanism
- Positional encoding
`);

    const result = mergeAllConcepts(TMP);
    const papers = result.concepts.filter(c => c.nodeType === 'paper');
    expect(papers.length).toBe(1);
    expect(papers[0].name).toContain('Attention Is All You Need');
    expect(papers[0].tags).toContain('transformer');
  });
});
