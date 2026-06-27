import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import express from 'express';
import { loadConfig } from '../utils/config.js';
import { readYaml, readText } from '../utils/files.js';
import { success, error, info, progress } from '../utils/logger.js';
import { generateSite } from './site.js';
import type { CourseConfig, ConceptsYaml } from '../types.js';

/**
 * Register the `learn serve` command.
 *
 * Start a local server that:
 * 1. Serves the static site from site/
 * 2. Provides API endpoints for search, ask, quiz, synthesize
 */
export function serveCommand(program: Command): void {
  program
    .command('serve')
    .description('Start local server with interactive features (search, ask, quiz, synthesize)')
    .option('--port <port>', 'Port number', '3000')
    .option('--site-dir <dir>', 'Static site directory', 'site')
    .action(async (opts: { port: string; siteDir: string }) => {
      try {
        const config = loadConfig();
        const port = parseInt(opts.port, 10);
        const siteDir = resolve(config.projectRoot, opts.siteDir);

        if (!existsSync(siteDir)) {
          error('Site directory not found. Run `learn site` first.');
          process.exit(1);
        }

        const app = express();
        app.use(express.json());

        // Serve static site
        app.use(express.static(siteDir));

        // ── API: Search ──
        app.post('/api/search', (req, res) => {
          const { query, course: courseFilter, notesOnly } = req.body as {
            query: string; course?: string; notesOnly?: boolean;
          };

          if (!query) {
            res.json({ results: [], error: 'No query provided' });
            return;
          }

          const queryLower = query.toLowerCase();
          const coursesDir = resolve(config.projectRoot, 'courses');
          const results: Array<{
            course: string;
            lecture: string;
            file: string;
            matches: Array<{ line: number; text: string }>;
          }> = [];

          if (!existsSync(coursesDir)) {
            res.json({ results: [] });
            return;
          }

          const courseDirs = courseFilter
            ? [courseFilter]
            : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis');

          for (const courseDir of courseDirs) {
            const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
            if (!existsSync(lecturesDir)) continue;

            for (const lecDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
              const searchFiles = notesOnly
                ? ['notes.md']
                : ['notes.md', 'transcript.txt', 'concepts.yaml'];

              for (const fileName of searchFiles) {
                const filePath = resolve(lecturesDir, lecDir, fileName);
                if (!existsSync(filePath)) continue;

                const content = readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                const matches: Array<{ line: number; text: string }> = [];

                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].toLowerCase().includes(queryLower)) {
                    matches.push({
                      line: i + 1,
                      text: lines[i].trim().substring(0, 200),
                    });
                  }
                }

                if (matches.length > 0) {
                  results.push({
                    course: courseDir,
                    lecture: lecDir,
                    file: fileName,
                    matches: matches.slice(0, 5), // Top 5 matches per file
                  });
                }
              }
            }
          }

          res.json({ results, total: results.reduce((s, r) => s + r.matches.length, 0) });
        });

        // ── API: Quiz ──
        app.post('/api/quiz', (req, res) => {
          const { course: courseName, lectureId } = req.body as {
            course?: string; lectureId?: string;
          };

          const coursesDir = resolve(config.projectRoot, 'courses');
          const concepts: Array<{
            name: string;
            definition: string;
            course: string;
            lecture: string;
            relations?: Array<{ target: string; type: string }>;
          }> = [];

          const courseDirs = courseName
            ? [courseName]
            : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis');

          for (const courseDir of courseDirs) {
            const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
            if (!existsSync(lecturesDir)) continue;

            for (const lecDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
              if (lectureId && !lecDir.startsWith(lectureId.padStart(2, '0'))) continue;

              const data = readYaml<ConceptsYaml>(resolve(lecturesDir, lecDir, 'concepts.yaml'));
              if (!data?.concepts) continue;

              for (const c of data.concepts) {
                concepts.push({
                  name: c.name,
                  definition: c.definition,
                  course: courseDir,
                  lecture: lecDir.split('-')[0],
                  relations: c.relations?.map(r => ({ target: r.target, type: r.type })),
                });
              }
            }
          }

          // Shuffle and pick up to 10
          const shuffled = concepts.sort(() => Math.random() - 0.5).slice(0, 10);
          res.json({ questions: shuffled, total: concepts.length });
        });

        // ── API: Ask (requires LLM) ──
        app.post('/api/ask', async (req, res) => {
          const { question, course: courseName, lectureId } = req.body as {
            question: string; course?: string; lectureId?: string;
          };

          if (!question) {
            res.json({ answer: '', error: 'No question provided' });
            return;
          }

          // Gather context from notes
          const coursesDir = resolve(config.projectRoot, 'courses');
          let context = '';
          const courseDirs = courseName
            ? [courseName]
            : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis').slice(0, 3);

          for (const courseDir of courseDirs) {
            const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
            if (!existsSync(lecturesDir)) continue;

            for (const lecDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
              if (lectureId && !lecDir.startsWith(lectureId.padStart(2, '0'))) continue;
              const notes = readText(resolve(lecturesDir, lecDir, 'notes.md'));
              if (notes) {
                context += `\n\n--- ${courseDir} / ${lecDir} ---\n${notes.substring(0, 2000)}`;
              }
            }
          }

          // Check for available LLM
          if (config.geminiApiKey) {
            try {
              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
              const result = await ai.models.generateContent({
                model: config.model,
                contents: `Based on these lecture notes, answer this question concisely:\n\nQuestion: ${question}\n\nContext:\n${context.substring(0, 15000)}`,
              });
              res.json({ answer: result.text ?? 'No answer generated.' });
              return;
            } catch (e) {
              // Fall through to Claude
            }
          }

          if (config.anthropicApiKey) {
            try {
              const Anthropic = (await import('@anthropic-ai/sdk')).default;
              const client = new Anthropic({ apiKey: config.anthropicApiKey });
              const result = await client.messages.create({
                model: config.model,
                max_tokens: 2048,
                messages: [{
                  role: 'user',
                  content: `Based on these lecture notes, answer this question concisely:\n\nQuestion: ${question}\n\nContext:\n${context.substring(0, 15000)}`,
                }],
              });
              const text = result.content
                .filter(b => b.type === 'text')
                .map(b => (b as { type: 'text'; text: string }).text)
                .join('\n');
              res.json({ answer: text });
              return;
            } catch (e) {
              res.json({ answer: '', error: `LLM error: ${(e as Error).message}` });
              return;
            }
          }

          res.json({ answer: '', error: 'No LLM API key configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env' });
        });

        // ── API: Export Anki ──
        app.post('/api/export-anki', (req, res) => {
          const { course: courseName } = req.body as { course?: string };
          const coursesDir = resolve(config.projectRoot, 'courses');
          const cards: string[] = [];

          const courseDirs = courseName
            ? [courseName]
            : readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis');

          for (const courseDir of courseDirs) {
            const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
            if (!existsSync(lecturesDir)) continue;

            for (const lecDir of readdirSync(lecturesDir).filter(d => !d.startsWith('.')).sort()) {
              const data = readYaml<ConceptsYaml>(resolve(lecturesDir, lecDir, 'concepts.yaml'));
              if (!data?.concepts) continue;

              for (const c of data.concepts) {
                const front = c.name;
                const back = `${c.definition}\n\nSource: ${courseDir} L${lecDir.split('-')[0]}`;
                cards.push(`${front}\t${back}`);
              }
            }
          }

          res.setHeader('Content-Type', 'text/tab-separated-values');
          res.setHeader('Content-Disposition', `attachment; filename="${courseName ?? 'all'}-anki.txt"`);
          res.send(cards.join('\n'));
        });

        // ── API: Course list ──
        app.get('/api/courses', (_req, res) => {
          const coursesDir = resolve(config.projectRoot, 'courses');
          const courses: Array<{ name: string; title: string }> = [];

          if (existsSync(coursesDir)) {
            for (const d of readdirSync(coursesDir).filter(d => !d.startsWith('.') && d !== 'synthesis')) {
              const cfg = readYaml<CourseConfig>(resolve(coursesDir, d, 'course.yaml'));
              if (cfg) courses.push({ name: cfg.name, title: cfg.title });
            }
          }

          res.json({ courses });
        });

        // ── API: Refresh (regenerate site) ──
        app.post('/api/refresh', async (_req, res) => {
          try {
            info('🔄 Regenerating site...');
            const result = await generateSite(config.projectRoot, siteDir);
            info(`✓ Refreshed: ${result.pages} pages, ${result.courses} courses`);
            res.json({ ok: true, ...result });
          } catch (e) {
            error(`Refresh failed: ${(e as Error).message}`);
            res.json({ ok: false, error: (e as Error).message });
          }
        });

        // Start server
        app.listen(port, () => {
          success(`Server running at http://localhost:${port}`);
          info('');
          info('  📖 Site:       http://localhost:' + port);
          info('  🔍 Search:     POST /api/search');
          info('  ❓ Ask:        POST /api/ask');
          info('  📝 Quiz:       POST /api/quiz');
          info('  📇 Anki:       POST /api/export-anki');
          info('  🔄 Refresh:    POST /api/refresh');
          info('  📚 Courses:    GET  /api/courses');
          info('');
          info('  Press Ctrl+C to stop');
        });
      } catch (e) {
        error(`Server failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
