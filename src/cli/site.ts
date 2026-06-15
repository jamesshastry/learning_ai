import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, readText, writeText, ensureDir, readJson } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';
import type { CourseConfig, LectureEntry, Concept } from '../types.js';

// ─── Shared types ────────────────────────────────────────────────

interface PaperFrontmatter {
  type: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  resource?: string;
  tags?: string[];
}

interface PaperFile {
  frontmatter: PaperFrontmatter;
  body: string;
  relativePath: string; // e.g. "foundations/alexnet.md"
  category: string;     // e.g. "foundations"
}

interface ConceptsYaml {
  concepts: Concept[];
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    definition: string;
    tags: string[];
    sourceCount: number;
    sources: Array<{ course: string; lecture: string }>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    note?: string;
  }>;
}

interface CourseReading {
  title: string;
  url?: string;
  type: string;
  lecture_id?: string;
}

interface CourseWithReadings extends CourseConfig {
  readings?: CourseReading[];
}

// ─── CSS design system ───────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #0f1117;
  --surface: #1a1d2e;
  --surface2: #222537;
  --border: #2d3150;
  --text: #e8eaf6;
  --muted: #8892b0;
  --faint: #5a6785;
  --accent: #6366f1;
  --accent2: #22d3ee;
  --green: #10b981;
  --amber: #f59e0b;
  --red: #ef4444;
  --code-bg: #0d1117;
  --sidebar-w: 260px;
  --content-max: 820px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
#sidebar {
  width: var(--sidebar-w);
  background: #0d0f1a;
  border-right: 1px solid var(--border);
  padding: 24px 0;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}
.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.sidebar-logo {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 4px;
}
.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
.nav-section {
  padding: 8px 20px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--faint);
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 20px;
  color: var(--muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all .15s;
  border-left: 3px solid transparent;
}
.nav-item:hover { background: var(--surface); color: var(--text); }
.nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(99,102,241,.08); }
.nav-icon { font-size: 14px; width: 20px; text-align: center; }

/* ── Main content ── */
#main {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
}
#topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15,17,23,.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 14px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.breadcrumb { font-size: 13px; color: var(--muted); }
.breadcrumb a { color: var(--accent); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }

#content {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 32px 40px 80px;
}

/* ── Typography ── */
h1 { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 16px; line-height: 1.2; }
h2 { font-size: 20px; font-weight: 700; color: var(--text); margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
h3 { font-size: 16px; font-weight: 600; color: var(--text); margin: 20px 0 8px; }
p { margin-bottom: 12px; color: var(--text); }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
strong { font-weight: 600; }
blockquote {
  border-left: 3px solid var(--accent);
  padding: 10px 16px;
  margin: 16px 0;
  background: rgba(99,102,241,.06);
  border-radius: 0 8px 8px 0;
  color: var(--muted);
  font-style: italic;
}
code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--accent2);
}
pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}
pre code { background: none; padding: 0; color: var(--text); }
ul, ol { padding-left: 24px; margin-bottom: 12px; }
li { margin-bottom: 6px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 14px; }
th { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }

/* ── Components ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  transition: border-color .2s, transform .1s;
}
.card:hover { border-color: var(--accent); transform: translateY(-1px); }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.tag {
  display: inline-block;
  background: rgba(99,102,241,.1);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 14px;
  padding: 2px 10px;
  margin: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .03em;
}
.badge-green { background: rgba(16,185,129,.15); color: var(--green); }
.badge-amber { background: rgba(245,158,11,.15); color: var(--amber); }
.badge-red { background: rgba(239,68,68,.15); color: var(--red); }
.badge-dim { background: var(--surface2); color: var(--muted); }
.badge-accent { background: rgba(99,102,241,.15); color: var(--accent); }

.progress-bar { background: var(--surface2); border-radius: 6px; height: 6px; margin: 10px 0; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 6px; transition: width .6s ease; }
.progress-fill.green { background: linear-gradient(90deg, var(--green), #34d399); }
.progress-fill.accent { background: linear-gradient(90deg, var(--accent), var(--accent2)); }

.hero {
  background: linear-gradient(135deg, rgba(99,102,241,.12) 0%, rgba(34,211,238,.06) 100%);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
}
.hero h1 { margin-bottom: 10px; }
.hero p { color: var(--muted); font-size: 15px; max-width: 560px; }
.hero-stats { display: flex; gap: 32px; margin-top: 24px; flex-wrap: wrap; }
.stat-num { font-size: 28px; font-weight: 800; color: var(--text); }
.stat-num span { font-size: 14px; color: var(--accent); }
.stat-label { font-size: 11px; color: var(--faint); text-transform: uppercase; letter-spacing: .08em; }

.type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.type-paper { background: rgba(99,102,241,.15); color: var(--accent); }
.type-video { background: rgba(239,68,68,.15); color: var(--red); }
.type-slides { background: rgba(245,158,11,.15); color: var(--amber); }
.type-blog { background: rgba(16,185,129,.15); color: var(--green); }
.type-link { background: var(--surface2); color: var(--muted); }
.type-textbook { background: rgba(139,92,246,.15); color: #8b5cf6; }

/* ── Collapsible Q&A ── */
.qa-section { margin: 24px 0; }
.qa-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}
.qa-header:hover { border-color: var(--accent); }
.qa-toggle { margin-left: auto; transition: transform .2s; }
.qa-body { display: none; padding: 12px 0; }
.qa-body.open { display: block; }
.qa-item { margin: 8px 0; }
.qa-question {
  display: block;
  width: 100%;
  text-align: left;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color .15s;
}
.qa-question:hover { border-color: var(--accent); }
.qa-answer {
  display: none;
  padding: 12px 16px;
  margin-top: 4px;
  background: rgba(99,102,241,.04);
  border-radius: 0 0 8px 8px;
  border: 1px solid var(--border);
  border-top: none;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}
.qa-answer.open { display: block; }

/* ── Confidence indicators ── */
.confidence-high { color: var(--green); }
.confidence-medium { color: var(--amber); }
.confidence-low { color: var(--red); }
.confidence-none { color: var(--faint); }

/* ── Responsive ── */
@media (max-width: 900px) {
  #sidebar { display: none; }
  #main { margin-left: 0; }
  #content { padding: 20px 16px 60px; }
  .card-grid { grid-template-columns: 1fr; }
  .hero { padding: 24px; }
  .hero-stats { gap: 20px; }
  #topbar { padding: 12px 16px; }
}
`;

const JS = `
// Q&A toggle
document.addEventListener('click', e => {
  const header = e.target.closest('.qa-header');
  if (header) {
    const body = header.nextElementSibling;
    body.classList.toggle('open');
    const toggle = header.querySelector('.qa-toggle');
    if (toggle) toggle.textContent = body.classList.contains('open') ? '▲' : '▼';
    return;
  }
  const question = e.target.closest('.qa-question');
  if (question) {
    const answer = question.nextElementSibling;
    answer.classList.toggle('open');
  }
});
`;

// ─── Markdown → HTML converter (enhanced) ────────────────────────

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mdToHtml(md: string): string {
  // Strip YAML frontmatter
  const stripped = md.replace(/^---[\s\S]*?---\n*/m, '');

  return stripped
    // Code blocks (before other processing)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) =>
      `<pre><code>${escapeHtml(code.trim())}</code></pre>`)
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Wiki links → styled code spans
    .replace(/\[\[(.+?)\]\]/g, '<code class="concept-link">$1</code>')
    // Markdown links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // separator row
      const isHeader = false; // We'll handle this with CSS
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Wrap table rows
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, '<table>$&</table>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:24px 0">')
    // List items (unordered)
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    // List items (ordered)
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Inline code (after code blocks)
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Paragraphs (lines not already wrapped in HTML)
    .replace(/^(?!<[hblouprt]|<li|<pre|<code|<hr|<table|<tr)(.+)$/gm, '<p>$1</p>')
    // Wrap consecutive li in ul
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/<\/ul>\s*<ul>/g, '');
}

// ─── Page template ───────────────────────────────────────────────

function page(title: string, content: string, nav: string, breadcrumb: string, activeId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Learning AI</title>
<style>${CSS}</style>
</head>
<body>
<div id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">Learning AI</div>
    <div class="sidebar-title">🧠 Knowledge Base</div>
  </div>
  ${nav}
</div>
<div id="main">
  <div id="topbar">
    <div class="breadcrumb">${breadcrumb}</div>
  </div>
  <div id="content">
    ${content}
  </div>
</div>
<script>${JS}</script>
</body>
</html>`;
}

// ─── Paper parsing ───────────────────────────────────────────────

function parsePaperFrontmatter(content: string): { frontmatter: PaperFrontmatter; body: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/m);
  if (!match) return null;

  const yamlStr = match[1];
  const body = match[2];

  // Simple YAML parser for our known fields
  const fm: Record<string, unknown> = {};
  const lines = yamlStr.split('\n');
  let currentKey = '';

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array: [a, b, c]
        fm[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else if (val.startsWith('"') && val.endsWith('"')) {
        fm[currentKey] = val.slice(1, -1);
      } else if (val === '') {
        fm[currentKey] = [];
      } else if (!isNaN(Number(val))) {
        fm[currentKey] = Number(val);
      } else {
        fm[currentKey] = val;
      }
    } else if (line.match(/^\s+-\s+/) && currentKey) {
      // Array continuation
      const item = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      (fm[currentKey] as string[]).push(item);
    }
  }

  return { frontmatter: fm as unknown as PaperFrontmatter, body };
}

function loadPapers(projectRoot: string): PaperFile[] {
  const papersDir = resolve(projectRoot, 'papers');
  if (!existsSync(papersDir)) return [];

  const papers: PaperFile[] = [];
  const categories = readdirSync(papersDir).filter(d => {
    const full = resolve(papersDir, d);
    return existsSync(full) && !d.startsWith('.') && d !== 'index.md' &&
      statSync(full).isDirectory();
  });

  for (const category of categories) {
    const catDir = resolve(papersDir, category);
    const files = readdirSync(catDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const content = readFileSync(resolve(catDir, file), 'utf-8');
      const parsed = parsePaperFrontmatter(content);
      if (!parsed) continue;

      papers.push({
        frontmatter: parsed.frontmatter,
        body: parsed.body,
        relativePath: `${category}/${file}`,
        category,
      });
    }
  }

  return papers;
}

// ─── Navigation builder ──────────────────────────────────────────

function buildNav(
  courses: CourseWithReadings[],
  papers: PaperFile[],
  graphExists: boolean,
  activeId: string
): string {
  let html = '';

  // Home
  html += `<a class="nav-item ${activeId === 'home' ? 'active' : ''}" href="index.html">
    <span class="nav-icon">🏠</span> Home</a>`;

  // Courses
  html += '<div class="nav-section">Courses</div>';
  for (const c of courses) {
    const id = `course-${c.name}`;
    html += `<a class="nav-item ${activeId === id ? 'active' : ''}" href="${c.name}/index.html">
      <span class="nav-icon">📚</span> ${escapeHtml(c.title)}</a>`;
  }

  // Papers
  if (papers.length > 0) {
    html += '<div class="nav-section">Papers</div>';
    html += `<a class="nav-item ${activeId === 'papers' ? 'active' : ''}" href="papers/index.html">
      <span class="nav-icon">📄</span> All Papers</a>`;

    const categories = [...new Set(papers.map(p => p.category))];
    for (const cat of categories) {
      const label = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
      const id = `papers-${cat}`;
      html += `<a class="nav-item ${activeId === id ? 'active' : ''}" href="papers/${cat}.html">
        <span class="nav-icon">›</span> ${escapeHtml(label)}</a>`;
    }
  }

  // Resources
  html += '<div class="nav-section">Resources</div>';
  html += `<a class="nav-item ${activeId === 'resources' ? 'active' : ''}" href="resources.html">
    <span class="nav-icon">📋</span> Resource Library</a>`;

  if (graphExists) {
    html += `<a class="nav-item ${activeId === 'graph' ? 'active' : ''}" href="graph.html">
      <span class="nav-icon">🔗</span> Knowledge Graph</a>`;
  }

  html += `<a class="nav-item ${activeId === 'progress' ? 'active' : ''}" href="progress.html">
    <span class="nav-icon">📊</span> Progress</a>`;

  return html;
}

// ─── Page generators ─────────────────────────────────────────────

function generateHomePage(
  courses: CourseWithReadings[],
  papers: PaperFile[],
  totalConcepts: number,
  totalEdges: number,
  graphExists: boolean,
  nav: string
): string {
  const totalLectures = courses.reduce((sum, c) => sum + c.lectures.length, 0);
  const totalWatched = courses.reduce((sum, c) => sum + c.lectures.filter(l => l.watched).length, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + c.lectures.filter(l => l.status === 'completed').length, 0);

  const courseCards = courses.map(c => {
    const pct = c.lectures.length > 0 ? Math.round((c.lectures.filter(l => l.watched).length / c.lectures.length) * 100) : 0;
    const completed = c.lectures.filter(l => l.status === 'completed').length;
    const uni = c.university ? `<span class="tag">${escapeHtml(c.university)}</span>` : '';
    return `<a href="${c.name}/index.html" style="text-decoration:none;color:inherit">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <h3 style="margin:0;font-size:16px">${escapeHtml(c.title)}</h3>
          ${uni}
        </div>
        <div class="progress-bar"><div class="progress-fill green" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <span class="badge badge-dim">${completed}/${c.lectures.length} notes</span>
          <span class="badge ${pct > 0 ? 'badge-green' : 'badge-dim'}">${pct}% watched</span>
        </div>
      </div></a>`;
  }).join('\n');

  const content = `
    <div class="hero">
      <h1>🧠 Learning AI</h1>
      <p>Personal knowledge base — courses, papers, and concepts connected in one place.</p>
      <div class="hero-stats">
        <div><div class="stat-num">${courses.length}</div><div class="stat-label">Courses</div></div>
        <div><div class="stat-num">${totalLectures}</div><div class="stat-label">Lectures</div></div>
        <div><div class="stat-num">${papers.length}</div><div class="stat-label">Papers</div></div>
        <div><div class="stat-num">${totalConcepts}</div><div class="stat-label">Concepts</div></div>
        <div><div class="stat-num">${totalWatched}<span>/${totalLectures}</span></div><div class="stat-label">Watched</div></div>
      </div>
    </div>

    <h2>Courses</h2>
    <div class="card-grid">${courseCards}</div>

    ${papers.length > 0 ? `<h2>Recent Papers</h2>
    <div class="card-grid">
      ${papers.slice(0, 6).map(p => `<a href="papers/${p.relativePath.replace('.md', '.html')}" style="text-decoration:none;color:inherit">
        <div class="card">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <span class="type-badge type-paper">Paper</span>
            <span style="font-size:12px;color:var(--faint)">${p.frontmatter.year ?? ''}</span>
          </div>
          <h3 style="margin:0;font-size:14px;line-height:1.4">${escapeHtml(p.frontmatter.title)}</h3>
          <p style="font-size:12px;color:var(--muted);margin:6px 0 0">${(p.frontmatter.authors ?? []).slice(0, 3).join(', ')}${(p.frontmatter.authors ?? []).length > 3 ? ' et al.' : ''}</p>
        </div></a>`).join('\n')}
    </div>` : ''}

    <h2>Explore</h2>
    <div class="card-grid">
      ${graphExists ? `<a href="graph.html" style="text-decoration:none;color:inherit">
        <div class="card" style="border-color:rgba(99,102,241,.3);background:linear-gradient(135deg,var(--surface) 0%,rgba(99,102,241,.06) 100%)">
          <div style="font-size:28px;margin-bottom:8px">🔗</div>
          <h3 style="margin:0;font-size:16px">Knowledge Graph</h3>
          <p style="font-size:13px;color:var(--muted);margin:6px 0 0">Interactive D3.js visualization — ${totalConcepts} nodes, ${totalEdges} edges. Click, drag, search.</p>
          <div style="display:flex;gap:6px;margin-top:10px">
            <span class="badge badge-accent">${totalConcepts - papers.length} concepts</span>
            <span class="badge badge-accent">${papers.length} papers</span>
          </div>
        </div></a>` : ''}
      <a href="resources.html" style="text-decoration:none;color:inherit">
        <div class="card">
          <div style="font-size:28px;margin-bottom:8px">📋</div>
          <h3 style="margin:0;font-size:16px">Resource Library</h3>
          <p style="font-size:13px;color:var(--muted);margin:6px 0 0">All papers, readings, and resources in one place — organized by type.</p>
        </div></a>
      <a href="progress.html" style="text-decoration:none;color:inherit">
        <div class="card">
          <div style="font-size:28px;margin-bottom:8px">📊</div>
          <h3 style="margin:0;font-size:16px">Progress Dashboard</h3>
          <p style="font-size:13px;color:var(--muted);margin:6px 0 0">Track watched lectures, confidence levels, and revisit flags across courses.</p>
        </div></a>
    </div>`;

  return page('Home', content, nav, '<a href="index.html">Home</a>', 'home');
}

function generateCoursePage(
  courseConfig: CourseWithReadings,
  projectRoot: string,
  nav: string
): string {
  const watchedCount = courseConfig.lectures.filter(l => l.watched).length;
  const completedCount = courseConfig.lectures.filter(l => l.status === 'completed').length;
  const totalDuration = courseConfig.lectures.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0);
  const pct = courseConfig.lectures.length > 0 ? Math.round((watchedCount / courseConfig.lectures.length) * 100) : 0;

  const lectureRows = courseConfig.lectures.map(l => {
    const watchIcon = l.watched ? '✅' : '⬜';
    const statusBadge = l.status === 'completed'
      ? '<span class="badge badge-green">notes ready</span>'
      : l.status === 'error'
        ? '<span class="badge badge-red">error</span>'
        : '<span class="badge badge-dim">pending</span>';

    const confClass = l.confidence ? `confidence-${l.confidence}` : '';
    const confLabel = l.confidence ? l.confidence : '';
    const revisitBadge = l.revisit ? '<span class="badge badge-amber">revisit</span>' : '';

    // Find matching lecture directory
    const lecturesDir = resolve(projectRoot, 'courses', courseConfig.name, 'lectures');
    const dirs = existsSync(lecturesDir) ? readdirSync(lecturesDir) : [];
    const matchingDir = dirs.find(d => d.split('-')[0] === l.id);
    const hasNotes = matchingDir && existsSync(resolve(lecturesDir, matchingDir, 'notes.md'));
    const href = hasNotes ? `${matchingDir}.html` : '#';

    const duration = l.duration_seconds
      ? `<span style="font-size:12px;color:var(--faint)">${Math.round(l.duration_seconds / 60)} min</span>`
      : '';

    return `<a href="${href}" style="text-decoration:none;color:inherit">
      <div class="card" style="display:flex;align-items:center;gap:12px">
        <span style="font-size:16px">${watchIcon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(l.title)}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:4px">
            ${statusBadge} ${revisitBadge}
            ${confLabel ? `<span class="badge badge-dim ${confClass}">${confLabel}</span>` : ''}
            ${duration}
          </div>
        </div>
      </div></a>`;
  }).join('\n');

  const content = `
    <div class="hero">
      <h1>${escapeHtml(courseConfig.title)}</h1>
      <p>${courseConfig.university ? escapeHtml(courseConfig.university) + ' · ' : ''}${courseConfig.lectures.length} lectures${totalDuration ? ' · ' + Math.round(totalDuration / 3600) + 'h total' : ''}</p>
      <div class="progress-bar"><div class="progress-fill green" style="width:${pct}%"></div></div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px">${watchedCount}/${courseConfig.lectures.length} watched (${pct}%) · ${completedCount} with notes</div>
      ${courseConfig.website ? `<p style="margin-top:12px"><a href="${courseConfig.website}">Course website ↗</a></p>` : ''}
    </div>
    ${lectureRows}`;

  const activeId = `course-${courseConfig.name}`;
  const breadcrumb = `<a href="../index.html">Home</a> › ${escapeHtml(courseConfig.title)}`;
  return page(courseConfig.title, content, nav, breadcrumb, activeId);
}

function generateLecturePage(
  notes: string,
  annotations: string | undefined,
  courseConfig: CourseWithReadings,
  lectureDir: string,
  lecture: LectureEntry | undefined,
  concepts: Concept[],
  nav: string
): string {
  const title = lecture?.title ?? lectureDir.replace(/^\d+-/, '').replace(/-/g, ' ');
  let content = mdToHtml(notes);

  // Add personal annotations
  if (annotations) {
    content += '<h2>📝 Personal Annotations</h2>' + mdToHtml(annotations);
  }

  // Add concept Q&A section from the concepts
  if (concepts.length > 0) {
    content += `
      <div class="qa-section">
        <div class="qa-header">
          <span>🎯</span>
          <span>Concept Review — ${concepts.length} concepts from this lecture</span>
          <span class="qa-toggle">▼</span>
        </div>
        <div class="qa-body">
          ${concepts.map(c => `
            <div class="qa-item">
              <button class="qa-question">What is ${escapeHtml(c.name)}?</button>
              <div class="qa-answer">
                <p><strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.definition)}</p>
                ${c.relations && c.relations.length > 0 ? `<p><strong>Related:</strong> ${c.relations.map(r =>
                  `${escapeHtml(r.target)} (${r.type.replace(/_/g, ' ')})`
                ).join(', ')}</p>` : ''}
                ${c.timestamps.length > 0 ? `<p style="color:var(--faint);font-size:12px">Timestamps: ${c.timestamps.join(', ')}</p>` : ''}
              </div>
            </div>
          `).join('\n')}
        </div>
      </div>`;
  }

  const breadcrumb = `<a href="../index.html">Home</a> › <a href="index.html">${escapeHtml(courseConfig.title)}</a> › Lecture ${lecture?.id ?? ''}`;
  return page(title, content, nav, breadcrumb, `course-${courseConfig.name}`);
}

function generatePapersIndexPage(papers: PaperFile[], nav: string): string {
  const categories = [...new Set(papers.map(p => p.category))];

  const categoryCards = categories.map(cat => {
    const catPapers = papers.filter(p => p.category === cat);
    const label = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');

    return `<div>
      <h3 style="margin-bottom:12px">${label}</h3>
      ${catPapers
        .sort((a, b) => (a.frontmatter.year ?? 0) - (b.frontmatter.year ?? 0))
        .map(p => `
          <a href="${p.relativePath.replace('.md', '.html')}" style="text-decoration:none;color:inherit">
            <div class="card" style="display:flex;gap:12px;align-items:start">
              <span class="type-badge type-paper">${p.frontmatter.year ?? ''}</span>
              <div>
                <div style="font-size:14px;font-weight:600">${escapeHtml(p.frontmatter.title)}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:4px">${(p.frontmatter.authors ?? []).slice(0, 4).join(', ')}${(p.frontmatter.authors ?? []).length > 4 ? ' et al.' : ''}</div>
                <div style="margin-top:6px">${(p.frontmatter.tags ?? []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</div>
              </div>
            </div>
          </a>`).join('\n')}
    </div>`;
  }).join('\n');

  const content = `
    <div class="hero">
      <h1>📄 Seminal AI Papers</h1>
      <p>Foundational research papers — curated summaries with cross-links to course lectures and related papers.</p>
      <div class="hero-stats">
        <div><div class="stat-num">${papers.length}</div><div class="stat-label">Papers</div></div>
        <div><div class="stat-num">${categories.length}</div><div class="stat-label">Categories</div></div>
      </div>
    </div>
    ${categoryCards}`;

  return page('Papers', content, nav, '<a href="../index.html">Home</a> › Papers', 'papers');
}

function generatePaperPage(paper: PaperFile, nav: string): string {
  // Convert paper body markdown to HTML, rewriting internal links
  let body = paper.body;

  // Rewrite relative .md links to .html links
  body = body.replace(/\]\((\.\.\/)?([\w-]+)\/([\w-]+)\.md\)/g, (_m, _prefix, cat, file) =>
    `](../${cat}/${file}.html)`
  );
  body = body.replace(/\]\(([\w-]+)\.md\)/g, (_m, file) =>
    `](${file}.html)`
  );

  let content = mdToHtml(body);

  // Add metadata header
  const meta = paper.frontmatter;
  const metaHtml = `
    <div style="margin-bottom:24px">
      <span class="type-badge type-paper">Paper</span>
      <span style="font-size:13px;color:var(--faint);margin-left:8px">${meta.venue ?? ''} ${meta.year ?? ''}</span>
      ${meta.resource ? `<a href="${meta.resource}" style="margin-left:12px;font-size:13px">Read paper ↗</a>` : ''}
    </div>
    <h1>${escapeHtml(meta.title)}</h1>
    <p style="color:var(--muted);font-size:14px;margin-bottom:8px">${(meta.authors ?? []).join(', ')}</p>
    <div style="margin-bottom:24px">${(meta.tags ?? []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</div>`;

  content = metaHtml + content;

  const catLabel = paper.category.charAt(0).toUpperCase() + paper.category.slice(1).replace(/-/g, ' ');
  const breadcrumb = `<a href="../../index.html">Home</a> › <a href="../index.html">Papers</a> › <a href="../${paper.category}.html">${escapeHtml(catLabel)}</a> › ${escapeHtml(meta.title)}`;
  return page(meta.title, content, nav, breadcrumb, `papers-${paper.category}`);
}

function generatePaperCategoryPage(category: string, papers: PaperFile[], nav: string): string {
  const label = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  const catPapers = papers.filter(p => p.category === category)
    .sort((a, b) => (a.frontmatter.year ?? 0) - (b.frontmatter.year ?? 0));

  const content = `
    <h1>${escapeHtml(label)}</h1>
    <p style="color:var(--muted)">${catPapers.length} papers</p>
    ${catPapers.map(p => `
      <a href="${p.relativePath.replace('.md', '.html')}" style="text-decoration:none;color:inherit">
        <div class="card">
          <div style="display:flex;gap:12px;align-items:start">
            <span class="type-badge type-paper">${p.frontmatter.year ?? ''}</span>
            <div>
              <div style="font-size:15px;font-weight:600">${escapeHtml(p.frontmatter.title)}</div>
              <div style="font-size:13px;color:var(--muted);margin-top:4px">${(p.frontmatter.authors ?? []).slice(0, 4).join(', ')}${(p.frontmatter.authors ?? []).length > 4 ? ' et al.' : ''}</div>
              <div style="margin-top:6px">${(p.frontmatter.tags ?? []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</div>
            </div>
          </div>
        </div>
      </a>`).join('\n')}`;

  const breadcrumb = `<a href="../index.html">Home</a> › <a href="index.html">Papers</a> › ${escapeHtml(label)}`;
  return page(label, content, nav, breadcrumb, `papers-${category}`);
}

function generateResourceLibraryPage(
  courses: CourseWithReadings[],
  papers: PaperFile[],
  nav: string
): string {
  // Collect all resources: readings from courses + papers
  interface Resource {
    title: string;
    url?: string;
    type: string;
    source: string;
    lectureId?: string;
  }

  const resources: Resource[] = [];

  // From course readings
  for (const c of courses) {
    for (const r of c.readings ?? []) {
      resources.push({
        title: r.title,
        url: r.url,
        type: r.type,
        source: c.title,
        lectureId: r.lecture_id,
      });
    }
  }

  // From papers directory
  for (const p of papers) {
    resources.push({
      title: p.frontmatter.title,
      url: p.frontmatter.resource,
      type: 'paper',
      source: 'Seminal Papers',
    });
  }

  const typeIcon: Record<string, string> = {
    paper: '📄', slides: '📊', textbook: '📚', video: '🎥', link: '🔗', blog: '📝',
  };

  const typeBadgeClass: Record<string, string> = {
    paper: 'type-paper', slides: 'type-slides', textbook: 'type-textbook',
    video: 'type-video', link: 'type-link', blog: 'type-blog',
  };

  // Group by type
  const byType = new Map<string, Resource[]>();
  for (const r of resources) {
    const list = byType.get(r.type) ?? [];
    list.push(r);
    byType.set(r.type, list);
  }

  const sections = [...byType.entries()].map(([type, items]) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    return `
      <h2>${typeIcon[type] ?? '📎'} ${typeLabel} (${items.length})</h2>
      <div class="card-grid">
        ${items.map(r => `
          <div class="card">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
              <span class="type-badge ${typeBadgeClass[r.type] ?? 'type-link'}">${escapeHtml(r.type)}</span>
              <span style="font-size:11px;color:var(--faint)">${escapeHtml(r.source)}</span>
            </div>
            <div style="font-size:14px;font-weight:600;margin-bottom:4px">${r.url ? `<a href="${r.url}">${escapeHtml(r.title)}</a>` : escapeHtml(r.title)}</div>
            ${r.lectureId ? `<span style="font-size:11px;color:var(--faint)">Lecture ${r.lectureId}</span>` : ''}
          </div>
        `).join('\n')}
      </div>`;
  }).join('\n');

  const content = `
    <div class="hero">
      <h1>📋 Resource Library</h1>
      <p>All papers, videos, and resources from courses and the papers collection.</p>
      <div class="hero-stats">
        <div><div class="stat-num">${resources.length}</div><div class="stat-label">Resources</div></div>
        <div><div class="stat-num">${byType.size}</div><div class="stat-label">Types</div></div>
      </div>
    </div>
    ${sections}`;

  return page('Resource Library', content, nav, '<a href="index.html">Home</a> › Resources', 'resources');
}

function generateProgressPage(courses: CourseWithReadings[], nav: string): string {
  const rows = courses.map(c => {
    const total = c.lectures.length;
    const watched = c.lectures.filter(l => l.watched).length;
    const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
    const high = c.lectures.filter(l => l.confidence === 'high').length;
    const medium = c.lectures.filter(l => l.confidence === 'medium').length;
    const low = c.lectures.filter(l => l.confidence === 'low').length;
    const revisit = c.lectures.filter(l => l.revisit).length;
    const completed = c.lectures.filter(l => l.status === 'completed').length;

    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h3 style="margin:0"><a href="${c.name}/index.html">${escapeHtml(c.title)}</a></h3>
            <div style="font-size:13px;color:var(--muted);margin-top:4px">${c.university ?? ''} · ${total} lectures</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:24px;font-weight:800">${pct}%</div>
            <div style="font-size:11px;color:var(--faint)">${watched}/${total} watched</div>
          </div>
        </div>
        <div class="progress-bar" style="margin:12px 0"><div class="progress-fill green" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <span class="badge badge-green">${completed} notes</span>
          ${high > 0 ? `<span class="badge badge-green">${high} confident</span>` : ''}
          ${medium > 0 ? `<span class="badge badge-amber">${medium} medium</span>` : ''}
          ${low > 0 ? `<span class="badge badge-red">${low} low</span>` : ''}
          ${revisit > 0 ? `<span class="badge badge-amber">${revisit} to revisit</span>` : ''}
        </div>
        ${c.lectures.filter(l => l.revisit).length > 0 ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <div style="font-size:12px;color:var(--faint);margin-bottom:6px">Flagged for revisit:</div>
            ${c.lectures.filter(l => l.revisit).map(l =>
              `<div style="font-size:13px;color:var(--amber);margin-bottom:4px">⚑ ${escapeHtml(l.title)}</div>`
            ).join('\n')}
          </div>
        ` : ''}
      </div>`;
  }).join('\n');

  const totalWatched = courses.reduce((s, c) => s + c.lectures.filter(l => l.watched).length, 0);
  const totalLectures = courses.reduce((s, c) => s + c.lectures.length, 0);
  const overallPct = totalLectures > 0 ? Math.round((totalWatched / totalLectures) * 100) : 0;

  const content = `
    <div class="hero">
      <h1>📊 Learning Progress</h1>
      <p>Track your progress across all courses.</p>
      <div class="hero-stats">
        <div><div class="stat-num">${totalWatched}<span>/${totalLectures}</span></div><div class="stat-label">Watched</div></div>
        <div><div class="stat-num">${overallPct}<span>%</span></div><div class="stat-label">Overall</div></div>
      </div>
      <div class="progress-bar" style="margin-top:16px"><div class="progress-fill accent" style="width:${overallPct}%"></div></div>
    </div>
    ${rows}`;

  return page('Progress', content, nav, '<a href="index.html">Home</a> › Progress', 'progress');
}

function generateGraphPage(graphJson: string, nav: string): string {
  // Embed the knowledge graph visualization inline
  const content = `
    <h1>🔗 Knowledge Graph</h1>
    <p style="color:var(--muted);margin-bottom:16px">Interactive concept map — click nodes to explore, drag to rearrange.</p>
    <div id="graph-container" style="width:100%;height:70vh;background:var(--code-bg);border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative">
      <div id="graph-controls" style="position:absolute;top:12px;left:12px;z-index:10">
        <input type="text" id="graph-search" placeholder="Search concepts..."
          style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);width:220px;font-size:13px">
      </div>
      <div id="graph-info" style="position:absolute;bottom:12px;right:12px;max-width:320px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;display:none;z-index:10">
        <h3 id="gi-name" style="margin:0 0 6px;font-size:15px"></h3>
        <p id="gi-def" style="font-size:13px;color:var(--muted);margin:0"></p>
        <div id="gi-tags" style="margin-top:8px"></div>
      </div>
    </div>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
    (function() {
      const data = ${graphJson};
      if (!data.nodes || data.nodes.length === 0) {
        document.getElementById('graph-container').innerHTML =
          '<p style="padding:40px;text-align:center;color:var(--muted)">No concepts yet. Run <code>learn graph build</code> first.</p>';
        return;
      }

      const container = document.getElementById('graph-container');
      const width = container.clientWidth;
      const height = container.clientHeight;

      const svg = d3.select('#graph-container').append('svg')
        .attr('width', width).attr('height', height);

      const g = svg.append('g');
      svg.call(d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform)));

      const tagColors = { architecture:'#6366f1', training:'#f59e0b', theory:'#22d3ee', application:'#10b981',
        safety:'#ef4444', infrastructure:'#8b5cf6', hardware:'#f97316', data:'#06b6d4', optimization:'#84cc16' };

      function nodeColor(d) {
        const t = (d.tags || [])[0];
        return tagColors[t] || '#6366f1';
      }

      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.edges || []).id(d => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collision', d3.forceCollide().radius(20));

      const link = g.append('g').selectAll('line')
        .data(data.edges || []).join('line')
        .attr('stroke', '#2d3150').attr('stroke-opacity', 0.5).attr('stroke-width', 1);

      const node = g.append('g').selectAll('g')
        .data(data.nodes).join('g')
        .call(d3.drag().on('start', dragStart).on('drag', dragging).on('end', dragEnd));

      // Papers: diamond; Concepts: circle
      node.each(function(d) {
        const el = d3.select(this);
        const size = 4 + (d.sourceCount || 1) * 2;
        const color = nodeColor(d);
        if (d.nodeType === 'paper') {
          el.append('rect')
            .attr('width', size*1.5).attr('height', size*1.5)
            .attr('x', -size*0.75).attr('y', -size*0.75)
            .attr('rx', 2)
            .attr('transform', 'rotate(45)')
            .attr('fill', color)
            .attr('stroke', color).attr('stroke-width', 2).attr('stroke-opacity', 0.3)
            .style('cursor', 'pointer');
        } else {
          el.append('circle')
            .attr('r', size)
            .attr('fill', color)
            .attr('stroke', color).attr('stroke-width', 2).attr('stroke-opacity', 0.3)
            .style('cursor', 'pointer');
        }
      });

      node.append('text')
        .text(d => d.name)
        .attr('dx', 10).attr('dy', 4)
        .attr('fill', '#8892b0').attr('font-size', '10px');

      node.on('click', (e, d) => {
        document.getElementById('gi-name').textContent = d.name;
        document.getElementById('gi-def').textContent = d.definition;
        document.getElementById('gi-tags').innerHTML = (d.tags||[]).map(t =>
          '<span class="tag">' + t + '</span>').join(' ');
        document.getElementById('graph-info').style.display = 'block';
      });

      simulation.on('tick', () => {
        link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
            .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
        node.attr('transform',d=>'translate('+d.x+','+d.y+')');
      });

      function dragStart(e,d){if(!e.active)simulation.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;}
      function dragging(e,d){d.fx=e.x;d.fy=e.y;}
      function dragEnd(e,d){if(!e.active)simulation.alphaTarget(0);d.fx=null;d.fy=null;}

      document.getElementById('graph-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        node.attr('opacity', d => !q || d.name.toLowerCase().includes(q) ? 1 : 0.15);
        link.attr('opacity', !q ? 0.5 : 0.05);
      });
    })();
    </script>`;

  return page('Knowledge Graph', content, nav, '<a href="index.html">Home</a> › Knowledge Graph', 'graph');
}

// ─── Main command ────────────────────────────────────────────────

export function siteCommand(program: Command): void {
  program
    .command('site')
    .description('Generate a static HTML site for mobile-friendly review')
    .option('--output <dir>', 'Output directory', 'site')
    .action(async (opts: { output: string }) => {
      try {
        const config = loadConfig();
        const outputDir = resolve(config.projectRoot, opts.output);
        ensureDir(outputDir);

        progress('Generating static site...');

        const coursesDir = resolve(config.projectRoot, 'courses');
        const pages: Array<{ path: string; content: string }> = [];

        // ── Load courses ──
        const courses: CourseWithReadings[] = [];
        if (existsSync(coursesDir)) {
          const courseDirs = readdirSync(coursesDir)
            .filter(d => d !== 'synthesis' && !d.startsWith('.'));

          for (const courseDir of courseDirs) {
            const courseConfig = readYaml<CourseWithReadings>(
              resolve(coursesDir, courseDir, 'course.yaml')
            );
            if (courseConfig) courses.push(courseConfig);
          }
        }

        // ── Load papers ──
        const papers = loadPapers(config.projectRoot);

        // ── Load knowledge graph ──
        const graphPath = resolve(config.projectRoot, 'knowledge-graph', 'graph.json');
        const graphExists = existsSync(graphPath);
        const graphJson = graphExists
          ? readFileSync(graphPath, 'utf-8')
          : '{"nodes":[],"edges":[]}';

        // Count concepts and edges
        let totalConcepts = 0;
        let totalEdges = 0;
        try {
          const graph = JSON.parse(graphJson) as GraphData;
          totalConcepts = graph.nodes?.length ?? 0;
          totalEdges = graph.edges?.length ?? 0;
        } catch { /* ignore */ }

        // ── Build navigation ──
        const nav = buildNav(courses, papers, graphExists, '');

        // ── Generate home page ──
        pages.push({
          path: resolve(outputDir, 'index.html'),
          content: generateHomePage(courses, papers, totalConcepts, totalEdges, graphExists,
            buildNav(courses, papers, graphExists, 'home')),
        });

        // ── Generate course pages + lecture pages ──
        for (const courseConfig of courses) {
          const courseOutputDir = resolve(outputDir, courseConfig.name);
          ensureDir(courseOutputDir);

          pages.push({
            path: resolve(courseOutputDir, 'index.html'),
            content: generateCoursePage(courseConfig, config.projectRoot,
              buildNav(courses, papers, graphExists, `course-${courseConfig.name}`)),
          });

          // Lecture pages
          const lecturesDir = resolve(coursesDir, courseConfig.name, 'lectures');
          if (!existsSync(lecturesDir)) continue;

          for (const lectureDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
            const notes = readText(resolve(lecturesDir, lectureDir, 'notes.md'));
            if (!notes) continue;

            const annotations = readText(resolve(lecturesDir, lectureDir, 'annotations.md'));
            const lectureId = lectureDir.split('-')[0];
            const lecture = courseConfig.lectures.find(l => l.id === lectureId);

            // Load concepts for Q&A
            const conceptsYaml = readYaml<ConceptsYaml>(
              resolve(lecturesDir, lectureDir, 'concepts.yaml')
            );
            const concepts = conceptsYaml?.concepts ?? [];

            pages.push({
              path: resolve(courseOutputDir, `${lectureDir}.html`),
              content: generateLecturePage(notes, annotations, courseConfig, lectureDir,
                lecture, concepts,
                buildNav(courses, papers, graphExists, `course-${courseConfig.name}`)),
            });
          }
        }

        // ── Generate papers pages ──
        if (papers.length > 0) {
          const papersOutputDir = resolve(outputDir, 'papers');
          ensureDir(papersOutputDir);

          // Papers index
          pages.push({
            path: resolve(papersOutputDir, 'index.html'),
            content: generatePapersIndexPage(papers,
              buildNav(courses, papers, graphExists, 'papers')),
          });

          // Category pages
          const categories = [...new Set(papers.map(p => p.category))];
          for (const cat of categories) {
            pages.push({
              path: resolve(papersOutputDir, `${cat}.html`),
              content: generatePaperCategoryPage(cat, papers,
                buildNav(courses, papers, graphExists, `papers-${cat}`)),
            });
          }

          // Individual paper pages
          for (const paper of papers) {
            const paperDir = resolve(papersOutputDir, paper.category);
            ensureDir(paperDir);
            pages.push({
              path: resolve(papersOutputDir, paper.relativePath.replace('.md', '.html')),
              content: generatePaperPage(paper,
                buildNav(courses, papers, graphExists, `papers-${paper.category}`)),
            });
          }
        }

        // ── Generate resource library ──
        pages.push({
          path: resolve(outputDir, 'resources.html'),
          content: generateResourceLibraryPage(courses, papers,
            buildNav(courses, papers, graphExists, 'resources')),
        });

        // ── Generate progress page ──
        pages.push({
          path: resolve(outputDir, 'progress.html'),
          content: generateProgressPage(courses,
            buildNav(courses, papers, graphExists, 'progress')),
        });

        // ── Generate knowledge graph page ──
        if (graphExists) {
          pages.push({
            path: resolve(outputDir, 'graph.html'),
            content: generateGraphPage(graphJson,
              buildNav(courses, papers, graphExists, 'graph')),
          });
        }

        // ── Write all pages ──
        for (const p of pages) {
          ensureDir(resolve(p.path, '..'));
          writeText(p.path, p.content);
        }

        success(`Static site generated: ${pages.length} pages`);
        info(`  📚 ${courses.length} courses`);
        info(`  📄 ${papers.length} papers`);
        if (graphExists) info(`  🔗 Knowledge graph embedded`);
        info(`  📋 Resource library`);
        info(`  📊 Progress dashboard`);
        info(`Open: ${resolve(outputDir, 'index.html')}`);
        info('Tip: serve with `npx serve site` for local preview');
      } catch (e) {
        error(`Site generation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
