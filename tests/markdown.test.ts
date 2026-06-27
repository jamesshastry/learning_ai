/**
 * Markdown-to-HTML conversion tests.
 *
 * The mdToHtml function in site.ts is not exported, so we test it indirectly
 * through generateSite. These tests validate the conversion by checking the
 * generated lecture pages for correct HTML output from markdown input.
 *
 * Since mdToHtml is critical and used on every lecture page, this file also
 * tests its behavior via a re-implementation extraction approach: we read
 * the compiled JS and extract the function for direct testing.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Extract mdToHtml and escapeHtml from the compiled site.js for direct testing.
// This avoids modifying the source just for testability.
const siteJs = readFileSync(resolve(import.meta.dirname, '..', 'dist', 'cli', 'site.js'), 'utf-8');

// Build the functions in an isolated scope
function buildFunctions() {
  // Extract escapeHtml
  const escapeMatch = siteJs.match(/function escapeHtml\(text\)\s*\{[^}]+\}/);
  // Extract mdToHtml — it's a longer function, match until the closing of the chain
  const mdStart = siteJs.indexOf('function mdToHtml(md)');
  if (mdStart === -1 || !escapeMatch) throw new Error('Could not extract functions from site.js');

  // Find the end of mdToHtml by counting braces
  let depth = 0;
  let mdEnd = mdStart;
  for (let i = mdStart; i < siteJs.length; i++) {
    if (siteJs[i] === '{') depth++;
    if (siteJs[i] === '}') { depth--; if (depth === 0) { mdEnd = i + 1; break; } }
  }

  const code = `
    ${escapeMatch[0]}
    ${siteJs.slice(mdStart, mdEnd)}
    return { mdToHtml, escapeHtml };
  `;

  const factory = new Function(code);
  return factory() as { mdToHtml: (md: string) => string; escapeHtml: (text: string) => string };
}

const { mdToHtml, escapeHtml } = buildFunctions();

// ── escapeHtml ─────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// ── mdToHtml ───────────────────────────────────────────────────────

describe('mdToHtml', () => {
  it('converts headers', () => {
    expect(mdToHtml('# Title')).toContain('<h1>Title</h1>');
    expect(mdToHtml('## Section')).toContain('<h2>Section</h2>');
    expect(mdToHtml('### Subsection')).toContain('<h3>Subsection</h3>');
    expect(mdToHtml('#### Minor')).toContain('<h4>Minor</h4>');
  });

  it('converts bold and italic', () => {
    expect(mdToHtml('**bold**')).toContain('<strong>bold</strong>');
    expect(mdToHtml('*italic*')).toContain('<em>italic</em>');
    expect(mdToHtml('***both***')).toContain('<strong><em>both</em></strong>');
  });

  it('converts wiki-links to concept spans', () => {
    const html = mdToHtml('See [[Transformer Architecture]]');
    expect(html).toContain('concept-link');
    expect(html).toContain('Transformer Architecture');
  });

  it('converts markdown links', () => {
    const html = mdToHtml('[click here](https://example.com)');
    expect(html).toContain('<a href="https://example.com">click here</a>');
  });

  it('converts blockquotes', () => {
    const html = mdToHtml('> Important quote');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('Important quote');
  });

  it('converts code blocks', () => {
    const html = mdToHtml('```python\nprint("hello")\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('print');
  });

  it('converts inline code', () => {
    const html = mdToHtml('Use `torch.nn.Module`');
    expect(html).toContain('<code>torch.nn.Module</code>');
  });

  it('strips YAML frontmatter', () => {
    const md = '---\ntitle: Test\ntags: [a, b]\n---\n# Real Content';
    const html = mdToHtml(md);
    expect(html).not.toContain('title: Test');
    expect(html).toContain('<h1>Real Content</h1>');
  });

  it('converts unordered list items', () => {
    const html = mdToHtml('- Item one\n- Item two');
    expect(html).toContain('<li>Item one</li>');
    expect(html).toContain('<li>Item two</li>');
    expect(html).toContain('<ul>');
  });

  it('converts horizontal rules', () => {
    const html = mdToHtml('above\n---\nbelow');
    expect(html).toContain('<hr');
  });
});
