import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, readText, writeText, writeJson, ensureDir, readLines } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';

/**
 * Register the `learn obsidian` command.
 *
 * Set up the project as an Obsidian vault with a dashboard note
 * and proper configuration for wiki-links and graph view.
 */
export function obsidianCommand(program: Command): void {
  program
    .command('obsidian')
    .description('Set up as an Obsidian vault with dashboard and graph config')
    .action(async () => {
      try {
        const config = loadConfig();
        const vaultRoot = config.projectRoot;

        progress('Setting up Obsidian vault...');

        // Create .obsidian directory with config
        const obsidianDir = resolve(vaultRoot, '.obsidian');
        ensureDir(obsidianDir);

        // app.json — vault settings
        writeJson(resolve(obsidianDir, 'app.json'), {
          showLineNumber: true,
          strictLineBreaks: false,
          useMarkdownLinks: false,  // Use wiki-links [[like this]]
          showFrontmatter: true,
          readableLineLength: true,
        });

        // graph.json — graph view settings
        writeJson(resolve(obsidianDir, 'graph.json'), {
          collapse: {
            search: false,
            query: '',
            attachments: false,
            existingOnly: false,
            orphans: false,
          },
          search: '',
          showTags: true,
          showAttachments: false,
          hideUnresolved: false,
          showOrphans: true,
          textFadeMultiplier: 0,
          nodeSizeMultiplier: 1,
          lineSizeMultiplier: 1,
          repelStrength: 10,
          centerStrength: 0.5,
          linkStrength: 1,
          linkDistance: 250,
          scale: 1,
          close: false,
        });

        // Generate the dashboard note
        const dashboard = generateDashboard(config.projectRoot);
        writeText(resolve(vaultRoot, 'Dashboard.md'), dashboard);

        // Generate a random concept review note
        const randomReview = generateRandomReviewNote(config.projectRoot);
        writeText(resolve(vaultRoot, 'Random Review.md'), randomReview);

        success('Obsidian vault configured!');
        info(`Open this folder in Obsidian: ${vaultRoot}`);
        info('Key files:');
        info('  📊 Dashboard.md — course overview with links');
        info('  🎲 Random Review.md — random concept for quick review');
        info('  🔗 knowledge-graph/concepts/ — all concepts with wiki-links');
      } catch (e) {
        error(`Obsidian setup failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Generate the main dashboard note for Obsidian.
 */
function generateDashboard(projectRoot: string): string {
  const lines: string[] = [
    '# 🧠 Learning AI Dashboard',
    '',
    `*Last updated: ${new Date().toISOString().split('T')[0]}*`,
    '',
    '## Courses',
    '',
  ];

  const coursesDir = resolve(projectRoot, 'courses');
  if (!existsSync(coursesDir)) return lines.join('\n');

  for (const courseDir of readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'))) {
    const courseConfig = readYaml<CourseConfig>(
      resolve(coursesDir, courseDir, 'course.yaml')
    );
    if (!courseConfig) continue;

    const total = courseConfig.lectures.length;
    const watched = courseConfig.lectures.filter(l => l.watched).length;
    const completed = courseConfig.lectures.filter(l => l.status === 'completed').length;
    const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

    lines.push(`### ${courseConfig.title}`);
    if (courseConfig.university) lines.push(`*${courseConfig.university}*`);
    lines.push(`Progress: ${watched}/${total} watched (${pct}%) · ${completed} with notes`);
    lines.push('');

    // List lectures with links to notes
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (existsSync(lecturesDir)) {
      for (const lecture of courseConfig.lectures) {
        const matchingDir = readdirSync(lecturesDir).find(d => d.split('-')[0] === lecture.id);
        const icon = lecture.watched ? '✅' : (lecture.status === 'completed' ? '📝' : '⏳');
        const confIcon = lecture.confidence === 'high' ? '🟢' :
          lecture.confidence === 'medium' ? '🟡' :
          lecture.confidence === 'low' ? '🟠' : '';

        if (matchingDir && existsSync(resolve(lecturesDir, matchingDir, 'notes.md'))) {
          lines.push(`- ${icon} ${confIcon} [[courses/${courseDir}/lectures/${matchingDir}/notes|${lecture.id} ${lecture.title}]]`);
        } else {
          lines.push(`- ${icon} ${confIcon} ${lecture.id} ${lecture.title}`);
        }
      }
    }
    lines.push('');
  }

  // Concept index
  lines.push('## Concepts');
  lines.push('');
  const concepts = readLines(resolve(projectRoot, 'knowledge-graph', 'concept-index.txt'));
  if (concepts.length > 0) {
    lines.push(`${concepts.length} concepts across all courses:`);
    lines.push('');
    for (const concept of concepts.sort()) {
      const slug = concept.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      lines.push(`- [[knowledge-graph/concepts/${slug}|${concept}]]`);
    }
  } else {
    lines.push('No concepts extracted yet. Run `learn graph build`.');
  }

  // Synthesis documents
  lines.push('');
  lines.push('## Synthesis');
  const synthesisDir = resolve(projectRoot, 'courses', 'synthesis');
  if (existsSync(synthesisDir)) {
    for (const file of readdirSync(synthesisDir).filter(f => f.endsWith('.md'))) {
      const name = file.replace('.md', '').replace(/-/g, ' ');
      lines.push(`- [[courses/synthesis/${file.replace('.md', '')}|${name}]]`);
    }
  } else {
    lines.push('No synthesis documents yet. Run `learn synthesize "topic"`.');
  }

  return lines.join('\n');
}

/**
 * Generate a "random concept review" note.
 * Uses Obsidian's built-in random note feature as inspiration,
 * but creates a curated review page.
 */
function generateRandomReviewNote(projectRoot: string): string {
  const concepts = readLines(resolve(projectRoot, 'knowledge-graph', 'concept-index.txt'));

  const lines: string[] = [
    '# 🎲 Random Concept Review',
    '',
    'Open the knowledge graph and pick a random concept to review!',
    '',
    '## Quick Review Cards',
    '',
    'Close your eyes, scroll down, stop, and try to define the concept before clicking:',
    '',
  ];

  // Shuffle concepts for random order
  const shuffled = [...concepts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (const concept of shuffled) {
    const slug = concept.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    lines.push(`- [ ] **${concept}** — Can you define it? → [[knowledge-graph/concepts/${slug}|Check]]`);
  }

  return lines.join('\n');
}
