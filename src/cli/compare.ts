import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readText, writeText, ensureDir } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';

/**
 * Register the `learn compare` command.
 *
 * Compare two or more lectures and generate a structured perspective analysis.
 * Lectures are specified as "course/lecture-id" (e.g., "cs153/01 cs153/04").
 */
export function compareCommand(program: Command): void {
  program
    .command('compare <lectures...>')
    .description('Compare perspectives across lectures (e.g., learn compare cs153/01 cs153/04)')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .option('--output <path>', 'Output file path')
    .action(async (lectureRefs: string[], opts: { provider?: string; output?: string }) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider as 'claude' | 'gemini' | 'none')
          : config.model;

        if (provider === 'none') {
          error('Comparison requires an LLM provider.');
          process.exit(1);
        }

        if (lectureRefs.length < 2) {
          error('Need at least 2 lectures to compare. Format: cs153/01 cs153/04');
          process.exit(1);
        }

        // Load notes for each lecture
        info(`Comparing ${lectureRefs.length} lectures...`);
        const lectureContents: Array<{ ref: string; title: string; notes: string }> = [];

        for (const ref of lectureRefs) {
          const [courseName, lectureId] = ref.split('/');
          if (!courseName || !lectureId) {
            error(`Invalid lecture reference "${ref}". Use format: course/lecture-id (e.g., cs153/01)`);
            process.exit(1);
            return;
          }

          const lecturesDir = resolve(config.projectRoot, 'courses', courseName, 'lectures');
          if (!existsSync(lecturesDir)) {
            error(`Course "${courseName}" not found.`);
            process.exit(1);
            return;
          }

          const paddedId = lectureId.padStart(2, '0');
          const lectureDirs = readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort();
          const matchingDir = lectureDirs.find(d => d.split('-')[0] === paddedId);

          if (!matchingDir) {
            error(`Lecture ${lectureId} not found in ${courseName}.`);
            process.exit(1);
            return;
          }

          const notes = readText(resolve(lecturesDir, matchingDir, 'notes.md'));
          if (!notes) {
            error(`No notes found for ${ref}. Process the lecture first.`);
            process.exit(1);
            return;
          }

          lectureContents.push({
            ref,
            title: matchingDir.replace(/^\d+-/, '').replace(/-/g, ' '),
            notes: notes.substring(0, 4000), // Cap per lecture
          });
        }

        // Build comparison prompt
        const lectureContext = lectureContents
          .map((l, i) => `### Lecture ${i + 1}: ${l.ref} — ${l.title}\n\n${l.notes}`)
          .join('\n\n---\n\n');

        const prompt = `You are a learning synthesis expert. Compare the following ${lectureContents.length} lectures and produce a structured comparison.

## Lectures to Compare

${lectureContext}

## Instructions

Generate a comparison in markdown with these sections:

# Lecture Comparison

## Lectures Compared
(List each lecture with a one-sentence summary)

## Shared Themes
(What topics or ideas appear in multiple lectures? How does each lecturer approach them?)

## Different Perspectives
(Where do the speakers disagree, emphasize different aspects, or bring unique viewpoints?)

## Contradictions
(Are there any direct contradictions? If so, which argument is stronger and why?)

## Complementary Insights
(How do the lectures complement each other? What does each add that the others don't cover?)

## Synthesis
(If someone watched all these lectures, what's the combined takeaway?)

## Recommended Order
(What order should someone watch these lectures for the best learning experience?)`;

        progress(`Generating comparison with ${provider}...`);

        let comparison: string;

        if (provider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
          const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: prompt,
          });
          comparison = response.text ?? '';
        } else {
          const client = new Anthropic({ apiKey: config.anthropicApiKey });
          const response = await client.messages.create({
            model: effectiveModel,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          });
          comparison = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');
        }

        if (!comparison) {
          error('LLM returned empty comparison.');
          process.exit(1);
        }

        // Output
        if (opts.output) {
          const outputPath = resolve(opts.output);
          ensureDir(resolve(outputPath, '..'));
          writeText(outputPath, comparison);
          success(`Comparison saved to: ${outputPath}`);
        } else {
          console.log('\n' + comparison);
        }
      } catch (e) {
        error(`Comparison failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
