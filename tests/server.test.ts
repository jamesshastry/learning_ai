/**
 * Server API endpoint tests.
 *
 * Spins up a minimal Express server with the same API logic as serve.ts,
 * backed by a synthetic test project. Validates search, quiz, courses, and ask endpoints.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'path';
import { mkdirSync, rmSync, existsSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import express from 'express';
import { writeYaml, writeText, ensureDir, readYaml } from '../src/utils/files.js';
import type { CourseConfig, ConceptsYaml } from '../src/types.js';
import type { Server } from 'http';

const TMP = resolve(tmpdir(), `learn-server-test-${process.pid}`);
const SITE_DIR = resolve(TMP, 'site');
const PORT = 9876 + (process.pid % 1000);
let server: Server;
let baseUrl: string;

function createTestProject(): void {
  const courseDir = resolve(TMP, 'courses', 'test-course');
  const lecDir = resolve(courseDir, 'lectures', '01-intro');
  ensureDir(lecDir);

  writeYaml(resolve(courseDir, 'course.yaml'), {
    name: 'test-course',
    title: 'Test Course',
    university: 'Test U',
    lectures: [
      { id: '01', title: 'Introduction', status: 'completed' },
      { id: '02', title: 'Advanced Topics', status: 'completed' },
    ],
  });

  writeText(resolve(lecDir, 'notes.md'), `# Introduction
## Key Points
- Transformers use attention mechanisms
- Self-attention computes queries, keys, and values
`);

  writeText(resolve(lecDir, 'transcript.txt'), `[00:01] Welcome to the course
[00:30] Today we'll talk about transformers
`);

  writeYaml(resolve(lecDir, 'concepts.yaml'), {
    concepts: [
      { name: 'Transformer', aliases: [], definition: 'A neural network architecture', tags: ['arch'], relations: [], timestamps: [] },
      { name: 'Attention', aliases: [], definition: 'Focus mechanism', tags: ['mech'], relations: [], timestamps: [] },
    ],
  });

  const lec2Dir = resolve(courseDir, 'lectures', '02-advanced');
  ensureDir(lec2Dir);
  writeText(resolve(lec2Dir, 'notes.md'), '# Advanced\n## Scaling\n- Scaling laws govern performance\n');
  writeYaml(resolve(lec2Dir, 'concepts.yaml'), {
    concepts: [
      { name: 'Scaling Laws', aliases: [], definition: 'Power law relationships', tags: ['scaling'], relations: [], timestamps: [] },
    ],
  });

  ensureDir(SITE_DIR);
  writeText(resolve(SITE_DIR, 'index.html'), '<html><body>Test</body></html>');
}

beforeAll(async () => {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  createTestProject();

  const app = express();
  app.use(express.json());
  app.use(express.static(SITE_DIR));

  const coursesDir = resolve(TMP, 'courses');

  app.post('/api/search', (req, res) => {
    const { query, course: courseFilter, notesOnly } = req.body as {
      query: string; course?: string; notesOnly?: boolean;
    };
    if (!query) { res.json({ results: [], error: 'No query provided' }); return; }
    const queryLower = query.toLowerCase();
    const results: Array<{ course: string; lecture: string; file: string; matches: Array<{ line: number; text: string }> }> = [];
    const cDirs = courseFilter ? [courseFilter] : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis');
    for (const cd of cDirs) {
      const lectDir = resolve(coursesDir, cd, 'lectures');
      if (!existsSync(lectDir)) continue;
      for (const ld of readdirSync(lectDir).filter(d => !d.startsWith('.')).sort()) {
        const files = notesOnly ? ['notes.md'] : ['notes.md', 'transcript.txt', 'concepts.yaml'];
        for (const fn of files) {
          const fp = resolve(lectDir, ld, fn);
          if (!existsSync(fp)) continue;
          const content = readFileSync(fp, 'utf-8');
          const lines = content.split('\n');
          const matches: Array<{ line: number; text: string }> = [];
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(queryLower)) matches.push({ line: i + 1, text: lines[i].trim().substring(0, 200) });
          }
          if (matches.length > 0) results.push({ course: cd, lecture: ld, file: fn, matches: matches.slice(0, 5) });
        }
      }
    }
    res.json({ results, total: results.reduce((s, r) => s + r.matches.length, 0) });
  });

  app.post('/api/quiz', (req, res) => {
    const { course: courseName } = req.body as { course?: string };
    const concepts: Array<{ name: string; definition: string; course: string; lecture: string }> = [];
    const cDirs = courseName ? [courseName] : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis');
    for (const cd of cDirs) {
      const lectDir = resolve(coursesDir, cd, 'lectures');
      if (!existsSync(lectDir)) continue;
      for (const ld of readdirSync(lectDir).filter(d => !d.startsWith('.')).sort()) {
        const data = readYaml<ConceptsYaml>(resolve(lectDir, ld, 'concepts.yaml'));
        if (!data?.concepts) continue;
        for (const c of data.concepts) concepts.push({ name: c.name, definition: c.definition, course: cd, lecture: ld.split('-')[0] });
      }
    }
    res.json({ questions: concepts.sort(() => Math.random() - 0.5).slice(0, 10), total: concepts.length });
  });

  app.get('/api/courses', (_req, res) => {
    const courses: Array<{ name: string; title: string }> = [];
    for (const d of readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis')) {
      const cfg = readYaml<CourseConfig>(resolve(coursesDir, d, 'course.yaml'));
      if (cfg) courses.push({ name: cfg.name, title: cfg.title });
    }
    res.json({ courses });
  });

  app.post('/api/ask', (_req, res) => {
    res.json({ answer: '', error: 'No LLM API key configured.' });
  });

  baseUrl = `http://localhost:${PORT}`;
  server = app.listen(PORT);
  await new Promise<void>(r => server.on('listening', r));
}, 10_000);

afterAll(() => {
  server?.close();
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
});

// ── Search ─────────────────────────────────────────────────────────

describe('/api/search', () => {
  it('returns results for matching query', async () => {
    const res = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'transformers' }) });
    const data = await res.json() as { results: unknown[]; total: number };
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });

  it('returns empty for non-matching query', async () => {
    const res = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'xyznonexistent123' }) });
    const data = await res.json() as { results: unknown[] };
    expect(data.results).toEqual([]);
  });

  it('returns error when query is empty', async () => {
    const res = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '' }) });
    const data = await res.json() as { error: string };
    expect(data.error).toBeDefined();
  });

  it('filters by course', async () => {
    const res = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'attention', course: 'test-course' }) });
    const data = await res.json() as { results: Array<{ course: string }> };
    for (const r of data.results) expect(r.course).toBe('test-course');
  });

  it('respects notesOnly flag', async () => {
    const res = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'transformers', notesOnly: true }) });
    const data = await res.json() as { results: Array<{ file: string }> };
    for (const r of data.results) expect(r.file).toBe('notes.md');
  });
});

// ── Quiz ───────────────────────────────────────────────────────────

describe('/api/quiz', () => {
  it('returns quiz questions with name and definition', async () => {
    const res = await fetch(`${baseUrl}/api/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const data = await res.json() as { questions: Array<{ name: string; definition: string }>; total: number };
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.total).toBe(3); // 2 from lecture 1 + 1 from lecture 2
    expect(data.questions[0]).toHaveProperty('name');
    expect(data.questions[0]).toHaveProperty('definition');
  });

  it('caps at 10 questions', async () => {
    const res = await fetch(`${baseUrl}/api/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const data = await res.json() as { questions: unknown[] };
    expect(data.questions.length).toBeLessThanOrEqual(10);
  });
});

// ── Courses ────────────────────────────────────────────────────────

describe('/api/courses', () => {
  it('returns course list with name and title', async () => {
    const res = await fetch(`${baseUrl}/api/courses`);
    const data = await res.json() as { courses: Array<{ name: string; title: string }> };
    expect(data.courses.length).toBe(1);
    expect(data.courses[0]).toEqual({ name: 'test-course', title: 'Test Course' });
  });
});

// ── Ask ────────────────────────────────────────────────────────────

describe('/api/ask', () => {
  it('returns error when no LLM configured', async () => {
    const res = await fetch(`${baseUrl}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: 'What is attention?' }) });
    const data = await res.json() as { answer: string; error: string };
    expect(data.error).toBeDefined();
    expect(data.answer).toBe('');
  });
});
