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

// ─── Interactive toolbar (search, quiz, ask, export) ─────────────

const TOOLBAR_CSS = `
/* ── Interactive Toolbar ── */
#toolbar-toggle {
  position: fixed; bottom: 20px; right: 20px; z-index: 200;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--accent); color: #fff; border: none;
  font-size: 22px; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,.4);
  transition: transform .2s, box-shadow .2s;
  display: flex; align-items: center; justify-content: center;
}
#toolbar-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(99,102,241,.5); }
#toolbar-panel {
  position: fixed; bottom: 84px; right: 20px; z-index: 200;
  width: 420px; max-height: 70vh; background: var(--surface);
  border: 1px solid var(--border); border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,.4); display: none;
  flex-direction: column; overflow: hidden;
}
#toolbar-panel.open { display: flex; }
.tb-tabs { display: flex; border-bottom: 1px solid var(--border); }
.tb-tab {
  flex: 1; padding: 10px 8px; text-align: center; font-size: 12px; font-weight: 600;
  color: var(--muted); background: none; border: none; cursor: pointer;
  border-bottom: 2px solid transparent; transition: all .15s;
}
.tb-tab:hover { color: var(--text); }
.tb-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tb-content { padding: 16px; overflow-y: auto; max-height: calc(70vh - 50px); }
.tb-pane { display: none; }
.tb-pane.active { display: block; }
.tb-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.tb-input {
  flex: 1; padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text); font-size: 13px; font-family: inherit;
}
.tb-input:focus { outline: none; border-color: var(--accent); }
.tb-btn {
  padding: 10px 16px; background: var(--accent); color: #fff; border: none;
  border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background .15s;
}
.tb-btn:hover { background: #5558e6; }
.tb-btn:disabled { opacity: .5; cursor: not-allowed; }
.tb-select {
  padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text); font-size: 12px;
}
.tb-results { font-size: 13px; color: var(--text); line-height: 1.6; }
.tb-result-item {
  padding: 10px 12px; margin: 6px 0; background: var(--surface2);
  border-radius: 8px; border-left: 3px solid var(--accent);
}
.tb-result-item .source { font-size: 11px; color: var(--faint); margin-bottom: 4px; }
.tb-result-item .match { font-size: 13px; }
.tb-quiz-card {
  padding: 16px; background: var(--surface2); border-radius: 12px;
  margin-bottom: 12px; border: 1px solid var(--border);
}
.tb-quiz-q { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--accent); }
.tb-quiz-a {
  font-size: 13px; color: var(--muted); display: none;
  padding: 10px; background: rgba(99,102,241,.06); border-radius: 8px; margin-top: 8px;
}
.tb-quiz-a.show { display: block; }
.tb-reveal-btn {
  padding: 6px 12px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 6px; color: var(--text); font-size: 12px; cursor: pointer;
}
.tb-status { font-size: 12px; color: var(--faint); margin: 8px 0; }
.tb-server-badge {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
  padding: 3px 8px; border-radius: 4px; margin-bottom: 12px;
}
.tb-server-badge.online { background: rgba(16,185,129,.15); color: var(--green); }
.tb-server-badge.offline { background: var(--surface2); color: var(--faint); }
@media (max-width: 600px) {
  #toolbar-panel { width: calc(100vw - 32px); right: 16px; bottom: 76px; }
}
`;

const TOOLBAR_JS = `
// ── Interactive Toolbar ──
(function() {
  let serverOnline = false;
  let activeTab = 'search';

  // Check if local server is running
  async function checkServer() {
    try {
      const r = await fetch('/api/courses', { signal: AbortSignal.timeout(1000) });
      if (r.ok) { serverOnline = true; updateServerBadge(); }
    } catch { serverOnline = false; updateServerBadge(); }
  }
  checkServer();

  function updateServerBadge() {
    const el = document.getElementById('tb-server');
    if (!el) return;
    if (serverOnline) {
      el.className = 'tb-server-badge online';
      el.innerHTML = '● Server connected';
    } else {
      el.className = 'tb-server-badge offline';
      el.innerHTML = '○ Static mode — run <code>learn serve</code> for Ask &amp; Synthesize';
    }
  }

  // Toggle panel
  document.getElementById('toolbar-toggle').addEventListener('click', () => {
    document.getElementById('toolbar-panel').classList.toggle('open');
  });

  // Tab switching
  document.querySelectorAll('.tb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tb-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tb-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tb-' + tab.dataset.tab).classList.add('active');
      activeTab = tab.dataset.tab;
    });
  });

  // ── Search ──
  document.getElementById('tb-search-btn')?.addEventListener('click', doSearch);
  document.getElementById('tb-search-input')?.addEventListener('keydown', e => { if(e.key==='Enter') doSearch(); });

  async function doSearch() {
    const q = document.getElementById('tb-search-input').value.trim();
    if (!q) return;
    const results = document.getElementById('tb-search-results');
    results.innerHTML = '<div class="tb-status">Searching...</div>';

    if (serverOnline) {
      // Use server API
      try {
        const r = await fetch('/api/search', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ query: q, notesOnly: true })
        });
        const data = await r.json();
        renderSearchResults(data.results, q);
      } catch(e) { results.innerHTML = '<div class="tb-status">Search failed</div>'; }
    } else {
      // Client-side search using embedded index
      clientSearch(q);
    }
  }

  function renderSearchResults(items, q) {
    const el = document.getElementById('tb-search-results');
    if (!items || items.length === 0) { el.innerHTML = '<div class="tb-status">No results found</div>'; return; }
    el.innerHTML = items.slice(0, 15).map(r =>
      '<div class="tb-result-item">' +
      '<div class="source">' + r.course + ' / ' + r.lecture.split('-').slice(1).join(' ').substring(0,50) + ' (' + r.file + ')</div>' +
      r.matches.slice(0,2).map(m =>
        '<div class="match">' + highlightMatch(m.text, q) + '</div>'
      ).join('') + '</div>'
    ).join('');
  }

  function highlightMatch(text, q) {
    const re = new RegExp('(' + q.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&') + ')', 'gi');
    return text.replace(re, '<strong style="color:var(--accent)">$1</strong>');
  }

  // Client-side fallback search using search-index.json
  async function clientSearch(q) {
    const el = document.getElementById('tb-search-results');
    try {
      const r = await fetch('search-index.json');
      if (!r.ok) { el.innerHTML = '<div class="tb-status">Search index not available. Run <code>learn site</code> to rebuild.</div>'; return; }
      const index = await r.json();
      const ql = q.toLowerCase();
      const results = index.filter(e => e.text.toLowerCase().includes(ql)).slice(0, 20);
      if (results.length === 0) { el.innerHTML = '<div class="tb-status">No results</div>'; return; }
      el.innerHTML = results.map(r =>
        '<div class="tb-result-item"><div class="source">' + r.course + ' / L' + r.lecture + '</div>' +
        '<div class="match">' + highlightMatch(r.text.substring(0, 200), q) + '</div></div>'
      ).join('');
    } catch { el.innerHTML = '<div class="tb-status">Search index not found</div>'; }
  }

  // ── Quiz ──
  document.getElementById('tb-quiz-btn')?.addEventListener('click', loadQuiz);

  async function loadQuiz() {
    const el = document.getElementById('tb-quiz-results');
    el.innerHTML = '<div class="tb-status">Loading questions...</div>';

    if (serverOnline) {
      try {
        const course = document.getElementById('tb-quiz-course')?.value || '';
        const r = await fetch('/api/quiz', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ course: course || undefined })
        });
        const data = await r.json();
        renderQuiz(data.questions);
      } catch { el.innerHTML = '<div class="tb-status">Failed to load quiz</div>'; }
    } else {
      // Use pre-built quiz data
      try {
        const r = await fetch('quiz-data.json');
        if (!r.ok) throw new Error();
        const all = await r.json();
        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 10);
        renderQuiz(shuffled);
      } catch { el.innerHTML = '<div class="tb-status">Quiz data not available</div>'; }
    }
  }

  function renderQuiz(questions) {
    const el = document.getElementById('tb-quiz-results');
    if (!questions || questions.length === 0) { el.innerHTML = '<div class="tb-status">No questions available</div>'; return; }
    el.innerHTML = questions.map((q, i) =>
      '<div class="tb-quiz-card">' +
      '<div class="tb-quiz-q">' + (i+1) + '. What is ' + esc(q.name) + '?</div>' +
      '<button class="tb-reveal-btn" onclick="this.nextElementSibling.classList.toggle(\\'show\\');this.textContent=this.textContent===\\'Show Answer\\'?\\'Hide\\':\\'Show Answer\\'">Show Answer</button>' +
      '<div class="tb-quiz-a"><strong>' + esc(q.name) + ':</strong> ' + esc(q.definition) +
      '<div style=\\"margin-top:6px;font-size:11px;color:var(--faint)\\">Source: ' + esc(q.course) + ' L' + esc(q.lecture) + '</div></div>' +
      '</div>'
    ).join('');
  }

  function esc(s) { if(!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

  // ── Ask ──
  document.getElementById('tb-ask-btn')?.addEventListener('click', doAsk);
  document.getElementById('tb-ask-input')?.addEventListener('keydown', e => { if(e.key==='Enter') doAsk(); });

  async function doAsk() {
    const q = document.getElementById('tb-ask-input').value.trim();
    if (!q) return;
    const el = document.getElementById('tb-ask-results');

    if (!serverOnline) {
      el.innerHTML = '<div class="tb-status">⚠️ Ask requires the local server. Run: <code>learn serve</code></div>';
      return;
    }

    el.innerHTML = '<div class="tb-status">Thinking...</div>';
    try {
      const course = document.getElementById('tb-ask-course')?.value || '';
      const r = await fetch('/api/ask', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ question: q, course: course || undefined })
      });
      const data = await r.json();
      if (data.error) { el.innerHTML = '<div class="tb-status">⚠️ ' + esc(data.error) + '</div>'; return; }
      el.innerHTML = '<div class="tb-result-item" style="border-left-color:var(--green)">' + data.answer.replace(/\\n/g,'<br>') + '</div>';
    } catch(e) { el.innerHTML = '<div class="tb-status">Request failed</div>'; }
  }

  // ── Export ──
  document.getElementById('tb-export-btn')?.addEventListener('click', doExport);

  async function doExport() {
    if (serverOnline) {
      const course = document.getElementById('tb-export-course')?.value || '';
      window.open('/api/export-anki' + (course ? '?course='+course : ''), '_blank');
    } else {
      // Use pre-built file
      window.open('exports/anki.txt', '_blank');
    }
  }
})();
`;

const TOOLBAR_HTML = `
<button id="toolbar-toggle" title="Tools">⚡</button>
<div id="toolbar-panel">
  <div class="tb-tabs">
    <button class="tb-tab active" data-tab="search">🔍 Search</button>
    <button class="tb-tab" data-tab="quiz">📝 Quiz</button>
    <button class="tb-tab" data-tab="ask">❓ Ask</button>
    <button class="tb-tab" data-tab="export">📇 Export</button>
  </div>
  <div class="tb-content">
    <div id="tb-server"></div>

    <div id="tb-search" class="tb-pane active">
      <div class="tb-input-row">
        <input type="text" class="tb-input" id="tb-search-input" placeholder="Search notes, concepts...">
        <button class="tb-btn" id="tb-search-btn">Search</button>
      </div>
      <div id="tb-search-results" class="tb-results"></div>
    </div>

    <div id="tb-quiz" class="tb-pane">
      <div class="tb-input-row">
        <select class="tb-select" id="tb-quiz-course"><option value="">All courses</option></select>
        <button class="tb-btn" id="tb-quiz-btn">Generate Quiz</button>
      </div>
      <div id="tb-quiz-results" class="tb-results"></div>
    </div>

    <div id="tb-ask" class="tb-pane">
      <div class="tb-input-row">
        <select class="tb-select" id="tb-ask-course"><option value="">All courses</option></select>
      </div>
      <div class="tb-input-row">
        <input type="text" class="tb-input" id="tb-ask-input" placeholder="Ask a question about your lectures...">
        <button class="tb-btn" id="tb-ask-btn">Ask</button>
      </div>
      <div id="tb-ask-results" class="tb-results"></div>
    </div>

    <div id="tb-export" class="tb-pane">
      <p style="font-size:13px;color:var(--muted);margin-bottom:12px">Export concepts as Anki flashcards for active recall.</p>
      <div class="tb-input-row">
        <select class="tb-select" id="tb-export-course"><option value="">All courses</option></select>
        <button class="tb-btn" id="tb-export-btn">📇 Download Anki Cards</button>
      </div>
    </div>
  </div>
</div>`;

// ─── Page template ───────────────────────────────────────────────

function page(title: string, content: string, nav: string, breadcrumb: string, activeId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Learning AI</title>
<style>${CSS}${TOOLBAR_CSS}</style>
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
${TOOLBAR_HTML}
<script>${JS}</script>
<script>${TOOLBAR_JS}</script>
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

  html += `<a class="nav-item ${activeId === 'visualizations' ? 'active' : ''}" href="visualizations.html">
    <span class="nav-icon">🎛️</span> Visualizations</a>`;

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
      <a href="visualizations.html" style="text-decoration:none;color:inherit">
        <div class="card" style="border-color:rgba(34,211,238,.3);background:linear-gradient(135deg,var(--surface) 0%,rgba(34,211,238,.06) 100%)">
          <div style="font-size:28px;margin-bottom:8px">🎛️</div>
          <h3 style="margin:0;font-size:16px">Interactive Visualizations</h3>
          <p style="font-size:13px;color:var(--muted);margin:6px 0 0">Attention calculator, scaling laws explorer, transformer architecture diagram, and embedding space.</p>
          <div style="display:flex;gap:6px;margin-top:10px">
            <span class="badge badge-accent">4 interactive</span>
            <span class="badge badge-dim">D3.js</span>
          </div>
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

function generatePapersIndexPage(papers: PaperFile[], courses: CourseWithReadings[], nav: string): string {
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

  // Course reading lists
  const coursesWithReadings = courses.filter(c => (c.readings ?? []).length > 0);
  const totalCourseReadings = coursesWithReadings.reduce((sum, c) => sum + (c.readings ?? []).length, 0);

  const courseReadingCards = coursesWithReadings.map(c => {
    const readings = (c.readings ?? []).filter(r => r.type === 'paper');
    if (readings.length === 0) return '';

    return `<div>
      <h3 style="margin-bottom:12px">${escapeHtml(c.title)} <span style="font-size:13px;color:var(--faint);font-weight:400">${c.university ?? ''} · ${readings.length} papers</span></h3>
      ${readings.map(r => {
        const lectureLabel = r.lecture_id
          ? c.lectures.find(l => l.id === r.lecture_id)?.title ?? `Lecture ${r.lecture_id}`
          : '';
        return `<div class="card" style="display:flex;gap:12px;align-items:start">
          <span class="type-badge type-paper">📄</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600">${r.url ? `<a href="${r.url}">${escapeHtml(r.title)}</a>` : escapeHtml(r.title)}</div>
            ${lectureLabel ? `<div style="font-size:12px;color:var(--faint);margin-top:4px">${escapeHtml(lectureLabel)}</div>` : ''}
          </div>
        </div>`;
      }).join('\n')}
    </div>`;
  }).filter(s => s).join('\n');

  const content = `
    <div class="hero">
      <h1>📄 AI Papers</h1>
      <p>Seminal papers with curated summaries, plus reading lists from ${coursesWithReadings.length} courses.</p>
      <div class="hero-stats">
        <div><div class="stat-num">${papers.length}</div><div class="stat-label">Seminal Papers</div></div>
        <div><div class="stat-num">${totalCourseReadings}</div><div class="stat-label">Course Readings</div></div>
        <div><div class="stat-num">${categories.length}</div><div class="stat-label">Categories</div></div>
      </div>
    </div>

    <h2>Seminal Papers</h2>
    ${categoryCards}

    ${courseReadingCards ? `<h2 style="margin-top:40px">Course Reading Lists</h2>
    <p style="color:var(--muted);margin-bottom:16px">Papers assigned as readings across your courses — click to open the original.</p>
    ${courseReadingCards}` : ''}`;

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

function generateVisualizationsPage(nav: string): string {
  const content = `
    <div class="hero">
      <h1>🎛️ Interactive Visualizations</h1>
      <p>Explore core AI concepts through interactive D3.js visualizations. Click, drag, and adjust parameters to build intuition.</p>
    </div>

    <!-- VIZ 1: Attention Mechanism -->
    <div class="card" style="padding:24px;margin-bottom:24px">
      <h2 style="margin-top:0;border:none;padding:0">🔢 Scaled Dot-Product Attention</h2>
      <p style="color:var(--muted);font-size:14px">See how Query and Key vectors produce attention weights via softmax. Adjust d_k to see why the √d_k scaling matters.</p>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--accent2);margin:12px 0;padding:12px;background:var(--code-bg);border-radius:8px;text-align:center">
        Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V
      </div>
      <div style="display:flex;gap:16px;align-items:center;margin:16px 0;flex-wrap:wrap">
        <label style="font-size:13px;color:var(--muted)">d_k (head dim):</label>
        <input type="range" id="dk-slider" min="1" max="128" value="8" step="1" style="flex:1;min-width:120px;accent-color:var(--accent)">
        <span id="dk-val" style="font-size:14px;font-weight:700;color:var(--accent);min-width:30px">8</span>
        <button id="attn-randomize" style="padding:6px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:13px">🎲 Randomize</button>
      </div>
      <div style="display:flex;gap:8px;margin:8px 0;flex-wrap:wrap" id="attn-tokens"></div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:16px">
        <div style="flex:1;min-width:280px">
          <div style="font-size:12px;color:var(--faint);margin-bottom:8px">Attention heatmap (query × key)</div>
          <div id="attn-heatmap"></div>
        </div>
        <div style="flex:1;min-width:280px">
          <div style="font-size:12px;color:var(--faint);margin-bottom:8px">Softmax distribution for selected query</div>
          <div id="attn-bars"></div>
        </div>
      </div>
      <div id="attn-insight" style="margin-top:16px;padding:12px 16px;background:rgba(99,102,241,.06);border-radius:8px;font-size:13px;color:var(--muted);display:none"></div>
    </div>

    <!-- VIZ 2: Scaling Laws -->
    <div class="card" style="padding:24px;margin-bottom:24px">
      <h2 style="margin-top:0;border:none;padding:0">📈 Neural Scaling Laws</h2>
      <p style="color:var(--muted);font-size:14px">Loss follows power-law relationships with model parameters, dataset size, and compute. Drag the slider to see how loss decreases as you scale each factor.</p>
      <div style="display:flex;gap:24px;flex-wrap:wrap;margin:16px 0">
        <div style="flex:1;min-width:200px">
          <label style="font-size:12px;color:var(--faint);display:block;margin-bottom:4px">Model Parameters (N)</label>
          <input type="range" id="scale-n" min="6" max="12" value="8" step="0.1" style="width:100%;accent-color:var(--accent)">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--faint)"><span>1M</span><span id="scale-n-val">100M</span><span>1T</span></div>
        </div>
        <div style="flex:1;min-width:200px">
          <label style="font-size:12px;color:var(--faint);display:block;margin-bottom:4px">Dataset Tokens (D)</label>
          <input type="range" id="scale-d" min="8" max="14" value="10" step="0.1" style="width:100%;accent-color:var(--accent2)">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--faint)"><span>100M</span><span id="scale-d-val">10B</span><span>100T</span></div>
        </div>
      </div>
      <div id="scaling-chart" style="width:100%;height:300px"></div>
      <div id="scaling-insight" style="margin-top:12px;padding:12px 16px;background:rgba(34,211,238,.06);border-radius:8px;font-size:13px;color:var(--muted)"></div>
    </div>

    <!-- VIZ 3: Transformer Architecture -->
    <div class="card" style="padding:24px;margin-bottom:24px">
      <h2 style="margin-top:0;border:none;padding:0">🏗️ Transformer Block</h2>
      <p style="color:var(--muted);font-size:14px">How data flows through a single Transformer layer. Hover over each component to see what it does and its parameter count for a given model size.</p>
      <div style="display:flex;gap:16px;align-items:center;margin:12px 0">
        <label style="font-size:13px;color:var(--muted)">d_model:</label>
        <select id="dmodel-select" style="padding:6px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
          <option value="768">768 (GPT-2 Small)</option>
          <option value="1024">1024 (GPT-2 Medium)</option>
          <option value="4096" selected>4096 (LLaMA 7B)</option>
          <option value="8192">8192 (LLaMA 70B)</option>
          <option value="12288">12288 (GPT-4 class)</option>
        </select>
      </div>
      <div id="transformer-diagram" style="width:100%;min-height:420px"></div>
      <div id="transformer-info" style="margin-top:12px;padding:12px 16px;background:rgba(16,185,129,.06);border-radius:8px;font-size:13px;color:var(--muted);display:none"></div>
    </div>

    <!-- VIZ 4: Embedding Space -->
    <div class="card" style="padding:24px;margin-bottom:24px">
      <h2 style="margin-top:0;border:none;padding:0">🌐 Word Embedding Space</h2>
      <p style="color:var(--muted);font-size:14px">2D projection of word embeddings showing semantic clusters. Drag words to see how distances map to meaning. The famous king - man + woman ≈ queen relationship.</p>
      <div id="embedding-space" style="width:100%;height:400px;background:var(--code-bg);border:1px solid var(--border);border-radius:12px;overflow:hidden"></div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="emb-btn" data-group="royalty" style="padding:4px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">👑 Royalty</button>
        <button class="emb-btn" data-group="animals" style="padding:4px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">🐾 Animals</button>
        <button class="emb-btn" data-group="cities" style="padding:4px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">🌆 Cities</button>
        <button class="emb-btn" data-group="ml" style="padding:4px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:12px">🤖 ML Concepts</button>
      </div>
    </div>

    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
    (function() {
      // ═══════════════════════════════════════════
      // VIZ 1: Attention Mechanism
      // ═══════════════════════════════════════════
      const tokens = ['The','cat','sat','on','the','mat'];
      const N = tokens.length;
      let dk = 8;
      let selectedQ = 0;
      let Q, K;

      function randomMatrix(rows, cols) {
        return Array.from({length:rows}, () =>
          Array.from({length:cols}, () => (Math.random()-0.5)*2));
      }
      function dot(a,b) { return a.reduce((s,v,i) => s+v*b[i], 0); }
      function softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(x => Math.exp(x - max));
        const sum = exps.reduce((a,b) => a+b, 0);
        return exps.map(e => e/sum);
      }

      function initAttention() {
        Q = randomMatrix(N, dk);
        K = randomMatrix(N, dk);
        renderAttention();
      }

      function computeScores() {
        return Array.from({length:N}, (_, i) =>
          Array.from({length:N}, (_, j) => dot(Q[i], K[j]) / Math.sqrt(dk)));
      }

      function renderAttention() {
        const scores = computeScores();
        const weights = scores.map(row => softmax(row));
        const cellSize = Math.min(48, (280/N)|0);

        // Tokens
        const tokenDiv = document.getElementById('attn-tokens');
        tokenDiv.innerHTML = tokens.map((t,i) =>
          '<div style="padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid '
          + (i===selectedQ ? 'var(--accent)' : 'var(--border)') + ';background:'
          + (i===selectedQ ? 'rgba(99,102,241,.15)' : 'var(--surface2)') + ';color:'
          + (i===selectedQ ? 'var(--accent)' : 'var(--text)') + '" data-idx="'+i+'">' + t + '</div>'
        ).join('');
        tokenDiv.querySelectorAll('[data-idx]').forEach(el =>
          el.addEventListener('click', () => { selectedQ = +el.dataset.idx; renderAttention(); }));

        // Heatmap
        const hmDiv = document.getElementById('attn-heatmap');
        hmDiv.innerHTML = '';
        const svg = d3.select('#attn-heatmap').append('svg')
          .attr('width', (N+1)*cellSize+20).attr('height', (N+1)*cellSize+20);
        const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0,1]);

        // Column labels
        tokens.forEach((t,j) => svg.append('text').attr('x',(j+1.5)*cellSize+10).attr('y',cellSize-4)
          .attr('text-anchor','middle').attr('fill','#8892b0').attr('font-size',10).text(t));
        // Row labels
        tokens.forEach((t,i) => svg.append('text').attr('x',cellSize).attr('y',(i+1.5)*cellSize+14)
          .attr('text-anchor','end').attr('fill','#8892b0').attr('font-size',10).text(t));

        for(let i=0;i<N;i++) for(let j=0;j<N;j++) {
          svg.append('rect')
            .attr('x',(j+1)*cellSize+10).attr('y',(i+1)*cellSize)
            .attr('width',cellSize-2).attr('height',cellSize-2)
            .attr('rx',3).attr('fill',color(weights[i][j]))
            .attr('stroke',i===selectedQ?'var(--accent)':'none').attr('stroke-width',i===selectedQ?2:0)
            .attr('opacity',i===selectedQ?1:0.5)
            .style('cursor','pointer')
            .on('click',() => { selectedQ = i; renderAttention(); });
          if(weights[i][j]>0.15) svg.append('text')
            .attr('x',(j+1.5)*cellSize+9).attr('y',(i+1.5)*cellSize+4)
            .attr('text-anchor','middle').attr('fill','#000').attr('font-size',9).attr('font-weight',600)
            .text(weights[i][j].toFixed(2));
        }

        // Bar chart
        const barDiv = document.getElementById('attn-bars');
        barDiv.innerHTML = '';
        const barW = 280, barH = 180;
        const barSvg = d3.select('#attn-bars').append('svg').attr('width',barW).attr('height',barH);
        const bw = (barW-40)/N;
        const yScale = d3.scaleLinear().domain([0,1]).range([barH-30,10]);
        tokens.forEach((t,j) => {
          barSvg.append('rect').attr('x',20+j*bw+2).attr('y',yScale(weights[selectedQ][j]))
            .attr('width',bw-4).attr('height',barH-30-yScale(weights[selectedQ][j]))
            .attr('rx',3).attr('fill', j===selectedQ?'var(--accent)':'var(--accent2)').attr('opacity',0.8);
          barSvg.append('text').attr('x',20+j*bw+bw/2).attr('y',barH-8)
            .attr('text-anchor','middle').attr('fill','#8892b0').attr('font-size',10).text(t);
          barSvg.append('text').attr('x',20+j*bw+bw/2).attr('y',yScale(weights[selectedQ][j])-4)
            .attr('text-anchor','middle').attr('fill','var(--text)').attr('font-size',10).attr('font-weight',600)
            .text(weights[selectedQ][j].toFixed(2));
        });

        // Insight
        const insightDiv = document.getElementById('attn-insight');
        const maxAttn = Math.max(...weights[selectedQ]);
        const maxIdx = weights[selectedQ].indexOf(maxAttn);
        const entropy = -weights[selectedQ].reduce((s,p) => p>0?s+p*Math.log2(p):s, 0);
        insightDiv.style.display = 'block';
        insightDiv.innerHTML = '<strong>"'+tokens[selectedQ]+'"</strong> attends most to <strong>"'+tokens[maxIdx]+'"</strong> ('+maxAttn.toFixed(3)+'). '
          + 'Entropy: '+entropy.toFixed(2)+' bits. '
          + (dk<4?'⚠️ Very small d_k → attention is nearly uniform (softmax saturated by high variance).'
            :dk>64?'Large d_k → √d_k scaling keeps softmax in a healthy range despite high-dimensional dot products.'
            :'d_k='+dk+' → √d_k='+Math.sqrt(dk).toFixed(1)+', a typical head dimension.');
      }

      document.getElementById('dk-slider').addEventListener('input', e => {
        dk = +e.target.value;
        document.getElementById('dk-val').textContent = dk;
        Q = randomMatrix(N, dk);
        K = randomMatrix(N, dk);
        renderAttention();
      });
      document.getElementById('attn-randomize').addEventListener('click', initAttention);
      initAttention();

      // ═══════════════════════════════════════════
      // VIZ 2: Scaling Laws
      // ═══════════════════════════════════════════
      const fmtNum = n => {
        if(n>=1e12) return (n/1e12).toFixed(1)+'T';
        if(n>=1e9) return (n/1e9).toFixed(1)+'B';
        if(n>=1e6) return (n/1e6).toFixed(1)+'M';
        if(n>=1e3) return (n/1e3).toFixed(1)+'K';
        return n.toFixed(0);
      };

      function renderScaling() {
        const logN = +document.getElementById('scale-n').value;
        const logD = +document.getElementById('scale-d').value;
        const N = Math.pow(10, logN);
        const D = Math.pow(10, logD);
        document.getElementById('scale-n-val').textContent = fmtNum(N);
        document.getElementById('scale-d-val').textContent = fmtNum(D);

        // Kaplan-style power law: L(N,D) ≈ a/N^α + b/D^β + c
        const loss = 6.0 * Math.pow(N, -0.076) + 5.0 * Math.pow(D, -0.095) + 1.69;

        // Generate curve data (sweep N for fixed D, and D for fixed N)
        const nPoints = Array.from({length:50}, (_,i) => {
          const n = Math.pow(10, 6 + i * 0.14);
          return { x: n, y: 6.0*Math.pow(n,-0.076) + 5.0*Math.pow(D,-0.095) + 1.69 };
        });
        const dPoints = Array.from({length:50}, (_,i) => {
          const d = Math.pow(10, 8 + i * 0.14);
          return { x: d, y: 6.0*Math.pow(N,-0.076) + 5.0*Math.pow(d,-0.095) + 1.69 };
        });

        const div = document.getElementById('scaling-chart');
        div.innerHTML = '';
        const w = div.clientWidth || 600, h = 300;
        const svg = d3.select('#scaling-chart').append('svg').attr('width',w).attr('height',h);
        const margin = {top:20,right:w/2+20,bottom:40,left:50};
        const chartW = w/2-60, chartH = h-60;

        // Left chart: Loss vs N
        const xN = d3.scaleLog().domain([1e6,1e13]).range([margin.left,margin.left+chartW]);
        const yN = d3.scaleLinear().domain([1.5,4.5]).range([margin.top+chartH,margin.top]);
        svg.append('g').attr('transform','translate(0,'+(margin.top+chartH)+')').call(d3.axisBottom(xN).ticks(4).tickFormat(d=>fmtNum(d)))
          .selectAll('text').attr('fill','#5a6785').attr('font-size',10);
        svg.append('g').attr('transform','translate('+margin.left+',0)').call(d3.axisLeft(yN).ticks(5))
          .selectAll('text').attr('fill','#5a6785').attr('font-size',10);
        svg.selectAll('.domain,.tick line').attr('stroke','#2d3150');
        svg.append('text').attr('x',margin.left+chartW/2).attr('y',h-4).attr('text-anchor','middle').attr('fill','#8892b0').attr('font-size',11).text('Parameters (N)');
        svg.append('text').attr('x',margin.left-35).attr('y',margin.top+chartH/2).attr('text-anchor','middle').attr('fill','#8892b0').attr('font-size',11).attr('transform','rotate(-90,'+(margin.left-35)+','+(margin.top+chartH/2)+')').text('Loss');
        const lineN = d3.line().x(d=>xN(d.x)).y(d=>yN(Math.max(1.5,Math.min(4.5,d.y)))).curve(d3.curveMonotoneX);
        svg.append('path').datum(nPoints).attr('d',lineN).attr('fill','none').attr('stroke','var(--accent)').attr('stroke-width',2.5);
        svg.append('circle').attr('cx',xN(N)).attr('cy',yN(Math.max(1.5,Math.min(4.5,loss)))).attr('r',6).attr('fill','var(--accent)').attr('stroke','#fff').attr('stroke-width',2);

        // Right chart: Loss vs D
        const offsetX = w/2+10;
        const xD = d3.scaleLog().domain([1e8,1e15]).range([offsetX,offsetX+chartW]);
        const yD = d3.scaleLinear().domain([1.5,4.5]).range([margin.top+chartH,margin.top]);
        svg.append('g').attr('transform','translate(0,'+(margin.top+chartH)+')').call(d3.axisBottom(xD).ticks(4).tickFormat(d=>fmtNum(d)))
          .selectAll('text').attr('fill','#5a6785').attr('font-size',10);
        svg.append('g').attr('transform','translate('+offsetX+',0)').call(d3.axisLeft(yD).ticks(5))
          .selectAll('text').attr('fill','#5a6785').attr('font-size',10);
        svg.selectAll('.domain,.tick line').attr('stroke','#2d3150');
        svg.append('text').attr('x',offsetX+chartW/2).attr('y',h-4).attr('text-anchor','middle').attr('fill','#8892b0').attr('font-size',11).text('Dataset Tokens (D)');
        const lineD = d3.line().x(d=>xD(d.x)).y(d=>yD(Math.max(1.5,Math.min(4.5,d.y)))).curve(d3.curveMonotoneX);
        svg.append('path').datum(dPoints).attr('d',lineD).attr('fill','none').attr('stroke','var(--accent2)').attr('stroke-width',2.5);
        svg.append('circle').attr('cx',xD(D)).attr('cy',yD(Math.max(1.5,Math.min(4.5,loss)))).attr('r',6).attr('fill','var(--accent2)').attr('stroke','#fff').attr('stroke-width',2);

        // Insight
        const chinchillaOptD = 20 * N;
        const ratio = D / chinchillaOptD;
        let advice = '';
        if(ratio < 0.3) advice = '⚠️ Very undertrained — Chinchilla says you need ~' + fmtNum(chinchillaOptD) + ' tokens for this model size.';
        else if(ratio < 0.8) advice = '📊 Undertrained — consider ~' + fmtNum(chinchillaOptD) + ' tokens (Chinchilla optimal).';
        else if(ratio < 1.5) advice = '✅ Near Chinchilla-optimal! ~20 tokens per parameter.';
        else advice = '📈 Overtrained relative to Chinchilla — LLaMA/Llama-style (more tokens, smaller model).';

        document.getElementById('scaling-insight').innerHTML =
          '<strong>N='+fmtNum(N)+', D='+fmtNum(D)+'</strong> → Loss ≈ '+loss.toFixed(3)+'. '
          + 'Tokens/param ratio: '+ratio.toFixed(1)+'× Chinchilla optimal. ' + advice;
      }

      document.getElementById('scale-n').addEventListener('input', renderScaling);
      document.getElementById('scale-d').addEventListener('input', renderScaling);
      renderScaling();

      // ═══════════════════════════════════════════
      // VIZ 3: Transformer Block Diagram
      // ═══════════════════════════════════════════
      function renderTransformer() {
        const dModel = +document.getElementById('dmodel-select').value;
        const nHeads = {768:12,1024:16,4096:32,8192:64,12288:96}[dModel] || 32;
        const dFF = dModel * 4;
        const headDim = dModel / nHeads;

        const components = [
          { id:'input', label:'Input Embedding', y:0, color:'#6366f1', params: 0, desc:'Token IDs → dense vectors of dimension d_model='+dModel },
          { id:'ln1', label:'LayerNorm', y:60, color:'#8b5cf6', params: 2*dModel, desc:'RMSNorm: normalizes activations. '+fmtNum(2*dModel)+' params (γ scale vector)' },
          { id:'mha', label:'Multi-Head Attention', y:120, color:'#22d3ee', params: 4*dModel*dModel, desc: nHeads+' heads × d_k='+headDim+'. Q,K,V,O projections: '+fmtNum(4*dModel*dModel)+' params' },
          { id:'add1', label:'+ Residual', y:180, color:'#10b981', params: 0, desc:'Skip connection: output = attention(x) + x. Zero extra params.' },
          { id:'ln2', label:'LayerNorm', y:240, color:'#8b5cf6', params: 2*dModel, desc:'Second RMSNorm before the FFN. '+fmtNum(2*dModel)+' params' },
          { id:'ffn', label:'FFN (SwiGLU)', y:300, color:'#f59e0b', params: 3*dModel*dFF, desc:'SwiGLU: 3 weight matrices of '+dModel+'×'+dFF+'. '+fmtNum(3*dModel*dFF)+' params — the majority of each layer!' },
          { id:'add2', label:'+ Residual', y:360, color:'#10b981', params: 0, desc:'Skip connection: output = FFN(x) + x' },
        ];

        const totalParams = components.reduce((s,c) => s+c.params, 0);
        const div = document.getElementById('transformer-diagram');
        div.innerHTML = '';
        const w = div.clientWidth || 600, h = 420;
        const svg = d3.select('#transformer-diagram').append('svg').attr('width',w).attr('height',h);
        const cx = w/2, boxW = 260, boxH = 44;

        // Draw connections
        components.forEach((c,i) => {
          if(i>0) svg.append('line').attr('x1',cx).attr('y1',components[i-1].y+boxH+8).attr('x2',cx).attr('y2',c.y+8)
            .attr('stroke','#2d3150').attr('stroke-width',2).attr('marker-end','');
        });
        // Skip connections
        svg.append('path').attr('d','M'+(cx+boxW/2+10)+','+128+' Q'+(cx+boxW/2+40)+','+155+' '+(cx+boxW/2+10)+','+188)
          .attr('fill','none').attr('stroke','#10b981').attr('stroke-width',2).attr('stroke-dasharray','6,4');
        svg.append('path').attr('d','M'+(cx+boxW/2+10)+','+248+' Q'+(cx+boxW/2+40)+','+285+' '+(cx+boxW/2+10)+','+308)
          .attr('fill','none').attr('stroke','#10b981').attr('stroke-width',2).attr('stroke-dasharray','6,4');

        // Draw boxes
        components.forEach(c => {
          const g = svg.append('g').style('cursor','pointer');
          g.append('rect').attr('x',cx-boxW/2).attr('y',c.y+8).attr('width',boxW).attr('height',boxH)
            .attr('rx',8).attr('fill',c.color+'18').attr('stroke',c.color).attr('stroke-width',1.5);
          g.append('text').attr('x',cx).attr('y',c.y+28).attr('text-anchor','middle')
            .attr('fill','var(--text)').attr('font-size',13).attr('font-weight',600).text(c.label);
          if(c.params > 0) g.append('text').attr('x',cx).attr('y',c.y+43).attr('text-anchor','middle')
            .attr('fill','#8892b0').attr('font-size',10).text(fmtNum(c.params)+' params');

          // Param bar
          if(c.params > 0 && totalParams > 0) {
            const barW = (c.params/totalParams) * (boxW-20);
            g.append('rect').attr('x',cx-boxW/2+10).attr('y',c.y+boxH+6).attr('width',barW).attr('height',3)
              .attr('rx',1.5).attr('fill',c.color).attr('opacity',0.5);
          }

          g.on('mouseover', () => {
            const info = document.getElementById('transformer-info');
            info.style.display = 'block';
            info.innerHTML = '<strong>'+c.label+'</strong>: '+c.desc;
          });
        });

        svg.append('text').attr('x',cx).attr('y',h-4).attr('text-anchor','middle')
          .attr('fill','#5a6785').attr('font-size',11).text('Total per layer: '+fmtNum(totalParams)+' params. FFN is '+(100*3*dModel*dFF/totalParams).toFixed(0)+'% of layer params.');
      }

      document.getElementById('dmodel-select').addEventListener('change', renderTransformer);
      renderTransformer();

      // ═══════════════════════════════════════════
      // VIZ 4: Embedding Space
      // ═══════════════════════════════════════════
      const groups = {
        royalty: [
          {word:'king',x:200,y:100,c:'#f59e0b'},{word:'queen',x:260,y:110,c:'#f59e0b'},
          {word:'prince',x:190,y:160,c:'#f59e0b'},{word:'princess',x:250,y:170,c:'#f59e0b'},
          {word:'man',x:120,y:200,c:'#8892b0'},{word:'woman',x:180,y:210,c:'#8892b0'},
        ],
        animals: [
          {word:'dog',x:350,y:250,c:'#10b981'},{word:'puppy',x:370,y:300,c:'#10b981'},
          {word:'cat',x:420,y:240,c:'#10b981'},{word:'kitten',x:440,y:290,c:'#10b981'},
          {word:'fish',x:480,y:200,c:'#22d3ee'},{word:'bird',x:310,y:200,c:'#22d3ee'},
        ],
        cities: [
          {word:'Paris',x:100,y:320,c:'#ef4444'},{word:'France',x:140,y:350,c:'#ef4444'},
          {word:'Tokyo',x:200,y:310,c:'#ef4444'},{word:'Japan',x:240,y:340,c:'#ef4444'},
          {word:'Berlin',x:150,y:290,c:'#ef4444'},{word:'Germany',x:190,y:320,c:'#ef4444'},
        ],
        ml: [
          {word:'gradient',x:400,y:100,c:'#6366f1'},{word:'loss',x:440,y:130,c:'#6366f1'},
          {word:'attention',x:380,y:150,c:'#6366f1'},{word:'transformer',x:460,y:160,c:'#6366f1'},
          {word:'embedding',x:420,y:80,c:'#8b5cf6'},{word:'token',x:360,y:120,c:'#8b5cf6'},
        ],
      };

      let activeWords = [...groups.royalty, ...groups.animals];

      function renderEmbedding() {
        const div = document.getElementById('embedding-space');
        div.innerHTML = '';
        const w = div.clientWidth || 600, h = 400;
        const svg = d3.select('#embedding-space').append('svg').attr('width',w).attr('height',h);

        // Scale positions to container
        const xs = activeWords.map(w=>w.x), ys = activeWords.map(w=>w.y);
        const scaleX = d3.scaleLinear().domain([Math.min(...xs)-40,Math.max(...xs)+40]).range([40,w-40]);
        const scaleY = d3.scaleLinear().domain([Math.min(...ys)-40,Math.max(...ys)+40]).range([30,h-30]);

        // Draw lines between close words
        for(let i=0;i<activeWords.length;i++) for(let j=i+1;j<activeWords.length;j++) {
          const dx = activeWords[i].x-activeWords[j].x, dy = activeWords[i].y-activeWords[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if(dist < 100) {
            svg.append('line').attr('x1',scaleX(activeWords[i].x)).attr('y1',scaleY(activeWords[i].y))
              .attr('x2',scaleX(activeWords[j].x)).attr('y2',scaleY(activeWords[j].y))
              .attr('stroke','#2d3150').attr('stroke-width',1).attr('stroke-opacity',1-dist/100);
          }
        }

        // Draw words
        const nodes = svg.selectAll('.word').data(activeWords).join('g').attr('class','word')
          .attr('transform',d=>'translate('+scaleX(d.x)+','+scaleY(d.y)+')')
          .style('cursor','grab');

        nodes.append('circle').attr('r',6).attr('fill',d=>d.c).attr('stroke',d=>d.c).attr('stroke-opacity',0.3).attr('stroke-width',8);
        nodes.append('text').attr('dx',10).attr('dy',4).text(d=>d.word)
          .attr('fill','var(--text)').attr('font-size',13).attr('font-weight',500);

        // Drag behavior
        nodes.call(d3.drag()
          .on('start', function() { d3.select(this).style('cursor','grabbing'); })
          .on('drag', function(e,d) {
            d.x = scaleX.invert(e.x); d.y = scaleY.invert(e.y);
            renderEmbedding();
          })
          .on('end', function() { d3.select(this).style('cursor','grab'); })
        );
      }

      document.querySelectorAll('.emb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const g = btn.dataset.group;
          // Toggle: if already showing this group exclusively, show all
          const allGroups = Object.values(groups).flat();
          activeWords = groups[g] ? [...groups[g]] : allGroups;
          // Add one more group for context
          const otherKeys = Object.keys(groups).filter(k => k !== g);
          if(otherKeys.length > 0) activeWords.push(...groups[otherKeys[0]]);
          renderEmbedding();
        });
      });
      renderEmbedding();
    })();
    </script>`;

  return page('Visualizations', content, nav, '<a href="index.html">Home</a> › Visualizations', 'visualizations');
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
            content: generatePapersIndexPage(papers, courses,
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

        // ── Generate visualizations page ──
        pages.push({
          path: resolve(outputDir, 'visualizations.html'),
          content: generateVisualizationsPage(
            buildNav(courses, papers, graphExists, 'visualizations')),
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

        // ── Generate static data files for client-side features ──

        // Search index: key snippets from all notes
        const searchIndex: Array<{ course: string; lecture: string; text: string }> = [];
        for (const courseConfig of courses) {
          const lectDir = resolve(coursesDir, courseConfig.name, 'lectures');
          if (!existsSync(lectDir)) continue;
          for (const ld of readdirSync(lectDir).filter(d => !d.startsWith('.')).sort()) {
            const notes = readText(resolve(lectDir, ld, 'notes.md'));
            if (!notes) continue;
            const lecId = ld.split('-')[0];
            // Extract key lines (headings, takeaways, quotes, concept mentions)
            const lines = notes.split('\n').filter(l =>
              l.startsWith('#') || l.startsWith('- ') || l.startsWith('> ') ||
              l.includes('**') || l.includes('[[') || l.length > 40
            );
            for (const line of lines.slice(0, 30)) {
              const clean = line.replace(/^[#*>\-\s]+/, '').replace(/\[\[|\]\]/g, '').trim();
              if (clean.length > 15) {
                searchIndex.push({ course: courseConfig.name, lecture: lecId, text: clean });
              }
            }
          }
        }
        writeText(resolve(outputDir, 'search-index.json'), JSON.stringify(searchIndex));

        // Quiz data: all concepts as flashcard-style questions
        const quizData: Array<{ name: string; definition: string; course: string; lecture: string }> = [];
        for (const courseConfig of courses) {
          const lectDir = resolve(coursesDir, courseConfig.name, 'lectures');
          if (!existsSync(lectDir)) continue;
          for (const ld of readdirSync(lectDir).filter(d => !d.startsWith('.')).sort()) {
            const conceptsData = readYaml<ConceptsYaml>(resolve(lectDir, ld, 'concepts.yaml'));
            if (!conceptsData?.concepts) continue;
            for (const c of conceptsData.concepts) {
              if (c.name && c.definition) {
                quizData.push({
                  name: c.name,
                  definition: c.definition,
                  course: courseConfig.name,
                  lecture: ld.split('-')[0],
                });
              }
            }
          }
        }
        writeText(resolve(outputDir, 'quiz-data.json'), JSON.stringify(quizData));

        // Anki export: TSV of all concepts
        const ankiLines = quizData.map(q =>
          `${q.name}\t${q.definition} (Source: ${q.course} L${q.lecture})`
        );
        ensureDir(resolve(outputDir, 'exports'));
        writeText(resolve(outputDir, 'exports', 'anki.txt'), ankiLines.join('\n'));

        success(`Static site generated: ${pages.length} pages`);
        info(`  📚 ${courses.length} courses`);
        info(`  📄 ${papers.length} papers`);
        if (graphExists) info(`  🔗 Knowledge graph embedded`);
        info(`  📋 Resource library`);
        info(`  📊 Progress dashboard`);
        info(`  🔍 Search index: ${searchIndex.length} entries`);
        info(`  📝 Quiz data: ${quizData.length} concepts`);
        info(`  📇 Anki export: ${ankiLines.length} cards`);
        info(`Open: ${resolve(outputDir, 'index.html')}`);
        info('Interactive: `learn serve` for full experience');
      } catch (e) {
        error(`Site generation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
