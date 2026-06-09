import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, readText, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';
import { formatDuration } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';

/**
 * Register the `learn site` command.
 *
 * Generate a static HTML site from all notes and concepts
 * for mobile-friendly browsing.
 */
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
        if (!existsSync(coursesDir)) {
          error('No courses found.');
          process.exit(1);
        }

        const courseDirs = readdirSync(coursesDir)
          .filter(d => d !== 'synthesis' && !d.startsWith('.'));

        // Build course index
        const courseIndex: Array<{
          name: string;
          title: string;
          university?: string;
          lectureCount: number;
          watchedCount: number;
        }> = [];

        const pages: Array<{ path: string; content: string }> = [];

        for (const courseDir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(
            resolve(coursesDir, courseDir, 'course.yaml')
          );
          if (!courseConfig) continue;

          const watchedCount = courseConfig.lectures.filter(l => l.watched).length;
          courseIndex.push({
            name: courseConfig.name,
            title: courseConfig.title,
            university: courseConfig.university,
            lectureCount: courseConfig.lectures.length,
            watchedCount,
          });

          // Generate course page
          const coursePage = generateCoursePage(courseConfig, config.projectRoot);
          const courseOutputDir = resolve(outputDir, courseDir);
          ensureDir(courseOutputDir);
          pages.push({ path: resolve(courseOutputDir, 'index.html'), content: coursePage });

          // Generate lecture pages
          const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
          if (!existsSync(lecturesDir)) continue;

          for (const lectureDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
            const notes = readText(resolve(lecturesDir, lectureDir, 'notes.md'));
            if (!notes) continue;

            const annotations = readText(resolve(lecturesDir, lectureDir, 'annotations.md'));
            const lecturePage = generateLecturePage(notes, annotations, courseConfig, lectureDir);
            pages.push({
              path: resolve(courseOutputDir, `${lectureDir}.html`),
              content: lecturePage,
            });
          }
        }

        // Generate index page
        const indexPage = generateIndexPage(courseIndex);
        pages.push({ path: resolve(outputDir, 'index.html'), content: indexPage });

        // Write all pages
        for (const page of pages) {
          ensureDir(resolve(page.path, '..'));
          writeText(page.path, page.content);
        }

        success(`Static site generated: ${pages.length} pages`);
        info(`Open: ${resolve(outputDir, 'index.html')}`);
        info('Tip: serve with `npx serve site` for local preview');
      } catch (e) {
        error(`Site generation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Shared CSS for all pages.
 */
const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 16px; }
a { color: #58a6ff; text-decoration: none; }
a:hover { text-decoration: underline; }
h1 { color: #f0f6fc; margin-bottom: 16px; font-size: 24px; }
h2 { color: #f0f6fc; margin: 24px 0 8px; font-size: 20px; border-bottom: 1px solid #21262d; padding-bottom: 4px; }
h3 { color: #c9d1d9; margin: 16px 0 8px; font-size: 16px; }
p { margin-bottom: 12px; }
blockquote { border-left: 3px solid #58a6ff; padding: 8px 16px; margin: 12px 0; background: #161b22; border-radius: 4px; }
code { background: #161b22; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
pre { background: #161b22; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
ul, ol { padding-left: 24px; margin-bottom: 12px; }
li { margin-bottom: 4px; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin: 8px 0; }
.card:hover { border-color: #58a6ff; }
.tag { display: inline-block; background: #21262d; border: 1px solid #30363d; border-radius: 12px; padding: 2px 10px; margin: 2px; font-size: 12px; color: #58a6ff; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.badge-green { background: #238636; color: #fff; }
.badge-yellow { background: #9e6a03; color: #fff; }
.badge-dim { background: #21262d; color: #8b949e; }
.nav { margin-bottom: 16px; font-size: 14px; }
.nav a { margin-right: 8px; }
.progress { background: #21262d; border-radius: 4px; height: 8px; margin: 8px 0; }
.progress-fill { background: #238636; border-radius: 4px; height: 100%; }
@media (max-width: 600px) { body { padding: 12px; } h1 { font-size: 20px; } }
`;

/**
 * Convert basic markdown to HTML (lightweight, no external deps).
 */
function mdToHtml(md: string): string {
  return md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Wiki links
    .replace(/\[\[(.+?)\]\]/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    // List items
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').trim();
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    })
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[hbloup]|<li|<pre|<code)(.+)$/gm, '<p>$1</p>')
    // Wrap loose li in ul
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generateIndexPage(courses: Array<{
  name: string; title: string; university?: string; lectureCount: number; watchedCount: number;
}>): string {
  const courseCards = courses.map(c => {
    const pct = c.lectureCount > 0 ? Math.round((c.watchedCount / c.lectureCount) * 100) : 0;
    const uni = c.university ? ` <span class="tag">${escapeHtml(c.university)}</span>` : '';
    return `
      <a href="${c.name}/index.html" style="text-decoration:none;color:inherit">
        <div class="card">
          <h3>${escapeHtml(c.title)}${uni}</h3>
          <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="badge badge-dim">${c.watchedCount}/${c.lectureCount} watched (${pct}%)</span>
        </div>
      </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Learning AI</title><style>${CSS}</style></head>
<body>
<h1>🧠 Learning AI</h1>
<p>Your AI course notes — ${courses.length} courses</p>
${courseCards}
</body></html>`;
}

function generateCoursePage(courseConfig: CourseConfig, projectRoot: string): string {
  const lectureLinks = courseConfig.lectures.map(l => {
    const watchIcon = l.watched ? '✓' : '○';
    const badge = l.status === 'completed'
      ? '<span class="badge badge-green">notes</span>'
      : '<span class="badge badge-dim">pending</span>';
    const slug = l.id + '-' + l.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);

    // Check if notes exist
    const lecturesDir = resolve(projectRoot, 'courses', courseConfig.name, 'lectures');
    const dirs = existsSync(lecturesDir) ? readdirSync(lecturesDir) : [];
    const matchingDir = dirs.find(d => d.split('-')[0] === l.id);
    const hasNotes = matchingDir && existsSync(resolve(lecturesDir, matchingDir, 'notes.md'));
    const href = hasNotes ? `${matchingDir}.html` : '#';

    return `<a href="${href}" style="text-decoration:none;color:inherit">
      <div class="card">
        <span>${watchIcon} ${l.id}</span> ${escapeHtml(l.title)} ${badge}
      </div></a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(courseConfig.title)}</title><style>${CSS}</style></head>
<body>
<div class="nav"><a href="../index.html">← All Courses</a></div>
<h1>${escapeHtml(courseConfig.title)}</h1>
<p>${courseConfig.university ?? ''} · ${courseConfig.lectures.length} lectures</p>
${lectureLinks}
</body></html>`;
}

function generateLecturePage(
  notes: string,
  annotations: string | undefined,
  courseConfig: CourseConfig,
  lectureDir: string
): string {
  const title = lectureDir.replace(/^\d+-/, '').replace(/-/g, ' ');
  let content = mdToHtml(notes);
  if (annotations) {
    content += '<h2>Personal Annotations</h2>' + mdToHtml(annotations);
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><style>${CSS}</style></head>
<body>
<div class="nav"><a href="index.html">← ${escapeHtml(courseConfig.title)}</a></div>
${content}
</body></html>`;
}
