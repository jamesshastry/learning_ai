import { GoogleGenAI } from '@google/genai';
import { info, progress, warn, debug } from '../utils/logger.js';
import { readLines, appendLine } from '../utils/files.js';
import { resolve } from 'path';
import type { AnalysisResult, Concept, TranscriptSegment } from '../types.js';

const CONCEPT_INDEX_PATH = 'knowledge-graph/concept-index.txt';

/** Max retries for transient Gemini errors (503, 429). */
const MAX_RETRIES = 4;

/**
 * Format transcript segments as plain text for the prompt.
 */
function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map(seg => `[${seg.timestamp}] ${seg.text}`)
    .join('\n');
}

/**
 * Retry a Gemini API call with exponential backoff on transient errors.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = (e as Error).message ?? '';
      const isTransient = msg.includes('503') || msg.includes('429') ||
        msg.includes('UNAVAILABLE') || msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('overloaded');

      if (!isTransient || attempt === MAX_RETRIES) {
        throw e;
      }

      const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s, 16s
      warn(`${label}: transient error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Analyze a lecture transcript using Google Gemini API.
 * Call 1: Generate structured notes (text response).
 * Call 2: Extract concepts (JSON mode).
 * Includes exponential backoff for transient 503/429 errors.
 */
export async function analyzeLectureGemini(
  segments: TranscriptSegment[],
  lectureTitle: string,
  courseName: string,
  courseTitle: string,
  projectRoot: string,
  config: { geminiApiKey: string; model: string }
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const transcript = formatTranscript(segments);

  // Load existing concept names to avoid duplicates
  const conceptIndexPath = resolve(projectRoot, CONCEPT_INDEX_PATH);
  const existingConcepts = readLines(conceptIndexPath);
  const conceptListStr = existingConcepts.length > 0
    ? `\nExisting concepts in the knowledge base (reference these instead of creating duplicates):\n${existingConcepts.map(c => `- ${c}`).join('\n')}`
    : '';

  const notesPrompt = `You are an expert note-taker and educator. Generate structured lecture notes from the following transcript.

## Lecture Information
- **Title:** ${lectureTitle}
- **Course:** ${courseName} — ${courseTitle}

## Output Format

Produce markdown notes following this EXACT structure:

# ${lectureTitle}

**Course:** ${courseTitle}
**Video:** [YouTube](https://youtube.com/watch?v=VIDEO_ID)

## TL;DR
(2-3 sentence summary of the entire lecture)

## Key Takeaways
1. (3-5 most important points)

## Detailed Notes

### Section Title [START_TIME-END_TIME]
(Detailed notes for this section, organized by topic shifts in the lecture)

(Repeat for each major section — aim for 4-8 sections)

## Notable Quotes
> "Exact or near-exact quote" — Speaker Name [TIMESTAMP]

(Include 3-5 most impactful quotes)

## Concepts Introduced
- [[Concept Name]] — brief description
(Use [[wiki-link]] syntax for each concept. These will be cross-referenced in the knowledge graph.)

## Connections to Other Lectures
(If the speaker references other work, papers, or ideas that might appear in other lectures, note them here)

## Open Questions
(Questions raised but not answered, or areas that deserve further exploration)
${conceptListStr}

## Transcript

${transcript}`;

  // === CALL 1: Notes generation with retry ===
  info('Generating lecture notes (Gemini)...');
  const notesResponse = await withRetry(
    () => ai.models.generateContent({
      model: config.model,
      contents: notesPrompt,
    }),
    'Notes generation'
  );

  const notesContent = notesResponse.text ?? '';

  if (!notesContent) {
    throw new Error('Gemini returned empty notes response');
  }

  progress('Notes generated successfully');

  // === CALL 2: Concept extraction (JSON mode) with retry ===
  info('Extracting concepts (Gemini)...');
  const conceptsResponse = await withRetry(
    () => ai.models.generateContent({
      model: config.model,
      contents: `Extract all key concepts from this lecture transcript and return them as JSON.

## Lecture: ${lectureTitle}
## Course: ${courseName} — ${courseTitle}

## Guidelines:
- Extract 5-15 concepts per lecture
- Use the canonical/most descriptive name for each concept
- Include common abbreviations as aliases
- Tags should be broad categories: architecture, training, hardware, theory, application, optimization, safety, data, infrastructure
- If a concept matches one from the existing list below, use the EXACT same name
${conceptListStr}

## Notes generated from this lecture (for context):
${notesContent.substring(0, 2000)}

## Full Transcript:
${transcript}

## Output Format

Return ONLY valid JSON with this exact structure, no markdown fences:
{
  "concepts": [
    {
      "name": "Concept Name",
      "aliases": ["alias1", "alias2"],
      "definition": "Clear 1-2 sentence definition",
      "tags": ["tag1", "tag2"],
      "timestamps": ["12:34", "28:10"],
      "relations": [
        {
          "target": "Other Concept",
          "type": "related_to",
          "note": "Brief description"
        }
      ]
    }
  ]
}

Valid relation types: related_to, enables, part_of, contrasts_with, prerequisite_for`,
      config: {
        responseMimeType: 'application/json',
      },
    }),
    'Concept extraction'
  );

  let concepts: Concept[] = [];
  const rawText = conceptsResponse.text ?? '';

  if (rawText) {
    try {
      const parsed = JSON.parse(rawText) as { concepts: Concept[] };
      concepts = parsed.concepts ?? [];
      progress(`Extracted ${concepts.length} concepts`);
    } catch (e) {
      warn(`Failed to parse concept JSON: ${(e as Error).message}`);
      debug(`Raw response: ${rawText.substring(0, 200)}`);
    }
  } else {
    warn('Could not extract concepts — empty response from Gemini');
  }

  // Update the concept index with new concept names
  const newConcepts = concepts
    .map(c => c.name)
    .filter(name => !existingConcepts.includes(name));

  for (const name of newConcepts) {
    appendLine(conceptIndexPath, name);
  }

  if (newConcepts.length > 0) {
    debug(`Added ${newConcepts.length} new concepts to index`);
  }

  return {
    notes: notesContent,
    concepts,
  };
}
