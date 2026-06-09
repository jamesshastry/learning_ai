import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readText, readLines, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, warn, progress } from '../utils/logger.js';
import chalk from 'chalk';

/**
 * Register the `learn synthesize` command.
 *
 * The killer feature: collect everything across all courses about a topic
 * and generate a cross-course synthesis document.
 */
export function synthesizeCommand(program: Command): void {
  program
    .command('synthesize <topic>')
    .description('Generate a cross-course synthesis on a topic (the killer feature)')
    .option('--output <path>', 'Output file path (default: courses/synthesis/<topic>.md)')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .action(async (topic: string, opts: { output?: string; provider?: string }) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider as 'claude' | 'gemini' | 'none')
          : config.model;

        if (provider === 'none') {
          error('Synthesis requires an LLM provider. Set an API key in .env');
          process.exit(1);
        }
        if (provider === 'claude' && !config.anthropicApiKey) {
          error('Claude selected but ANTHROPIC_API_KEY not set.');
          process.exit(1);
        }
        if (provider === 'gemini' && !config.geminiApiKey) {
          error('Gemini selected but GEMINI_API_KEY not set.');
          process.exit(1);
        }

        info(`Synthesizing everything about: "${topic}"`);

        // Step 1: Collect relevant content from all courses
        progress('Searching all courses for relevant content...');
        const sources = collectSources(config.projectRoot, topic);

        if (sources.length === 0) {
          error(`No content found about "${topic}" across any course.`);
          info('Tip: process more lectures first, or check your spelling.');
          process.exit(1);
          return;
        }

        info(`Found ${sources.length} relevant source(s) across ${new Set(sources.map(s => s.course)).size} course(s)`);

        // Step 2: Also gather matching concepts
        const concepts = collectConcepts(config.projectRoot, topic);
        if (concepts.length > 0) {
          info(`Found ${concepts.length} related concept(s) in the knowledge graph`);
        }

        // Step 3: Build the synthesis prompt
        const context = buildSynthesisContext(sources, concepts);

        // Step 4: Generate synthesis
        progress(`Generating synthesis with ${provider}...`);

        const prompt = `You are a learning synthesis expert. A student is studying the topic "${topic}" across multiple courses and lectures simultaneously. Your job is to create a comprehensive, cross-course synthesis that connects insights from all sources.

## Source Material

${context}

## Instructions

Generate a synthesis document in markdown with these sections:

# ${topic}: Cross-Course Synthesis

## Overview
(2-3 paragraph overview synthesizing all perspectives on this topic)

## Coverage Map
(Table showing which courses/lectures cover this topic and how deeply)
| Course | Lecture | Speaker | Depth | Focus |
|--------|---------|---------|-------|-------|

## Key Perspectives

### [Perspective/Theme 1]
(Synthesize what multiple sources say about this angle)
- Source A says...
- Source B adds/contrasts...

### [Perspective/Theme 2]
(Continue for each major angle — aim for 3-5 themes)

## Areas of Agreement
(What do all sources agree on?)

## Areas of Disagreement or Tension
(Where do sources differ? Different emphases, conflicting claims, different contexts?)

## Recommended Learning Order
(If someone wants to understand this topic deeply, what order should they consume these lectures?)
1. Start with...
2. Then...

## Knowledge Gaps
(What aspects of this topic are NOT covered by any of your courses? What should you look for elsewhere?)

## Key Takeaway
(The single most important insight from synthesizing all these sources)`;

        let synthesis: string;

        if (provider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
          const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: prompt,
          });
          synthesis = response.text ?? '';
        } else {
          const client = new Anthropic({ apiKey: config.anthropicApiKey });
          const response = await client.messages.create({
            model: effectiveModel,
            max_tokens: 8192,
            messages: [{ role: 'user', content: prompt }],
          });
          synthesis = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');
        }

        if (!synthesis) {
          error('LLM returned empty synthesis.');
          process.exit(1);
        }

        // Step 5: Write output
        const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const outputPath = opts.output
          ? resolve(opts.output)
          : resolve(config.projectRoot, 'courses', 'synthesis', `${topicSlug}.md`);

        ensureDir(resolve(outputPath, '..'));
        writeText(outputPath, synthesis);

        success(`Synthesis written to: ${outputPath}`);
        info(`Topic: "${topic}" | Sources: ${sources.length} | Concepts: ${concepts.length}`);
      } catch (e) {
        error(`Synthesis failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Source material found for a topic.
 */
interface SourceExcerpt {
  course: string;
  lectureId: string;
  lectureTitle: string;
  type: 'notes' | 'transcript';
  excerpt: string;
}

/**
 * Collect relevant excerpts from all courses matching a topic.
 */
function collectSources(projectRoot: string, topic: string): SourceExcerpt[] {
  const sources: SourceExcerpt[] = [];
  const coursesDir = resolve(projectRoot, 'courses');
  const topicLower = topic.toLowerCase();

  if (!existsSync(coursesDir)) return sources;

  for (const courseDir of readdirSync(coursesDir)) {
    if (courseDir === 'synthesis') continue;
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const lectureDir of readdirSync(lecturesDir)) {
      const dirPath = resolve(lecturesDir, lectureDir);

      // Search notes.md first (higher quality, structured)
      const notesPath = resolve(dirPath, 'notes.md');
      if (existsSync(notesPath)) {
        const content = readFileSync(notesPath, 'utf-8');
        if (content.toLowerCase().includes(topicLower)) {
          // Extract relevant sections (paragraphs mentioning the topic)
          const excerpt = extractRelevantSections(content, topicLower);
          if (excerpt) {
            sources.push({
              course: courseDir,
              lectureId: lectureDir.split('-')[0],
              lectureTitle: lectureDir.replace(/^\d+-/, '').replace(/-/g, ' '),
              type: 'notes',
              excerpt,
            });
          }
        }
      }
    }
  }

  return sources;
}

/**
 * Extract sections from markdown that mention the topic.
 * Returns the relevant sections (not the whole document).
 */
function extractRelevantSections(content: string, topicLower: string): string {
  const lines = content.split('\n');
  const relevantLines: string[] = [];
  let inRelevantSection = false;
  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('#')) {
      // Start of a new section
      if (inRelevantSection && currentSection) {
        relevantLines.push(currentSection);
      }
      currentSection = line + '\n';
      inRelevantSection = line.toLowerCase().includes(topicLower);
    } else {
      currentSection += line + '\n';
      if (line.toLowerCase().includes(topicLower)) {
        inRelevantSection = true;
      }
    }
  }

  // Don't forget last section
  if (inRelevantSection && currentSection) {
    relevantLines.push(currentSection);
  }

  const result = relevantLines.join('\n').trim();
  // Cap at ~3000 chars per source to fit in LLM context
  return result.substring(0, 3000);
}

/**
 * Collect matching concepts from the concept index.
 */
function collectConcepts(projectRoot: string, topic: string): string[] {
  const indexPath = resolve(projectRoot, 'knowledge-graph', 'concept-index.txt');
  const allConcepts = readLines(indexPath);
  const topicLower = topic.toLowerCase();
  return allConcepts.filter(c => c.toLowerCase().includes(topicLower));
}

/**
 * Build the synthesis context from sources and concepts.
 */
function buildSynthesisContext(sources: SourceExcerpt[], concepts: string[]): string {
  const parts: string[] = [];

  // Group sources by course
  const byCourse = new Map<string, SourceExcerpt[]>();
  for (const source of sources) {
    const existing = byCourse.get(source.course) ?? [];
    existing.push(source);
    byCourse.set(source.course, existing);
  }

  for (const [course, courseSources] of byCourse) {
    parts.push(`### Course: ${course}`);
    for (const source of courseSources) {
      parts.push(`\n#### Lecture ${source.lectureId}: ${source.lectureTitle}`);
      parts.push(source.excerpt);
    }
  }

  if (concepts.length > 0) {
    parts.push(`\n### Related Concepts in Knowledge Graph`);
    for (const concept of concepts) {
      parts.push(`- ${concept}`);
    }
  }

  return parts.join('\n');
}
