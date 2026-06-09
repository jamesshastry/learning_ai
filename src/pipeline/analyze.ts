import Anthropic from '@anthropic-ai/sdk';
import { info, progress, warn, debug } from '../utils/logger.js';
import { readLines, appendLine } from '../utils/files.js';
import { resolve } from 'path';
import type { AnalysisResult, Concept, TranscriptSegment } from '../types.js';

const CONCEPT_INDEX_PATH = 'knowledge-graph/concept-index.txt';

/**
 * The tool definition for structured concept extraction (Call 2).
 * Using tool_use guarantees valid JSON output.
 */
const conceptExtractionTool: Anthropic.Tool = {
  name: 'concepts_extraction',
  description: 'Extract concepts and their relationships from a lecture transcript',
  input_schema: {
    type: 'object' as const,
    properties: {
      concepts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The canonical name of the concept' },
            aliases: {
              type: 'array',
              items: { type: 'string' },
              description: 'Alternative names or abbreviations for this concept',
            },
            definition: {
              type: 'string',
              description: 'A clear 1-2 sentence definition of the concept as discussed in this lecture',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Category tags like: architecture, training, hardware, theory, application',
            },
            timestamps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Timestamps where this concept is discussed, in MM:SS or HH:MM:SS format',
            },
            relations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  target: { type: 'string', description: 'Name of the related concept' },
                  type: {
                    type: 'string',
                    enum: ['related_to', 'enables', 'part_of', 'contrasts_with', 'prerequisite_for'],
                  },
                  note: { type: 'string', description: 'Brief description of the relationship' },
                },
                required: ['target', 'type'],
              },
              description: 'Relationships to other concepts',
            },
          },
          required: ['name', 'definition', 'tags', 'timestamps'],
        },
      },
    },
    required: ['concepts'],
  },
};

/**
 * Format transcript segments as plain text for the prompt.
 */
function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map(seg => `[${seg.timestamp}] ${seg.text}`)
    .join('\n');
}

/**
 * Analyze a lecture transcript using Claude API.
 * Call 1: Generate structured notes (markdown text response).
 * Call 2: Extract concepts (structured JSON via tool_use).
 */
export async function analyzeLecture(
  segments: TranscriptSegment[],
  lectureTitle: string,
  courseName: string,
  courseTitle: string,
  projectRoot: string,
  config: { anthropicApiKey: string; model: string }
): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: config.anthropicApiKey });
  const transcript = formatTranscript(segments);

  // Load existing concept names to avoid duplicates
  const conceptIndexPath = resolve(projectRoot, CONCEPT_INDEX_PATH);
  const existingConcepts = readLines(conceptIndexPath);
  const conceptListStr = existingConcepts.length > 0
    ? `\nExisting concepts in the knowledge base (reference these instead of creating duplicates):\n${existingConcepts.map(c => `- ${c}`).join('\n')}`
    : '';

  // === CALL 1: Notes generation (text response) ===
  info('Generating lecture notes...');
  const notesResponse = await client.messages.create({
    model: config.model,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are an expert note-taker and educator. Generate structured lecture notes from the following transcript.

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

${transcript}`,
      },
    ],
  });

  const notesContent = notesResponse.content
    .filter(block => block.type === 'text')
    .map(block => (block as Anthropic.TextBlock).text)
    .join('\n');

  if (!notesContent) {
    throw new Error('Claude returned empty notes response');
  }

  progress('Notes generated successfully');

  // === CALL 2: Concept extraction (tool_use response) ===
  info('Extracting concepts...');
  const conceptsResponse = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    tools: [conceptExtractionTool],
    tool_choice: { type: 'tool', name: 'concepts_extraction' },
    messages: [
      {
        role: 'user',
        content: `Extract all key concepts, their definitions, relationships, and relevant timestamps from this lecture transcript.

## Lecture: ${lectureTitle}
## Course: ${courseName} — ${courseTitle}

## Guidelines:
- Extract 5-15 concepts per lecture (focus on the most important ones)
- Use the canonical/most descriptive name for each concept
- Include common abbreviations as aliases (e.g., "RLHF" for "Reinforcement Learning from Human Feedback")
- Tags should be broad categories: architecture, training, hardware, theory, application, optimization, safety, data, infrastructure
- Timestamps should reference where the concept is substantially discussed (not just mentioned in passing)
- Relations should capture meaningful connections between concepts discussed in this lecture
- If a concept matches one from the existing list below, use the EXACT same name
${conceptListStr}

## Notes generated from this lecture (for context):
${notesContent.substring(0, 2000)}

## Full Transcript:
${transcript}`,
      },
    ],
  });

  // Extract the tool_use result — guaranteed valid JSON by the API
  const toolUseBlock = conceptsResponse.content.find(
    block => block.type === 'tool_use'
  ) as Anthropic.ToolUseBlock | undefined;

  let concepts: Concept[] = [];
  if (toolUseBlock) {
    const input = toolUseBlock.input as { concepts: Concept[] };
    concepts = input.concepts;
    progress(`Extracted ${concepts.length} concepts`);
  } else {
    warn('Could not extract concepts — no tool_use response received');
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
