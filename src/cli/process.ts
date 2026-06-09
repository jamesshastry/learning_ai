import { Command } from 'commander';
import { resolve } from 'path';
import { loadConfig, defaultModel, type LLMProvider } from '../utils/config.js';
import { readYaml, writeYaml, writeText, writeJson, ensureDir } from '../utils/files.js';
import { success, error, info, step, warn } from '../utils/logger.js';
import { detectDuration, exceedsLimit } from '../pipeline/duration.js';
import { transcribeVideo } from '../pipeline/transcribe.js';
import { fallbackTranscribe } from '../pipeline/fallback.js';
import { analyzeLecture } from '../pipeline/analyze.js';
import { analyzeLectureGemini } from '../pipeline/analyze-gemini.js';
import { slugify } from '../pipeline/playlist.js';
import type { CourseConfig, TranscribeResult, TranscriptSegment, AnalysisResult } from '../types.js';

/**
 * Register the `learn process` command.
 *
 * Processes a single YouTube video through the per-lecture pipeline.
 * Supports three modes:
 * - Full pipeline (default): transcribe + analyze with LLM
 * - Transcribe-only (--transcribe-only): just save the transcript, no LLM needed
 * - Provider override (--provider): use a specific LLM provider
 */
export function processCommand(program: Command): void {
  program
    .command('process <youtube-url>')
    .description('Process a single YouTube video: transcribe, generate notes, extract concepts')
    .requiredOption('--course <name>', 'Course name to file this lecture under')
    .option('--force', 'Reprocess even if already completed', false)
    .option('--transcribe-only', 'Only transcribe — skip note generation (no API key needed)', false)
    .option('--provider <provider>', 'LLM provider: claude, gemini, or none')
    .action(async (youtubeUrl: string, opts: {
      course: string;
      force: boolean;
      transcribeOnly: boolean;
      provider?: string;
    }) => {
      const config = loadConfig();

      // Determine effective provider
      const provider = resolveEffectiveProvider(opts.provider, opts.transcribeOnly, config.llmProvider);
      // Resolve model for the effective provider (prevents sending Claude model name to Gemini)
      const effectiveModel = provider !== config.llmProvider
        ? defaultModel(provider)
        : config.model;

      // Validate API key for the chosen provider
      if (provider === 'claude' && !config.anthropicApiKey) {
        error('Claude selected but ANTHROPIC_API_KEY not set. Use --provider gemini or --transcribe-only');
        process.exit(1);
      }
      if (provider === 'gemini' && !config.geminiApiKey) {
        error('Gemini selected but GEMINI_API_KEY not set. Use --provider claude or --transcribe-only');
        process.exit(1);
      }

      const courseName = opts.course.toLowerCase();
      const courseYamlPath = resolve(config.projectRoot, 'courses', courseName, 'course.yaml');
      const courseConfig = readYaml<CourseConfig>(courseYamlPath);

      if (!courseConfig) {
        error(`Course "${courseName}" not found. Run \`learn add\` first.`);
        process.exit(1);
        return;
      }

      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        error(`Invalid YouTube URL: ${youtubeUrl}`);
        process.exit(1);
        return;
      }

      let lecture = courseConfig.lectures.find(l => l.video_id === videoId);
      if (lecture && lecture.status === 'completed' && !opts.force) {
        info(`Lecture "${lecture.title}" is already completed. Use --force to reprocess.`);
        return;
      }

      if (!lecture) {
        const nextId = String(courseConfig.lectures.length + 1).padStart(2, '0');
        lecture = {
          id: nextId,
          title: 'Processing...',
          video_id: videoId,
          status: 'pending',
        };
        courseConfig.lectures.push(lecture);
      }

      const totalSteps = provider === 'none' ? 4 : 6;

      try {
        // === Stage: Detect duration ===
        step(1, totalSteps, 'Detecting video duration...');
        const duration = await detectDuration(videoId);
        if (duration !== null) {
          lecture.duration_seconds = duration;
          info(`Duration: ${Math.floor(duration / 60)} minutes`);
        }

        // === Stage: Transcribe ===
        step(2, totalSteps, 'Transcribing...');
        let result: TranscribeResult | null = null;

        if (exceedsLimit(duration)) {
          warn(`Video exceeds 90-minute limit (${Math.floor((duration ?? 0) / 60)} min). Using fallback.`);
          result = await fallbackTranscribe(videoId);
        } else {
          lecture.status = 'transcribing';
          writeYaml(courseYamlPath, courseConfig);

          result = await transcribeVideo(videoId);
          if (!result) {
            warn('Primary transcription failed. Trying yt-dlp fallback...');
            result = await fallbackTranscribe(videoId);
          }
        }

        if (!result) {
          throw new Error('All transcription methods failed');
        }

        lecture.transcript_source = result.source;
        if (result.title && lecture.title === 'Processing...') {
          lecture.title = result.title;
        }
        if (result.duration_seconds && !lecture.duration_seconds) {
          lecture.duration_seconds = result.duration_seconds;
        }

        // === Stage: Normalize transcript ===
        step(3, totalSteps, 'Normalizing transcript...');
        const transcriptText = normalizeTranscript(result.segments);

        // === Stage: Analyze (skip if transcribe-only) ===
        let analysis: AnalysisResult | null = null;

        if (provider !== 'none') {
          const providerLabel = provider === 'claude' ? 'Claude' : 'Gemini';
          step(4, totalSteps, `Analyzing with ${providerLabel}...`);
          lecture.status = 'analyzing';
          writeYaml(courseYamlPath, courseConfig);

          analysis = await runAnalysis(
            provider, result.segments, lecture.title,
            courseConfig.name, courseConfig.title,
            config.projectRoot, { ...config, model: effectiveModel }
          );
        } else {
          info('Transcribe-only mode — skipping note generation');
        }

        // === Stage: Write files ===
        step(provider !== 'none' ? 5 : 4, totalSteps, 'Writing output files...');
        const titleSlug = slugify(lecture.title);
        const lectureDir = resolve(
          config.projectRoot, 'courses', courseName, 'lectures',
          `${lecture.id}-${titleSlug}`
        );
        ensureDir(lectureDir);

        // Always write transcript
        writeText(resolve(lectureDir, 'transcript.txt'), transcriptText);

        // Write notes and concepts if analysis was done
        if (analysis) {
          writeText(resolve(lectureDir, 'notes.md'), analysis.notes);
          writeYaml(resolve(lectureDir, 'concepts.yaml'), { concepts: analysis.concepts });
        }

        if (result.raw) {
          writeJson(resolve(lectureDir, 'raw.json'), result.raw);
        }

        // Update course config
        step(totalSteps, totalSteps, 'Updating course status...');
        if (provider === 'none') {
          lecture.status = 'partial'; // Transcript only — notes still pending
        } else {
          lecture.status = analysis && analysis.concepts.length > 0 ? 'completed' : 'partial';
        }
        writeYaml(courseYamlPath, courseConfig);

        success(`Processed: ${lecture.title}`);
        info(`Transcript: ${resolve(lectureDir, 'transcript.txt')}`);
        if (analysis) {
          info(`Notes: ${resolve(lectureDir, 'notes.md')}`);
          info(`Concepts: ${analysis.concepts.length} extracted`);
        }
        info(`Transcript source: ${result.source}`);
        if (provider === 'none') {
          info('Run again without --transcribe-only to generate notes when you have an API key.');
        }
      } catch (e) {
        lecture.status = 'error';
        lecture.error = (e as Error).message;
        writeYaml(courseYamlPath, courseConfig);
        error(`Processing failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Determine the effective LLM provider based on flags and config.
 */
function resolveEffectiveProvider(
  explicitProvider: string | undefined,
  transcribeOnly: boolean,
  configProvider: LLMProvider
): LLMProvider {
  if (transcribeOnly) return 'none';
  if (explicitProvider === 'claude' || explicitProvider === 'gemini' || explicitProvider === 'none') {
    return explicitProvider;
  }
  return configProvider;
}

/**
 * Route analysis to the appropriate LLM provider.
 */
async function runAnalysis(
  provider: LLMProvider,
  segments: TranscriptSegment[],
  lectureTitle: string,
  courseName: string,
  courseTitle: string,
  projectRoot: string,
  config: { anthropicApiKey: string; geminiApiKey: string; model: string }
): Promise<AnalysisResult> {
  switch (provider) {
    case 'claude':
      return analyzeLecture(segments, lectureTitle, courseName, courseTitle, projectRoot, config);
    case 'gemini':
      return analyzeLectureGemini(segments, lectureTitle, courseName, courseTitle, projectRoot, config);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

/**
 * Extract a YouTube video ID from various URL formats.
 */
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v');
    }

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  }
}

/**
 * Normalize transcript segments to plain text with timestamps.
 */
function normalizeTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map(seg => `[${seg.timestamp}] ${seg.text}`)
    .join('\n') + '\n';
}
