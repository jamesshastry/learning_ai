/**
 * Graph builder tests — Obsidian markdown generation, graph data structure, concept slugs.
 *
 * Tests the graph builder functions that transform merged concepts into
 * Obsidian vault files, D3.js graph data, and file-safe slugs.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { mkdirSync, rmSync, existsSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import {
  slugifyConcept,
  generateConceptMarkdown,
  buildGraphData,
  buildGraph,
} from '../src/graph/builder.js';
import { writeYaml, writeText, ensureDir } from '../src/utils/files.js';
import type { MergedConcept } from '../src/graph/merge.js';

const TMP = resolve(tmpdir(), `learn-builder-test-${process.pid}`);

function makeConcept(overrides: Partial<MergedConcept> = {}): MergedConcept {
  return {
    name: 'Test Concept',
    aliases: [],
    definition: 'A test concept definition',
    tags: ['test'],
    nodeType: 'concept',
    first_seen: 'cs153/01',
    sources: [{ course: 'cs153', lecture: '01', timestamps: ['0:01:00'] }],
    relations: [],
    ...overrides,
  };
}

// ── slugifyConcept ─────────────────────────────────────────────────

describe('slugifyConcept', () => {
  it('converts names to lowercase hyphenated slugs', () => {
    expect(slugifyConcept('Transformer Architecture')).toBe('transformer-architecture');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugifyConcept('Q-Learning (Off-Policy)')).toBe('q-learning-off-policy');
  });

  it('collapses multiple hyphens', () => {
    expect(slugifyConcept('A & B & C')).toBe('a-b-c');
  });

  it('strips leading/trailing hyphens', () => {
    expect(slugifyConcept('--hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugifyConcept('')).toBe('');
  });

  it('handles unicode characters', () => {
    expect(slugifyConcept('Réseau Neuronal')).toBe('rseau-neuronal');
  });
});

// ── generateConceptMarkdown ────────────────────────────────────────

describe('generateConceptMarkdown', () => {
  it('includes YAML frontmatter', () => {
    const md = generateConceptMarkdown(makeConcept());
    expect(md).toMatch(/^---\n/);
    expect(md).toContain('aliases:');
    expect(md).toContain('tags:');
    expect(md).toContain('type: concept');
  });

  it('includes definition in body', () => {
    const md = generateConceptMarkdown(makeConcept({ definition: 'Neural net architecture' }));
    expect(md).toContain('Neural net architecture');
  });

  it('includes source information', () => {
    const md = generateConceptMarkdown(makeConcept({
      sources: [
        { course: 'cs153', lecture: '01', timestamps: ['0:05:00'] },
        { course: 'cs336', lecture: '03', timestamps: ['0:10:00'] },
      ],
    }));
    expect(md).toContain('cs153');
    expect(md).toContain('cs336');
  });

  it('formats relations as wiki-links', () => {
    const md = generateConceptMarkdown(makeConcept({
      relations: [
        { target: 'Attention Mechanism', type: 'uses' },
        { target: 'BERT', type: 'related_to' },
      ],
    }));
    expect(md).toContain('[[Attention Mechanism]]');
    expect(md).toContain('[[BERT]]');
  });

  it('handles paper nodes', () => {
    const md = generateConceptMarkdown(makeConcept({
      name: 'Attention Is All You Need',
      nodeType: 'paper',
    }));
    expect(md).toContain('type: paper');
  });

  it('handles empty aliases and relations', () => {
    const md = generateConceptMarkdown(makeConcept({ aliases: [], relations: [] }));
    expect(md).toContain('aliases: []');
  });
});

// ── buildGraphData ─────────────────────────────────────────────────

describe('buildGraphData', () => {
  it('creates nodes from concepts', () => {
    const concepts = [
      makeConcept({ name: 'Alpha' }),
      makeConcept({ name: 'Beta' }),
    ];
    const graph = buildGraphData(concepts);
    expect(graph.nodes.length).toBe(2);
    expect(graph.nodes[0].id).toBe('alpha');
    expect(graph.nodes[0].name).toBe('Alpha');
    expect(graph.nodes[1].id).toBe('beta');
  });

  it('creates edges from relations', () => {
    const concepts = [
      makeConcept({ name: 'Transformer', relations: [{ target: 'Attention', type: 'uses' }] }),
      makeConcept({ name: 'Attention' }),
    ];
    const graph = buildGraphData(concepts);
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0].source).toBe('transformer');
    expect(graph.edges[0].target).toBe('attention');
  });

  it('skips edges to non-existent concepts', () => {
    const concepts = [
      makeConcept({ name: 'A', relations: [{ target: 'Nonexistent', type: 'uses' }] }),
    ];
    const graph = buildGraphData(concepts);
    expect(graph.edges.length).toBe(0);
  });

  it('deduplicates edges', () => {
    const concepts = [
      makeConcept({ name: 'A', relations: [
        { target: 'B', type: 'uses' },
        { target: 'B', type: 'uses' },
      ]}),
      makeConcept({ name: 'B' }),
    ];
    const graph = buildGraphData(concepts);
    expect(graph.edges.length).toBe(1);
  });

  it('includes nodeType in nodes', () => {
    const concepts = [
      makeConcept({ name: 'Concept', nodeType: 'concept' }),
      makeConcept({ name: 'Paper', nodeType: 'paper' }),
    ];
    const graph = buildGraphData(concepts);
    expect(graph.nodes.find(n => n.name === 'Concept')?.nodeType).toBe('concept');
    expect(graph.nodes.find(n => n.name === 'Paper')?.nodeType).toBe('paper');
  });

  it('handles empty input', () => {
    const graph = buildGraphData([]);
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });
});

// ── buildGraph integration ─────────────────────────────────────────

describe('buildGraph', () => {
  beforeEach(() => {
    if (existsSync(TMP)) rmSync(TMP, { recursive: true });
    mkdirSync(TMP, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  });

  it('generates graph files from course concepts', () => {
    // Create a test course with concepts
    const courseDir = resolve(TMP, 'courses', 'test');
    const lecDir = resolve(courseDir, 'lectures', '01-intro');
    ensureDir(lecDir);

    writeYaml(resolve(courseDir, 'course.yaml'), {
      name: 'test', title: 'Test', lectures: [{ id: '01', title: 'Intro', status: 'completed' }],
    });

    writeYaml(resolve(lecDir, 'concepts.yaml'), {
      concepts: [
        { name: 'Alpha', aliases: [], definition: 'First concept', tags: ['test'], relations: [{ target: 'Beta', type: 'related_to' }], timestamps: [] },
        { name: 'Beta', aliases: [], definition: 'Second concept', tags: ['test'], relations: [], timestamps: [] },
      ],
    });

    const result = buildGraph(TMP);

    // Check outputs exist
    const graphDir = resolve(TMP, 'knowledge-graph');
    expect(existsSync(resolve(graphDir, 'graph.json'))).toBe(true);
    expect(existsSync(resolve(graphDir, 'index.html'))).toBe(true);
    expect(existsSync(resolve(graphDir, 'concept-index.txt'))).toBe(true);
    expect(existsSync(resolve(graphDir, 'concepts'))).toBe(true);

    // Check graph.json content
    const graphJson = JSON.parse(readFileSync(resolve(graphDir, 'graph.json'), 'utf-8'));
    expect(graphJson.nodes.length).toBeGreaterThanOrEqual(2);
    expect(graphJson.edges.length).toBeGreaterThanOrEqual(1);

    // Check concept markdown files
    const conceptFiles = readdirSync(resolve(graphDir, 'concepts'));
    expect(conceptFiles.length).toBeGreaterThanOrEqual(2);

    // Check concept-index.txt
    const index = readFileSync(resolve(graphDir, 'concept-index.txt'), 'utf-8');
    expect(index).toContain('Alpha');
    expect(index).toContain('Beta');
  });

  it('handles project with no concepts', () => {
    ensureDir(resolve(TMP, 'courses'));
    const result = buildGraph(TMP);
    expect(result.concepts.length).toBe(0);
  });
});
