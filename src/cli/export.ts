import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml, readText, writeText, ensureDir, readLines } from '../utils/files.js';
import { success, error, info, warn } from '../utils/logger.js';
import type { CourseConfig, ConceptsYaml } from '../types.js';

/**
 * Register the `learn export` command.
 *
 * Export course content to various formats:
 * - anki: CSV flashcards from extracted concepts
 * - md: Clean markdown study guide
 */
export function exportCommand(program: Command): void {
  program
    .command('export [course] [lecture-id]')
    .description('Export notes/concepts to Anki flashcards or markdown study guide')
    .requiredOption('--format <format>', 'Export format: anki or md')
    .option('--topic <topic>', 'Export only content related to a topic')
    .option('--output <path>', 'Output file path')
    .action(async (courseName: string | undefined, lectureId: string | undefined, opts: {
      format: string;
      topic?: string;
      output?: string;
    }) => {
      try {
        const config = loadConfig();

        switch (opts.format) {
          case 'anki':
            await exportAnki(config.projectRoot, courseName, lectureId, opts.topic, opts.output);
            break;
          case 'md':
            await exportMarkdown(config.projectRoot, courseName, lectureId, opts.topic, opts.output);
            break;
          default:
            error(`Unknown format: "${opts.format}". Use: anki, md`);
            process.exit(1);
        }
      } catch (e) {
        error(`Export failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Export concepts as Anki-importable CSV.
 * Format: front\tback\ttags
 * Front = concept name, Back = definition + sources, Tags = concept tags
 */
async function exportAnki(
  projectRoot: string,
  courseName?: string,
  lectureId?: string,
  topic?: string,
  outputPath?: string
): Promise<void> {
  const concepts = collectConcepts(projectRoot, courseName, lectureId, topic);

  if (concepts.length === 0) {
    error('No concepts found to export.');
    process.exit(1);
  }

  // Build Anki CSV (tab-separated: front, back, tags)
  const lines: string[] = [];
  // Header comment for Anki import
  lines.push('#separator:tab');
  lines.push('#html:true');
  lines.push('#tags column:3');

  for (const concept of concepts) {
    const front = escapeAnki(concept.name);
    const aliases = concept.aliases.length > 0
      ? `<br><i>Also known as: ${concept.aliases.join(', ')}</i>`
      : '';

    const relations = concept.relations
      .map(r => `• ${r.target} (${r.type.replace(/_/g, ' ')})${r.note ? ': ' + r.note : ''}`)
      .join('<br>');

    const sources = concept.sources
      .map(s => `${s.course} / Lecture ${s.lecture}`)
      .join(', ');

    const back = [
      escapeAnki(concept.definition),
      aliases,
      relations ? `<br><br><b>Related:</b><br>${relations}` : '',
      `<br><br><i>Sources: ${sources}</i>`,
    ].join('');

    const tags = concept.tags.join(' ');

    lines.push(`${front}\t${back}\t${tags}`);
  }

  const output = outputPath
    ? resolve(outputPath)
    : resolve(projectRoot, 'exports', `${courseName ?? 'all'}-anki.txt`);

  ensureDir(resolve(output, '..'));
  writeText(output, lines.join('\n') + '\n');

  success(`Exported ${concepts.length} concepts as Anki flashcards`);
  info(`File: ${output}`);
  info('Import in Anki: File → Import → select the .txt file');
}

/**
 * Export as a clean markdown study guide.
 */
async function exportMarkdown(
  projectRoot: string,
  courseName?: string,
  lectureId?: string,
  topic?: string,
  outputPath?: string
): Promise<void> {
  const parts: string[] = [];

  if (topic) {
    // Topic-scoped export across all courses
    parts.push(`# Study Guide: ${topic}\n`);
    parts.push(`*Generated from learning-ai on ${new Date().toISOString().split('T')[0]}*\n`);
    parts.push(exportTopicGuide(projectRoot, topic));
  } else if (courseName && lectureId) {
    // Single lecture export
    const paddedId = lectureId.padStart(2, '0');
    parts.push(exportLecture(projectRoot, courseName, paddedId));
  } else if (courseName) {
    // Full course export
    parts.push(exportCourse(projectRoot, courseName));
  } else {
    // All courses
    parts.push(`# Complete Study Guide\n`);
    parts.push(`*Generated from learning-ai on ${new Date().toISOString().split('T')[0]}*\n`);

    const coursesDir = resolve(projectRoot, 'courses');
    if (existsSync(coursesDir)) {
      for (const dir of readdirSync(coursesDir).filter(d => d !== 'synthesis').sort()) {
        const courseConfig = readYaml<CourseConfig>(resolve(coursesDir, dir, 'course.yaml'));
        if (courseConfig) {
          parts.push(`---\n`);
          parts.push(exportCourse(projectRoot, dir));
        }
      }
    }
  }

  const content = parts.join('\n');
  const slug = topic ?? courseName ?? 'all';
  const output = outputPath
    ? resolve(outputPath)
    : resolve(projectRoot, 'exports', `${slug}-study-guide.md`);

  ensureDir(resolve(output, '..'));
  writeText(output, content);

  success(`Exported study guide: ${output}`);
}

/**
 * Export a single course as markdown.
 */
function exportCourse(projectRoot: string, courseName: string): string {
  const courseConfig = readYaml<CourseConfig>(
    resolve(projectRoot, 'courses', courseName, 'course.yaml')
  );
  if (!courseConfig) return `# ${courseName}\n\nCourse not found.\n`;

  const university = courseConfig.university ? ` (${courseConfig.university})` : '';
  const parts: string[] = [
    `# ${courseConfig.title}${university}\n`,
  ];

  if (courseConfig.website) {
    parts.push(`Website: ${courseConfig.website}\n`);
  }

  const lecturesDir = resolve(projectRoot, 'courses', courseName, 'lectures');
  if (!existsSync(lecturesDir)) return parts.join('\n');

  const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();

  for (const dir of lectureDirs) {
    const notesPath = resolve(lecturesDir, dir, 'notes.md');
    const notes = readText(notesPath);
    if (notes) {
      parts.push(`\n---\n`);
      parts.push(notes);
    }
  }

  return parts.join('\n');
}

/**
 * Export a single lecture as markdown.
 */
function exportLecture(projectRoot: string, courseName: string, lectureId: string): string {
  const lecturesDir = resolve(projectRoot, 'courses', courseName, 'lectures');
  if (!existsSync(lecturesDir)) return 'Lecture not found.\n';

  const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
  const matchingDir = lectureDirs.find(d => d.split('-')[0] === lectureId);
  if (!matchingDir) return 'Lecture not found.\n';

  const notes = readText(resolve(lecturesDir, matchingDir, 'notes.md'));
  const annotations = readText(resolve(lecturesDir, matchingDir, 'annotations.md'));

  let content = notes ?? 'No notes generated yet.\n';
  if (annotations) {
    content += '\n---\n\n## Personal Annotations\n\n' + annotations;
  }

  return content;
}

/**
 * Export a topic guide from all courses.
 */
function exportTopicGuide(projectRoot: string, topic: string): string {
  const topicLower = topic.toLowerCase();
  const parts: string[] = [];
  const coursesDir = resolve(projectRoot, 'courses');

  if (!existsSync(coursesDir)) return 'No courses found.\n';

  for (const courseDir of readdirSync(coursesDir).filter(d => d !== 'synthesis')) {
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const lectureDir of readdirSync(lecturesDir).sort()) {
      const notesPath = resolve(lecturesDir, lectureDir, 'notes.md');
      const notes = readText(notesPath);
      if (notes && notes.toLowerCase().includes(topicLower)) {
        parts.push(`\n## ${courseDir} / ${lectureDir}\n`);
        // Extract relevant sections
        const sections = notes.split(/^##\s/m);
        for (const section of sections) {
          if (section.toLowerCase().includes(topicLower)) {
            parts.push('## ' + section.trim());
          }
        }
      }
    }
  }

  if (parts.length === 0) {
    return `No content found about "${topic}" across any course.\n`;
  }

  return parts.join('\n');
}

/**
 * Collect concepts from courses/lectures, optionally filtered by topic.
 */
interface ExportConcept {
  name: string;
  aliases: string[];
  definition: string;
  tags: string[];
  relations: Array<{ target: string; type: string; note?: string }>;
  sources: Array<{ course: string; lecture: string }>;
}

function collectConcepts(
  projectRoot: string,
  courseName?: string,
  lectureId?: string,
  topic?: string
): ExportConcept[] {
  const concepts: ExportConcept[] = [];
  const coursesDir = resolve(projectRoot, 'courses');
  const topicLower = topic?.toLowerCase();

  if (!existsSync(coursesDir)) return concepts;

  const courseDirs = courseName
    ? [courseName]
    : readdirSync(coursesDir).filter(d => d !== 'synthesis');

  for (const courseDir of courseDirs) {
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const dir of readdirSync(lecturesDir).sort()) {
      const dirId = dir.split('-')[0];
      if (lectureId && dirId !== lectureId.padStart(2, '0')) continue;

      const data = readYaml<ConceptsYaml>(resolve(lecturesDir, dir, 'concepts.yaml'));
      if (!data?.concepts) continue;

      for (const concept of data.concepts) {
        if (topicLower && !concept.name.toLowerCase().includes(topicLower) &&
            !concept.definition.toLowerCase().includes(topicLower)) {
          continue;
        }

        concepts.push({
          name: concept.name,
          aliases: concept.aliases ?? [],
          definition: concept.definition,
          tags: concept.tags,
          relations: (concept.relations ?? []).map(r => ({
            target: r.target,
            type: r.type,
            note: r.note,
          })),
          sources: [{ course: courseDir, lecture: dirId }],
        });
      }
    }
  }

  return concepts;
}

/**
 * Escape text for Anki TSV format.
 */
export function escapeAnki(text: string): string {
  return text
    .replace(/\t/g, ' ')
    .replace(/\n/g, '<br>')
    .replace(/"/g, '&quot;');
}
