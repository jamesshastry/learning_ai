import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { loadConfig, defaultModel } from '../utils/config.js';
import { readYaml, readText } from '../utils/files.js';
import { error, info, warn, success } from '../utils/logger.js';
import type { CourseConfig, ConceptsYaml } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn quiz` command.
 *
 * Generate quiz questions from lecture content for active recall.
 * Questions are displayed interactively in the terminal.
 */
export function quizCommand(program: Command): void {
  program
    .command('quiz [course] [lecture-id]')
    .description('Generate quiz questions from lectures for active recall')
    .option('--topic <topic>', 'Quiz on a specific topic across courses')
    .option('--count <n>', 'Number of questions to generate', '5')
    .option('--provider <provider>', 'LLM provider: claude or gemini')
    .action(async (courseName: string | undefined, lectureId: string | undefined, opts: {
      topic?: string;
      count: string;
      provider?: string;
    }) => {
      try {
        const config = loadConfig();
        const provider = opts.provider ?? config.llmProvider;
        const effectiveModel = provider !== config.llmProvider
          ? defaultModel(provider as 'claude' | 'gemini' | 'none')
          : config.model;

        if (provider === 'none') {
          error('Quiz generation requires an LLM provider. Set an API key in .env');
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

        // Gather context for quiz generation
        const context = gatherQuizContext(config.projectRoot, courseName, lectureId, opts.topic);
        if (!context) {
          error('No content found to generate quiz from.');
          process.exit(1);
          return;
        }

        const count = parseInt(opts.count, 10) || 5;

        info(`Generating ${count} quiz questions...`);

        const prompt = `You are a learning coach generating quiz questions to help a student test their understanding.

## Source Material
${context}

## Instructions

Generate exactly ${count} quiz questions. Mix these types:
1. **Conceptual** — "What is X and why does it matter?"
2. **Comparison** — "How does X differ from Y?"
3. **Application** — "In what scenario would you use X?"
4. **Critical Thinking** — "What are the limitations of X?"

For each question, provide:
- The question
- A concise model answer (2-3 sentences)
- The difficulty level (easy/medium/hard)

Format as markdown:

### Q1 [easy]
**Question:** ...

**Answer:** ...

---

### Q2 [medium]
...

Make questions specific to the lecture content, referencing concrete examples and ideas from the material. Avoid generic questions that could be answered without watching the lecture.`;

        let quizContent: string;

        if (provider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
          const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: prompt,
          });
          quizContent = response.text ?? '';
        } else {
          const client = new Anthropic({ apiKey: config.anthropicApiKey });
          const response = await client.messages.create({
            model: effectiveModel,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          });
          quizContent = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');
        }

        if (!quizContent) {
          error('LLM returned empty quiz content.');
          process.exit(1);
        }

        // Display quiz interactively
        console.log(chalk.bold('\n📝 Quiz Time!\n'));
        console.log(chalk.dim('Try to answer each question before revealing the answer.\n'));

        const questions = quizContent.split(/^---$/m).filter(q => q.trim());

        for (const question of questions) {
          // Split question from answer
          const answerMatch = question.match(/\*\*Answer:\*\*\s*([\s\S]*?)$/m);
          const questionPart = question.replace(/\*\*Answer:\*\*[\s\S]*$/, '').trim();

          console.log(questionPart);

          if (answerMatch) {
            console.log(chalk.dim('\n  [Press Enter to reveal answer]'));
            await waitForEnter();
            console.log(chalk.green(`\n**Answer:** ${answerMatch[1].trim()}`));
          }

          console.log(chalk.dim('\n' + '─'.repeat(60) + '\n'));
        }

        success('Quiz complete! Review any topics you found challenging.');
      } catch (e) {
        error(`Quiz generation failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Gather context for quiz generation from notes and concepts.
 */
function gatherQuizContext(
  projectRoot: string,
  courseName?: string,
  lectureId?: string,
  topic?: string
): string | null {
  const parts: string[] = [];
  const coursesDir = resolve(projectRoot, 'courses');

  if (!existsSync(coursesDir)) return null;

  const courseDirs = courseName
    ? [courseName]
    : readdirSync(coursesDir).filter(d => d !== 'synthesis' && !d.startsWith('.'));

  const topicLower = topic?.toLowerCase();

  for (const courseDir of courseDirs) {
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const dir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
      const dirId = dir.split('-')[0];
      if (lectureId && dirId !== lectureId.padStart(2, '0')) continue;

      const notes = readText(resolve(lecturesDir, dir, 'notes.md'));
      if (!notes) continue;

      // Topic filter
      if (topicLower && !notes.toLowerCase().includes(topicLower)) continue;

      // Cap per lecture to avoid blowing context window
      const excerpt = notes.substring(0, 3000);
      parts.push(`### ${courseDir} / ${dir}\n${excerpt}\n`);

      // Also include concepts
      const concepts = readYaml<ConceptsYaml>(resolve(lecturesDir, dir, 'concepts.yaml'));
      if (concepts?.concepts) {
        const conceptList = concepts.concepts
          .map(c => `- **${c.name}**: ${c.definition}`)
          .join('\n');
        parts.push(`\n**Key Concepts:**\n${conceptList}\n`);
      }
    }
  }

  if (parts.length === 0) return null;

  // Cap total context to ~8000 chars
  const combined = parts.join('\n');
  return combined.substring(0, 8000);
}

/**
 * Wait for the user to press Enter.
 */
function waitForEnter(): Promise<void> {
  return new Promise(resolve => {
    process.stdin.once('data', () => resolve());
    process.stdin.resume();
  });
}
