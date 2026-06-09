import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readText, writeText } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';

/**
 * Register the `learn translate` command.
 *
 * Translate a lecture's notes or transcript to another language,
 * or translate non-English notes to English.
 */
export function translateCommand(program: Command): void {
  program
    .command('translate <course> <lecture-id>')
    .description('Translate lecture notes to/from another language')
    .option('--to <lang>', 'Target language', 'English')
    .option('--source <type>', 'What to translate: notes or transcript', 'notes')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .action(async (courseName: string, lectureId: string, opts: {
      to: string;
      source: string;
      provider?: string;
    }) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider as 'claude' | 'gemini' | 'none')
          : config.model;

        if (provider === 'none') {
          error('Translation requires an LLM provider.');
          process.exit(1);
        }

        const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
        if (!existsSync(lecturesDir)) {
          error(`Course "${courseName}" not found.`);
          process.exit(1);
        }

        const paddedId = lectureId.padStart(2, '0');
        const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
        const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);

        if (!matchingDir) {
          error(`Lecture ${lectureId} not found.`);
          process.exit(1);
          return;
        }

        const lectureDir = resolve(lecturesDir, matchingDir);
        const sourceFile = opts.source === 'transcript' ? 'transcript.txt' : 'notes.md';
        const sourceContent = readText(resolve(lectureDir, sourceFile));

        if (!sourceContent) {
          error(`No ${opts.source} found for this lecture.`);
          process.exit(1);
          return;
        }

        progress(`Translating ${opts.source} to ${opts.to}...`);

        const prompt = `Translate the following ${opts.source} to ${opts.to}. Preserve all formatting (markdown headers, bullet points, timestamps, wiki-links like [[Concept]]). Do not add explanations — just translate.

${sourceContent}`;

        let translated: string;

        if (provider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
          const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: prompt,
          });
          translated = response.text ?? '';
        } else {
          const client = new Anthropic({ apiKey: config.anthropicApiKey });
          const response = await client.messages.create({
            model: effectiveModel,
            max_tokens: 8192,
            messages: [{ role: 'user', content: prompt }],
          });
          translated = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');
        }

        if (!translated) {
          error('Translation returned empty result.');
          process.exit(1);
        }

        // Write translated version with language suffix
        const langSuffix = opts.to.toLowerCase().substring(0, 2);
        const outputName = opts.source === 'transcript'
          ? `transcript.${langSuffix}.txt`
          : `notes.${langSuffix}.md`;
        const outputPath = resolve(lectureDir, outputName);
        writeText(outputPath, translated);

        success(`Translated to ${opts.to}: ${outputPath}`);
      } catch (e) {
        error(`Translation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
