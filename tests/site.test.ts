/**
 * Site generation tests — nav links, page structure, and content integrity.
 *
 * These tests generate a real static site from the project data and validate
 * that all internal links resolve correctly across page depths.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { generateSite, type SiteResult } from '../src/cli/site.js';
import { tmpdir } from 'os';
import { mkdirSync, rmSync } from 'fs';

const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const OUTPUT_DIR = resolve(tmpdir(), `learn-site-test-${process.pid}`);

let result: SiteResult;

beforeAll(async () => {
  // Clean up and generate site
  if (existsSync(OUTPUT_DIR)) rmSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  result = await generateSite(PROJECT_ROOT, OUTPUT_DIR);
}, 60_000);

// ── Helpers ────────────────────────────────────────────────────────

/** Extract all href values from nav-item links in an HTML file */
function extractNavHrefs(html: string): string[] {
  const matches = [...html.matchAll(/class="nav-item[^"]*"\s+href="([^"]+)"/g)];
  return matches.map(m => m[1]);
}

/** Extract all href values from any <a> tag */
function extractAllHrefs(html: string): string[] {
  const matches = [...html.matchAll(/href="([^"#]+)"/g)];
  return matches.map(m => m[1]);
}

/** Resolve a relative href from a page's directory to an absolute file path */
function resolveHref(pageDir: string, href: string): string {
  // Filter out external URLs
  if (href.startsWith('http://') || href.startsWith('https://')) return '';
  return resolve(pageDir, href);
}

/** Collect all .html files recursively */
function collectHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

// ── Generation smoke tests ─────────────────────────────────────────

describe('site generation', () => {
  it('generates pages successfully', () => {
    expect(result.pages).toBeGreaterThan(0);
    expect(result.courses).toBeGreaterThan(0);
  });

  it('creates index.html at root', () => {
    expect(existsSync(resolve(OUTPUT_DIR, 'index.html'))).toBe(true);
  });

  it('creates search-index.json', () => {
    expect(existsSync(resolve(OUTPUT_DIR, 'search-index.json'))).toBe(true);
    const data = JSON.parse(readFileSync(resolve(OUTPUT_DIR, 'search-index.json'), 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(result.searchEntries);
  });

  it('creates quiz-data.json', () => {
    expect(existsSync(resolve(OUTPUT_DIR, 'quiz-data.json'))).toBe(true);
    const data = JSON.parse(readFileSync(resolve(OUTPUT_DIR, 'quiz-data.json'), 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(result.quizConcepts);
  });

  it('creates Anki export file', () => {
    expect(existsSync(resolve(OUTPUT_DIR, 'exports', 'anki.txt'))).toBe(true);
  });

  it('creates a course subdirectory for each course', () => {
    // There should be at least one course directory with an index.html
    const courseDirs = readdirSync(OUTPUT_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'papers' && d.name !== 'exports');
    expect(courseDirs.length).toBeGreaterThan(0);

    for (const dir of courseDirs) {
      expect(existsSync(resolve(OUTPUT_DIR, dir.name, 'index.html'))).toBe(true);
    }
  });
});

// ── Navigation link tests ──────────────────────────────────────────

describe('sidebar navigation links', () => {
  it('root page nav links all resolve to existing files', () => {
    const indexHtml = readFileSync(resolve(OUTPUT_DIR, 'index.html'), 'utf-8');
    const hrefs = extractNavHrefs(indexHtml);
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const target = resolveHref(OUTPUT_DIR, href);
      if (!target) continue;
      expect(existsSync(target), `Root nav link broken: ${href}`).toBe(true);
    }
  });

  it('course index pages nav links all resolve correctly', () => {
    const courseDirs = readdirSync(OUTPUT_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'papers' && d.name !== 'exports');

    for (const dir of courseDirs) {
      const indexPath = resolve(OUTPUT_DIR, dir.name, 'index.html');
      if (!existsSync(indexPath)) continue;

      const html = readFileSync(indexPath, 'utf-8');
      const hrefs = extractNavHrefs(html);
      const pageDir = resolve(OUTPUT_DIR, dir.name);

      for (const href of hrefs) {
        const target = resolveHref(pageDir, href);
        if (!target) continue;
        expect(existsSync(target),
          `Nav link broken on ${dir.name}/index.html: href="${href}" → ${target}`
        ).toBe(true);
      }
    }
  });

  it('lecture pages nav links all resolve correctly', () => {
    const courseDirs = readdirSync(OUTPUT_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'papers' && d.name !== 'exports');

    for (const dir of courseDirs) {
      const courseDir = resolve(OUTPUT_DIR, dir.name);
      const lectureFiles = readdirSync(courseDir)
        .filter(f => f.endsWith('.html') && f !== 'index.html');

      for (const file of lectureFiles) {
        const html = readFileSync(resolve(courseDir, file), 'utf-8');
        const hrefs = extractNavHrefs(html);

        for (const href of hrefs) {
          const target = resolveHref(courseDir, href);
          if (!target) continue;
          expect(existsSync(target),
            `Nav link broken on ${dir.name}/${file}: href="${href}" → ${target}`
          ).toBe(true);
        }
      }
    }
  });

  it('papers pages nav links all resolve correctly', () => {
    const papersDir = resolve(OUTPUT_DIR, 'papers');
    if (!existsSync(papersDir)) return;

    const allPaperHtml = collectHtmlFiles(papersDir);
    for (const filePath of allPaperHtml) {
      const html = readFileSync(filePath, 'utf-8');
      const hrefs = extractNavHrefs(html);
      const pageDir = resolve(filePath, '..');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');

      for (const href of hrefs) {
        const target = resolveHref(pageDir, href);
        if (!target) continue;
        expect(existsSync(target),
          `Nav link broken on ${relPath}: href="${href}" → ${target}`
        ).toBe(true);
      }
    }
  });

  it('nav links use ../ prefix on depth-1 pages (not bare relative)', () => {
    // Regression test for the bug where mse435 → mit-6s191 produced
    // /mse435/mit-6s191/index.html instead of /mit-6s191/index.html
    const courseDirs = readdirSync(OUTPUT_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'papers' && d.name !== 'exports');

    if (courseDirs.length < 2) return;

    const firstCourse = courseDirs[0].name;
    const html = readFileSync(resolve(OUTPUT_DIR, firstCourse, 'index.html'), 'utf-8');
    const hrefs = extractNavHrefs(html);

    // Every nav link from a course page should start with ../
    for (const href of hrefs) {
      expect(href.startsWith('../'),
        `Course page ${firstCourse}/index.html has nav link without ../ prefix: "${href}"`
      ).toBe(true);
    }
  });
});

// ── Cross-page link integrity ──────────────────────────────────────

describe('all internal links', () => {
  it('every internal href in every page resolves to an existing file', () => {
    const allFiles = collectHtmlFiles(OUTPUT_DIR);
    const broken: string[] = [];

    for (const filePath of allFiles) {
      const html = readFileSync(filePath, 'utf-8');
      const hrefs = extractAllHrefs(html);
      const pageDir = resolve(filePath, '..');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');

      for (const href of hrefs) {
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) continue;
        if (href.startsWith('javascript:') || href.startsWith('data:')) continue;
        const target = resolve(pageDir, href);
        if (!existsSync(target)) {
          broken.push(`${relPath}: href="${href}"`);
        }
      }
    }

    expect(broken, `Broken internal links:\n${broken.join('\n')}`).toEqual([]);
  });
});

// ── Page structure tests ───────────────────────────────────────────

describe('page structure', () => {
  it('every page has a <title> tag', () => {
    const allFiles = collectHtmlFiles(OUTPUT_DIR);
    for (const filePath of allFiles) {
      const html = readFileSync(filePath, 'utf-8');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');
      expect(html, `Missing <title> in ${relPath}`).toMatch(/<title>.+<\/title>/);
    }
  });

  it('every page has the sidebar nav', () => {
    const allFiles = collectHtmlFiles(OUTPUT_DIR);
    for (const filePath of allFiles) {
      const html = readFileSync(filePath, 'utf-8');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');
      expect(html, `Missing sidebar in ${relPath}`).toContain('id="sidebar"');
    }
  });

  it('every page has the toolbar', () => {
    const allFiles = collectHtmlFiles(OUTPUT_DIR);
    for (const filePath of allFiles) {
      const html = readFileSync(filePath, 'utf-8');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');
      expect(html, `Missing toolbar in ${relPath}`).toContain('id="toolbar-toggle"');
    }
  });

  it('every page includes the refresh button (hidden by default)', () => {
    const allFiles = collectHtmlFiles(OUTPUT_DIR);
    for (const filePath of allFiles) {
      const html = readFileSync(filePath, 'utf-8');
      const relPath = filePath.replace(OUTPUT_DIR + '/', '');
      expect(html, `Missing refresh button in ${relPath}`).toContain('id="refresh-btn"');
    }
  });

  it('home page has hero stats section', () => {
    const html = readFileSync(resolve(OUTPUT_DIR, 'index.html'), 'utf-8');
    expect(html).toContain('hero-stats');
    expect(html).toContain('Courses');
    expect(html).toContain('Lectures');
  });
});
