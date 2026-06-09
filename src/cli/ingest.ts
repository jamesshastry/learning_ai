import { Command } from 'commander';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { loadConfig, type LLMProvider } from '../utils/config.js';
import { readYaml, writeYaml, writeText, ensureDir, writeJson, readText } from '../utils/files.js';
import { success, error, info, warn, step } from '../utils/logger.js';
import { detectDuration, exceedsLimit } from '../pipeline/duration.js';
import { transcribeVideo } from '../pipeline/transcribe.js';
import { fallbackTranscribe } from '../pipeline/fallback.js';
import { analyzeLecture } from '../pipeline/analyze.js';
import { analyzeLectureGemini } from '../pipeline/analyze-gemini.js';
import { slugify } from '../pipeline/playlist.js';
import type { CourseConfig, LectureEntry, TranscribeResult, TranscriptSegment, AnalysisResult } from '../types.js';
import { existsSync, readdirSync } from 'fs';

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
          if (l.status === 'pending' || l.status === 'error') return true;
          // Retry partial lectures (transcript exists, but notes/concepts missing)
          // only when we have an LLM provider to generate them
          if (l.status === 'partial' && provider !== 'none') return true;
          // Retry stuck lectures from interrupted runs
          if (l.status === 'transcribing' || l.status === 'analyzing') return true;
          return false;
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
 * Smart resume: skips stages whose output already exists.
 * - If transcript.txt exists → skip transcription
 * - If notes.md exists and provider hasn't changed → skip analysis
 */
async function processLecture(
  lecture: LectureEntry,
  courseConfig: CourseConfig,
  courseYamlPath: string,
  config: ReturnType<typeof loadConfig>,
  provider: LLMProvider
): Promise<void> {
  const titleSlug = slugify(lecture.title);
  const lectureDir = resolve(
    config.projectRoot, 'courses', courseConfig.name, 'lectures',
    `${lecture.id}-${titleSlug}`
  );

  // Check what already exists from previous partial runs
  const existingTranscript = findExistingTranscript(config.projectRoot, courseConfig.name, lecture.id);
  const existingNotes = findExistingFile(config.projectRoot, courseConfig.name, lecture.id, 'notes.md');
  const hasTranscript = existingTranscript !== null;
  const hasNotes = existingNotes !== null;

  // Determine what stages to run
  const needsTranscription = !hasTranscript;
  const needsAnalysis = provider !== 'none' && !hasNotes;
  const totalSteps = (needsTranscription ? 3 : 0) + (needsAnalysis ? 1 : 0) + 2; // +2 for write + status
  let currentStep = 0;

  let transcriptText: string;
  let segments: TranscriptSegment[];

  if (needsTranscription) {
    // Detect duration
    step(++currentStep, totalSteps, 'Detecting duration...');
    const duration = await detectDuration(lecture.video_id);
    if (duration !== null) {
      lecture.duration_seconds = duration;
    }

    // Transcribe
    step(++currentStep, totalSteps, 'Transcribing...');
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
    step(++currentStep, totalSteps, 'Normalizing transcript...');
    segments = result.segments;
    transcriptText = segments
      .map(seg => `[${seg.timestamp}] ${seg.text}`)
      .join('\n') + '\n';

    // Write transcript immediately (so it survives if analysis fails)
    ensureDir(lectureDir);
    writeText(resolve(lectureDir, 'transcript.txt'), transcriptText);
    if (result.raw) {
      writeJson(resolve(lectureDir, 'raw.json'), result.raw);
    }
  } else {
    // Load existing transcript
    info('Transcript already exists — skipping transcription');
    transcriptText = readText(existingTranscript!)!;
    segments = transcriptText
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
        return match
          ? { timestamp: match[1], text: match[2] }
          : { timestamp: '00:00', text: line };
      });
  }

  // Analyze (skip if transcribe-only or notes already exist)
  let analysis: AnalysisResult | null = null;
  if (needsAnalysis) {
    const providerLabel = provider === 'claude' ? 'Claude' : 'Gemini';
    step(++currentStep, totalSteps, `Analyzing with ${providerLabel}...`);
    lecture.status = 'analyzing';
    writeYaml(courseYamlPath, courseConfig);

    if (provider === 'gemini') {
      analysis = await analyzeLectureGemini(
        segments, lecture.title, courseConfig.name, courseConfig.title,
        config.projectRoot, config
      );
    } else {
      analysis = await analyzeLecture(
        segments, lecture.title, courseConfig.name, courseConfig.title,
        config.projectRoot, config
      );
    }
  } else if (hasNotes) {
    info('Notes already exist — skipping analysis');
  }

  // Write files
  step(++currentStep, totalSteps, 'Writing output files...');
  ensureDir(lectureDir);

  if (!hasTranscript) {
    writeText(resolve(lectureDir, 'transcript.txt'), transcriptText);
  }
  if (analysis) {
    writeText(resolve(lectureDir, 'notes.md'), analysis.notes);
    writeYaml(resolve(lectureDir, 'concepts.yaml'), { concepts: analysis.concepts });
  }

  // Update status
  step(++currentStep, totalSteps, 'Updating status...');
  if (provider === 'none' && !hasNotes) {
    lecture.status = 'partial';
  } else if (hasNotes || (analysis && analysis.concepts.length > 0)) {
    lecture.status = 'completed';
  } else {
    lecture.status = 'partial';
  }
  delete lecture.error;
  writeYaml(courseYamlPath, courseConfig);

  success(`Completed: ${lecture.title}`);
}

/**
 * Find an existing transcript file for a lecture, searching by lecture ID prefix.
 * Returns the full file path or null.
 */
function findExistingTranscript(
  projectRoot: string, courseName: string, lectureId: string
): string | null {
  return findExistingFile(projectRoot, courseName, lectureId, 'transcript.txt');
}

/**
 * Find an existing file in a lecture directory, searching by lecture ID prefix.
 */
function findExistingFile(
  projectRoot: string, courseName: string, lectureId: string, filename: string
): string | null {
  const lecturesDir = resolve(projectRoot, 'courses', courseName, 'lectures');
  if (!existsSync(lecturesDir)) return null;

  const paddedId = lectureId.padStart(2, '0');
  const dirs = readdirSync(lecturesDir).filter(d => d.startsWith(paddedId + '-'));

  for (const dir of dirs) {
    const filePath = resolve(lecturesDir, dir, filename);
    if (existsSync(filePath)) return filePath;
  }

  return null;
}
