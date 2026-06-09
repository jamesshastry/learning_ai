import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readText } from '../utils/files.js';
import { error, info, progress } from '../utils/logger.js';

/**
 * Register the `learn ask` command.
 *
 * Ask a question about lecture(s) using the configured LLM.
 * Supports:
 * - Single lecture: learn ask cs153 3 "question"
 * - Whole course:   learn ask cs153 "question"  (no lecture ID)
 * - Cross-course:   learn ask --all "question"
 */
export function askCommand(program: Command): void {
  program
    .command('ask <course> [lecture-id-or-question] [question]')
    .description('Ask a question about lecture(s) — single lecture, whole course, or cross-course')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .option('--all', 'Search across all courses (ignore course argument)', false)
    .action(async (
      courseName: string,
      lectureIdOrQuestion: string | undefined,
      questionArg: string | undefined,
      opts: { provider?: string; all: boolean }
    ) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider as 'claude' | 'gemini' | 'none')
          : config.model;

        if (provider === 'none') {
          error('No LLM provider configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in .env');
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

        // Parse arguments: is the second arg a lecture ID or the question?
        let question: string;
        let lectureId: string | undefined;

        if (questionArg) {
          // Three args: course, lecture-id, question
          lectureId = lectureIdOrQuestion;
          question = questionArg;
        } else if (lectureIdOrQuestion) {
          // Two args: could be (course, question) or (course, lecture-id)
          // Heuristic: if it looks like a number, it's a lecture ID (and question is missing)
          if (/^\d+$/.test(lectureIdOrQuestion)) {
            error('Missing question. Usage: learn ask <course> <lecture-id> "your question"');
            process.exit(1);
            return;
          }
          // It's the question (no lecture ID — whole course mode)
          question = lectureIdOrQuestion;
        } else {
          error('Missing question. Usage: learn ask <course> "your question"');
          process.exit(1);
          return;
        }

        // Gather context based on scope
        let context: string;
        let scopeLabel: string;

        if (opts.all) {
          // Cross-course mode
          context = gatherAllContext(config.projectRoot, question);
          scopeLabel = 'all courses';
        } else if (lectureId) {
          // Single lecture mode
          context = gatherLectureContext(config.projectRoot, courseName, lectureId);
          scopeLabel = `${courseName} lecture ${lectureId}`;
        } else {
          // Whole course mode
          context = gatherCourseContext(config.projectRoot, courseName, question);
          scopeLabel = `${courseName} (all lectures)`;
        }

        if (!context) {
          error('No content found. Process lectures first.');
          process.exit(1);
          return;
        }

        info(`Asking about: ${scopeLabel} (via ${provider})`);

        const prompt = `You are answering questions about lecture content. Use the provided notes and transcripts as your source of truth. Include timestamps [MM:SS] when referencing specific parts of lectures. When drawing from multiple lectures, cite which lecture each point comes from.

${context}

## Question

${question}`;

        let answer: string;

        if (provider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
          const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: prompt,
          });
          answer = response.text ?? '';
        } else {
          const client = new Anthropic({ apiKey: config.anthropicApiKey });
          const response = await client.messages.create({
            model: effectiveModel,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          });
          answer = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');
        }

        console.log('\n' + answer);
      } catch (e) {
        error(`Failed to answer: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Gather context for a single lecture.
 */
function gatherLectureContext(projectRoot: string, courseName: string, lectureId: string): string {
  const lecturesDir = resolve(projectRoot, 'courses', courseName, 'lectures');
  if (!existsSync(lecturesDir)) return '';

  const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
  const paddedId = lectureId.padStart(2, '0');
  const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);
  if (!matchingDir) return '';

  const transcript = readText(resolve(lecturesDir, matchingDir, 'transcript.txt'));
  const notes = readText(resolve(lecturesDir, matchingDir, 'notes.md'));

  if (!transcript && !notes) return '';

  return notes
    ? `## Lecture Notes\n\n${notes}\n\n## Full Transcript\n\n${transcript}`
    : `## Full Transcript\n\n${transcript}`;
}

/**
 * Gather context from an entire course, focused on the question topic.
 * Uses notes (more concise than transcripts) and caps total context.
 */
function gatherCourseContext(projectRoot: string, courseName: string, question: string): string {
  const lecturesDir = resolve(projectRoot, 'courses', courseName, 'lectures');
  if (!existsSync(lecturesDir)) return '';

  const parts: string[] = [];
  const questionLower = question.toLowerCase();

  for (const dir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
    const notes = readText(resolve(lecturesDir, dir, 'notes.md'));
    if (!notes) continue;

    // Prioritize lectures that mention the question's key terms
    const isRelevant = questionLower.split(/\s+/).some(word =>
      word.length > 3 && notes.toLowerCase().includes(word)
    );

    if (isRelevant) {
      parts.push(`## ${dir}\n\n${notes.substring(0, 3000)}`);
    } else {
      // Include TL;DR and Key Takeaways for less relevant lectures
      const tldr = extractSection(notes, 'TL;DR') ?? extractSection(notes, 'Key Takeaways');
      if (tldr) {
        parts.push(`## ${dir}\n\n${tldr}`);
      }
    }
  }

  // Cap at ~15000 chars to fit in context window
  const combined = parts.join('\n\n---\n\n');
  return combined.substring(0, 15000);
}

/**
 * Gather context from all courses, focused on the question topic.
 */
function gatherAllContext(projectRoot: string, question: string): string {
  const coursesDir = resolve(projectRoot, 'courses');
  if (!existsSync(coursesDir)) return '';

  const parts: string[] = [];
  const questionLower = question.toLowerCase();

  for (const courseDir of readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'))) {
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const dir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
      const notes = readText(resolve(lecturesDir, dir, 'notes.md'));
      if (!notes) continue;

      const isRelevant = questionLower.split(/\s+/).some(word =>
        word.length > 3 && notes.toLowerCase().includes(word)
      );

      if (isRelevant) {
        parts.push(`## ${courseDir} / ${dir}\n\n${notes.substring(0, 2000)}`);
      }
    }
  }

  const combined = parts.join('\n\n---\n\n');
  return combined.substring(0, 15000);
}

/**
 * Extract a named section from markdown.
 */
function extractSection(markdown: string, sectionName: string): string | undefined {
  const regex = new RegExp(`^##\\s+${sectionName}\\s*$`, 'mi');
  const match = markdown.match(regex);
  if (!match || match.index === undefined) return undefined;

  const start = match.index;
  const nextSection = markdown.indexOf('\n## ', start + 1);
  const end = nextSection === -1 ? start + 1000 : nextSection;

  return markdown.substring(start, end).trim();
}
