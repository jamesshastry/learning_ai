import { Command } from 'commander';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { loadConfig, type LLMProvider } from '../utils/config.js';
import { readYaml, writeYaml, writeText, ensureDir, writeJson } from '../utils/files.js';
import { success, error, info, warn, step } from '../utils/logger.js';
import { detectDuration, exceedsLimit } from '../pipeline/duration.js';
import { transcribeVideo } from '../pipeline/transcribe.js';
import { fallbackTranscribe } from '../pipeline/fallback.js';
import { analyzeLecture } from '../pipeline/analyze.js';
import { analyzeLectureGemini } from '../pipeline/analyze-gemini.js';
import { slugify } from '../pipeline/playlist.js';
import type { CourseConfig, LectureEntry, TranscribeResult, AnalysisResult } from '../types.js';

/**
 * Register the `learn ingest` command.
 *
 * Batch-process all pending lectures in a course.
 * Supports:
 * - --auto: fully automated, no pauses
 * - --review: pause after each lecture for user review in $EDITOR
 * - --transcribe-only: just save transcripts, no LLM needed
 * - --provider: override LLM provider (claude, gemini, none)
 */
export function ingestCommand(program: Command): void {
  program
    .command('ingest <course>')
    .description('Process all pending lectures in a course')
    .option('--auto', 'Fully automated mode (default)', true)
    .option('--review', 'Pause for review after each lecture', false)
    .option('--force', 'Reprocess completed lectures', false)
    .option('--transcribe-only', 'Only transcribe — skip note generation (no API key needed)', false)
    .option('--provider <provider>', 'LLM provider: claude, gemini, or none')
    .action(async (courseName: string, opts: {
      auto: boolean;
      review: boolean;
      force: boolean;
      transcribeOnly: boolean;
      provider?: string;
    }) => {
      try {
        const config = loadConfig();

        // Determine effective provider
        const provider = resolveProvider(opts.provider, opts.transcribeOnly, config.llmProvider);

        if (provider === 'claude' && !config.anthropicApiKey) {
          error('Claude selected but ANTHROPIC_API_KEY not set. Use --provider gemini or --transcribe-only');
          process.exit(1);
        }
        if (provider === 'gemini' && !config.geminiApiKey) {
          error('Gemini selected but GEMINI_API_KEY not set. Use --provider claude or --transcribe-only');
          process.exit(1);
        }

        const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
        const courseConfig = readYaml<CourseConfig>(courseYamlPath);

        if (!courseConfig) {
          error(`Course "${courseName}" not found. Run \`learn add\` first.`);
          process.exit(1);
          return;
        }

        const toProcess = courseConfig.lectures.filter(l => {
          if (opts.force) return true;
          return l.status === 'pending' || l.status === 'error';
        });

        if (toProcess.length === 0) {
          info('All lectures already processed. Use --force to reprocess.');
          return;
        }

        const modeLabel = provider === 'none' ? '(transcribe-only)' : `(${provider})`;
        info(`Processing ${toProcess.length} lectures in ${courseConfig.title} ${modeLabel}`);
        if (opts.review && provider !== 'none') info('Review mode: will open editor after each lecture');

        let processed = 0;
        let errors = 0;

        for (const lecture of toProcess) {
          console.log();
          info(`--- Lecture ${lecture.id}: ${lecture.title} ---`);

          try {
            await processLecture(lecture, courseConfig, courseYamlPath, config, provider);

            if (opts.review && provider !== 'none' && lecture.status === 'completed') {
              const titleSlug = slugify(lecture.title);
              const notesPath = resolve(
                config.projectRoot, 'courses', courseName, 'lectures',
                `${lecture.id}-${titleSlug}`, 'notes.md'
              );
              info(`Opening notes in ${config.editor} for review...`);
              try {
                execSync(`${config.editor} "${notesPath}"`, { stdio: 'inherit' });
                info('Press Enter to continue to the next lecture...');
                await new Promise<void>((resolvePromise) => {
                  process.stdin.once('data', () => resolvePromise());
                  process.stdin.resume();
                });
                process.stdin.pause();
              } catch {
                warn('Could not open editor. Continuing...');
              }
            }

            processed++;
          } catch (e) {
            error(`Failed: ${(e as Error).message}`);
            lecture.status = 'error';
            lecture.error = (e as Error).message;
            writeYaml(courseYamlPath, courseConfig);
            errors++;
          }
        }

        console.log();
        success(`Ingestion complete: ${processed} processed, ${errors} errors`);
      } catch (e) {
        error(`Ingestion failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Determine the effective LLM provider.
 */
function resolveProvider(
  explicit: string | undefined,
  transcribeOnly: boolean,
  configProvider: LLMProvider
): LLMProvider {
  if (transcribeOnly) return 'none';
  if (explicit === 'claude' || explicit === 'gemini' || explicit === 'none') return explicit;
  return configProvider;
}

/**
 * Process a single lecture through the pipeline.
 */
async function processLecture(
  lecture: LectureEntry,
  courseConfig: CourseConfig,
  courseYamlPath: string,
  config: ReturnType<typeof loadConfig>,
  provider: LLMProvider
): Promise<void> {
  const totalSteps = provider === 'none' ? 4 : 6;

  // Detect duration
  step(1, totalSteps, 'Detecting duration...');
  const duration = await detectDuration(lecture.video_id);
  if (duration !== null) {
    lecture.duration_seconds = duration;
  }

  // Transcribe
  step(2, totalSteps, 'Transcribing...');
  let result: TranscribeResult | null = null;

  if (exceedsLimit(duration)) {
    warn('Video exceeds 90-minute limit. Using fallback.');
    result = await fallbackTranscribe(lecture.video_id);
  } else {
    lecture.status = 'transcribing';
    writeYaml(courseYamlPath, courseConfig);

    result = await transcribeVideo(lecture.video_id);
    if (!result) {
      warn('Primary transcription failed. Trying fallback...');
      result = await fallbackTranscribe(lecture.video_id);
    }
  }

  if (!result) {
    throw new Error('All transcription methods failed');
  }

  lecture.transcript_source = result.source;
  if (result.title && result.title !== 'Untitled') {
    lecture.title = result.title;
  }
  if (result.duration_seconds) {
    lecture.duration_seconds = result.duration_seconds;
  }

  // Normalize
  step(3, totalSteps, 'Normalizing transcript...');
  const transcriptText = result.segments
    .map(seg => `[${seg.timestamp}] ${seg.text}`)
    .join('\n') + '\n';

  // Analyze (skip if transcribe-only)
  let analysis: AnalysisResult | null = null;
  if (provider !== 'none') {
    const providerLabel = provider === 'claude' ? 'Claude' : 'Gemini';
    step(4, totalSteps, `Analyzing with ${providerLabel}...`);
    lecture.status = 'analyzing';
    writeYaml(courseYamlPath, courseConfig);

    if (provider === 'gemini') {
      analysis = await analyzeLectureGemini(
        result.segments, lecture.title, courseConfig.name, courseConfig.title,
        config.projectRoot, config
      );
    } else {
      analysis = await analyzeLecture(
        result.segments, lecture.title, courseConfig.name, courseConfig.title,
        config.projectRoot, config
      );
    }
  }

  // Write files
  step(provider !== 'none' ? 5 : 4, totalSteps, 'Writing output files...');
  const titleSlug = slugify(lecture.title);
  const lectureDir = resolve(
    config.projectRoot, 'courses', courseConfig.name, 'lectures',
    `${lecture.id}-${titleSlug}`
  );
  ensureDir(lectureDir);

  writeText(resolve(lectureDir, 'transcript.txt'), transcriptText);
  if (analysis) {
    writeText(resolve(lectureDir, 'notes.md'), analysis.notes);
    writeYaml(resolve(lectureDir, 'concepts.yaml'), { concepts: analysis.concepts });
  }
  if (result.raw) {
    writeJson(resolve(lectureDir, 'raw.json'), result.raw);
  }

  // Update status
  step(totalSteps, totalSteps, 'Updating status...');
  if (provider === 'none') {
    lecture.status = 'partial';
  } else {
    lecture.status = analysis && analysis.concepts.length > 0 ? 'completed' : 'partial';
  }
  delete lecture.error;
  writeYaml(courseYamlPath, courseConfig);

  success(`Completed: ${lecture.title}`);
}
