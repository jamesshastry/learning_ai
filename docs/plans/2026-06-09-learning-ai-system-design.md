# Learning AI System — Design Document

**Date:** 2026-06-09
**Author:** brainstorming session
**Status:** Draft

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
- **Transcription:** usetranscribe.io (free, no API key, rate limit: 50/day, max 2 concurrent)
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
│   │   ├── search.ts         # learn search
│   │   ├── graph.ts          # learn graph
│   │   ├── notes.ts          # learn notes / transcript
│   │   ├── ask.ts            # learn ask
│   │   ├── status.ts         # learn status
│   │   └── config.ts         # learn config
│   ├── pipeline/             # Transcribe, summarize, extract
│   │   ├── transcribe.ts     # usetranscribe.io integration
│   │   ├── summarize.ts      # Claude API → structured notes
│   │   ├── extract.ts        # Claude API → concepts + relations
│   │   ├── playlist.ts       # YouTube playlist resolution
│   │   └── scraper.ts        # Course website scraping
│   ├── graph/                # Knowledge graph builder
│   │   ├── builder.ts        # Build graph from concepts.yaml files
│   │   ├── merge.ts          # Concept merging + alias resolution
│   │   └── visualize.ts      # Generate D3.js HTML
│   └── utils/                # HTTP, file I/O, config
│       ├── http.ts           # Fetch helpers, SSE parsing, rate limiting
│       ├── files.ts          # Read/write markdown, YAML
│       ├── config.ts         # Config loading (.env, learn.yaml)
│       └── logger.ts         # Progress bars, colored output
├── courses/                  # Content root (one dir per course)
│   └── cs153-frontier-systems/
│       ├── course.yaml       # Metadata: title, url, playlist, tags
│       ├── lectures/
│       │   └── 01-jensen-huang/
│       │       ├── transcript.md
│       │       ├── notes.md       # AI-generated structured notes
│       │       ├── concepts.yaml  # Extracted concepts + relations
│       │       └── raw.json       # Raw API response (gitignored)
│       ├── readings/
│       └── README.md         # Course overview, auto-generated
├── knowledge-graph/
│   ├── concepts/             # One .md per concept (Obsidian vault)
│   │   ├── transformer-architecture.md
│   │   └── scaling-laws.md
│   ├── graph.json            # Machine-readable graph data
│   └── index.html            # Interactive D3 visualization
├── templates/                # Prompt templates and HTML templates
│   ├── summarize-prompt.md
│   ├── extract-prompt.md
│   └── graph.html            # D3.js template
├── docs/plans/
├── .env                      # ANTHROPIC_API_KEY (gitignored)
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## Content Model

### Course Configuration (`course.yaml`)

```yaml
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
    status: completed    # pending | transcribing | summarizing | completed | error
    duration: "1:18:32"
    date: 2026-04-01
```

### Structured Notes Format (`notes.md`)

```markdown
# Lecture 3: Jensen Huang — The GPU Computing Stack

**Course:** CS153 Frontier Systems
**Date:** 2026-04-10
**Duration:** 1:18:32
**Video:** [YouTube](https://youtube.com/watch?v=...)

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

## Pipeline Architecture

### Three Ingestion Modes

| Mode | Command | Behavior |
|------|---------|----------|
| **Auto** | `learn ingest cs153 --auto` | Processes entire playlist, generates all notes, no pauses |
| **Review** | `learn ingest cs153 --review` | Processes each lecture, opens notes in `$EDITOR` for review before committing |
| **On-demand** | `learn process <youtube-url>` | Single video, immediate processing |

### Pipeline Stages (per lecture)

```
1. Resolve     → Extract video IDs from playlist (YouTube page scraping)
2. Check cache → Hit usetranscribe.io /api/check endpoint
3. Transcribe  → If cache miss, call /transcribe SSE endpoint
4. Structure   → Convert raw transcript to timestamped markdown
5. Summarize   → Send transcript to Claude API → structured notes
6. Extract     → Send transcript to Claude API → concepts + relations
7. Link        → Update knowledge graph with new concepts/edges
8. Write       → Write all files to courses/<course>/lectures/<N>/
```

### Transcription Details (usetranscribe.io)

- Always check cache first via `/api/check?platform=youtube&id={video_id}`
- On cache miss: call `/transcribe?url={url}&summarize=1` (SSE stream)
- SSE events: `validating` → `resolving` → `transcribing` → `summarizing` → `done`/`error`
- Max video length: 90 minutes
- Rate limits: 50 transcriptions/day, max 2 concurrent jobs
- Cached responses: different schema — `summary` field, segments under `transcript.segments`
- SSE done events: `summary_md` field, top-level `segments`
- Store raw JSON in `raw.json` (gitignored) for reprocessing without re-transcribing

### Claude API Prompt Strategy

- **Summarize stage:** Full transcript sent in single prompt (within 200K context).
  Output: structured markdown following the notes template above.
- **Extract stage:** Second prompt with transcript + list of existing concepts from
  `knowledge-graph/concepts/`. Output: YAML with new concepts, definitions, relationships,
  and connections to existing concepts.

## CLI Commands

```bash
# Course management
learn add <playlist-url> --name "cs153" --website "https://cs153.stanford.edu/"
learn list                           # List all courses with lecture counts
learn status cs153                   # Show processing status per lecture

# Ingestion (three modes)
learn ingest cs153 --auto            # Full playlist, fully automated
learn ingest cs153 --review          # Pause for review after each lecture
learn process <youtube-url> --course cs153   # Single video, on-demand

# Search & discovery
learn search "attention mechanism"   # Full-text search across all notes
learn search --concept "RLHF"       # Search concept index specifically
learn search --course cs153 "scaling"  # Scoped to one course

# Knowledge graph
learn graph build                    # Rebuild graph from all concepts.yaml
learn graph serve                    # Open interactive HTML graph in browser
learn graph "transformers"           # Show concept + connections in terminal

# Notes & reading
learn notes cs153 3                  # View notes for lecture 3
learn transcript cs153 3             # View transcript for lecture 3
learn ask cs153 3 "What did the speaker say about inference cost?"

# Utilities
learn config                         # Show/edit config (API keys, defaults)
learn export --format pdf cs153      # Export course notes
```

## Knowledge Graph

### Data Flow

1. Each lecture's `concepts.yaml` contains extracted concepts and their relationships
2. `learn graph build` scans all `concepts.yaml` files across all courses
3. Merges concepts with matching names/aliases (case-insensitive, alias-aware)
4. Generates Obsidian-compatible `.md` files in `knowledge-graph/concepts/`
5. Generates `graph.json` for the D3.js visualization
6. Regenerates `index.html` from template + `graph.json`

### Interactive Visualization

- D3.js force-directed layout in a static HTML file
- Nodes = concepts, sized by number of source lectures
- Edges = wiki-links between concepts
- Color-coded by topic cluster (auto-detected via community detection)
- Click node → sidebar with concept summary + source lectures
- Filter by course, topic tag, or search term
- No server needed — `open knowledge-graph/index.html`

## Phased Implementation

### Phase 1 — Transcription + Notes (MVP)
- Project scaffolding (TypeScript, Commander.js, npm scripts)
- `learn add` and `learn list` commands
- Transcription pipeline (usetranscribe.io integration)
- Claude API integration for note generation
- `learn process` (single video, on-demand mode)
- `learn ingest --auto` (full playlist mode)
- `learn notes` and `learn transcript` viewing commands
- End-to-end test with CS153 lecture 1

### Phase 2 — CLI + Search
- `learn search` with full-text search across markdown files
- `learn ingest --review` mode (editor integration)
- `learn ask` (Q&A via usetranscribe.io endpoint)
- `learn status` and progress tracking
- Course website scraping for readings/syllabus
- Resume-on-failure for playlist ingestion
- `learn config` for API keys and preferences

### Phase 3 — Knowledge Graph + Synthesis
- Concept extraction pipeline (Claude API)
- Obsidian-compatible concept file generation
- Concept merging and alias resolution
- `learn graph build` and `graph.json` generation
- Interactive D3.js HTML visualization
- `learn graph` CLI query commands
- Cross-course connections and concept search

## Error Handling

- **Transcription failures:** Log error, mark lecture as `error` in course.yaml, continue to next lecture
- **Rate limits:** Track usage, pause and warn when approaching 50/day limit
- **API failures (Claude):** Retry with exponential backoff (3 attempts), then skip
- **Resume:** `learn ingest` checks `status` field in course.yaml, skips `completed` lectures
- **Partial state:** Pipeline writes raw.json first, so re-runs can skip transcription

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
