# Learning AI System — Design Document (v2)

**Date:** 2026-06-09
**Author:** brainstorming session
**Status:** Draft (revised)
**Previous version:** `2026-06-09-learning-ai-system-design.md`

---

## Changes from Previous Version

This revision addresses all critical issues and several suggestions from the design review.

**Critical fixes:**

1. **Fallback transcription strategy** — Added yt-dlp auto-captions as a degraded fallback when usetranscribe.io is unavailable or a video exceeds the 90-minute limit. The transcript file format is source-agnostic so downstream stages work regardless of origin.
2. **Concept extraction moved to Phase 1** — Summarization and concept extraction are now a single Claude API call during ingestion, eliminating the need to reprocess lectures later and halving API costs.
3. **Concrete knowledge graph merge algorithm** — Specified a deterministic merge algorithm with exact-match and alias-overlap rules, conflict resolution policy, and an optional Claude-assisted fuzzy merge step.
4. **Explicit handling for videos over 90 minutes** — Duration is detected before transcription. Videos over 90 minutes get a warning and fall back to yt-dlp captions automatically.
5. **Cached transcript fetch uses permalink** — The HTTP client constructs the fetch URL from the `/api/check` permalink field, not from the video ID alone.

**Incorporated suggestions:**

- Phase 1 CLI surface area reduced to four essential commands: `add`, `process`, `notes`, `status`.
- Transcripts stored as `transcript.txt` instead of `transcript.md`.
- `learn ask` routes through Claude API with local transcript context instead of usetranscribe.io's `/ask` endpoint.
- Summarize and extract combined into a single prompt (addressed as part of critical fix #2).
- Added `schema_version` field to `course.yaml`.

---

## Goals

Build a personal learning acceleration system that solves four bottlenecks:

1. **Volume** — Condense hours of lecture content into searchable summaries
2. **Retention** — Generate structured, reviewable notes from every lecture
3. **Synthesis** — Connect ideas across lectures/courses via a knowledge graph
4. **Discovery** — Enable full-text and concept-level search across all content

## Tech Stack

- **Language:** TypeScript (Node.js 22+, ES modules)
- **CLI framework:** Commander.js
- **LLM:** Claude API via `@anthropic-ai/sdk`
- **Transcription (primary):** usetranscribe.io (free, no API key, rate limit: 50/day, max 2 concurrent)
- **Transcription (fallback):** yt-dlp auto-captions (degraded quality, no rate limit)
- **Knowledge graph visualization:** D3.js (interactive HTML) + Obsidian-compatible markdown with wiki-links
- **Package manager:** npm

## Repository Structure

```
learning-ai/
├── src/                      # CLI + pipeline source code
│   ├── cli/                  # Command definitions
│   │   ├── index.ts          # CLI entry point
│   │   ├── add.ts            # learn add
│   │   ├── ingest.ts         # learn ingest
│   │   ├── process.ts        # learn process
│   │   ├── status.ts         # learn status
│   │   ├── notes.ts          # learn notes / transcript
│   │   ├── search.ts         # learn search
│   │   ├── ask.ts            # learn ask
│   │   └── graph.ts          # learn graph
│   ├── pipeline/             # Transcribe, summarize, extract
│   │   ├── transcribe.ts     # usetranscribe.io integration
│   │   ├── fallback.ts       # yt-dlp caption extraction
│   │   ├── duration.ts       # Video duration detection
│   │   ├── analyze.ts        # Claude API → notes + concepts (single call)
│   │   └── playlist.ts       # YouTube playlist resolution
│   ├── graph/                # Knowledge graph builder
│   │   ├── builder.ts        # Build graph from concepts.yaml files
│   │   ├── merge.ts          # Concept merging + alias resolution
│   │   └── visualize.ts      # Generate D3.js HTML
│   └── utils/                # HTTP, file I/O, config
│       ├── http.ts           # Fetch helpers, SSE parsing, rate limiting
│       ├── files.ts          # Read/write markdown, YAML, text
│       ├── config.ts         # Config loading (.env, learn.yaml)
│       └── logger.ts         # Progress bars, colored output
├── courses/                  # Content root (one dir per course)
│   └── cs153-frontier-systems/
│       ├── course.yaml       # Metadata: title, url, playlist, tags
│       ├── lectures/
│       │   └── 01-jensen-huang/
│       │       ├── transcript.txt   # Plain text transcript with timestamps
│       │       ├── notes.md         # AI-generated structured notes
│       │       ├── concepts.yaml    # Extracted concepts + relations
│       │       └── raw.json         # Raw API response (gitignored)
│       └── README.md         # Course overview, auto-generated
├── knowledge-graph/
│   ├── concepts/             # One .md per concept (Obsidian vault)
│   │   ├── transformer-architecture.md
│   │   └── scaling-laws.md
│   ├── graph.json            # Machine-readable graph data
│   └── index.html            # Interactive D3 visualization
├── templates/                # Prompt templates and HTML templates
│   ├── analyze-prompt.md     # Combined summarize + extract prompt
│   └── graph.html            # D3.js template
├── docs/plans/
├── .env                      # ANTHROPIC_API_KEY (gitignored)
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

**Changes from v1:** Removed `summarize-prompt.md` and `extract-prompt.md` in favor of a single `analyze-prompt.md`. Removed `scraper.ts` (deferred). Added `fallback.ts` and `duration.ts`. Changed `transcript.md` to `transcript.txt`. Removed `readings/` directory (deferred with scraping). Consolidated `summarize.ts` and `extract.ts` into `analyze.ts`.

## Content Model

### Course Configuration (`course.yaml`)

```yaml
schema_version: 1
name: cs153
title: "Frontier Systems"
university: Stanford
website: https://cs153.stanford.edu/
playlist: https://www.youtube.com/playlist?list=PLoROMvodv4rN447WKQ5oz_YdYbS74M5IA
tags: [infrastructure, frontier-ai, systems]
added: 2026-06-09
lectures:
  - id: "01"
    title: "Jensen Huang — The GPU Computing Stack"
    video_id: "abc123"
    status: completed    # pending | transcribing | analyzing | completed | error
    transcript_source: usetranscribe  # usetranscribe | yt-dlp-captions | manual
    duration_seconds: 4712
    date: 2026-04-01
```

**Changes from v1:** Added `schema_version` field at the top level. Added `transcript_source` field per lecture to track transcription provenance. Changed `duration` from formatted string to `duration_seconds` integer for programmatic comparison against the 90-minute limit. Replaced `summarizing` status with `analyzing` to reflect the combined pipeline step.

### Structured Notes Format (`notes.md`)

```markdown
# Lecture 3: Jensen Huang — The GPU Computing Stack

**Course:** CS153 Frontier Systems
**Date:** 2026-04-10
**Duration:** 1:18:32
**Video:** [YouTube](https://youtube.com/watch?v=...)
**Transcript source:** usetranscribe.io

## TL;DR (2-3 sentences)
Jensen Huang discusses NVIDIA's full-stack approach to AI infrastructure...

## Key Takeaways
1. ...
2. ...
3. ...

## Detailed Notes

### The Evolution of GPU Architecture [0:00-15:30]
...

### Scaling Laws and Hardware Co-design [15:30-32:00]
...

## Notable Quotes
> "The more you buy, the more you save" — Jensen Huang [23:45]

## Concepts Introduced
- [[GPU Architecture]]
- [[Scaling Laws]]
- [[Inference Optimization]]

## Connections to Other Lectures
- Relates to [[cs153/lecture-05]] where Sam Altman discusses compute needs
- Contrasts with [[cs229/lecture-12]] on software-level optimizations

## Open Questions
- How do custom ASICs compare to GPUs for specific workloads?

## Sources & Further Reading
- [NVIDIA CUDA Documentation](...)
```

**Changes from v1:** Added `Transcript source` metadata field. Otherwise identical — the notes format itself was sound.

### Concept File Format (`knowledge-graph/concepts/*.md`)

```markdown
---
aliases: ["attention", "self-attention", "multi-head attention"]
tags: [architecture, transformer, deep-learning]
first_seen: cs153/lecture-03
sources:
  - course: cs153
    lecture: 03
    timestamp: "12:34"
  - course: cs229
    lecture: 15
    timestamp: "45:00"
---

# Attention Mechanism

A mechanism that allows models to focus on relevant parts of the input
sequence when producing each element of the output.

## Key Points from Sources

- **CS153 Lecture 3 (Jensen Huang):** Discussed how attention scales
  quadratically and NVIDIA's hardware optimizations for it [[GPU Architecture]]
- **CS229 Lecture 15:** Mathematical formulation of Q/K/V matrices
  [[Linear Algebra]] [[Transformer Architecture]]

## Related Concepts
- [[Transformer Architecture]]
- [[Scaling Laws]]
- [[GPU Architecture]]
- [[Inference Optimization]]
```

### Concepts YAML Format (`concepts.yaml`)

```yaml
concepts:
  - name: "GPU Architecture"
    aliases: ["GPU arch", "graphics processing unit architecture"]
    definition: "The design and organization of GPU hardware for parallel computation."
    tags: [hardware, systems]
    timestamps: ["12:34", "28:10"]
    relations:
      - target: "Scaling Laws"
        type: related_to
        note: "GPU architecture decisions driven by scaling law predictions"
      - target: "Inference Optimization"
        type: enables
        note: "Hardware features like tensor cores enable inference optimizations"
```

This format is generated by Claude alongside notes.md in a single API call (see Pipeline Architecture below).

## Pipeline Architecture

### Three Ingestion Modes

| Mode | Command | Behavior |
|------|---------|----------|
| **Auto** | `learn ingest cs153 --auto` | Processes entire playlist, generates all notes, no pauses |
| **Review** | `learn ingest cs153 --review` | Processes each lecture, opens notes in `$EDITOR` for review before committing |
| **On-demand** | `learn process <youtube-url>` | Single video, immediate processing |

### Pipeline Stages (per lecture)

```
1. Resolve      → Extract video IDs from playlist (YouTube page scraping)
2. Detect       → Fetch video duration; if >90min, flag for fallback
3. Check cache  → Hit usetranscribe.io /api/check endpoint
4. Transcribe   → Primary: usetranscribe.io SSE; Fallback: yt-dlp captions
5. Normalize    → Convert transcript to plain text with timestamps (transcript.txt)
6. Analyze      → Single Claude API call → structured notes + concepts YAML
7. Write        → Write transcript.txt, notes.md, concepts.yaml to lectures/<N>/
```

**Changes from v1:** Added duration detection step (stage 2). Merged summarize + extract into a single "Analyze" stage (was stages 5-6). Removed the separate "Link" stage — knowledge graph building is a separate command, not part of per-lecture ingestion in Phase 1. Added "Normalize" stage to standardize transcript format regardless of source.

### Transcription Strategy

#### Primary: usetranscribe.io

- Always check cache first via `/api/check?platform=youtube&id={video_id}`
- On cache hit: construct fetch URL from the `permalink` field in the response (e.g., `/yt/{id}/{slug}?format=json`), not from the video ID alone. This avoids 301 redirect issues.
- On cache miss: call `/transcribe?url={url}&summarize=1` (SSE stream)
- SSE events: `validating` → `resolving` → `transcribing` → `summarizing` → `done`/`error`
- Max video length: 90 minutes
- Rate limits: 50 transcriptions/day, max 2 concurrent jobs
- Cached responses: `summary` field, segments under `transcript.segments`
- SSE done events: `summary_md` field, top-level `segments`
- Store raw JSON in `raw.json` (gitignored) for reprocessing without re-transcribing

#### Fallback: yt-dlp auto-captions

Used automatically when:
- Video duration exceeds 90 minutes
- usetranscribe.io returns an error or is unreachable
- Daily rate limit (50/day) is exhausted

Implementation:
```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "%(id)s" <url>
```

This produces a `.vtt` (WebVTT) file. The normalize stage converts VTT to the same plain-text timestamp format used by usetranscribe.io transcripts, so downstream stages (analyze) are source-agnostic.

Limitations of fallback:
- Lower accuracy than usetranscribe.io (YouTube's auto-generated captions vs. Whisper)
- No speaker diarization
- May have missing punctuation or word errors

The `transcript_source` field in `course.yaml` records which method was used. The `notes.md` header includes the transcript source so the user knows the quality level.

#### Duration Detection

Before attempting transcription, fetch the video duration:

1. Fetch the YouTube watch page HTML
2. Extract duration from `ytInitialPlayerResponse` JSON (field: `videoDetails.lengthSeconds`)
3. Store as `duration_seconds` in `course.yaml`

Decision logic:
- Duration <= 5400 seconds (90 min): use usetranscribe.io (primary path)
- Duration > 5400 seconds: log warning, automatically use yt-dlp fallback
- Duration unavailable: attempt usetranscribe.io, fall back on error

### Claude API Strategy: Combined Analysis Prompt

A single Claude API call produces both structured notes and concept extraction. This halves API costs compared to two separate calls and ensures concept wiki-links in the notes are consistent with the extracted concepts.

**Input:** Full transcript text (plain text with timestamps)

**Output format:** The prompt instructs Claude to return a response with two clearly delimited sections:

1. **Structured notes** (markdown) — following the notes.md template
2. **Concepts YAML** (YAML block) — following the concepts.yaml schema

The analyze stage parses the response, splits it into the two outputs, and writes them to separate files.

**Prompt template (`templates/analyze-prompt.md`):**

The prompt includes:
- The full transcript
- The notes.md template/format specification
- The concepts.yaml schema
- A list of existing concept names from `knowledge-graph/concepts/` (so Claude can reference existing concepts rather than creating duplicates)
- Instructions to use wiki-link syntax `[[Concept Name]]` in notes that matches the extracted concepts exactly

**Cost estimate:** ~$0.19/lecture (single call vs. ~$0.38 for two calls). Total for 200-300 lectures: ~$38-57.

### Transcript Normalization

All transcripts are normalized to a common plain-text format before analysis:

```
[00:00:12] Welcome to today's lecture on GPU architecture.
[00:00:18] We'll be covering three main topics.
[00:00:25] First, the evolution of parallel computing...
```

This format is produced regardless of whether the source is usetranscribe.io or yt-dlp VTT captions. The normalize stage handles:
- usetranscribe.io: extract text and timestamps from `segments` array
- VTT (yt-dlp): parse WebVTT cues, deduplicate rolling captions, format timestamps

File extension is `.txt` because this is timestamped plain text, not markdown.

## Knowledge Graph

### Data Flow

1. Each lecture's `concepts.yaml` contains extracted concepts and their relationships (generated during ingestion in Phase 1)
2. `learn graph build` scans all `concepts.yaml` files across all courses
3. Merges concepts using the algorithm described below
4. Generates Obsidian-compatible `.md` files in `knowledge-graph/concepts/`
5. Generates `graph.json` for the D3.js visualization
6. Regenerates `index.html` from template + `graph.json`

### Merge Algorithm

The merge algorithm is deterministic and runs in two passes:

**Pass 1 — Exact matching (automatic):**

1. Load all concepts from all `concepts.yaml` files into a flat list.
2. Normalize each concept name: lowercase, trim whitespace, collapse hyphens/underscores to spaces.
3. Build an alias index: a map from every normalized alias to its parent concept.
4. For each concept, check if its normalized name or any of its normalized aliases appear in the alias index.
   - **Match found:** Merge into the existing concept (see merge rules below).
   - **No match:** Create a new concept entry.

**Pass 2 — Ambiguity detection (logged, not auto-resolved):**

5. After pass 1, scan for potential issues:
   - **Alias conflicts:** Two distinct concepts share an alias. Log a warning with both concept names and the conflicting alias.
   - **Near-duplicates:** Concepts whose names have a Levenshtein distance <= 3 or share 2+ aliases. Log as candidates for manual review.
6. Write ambiguities to `knowledge-graph/merge-log.yaml` for the user to review.

**Merge rules (when two concept records match):**

- **Name:** Keep the longer/more descriptive name. E.g., "RLHF" merges into "Reinforcement Learning from Human Feedback".
- **Aliases:** Union of all aliases from both records.
- **Definition:** Keep the longer definition (more detail wins).
- **Tags:** Union of all tags.
- **Sources:** Union of all source references (course/lecture/timestamp).
- **Relations:** Union of all relations. If two relations have the same target but different types, keep both.
- **first_seen:** Keep the earliest `first_seen` value.

**Future enhancement (Phase 3):** Add `learn graph resolve` command that presents ambiguous merges to the user interactively, and optionally uses Claude to suggest whether near-duplicates should be merged, kept separate, or linked as parent-child.

### Interactive Visualization

- D3.js force-directed layout in a static HTML file
- Nodes = concepts, sized by number of source lectures
- Edges = relations between concepts (from concepts.yaml)
- Color-coded by topic cluster (auto-detected via community detection)
- Click node: sidebar with concept summary + source lectures
- Filter by course, topic tag, or search term
- No server needed: `open knowledge-graph/index.html`

## CLI Commands

### Phase 1 (MVP)

```bash
# Course management
learn add <playlist-url> --name "cs153"     # Add a course from a YouTube playlist
learn status [course]                        # Show processing status (all courses or one)

# Ingestion
learn process <youtube-url> --course cs153   # Single video, on-demand

# Reading
learn notes cs153 1                          # View notes for lecture 1
```

### Phase 2

```bash
# Batch ingestion
learn ingest cs153 --auto                    # Full playlist, fully automated
learn ingest cs153 --review                  # Pause for review after each

# Search & Q&A
learn search "attention mechanism"           # Full-text search across all notes
learn search --concept "RLHF"               # Search concept index
learn search --course cs153 "scaling"        # Scoped to one course
learn ask cs153 3 "What did the speaker say about inference cost?"
learn transcript cs153 3                     # View raw transcript

# Utilities
learn config                                 # Show/edit config
```

### Phase 3

```bash
# Knowledge graph
learn graph build                            # Rebuild graph from all concepts.yaml
learn graph serve                            # Open interactive D3 visualization in browser
learn graph "transformers"                   # Show concept + connections in terminal
learn graph resolve                          # Interactive disambiguation of merge conflicts
```

**Changes from v1:** Phase 1 reduced from 7+ commands to 4 (`add`, `process`, `notes`, `status`). `learn ingest` (batch) moved to Phase 2. `learn ask` moved to Phase 2 and rerouted through Claude API instead of usetranscribe.io. `learn list` removed (merged into `learn status`). `learn export` removed entirely (low priority). `learn graph resolve` added to Phase 3.

### `learn ask` Implementation (Phase 2)

Routes through Claude API, not usetranscribe.io:

```
1. Load transcript.txt for the specified lecture
2. Construct a prompt: system message with transcript as context + user's question
3. Send to Claude API
4. Stream the response to stdout
```

This avoids an additional external dependency and produces better answers because:
- The full transcript is available as context (not just the usetranscribe.io summary)
- No separate rate limit to manage
- Works offline if transcript is already cached locally

## Phased Implementation

### Phase 1 — Transcription + Notes (MVP)

- Project scaffolding (TypeScript, Commander.js, npm scripts)
- `learn add` — add a course from a playlist URL, resolve video IDs, write `course.yaml`
- `learn status` — show processing status per lecture
- Duration detection (`duration.ts`)
- Transcription pipeline: usetranscribe.io primary with cached permalink fetch
- Fallback transcription: yt-dlp auto-captions
- Transcript normalization to plain text (`transcript.txt`)
- Combined Claude API analysis: structured notes + concept extraction in one call
- `concepts.yaml` written per lecture at ingestion time
- `learn process` — single video, on-demand mode
- `learn notes` — view generated notes
- End-to-end test with CS153 lecture 1

**What is NOT in Phase 1:** Batch ingestion (`learn ingest`), search, Q&A, knowledge graph visualization, course website scraping, review mode.

### Phase 2 — Batch Ingestion + Search + Q&A

- `learn ingest --auto` (full playlist, concurrency management, rate limit tracking)
- `learn ingest --review` mode (editor integration)
- Resume-on-failure for playlist ingestion
- `learn search` with full-text search across markdown files
- `learn ask` via Claude API with transcript context
- `learn transcript` viewing command
- `learn config` for preferences

### Phase 3 — Knowledge Graph + Visualization

- Knowledge graph merge algorithm (builder.ts, merge.ts)
- Obsidian-compatible concept file generation from `concepts.yaml` data
- `learn graph build` and `graph.json` generation
- Interactive D3.js HTML visualization
- `learn graph` CLI query commands
- `learn graph resolve` for merge disambiguation
- Cross-course connection analysis

**Key change from v1:** Concept extraction happens in Phase 1 (at ingestion time). Phase 3 only handles the *aggregation, merging, and visualization* of concepts that were already extracted. This means no lectures need to be reprocessed when Phase 3 ships.

## Error Handling

- **Transcription failures (primary):** Log error, attempt yt-dlp fallback. If fallback also fails, mark lecture as `error` in course.yaml with error details, continue to next lecture.
- **Duration over 90 minutes:** Log warning ("Video exceeds 90-minute limit, using YouTube captions as fallback"), use yt-dlp automatically. Not treated as an error.
- **yt-dlp not installed:** Log actionable error message ("yt-dlp is required for fallback transcription. Install via: brew install yt-dlp"). Mark lecture as `error`, continue.
- **Rate limits:** Track daily usage in a local file (`~/.learning-ai/usage.json`). When approaching 50/day, warn the user. When exhausted, switch remaining lectures to yt-dlp fallback automatically.
- **API failures (Claude):** Retry with exponential backoff (3 attempts), then mark as `error` and skip.
- **Cached transcript redirect:** Fetch URL constructed from `/api/check` permalink field. If fetch fails, retry once by following redirects explicitly, then fall back to re-transcribing.
- **Resume:** `learn ingest` checks `status` field in course.yaml, skips `completed` lectures.
- **Partial state:** Pipeline writes raw.json first, so re-runs can skip transcription.
- **Schema migration:** `schema_version` in course.yaml enables future `learn migrate` command to update file formats across all courses.

## Configuration

```yaml
# .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...

# learn.yaml (optional, committed)
defaults:
  editor: code    # for --review mode
  model: claude-sonnet-4-6  # Claude model to use
  max_concurrent_transcriptions: 2
```

## Known Limitations

1. **usetranscribe.io has no SLA.** It is a hobby project. The yt-dlp fallback mitigates this but produces lower-quality transcripts.
2. **YouTube playlist pagination.** Playlists over ~100 videos may not return all video IDs in the initial HTML page load. Target use case (10-40 video lecture playlists) is unaffected.
3. **yt-dlp captions quality.** YouTube auto-generated captions lack speaker diarization, may have word errors, and sometimes miss punctuation. Notes generated from these transcripts will be lower quality.
4. **Course website scraping is deferred.** Per review feedback, course websites vary too much for a reliable generic scraper. May be added as an optional manual/per-site feature later.
5. **D3.js visualization scope.** The full interactive visualization (community detection, filtering, sidebar) is a substantial frontend effort. Phase 3 may ship a simpler initial version and iterate.
