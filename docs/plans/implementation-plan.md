# Implementation Plan — Learning AI System

## Phase 1: Transcription + Notes (MVP)

### Step 1: Project Scaffolding
- Initialize npm project with TypeScript
- Configure tsconfig.json (ES modules, Node 22+)
- Install dependencies: commander, @anthropic-ai/sdk, js-yaml, dotenv, chalk
- Set up bin entry point, npm scripts (build, typecheck, dev)
- Create .env.example, .gitignore
- Create directory structure

### Step 2: Utility Modules
- src/utils/config.ts — load .env, learn.yaml
- src/utils/files.ts — read/write YAML, markdown, text
- src/utils/http.ts — fetch helpers, SSE stream parser, rate limiting
- src/utils/logger.ts — colored output, progress indicators

### Step 3: Playlist Resolution
- src/pipeline/playlist.ts — scrape YouTube playlist page, extract video IDs/titles from ytInitialData

### Step 4: Duration Detection
- src/pipeline/duration.ts — fetch YouTube watch page, extract lengthSeconds from ytInitialPlayerResponse

### Step 5: Transcription (Primary)
- src/pipeline/transcribe.ts — check cache via /api/check, fetch via permalink, or trigger SSE transcription
- Handle SSE event stream parsing
- Store raw.json

### Step 6: Transcription (Fallback)
- src/pipeline/fallback.ts — yt-dlp auto-caption extraction
- VTT parsing and rolling caption deduplication
- Normalize to same timestamp format as primary

### Step 7: Claude API Analysis
- src/pipeline/analyze.ts — two-call strategy
- Call 1: notes generation (text response)
- Call 2: concept extraction (tool_use with JSON schema)
- Concept index management (concept-index.txt)
- Prompt templates

### Step 8: CLI Commands (Phase 1)
- src/cli/index.ts — Commander.js entry point
- src/cli/add.ts — learn add (playlist resolution + course.yaml)
- src/cli/process.ts — learn process (full per-lecture pipeline)
- src/cli/notes.ts — learn notes (display notes)
- src/cli/status.ts — learn status (display course status)

### Step 9: End-to-End Test
- Wire up CS153 as first course
- Process one lecture end-to-end
- Verify all output files are correct

## Phase 2: Batch Ingestion + Search + Q&A

### Step 10: Batch Ingestion
- src/cli/ingest.ts — learn ingest --auto / --review
- Concurrency management, rate limit tracking
- Resume-on-failure logic

### Step 11: Search
- src/cli/search.ts — full-text search across markdown/text files
- Concept search via concept-index.txt
- Course-scoped search

### Step 12: Q&A and Utilities
- src/cli/ask.ts — Claude API with transcript context
- src/cli/config.ts — learn config
- learn transcript command

## Phase 3: Knowledge Graph + Visualization

### Step 13: Graph Builder
- src/graph/builder.ts — scan all concepts.yaml files
- src/graph/merge.ts — two-pass merge algorithm
- Generate concept-index.txt from all sources

### Step 14: Obsidian Concept Files
- Generate markdown files with wiki-links in knowledge-graph/concepts/
- YAML frontmatter with aliases, tags, sources

### Step 15: D3.js Visualization
- src/graph/visualize.ts — generate graph.json
- templates/graph.html — interactive force-directed graph
- src/cli/graph.ts — learn graph commands
