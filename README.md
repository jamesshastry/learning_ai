# Learning AI 🧠

Personal learning acceleration system for AI courses. Transcribe YouTube lectures, generate structured notes, extract concepts, build a knowledge graph, and track your learning progress — all from the command line.

## Features

### Content Processing
- **📝 Automated Notes** — Transcribe lectures and generate structured notes with Claude or Gemini
- **🔄 Multi-Source Ingestion** — YouTube playlists, individual videos, or external transcript files (SRT, VTT, TXT)
- **🔗 Knowledge Graph** — Obsidian-compatible concept files with `[[wiki-links]]` + interactive D3.js visualization
- **🔍 Full-Text Search** — Search across all notes, transcripts, and concepts
- **❓ Lecture Q&A** — Ask questions about any lecture with the full transcript as context

### Learning Workflow
- **📊 Progress Tracking** — Track watched status, confidence levels, and revisit flags per lecture
- **🔬 Cross-Course Synthesis** — Generate synthesis documents that connect ideas across all your courses *(the killer feature)*
- **✏️ Personal Annotations** — Add your own notes per lecture that survive reprocessing
- **📋 Review System** — Surface lectures you're shaky on or flagged for revisit

### Infrastructure
- **🤖 Multi-Provider** — Claude, Gemini (free tier!), or transcribe-only mode with no API key
- **💰 Cost-Aware** — Use free Gemini for bulk processing, Claude for deep Q&A
- **🔄 Smart Resume** — Interrupted runs pick up where they left off; transcripts are never re-fetched
- **🛡️ Fallback Transcription** — Falls back to yt-dlp auto-captions for long videos or service outages

## Quick Start

```bash
# 1. Install and build
npm install && npm run build

# 2. Set up your API key (get a free Gemini key at https://aistudio.google.com/apikey)
cp .env.example .env
# Edit .env — add at least GEMINI_API_KEY or ANTHROPIC_API_KEY

# 3. Link the CLI globally
npm link

# 4. Add your first course
learn add "https://www.youtube.com/playlist?list=PLoROMvodv4rN447WKQ5oz_YdYbS74M5IA" \
  --name cs153 --title "Frontier Systems" --university Stanford

# 5. Process all lectures
learn ingest cs153 --auto

# 6. Read the notes
learn notes cs153 1

# 7. Track your progress
learn watch cs153 1 --confidence high
learn progress
```

## CLI Commands

### Course Management

```bash
learn add <playlist-url> --name <name>     # Add a course from a YouTube playlist
learn status [course]                       # Show processing status per lecture
learn refresh <course>                      # Check playlist for new lectures
```

### Content Processing

```bash
# Process from YouTube
learn process <youtube-url> --course <name>  # Single video
learn ingest <course> --auto                 # All pending lectures, fully automated
learn ingest <course> --review               # Pause for editor review after each
learn ingest <course> --lectures 3-7         # Process a specific range
learn ingest <course> --skip 5,8             # Skip problematic lectures

# Process from external files (Coursera, edX, conference talks)
learn import ./transcript.srt --course cs229 --title "Gradient Descent"

# Modes
learn process <url> --course <name> --transcribe-only   # No API key needed
learn ingest <course> --provider gemini                  # Override provider
```

### Reading & Discovery

```bash
learn notes <course> [lecture-id]             # View AI-generated notes
learn transcript <course> <lecture-id>        # View raw transcript
learn search "attention mechanism"            # Search across everything
learn search --concept "RLHF"                # Search concept index only
learn search --course cs153 "scaling"         # Scoped to one course
learn ask <course> <id> "What did they say about inference cost?"
```

### Knowledge Graph

```bash
learn graph build     # Merge all concepts, generate Obsidian vault + D3.js viz
learn graph serve     # Open interactive graph in browser
learn graph "query"   # Search concepts in terminal
```

### Learning Progress

```bash
# Track what you've watched
learn watch cs153 1                          # Mark as watched (default: medium confidence)
learn watch cs153 1 --confidence high        # Set confidence: none, low, medium, high
learn watch cs153 2 --revisit                # Flag for later review
learn watch cs153 1 --note "Key insight..."  # Add a personal note
learn watch cs153 1 --unwatch                # Undo

# Review your learning
learn progress                               # Visual dashboard per course
learn review                                 # Show low-confidence + flagged lectures
learn review --course cs153                  # Scoped to one course
```

**Example `learn progress` output:**
```
📊 Learning Progress

  CS153 Frontier Systems
  ████░░░░░░░░░░░░░░░░ 2/11 watched (18%)
  1 confident | 1 to revisit

Overall: 2/11 lectures watched (18%)
```

### Personal Annotations

```bash
learn annotate cs153 3    # Open annotations.md in your editor
```

Creates a `annotations.md` file in the lecture directory with a template for your personal notes. This file is **never overwritten** by the pipeline — it's your space. Includes sections for: My Takeaways, Questions I Have, Connections I See, Things to Revisit.

### Cross-Course Synthesis ⭐

The killer feature — no other tool can do this because no other tool has structured notes from 10+ courses simultaneously.

```bash
learn synthesize "transformers"
learn synthesize "scaling laws" --provider claude
```

This command:
1. Searches all processed lectures across all courses for content related to the topic
2. Collects relevant concept files from the knowledge graph
3. Sends everything to an LLM to generate a structured synthesis

**The output includes:**
- **Coverage Map** — which courses/lectures cover this topic and how deeply
- **Key Perspectives** — what each source says, synthesized by theme
- **Areas of Agreement** — where sources align
- **Areas of Disagreement** — where sources differ or conflict
- **Recommended Learning Order** — optimal sequence across courses
- **Knowledge Gaps** — what aspects aren't covered by any of your courses

Output is saved to `courses/synthesis/<topic>.md`.

## How It Works

### Processing Pipeline (per lecture)
```
1. Detect duration  → Check if video exceeds 90-minute transcription limit
2. Transcribe       → Primary: usetranscribe.io | Fallback: yt-dlp captions
3. Normalize        → Convert to timestamped plain text (source-agnostic)
4. Analyze (Call 1) → LLM generates structured markdown notes
5. Analyze (Call 2) → LLM extracts concepts via structured JSON
6. Write            → Save transcript.txt, notes.md, concepts.yaml
```

### Smart Resume

The pipeline tracks state at every stage. If interrupted:

| What exists | What happens on re-run |
|---|---|
| Nothing | Full pipeline from scratch |
| `transcript.txt` only | Skip transcription, just run LLM analysis |
| `transcript.txt` + `notes.md` | Skipped entirely (use `--force` to redo) |
| Stuck in `transcribing`/`analyzing` | Retried automatically |

### Two State Tracks

The system maintains separate state for the **tool** and the **learner**:

| Field | Tracks | Example |
|---|---|---|
| `status: completed` | Pipeline state | "The tool finished processing" |
| `watched: true` | Learner state | "I watched this lecture" |
| `confidence: medium` | Learner state | "I somewhat understand it" |
| `revisit: true` | Learner state | "I need to come back to this" |

### Knowledge Graph

Concepts are extracted during ingestion and stored per-lecture. `learn graph build` merges them:
1. **Pass 1 — Exact matching**: normalized names + alias overlap → deterministic merge
2. **Pass 2 — Ambiguity detection**: near-duplicates logged to `merge-log.yaml`

Generates:
- **Obsidian vault** — `knowledge-graph/concepts/*.md` with `[[wiki-links]]`
- **Interactive graph** — `knowledge-graph/index.html` (D3.js force-directed layout)

## Project Structure

```
courses/
  cs153/
    course.yaml                  # Metadata, lecture list, pipeline + learner state
    lectures/
      01-jensen-huang/
        transcript.txt           # Timestamped plain text
        notes.md                 # AI-generated structured notes
        concepts.yaml            # Extracted concepts + relations
        annotations.md           # Personal notes (never overwritten)
  synthesis/
    transformers.md              # Cross-course synthesis documents

knowledge-graph/
  concepts/                      # Obsidian-compatible concept files
  graph.json                     # Machine-readable graph data
  index.html                     # Interactive D3.js visualization
  concept-index.txt              # Flat concept name index
```

## Configuration

```bash
# .env — set at least one API key, or use transcribe-only mode
ANTHROPIC_API_KEY=sk-ant-...       # For Claude (Haiku/Sonnet/Opus)
GEMINI_API_KEY=your-key-here       # For Gemini (free tier available!)
LLM_PROVIDER=gemini                # Optional: force a provider (auto-detected by default)
```

```yaml
# learn.yaml (optional, committed to repo)
defaults:
  provider: gemini
  editor: code                     # Editor for --review and annotate
  model: gemini-2.5-flash          # Model override
  max_concurrent_transcriptions: 2
```

### LLM Provider Selection

Auto-detected from available API keys:

| Keys available | Default provider | Notes |
|---|---|---|
| Both | Claude | Set `LLM_PROVIDER=gemini` to prefer Gemini |
| Only Anthropic | Claude | |
| Only Gemini | Gemini | **Free tier: 20 requests/day/model** |
| Neither | None | Transcribe-only mode — saves transcripts, no notes |

Override per-command with `--provider claude|gemini|none` or `--transcribe-only`.

### Cost Optimization

| Provider | Model | Cost per lecture | Best for |
|---|---|---|---|
| Gemini | gemini-2.5-flash | **Free** (free tier) | Batch processing entire courses |
| Claude | claude-haiku-4-5 | ~$0.03 | Cost-effective summarization |
| Claude | claude-sonnet-4-6 | ~$0.25 | Higher quality notes |

**Strategy:** Use `--provider gemini` for bulk ingestion, `learn ask --provider claude` for deep Q&A.

## Requirements

- **Node.js 22+**
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** (for fallback transcription): `brew install yt-dlp`
- **At least one API key** (Anthropic or Google), OR use `--transcribe-only` mode

## Roadmap

See `docs/plans/2026-06-09-phase4-plan.md` for the full roadmap. Upcoming:

- **Export** — Anki flashcards, PDF study guides, topic-scoped markdown
- **Quiz Generation** — Auto-generated questions from lecture content
- **"What's Next?"** — AI-powered study session recommendations
- **Lecture Comparison** — Side-by-side perspective analysis
- **Concept Dependencies** — Learning path DAGs from prerequisite relations

## License

MIT
