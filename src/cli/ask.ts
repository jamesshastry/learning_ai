import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readText } from '../utils/files.js';
import { error, info } from '../utils/logger.js';

/**
 * Register the `learn ask` command.
 *
 * Ask a question about a specific lecture using the configured LLM
 * with the transcript as context.
 */
export function askCommand(program: Command): void {
  program
    .command('ask <course> <lecture-id> <question>')
    .description('Ask a question about a lecture (powered by Claude or Gemini)')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .action(async (courseName: string, lectureId: string, question: string, opts: { provider?: string }) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        // Resolve model for effective provider
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

        // Find the lecture transcript
        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
        if (!existsSync(lecturesDir)) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
        }

        const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
        const paddedId = lectureId.padStart(2, '0');
        const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found in ${courseName}.`);
          process.exit(1);
        }

        const transcriptPath = resolve(lecturesDir, matchingDir, 'transcript.txt');
        const notesPath = resolve(lecturesDir, matchingDir, 'notes.md');

        const transcript = readText(transcriptPath);
        const notes = readText(notesPath);

        if (!transcript) {
          error('No transcript available for this lecture.');
          process.exit(1);
        }

        info(`Asking about: ${matchingDir} (via ${provider})`);

        const context = notes
          ? `## Lecture Notes\n\n${notes}\n\n## Full Transcript\n\n${transcript}`
          : `## Full Transcript\n\n${transcript}`;

        const prompt = `You are answering questions about a lecture. Use the provided transcript and notes as your source of truth. Include timestamps [MM:SS] when referencing specific parts of the lecture.

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
            max_tokens: 2048,
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
