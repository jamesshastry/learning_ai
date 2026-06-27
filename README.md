# Learning AI 🧠

Personal learning acceleration system for AI courses. Transcribe YouTube lectures, generate structured notes, extract concepts, build a knowledge graph, and track your learning progress — all from the command line.

**🌐 [Browse the live site →](https://jamesshastry.github.io/learning_ai/)** — search notes, take quizzes, and explore the knowledge graph right in your browser. Auto-deployed from `main` via GitHub Pages.

**35 commands** covering the full learning lifecycle: ingest → study → review → synthesize → export.

## Features

### Content Processing
- **📝 Automated Notes** — Transcribe lectures and generate structured notes with Claude or Gemini
- **🔄 Multi-Source Ingestion** — YouTube playlists, channels, individual videos, or external transcript files (SRT, VTT, TXT)
- **🔗 Knowledge Graph** — Obsidian-compatible concept files with `[[wiki-links]]` + interactive D3.js visualization
- **🔍 Full-Text Search** — Search across all notes, transcripts, and concepts
- **❓ Lecture Q&A** — Ask questions about a single lecture, entire course, or across all courses

### Learning Workflow
- **📊 Progress Tracking** — Track watched status, confidence levels, and revisit flags per lecture
- **🔬 Cross-Course Synthesis** — Generate synthesis documents that connect ideas across all your courses *(the killer feature)*
- **⚖️ Lecture Comparison** — Compare perspectives across speakers and courses
- **✏️ Personal Annotations** — Add your own notes per lecture that survive reprocessing
- **🔖 Bookmarks** — Save timestamps with clickable YouTube deep-links
- **📋 Review System** — Surface lectures you're shaky on or flagged for revisit
- **🎯 Study Planning** — Time-boxed study session builder + "what's next?" recommendations

### Export & Active Recall
- **📇 Anki Export** — Concepts → flashcards with definitions, relations, and sources
- **📝 Quiz Mode** — Interactive quiz with progressive answer reveal
- **🌐 Static Site** — Generate a mobile-friendly HTML site from all notes
- **📦 Obsidian Vault** — One-command setup with dashboard + random review notes

### Infrastructure
- **🤖 Multi-Provider** — Claude, Gemini (free tier!), or transcribe-only mode with no API key
- **💰 Cost-Aware** — Use free Gemini for bulk processing, Claude for deep Q&A
- **🔄 Smart Resume** — Interrupted runs pick up where they left off; transcripts survive LLM failures
- **🛡️ Fallback Transcription** — Falls back to yt-dlp auto-captions for long videos or service outages
- **🌍 Multi-Language** — Translate notes and transcripts to any language
- **📅 Schedule Tracking** — Track course release schedules, check for new lectures

## Quick Start

```bash
# 1. Install and build
npm install && npm run build

# 2. Set up your API key (get a free Gemini key at https://aistudio.google.com/apikey)
cp .env.example .env
# Edit .env — add at least GEMINI_API_KEY or ANTHROPIC_API_KEY

# 3. Link the CLI globally
npm link

# 4. Add a course (playlist, channel, or single video)
learn add "https://www.youtube.com/playlist?list=PLoROMvodv4rN..." \
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
# Add a course from various YouTube sources
learn add <playlist-url> --name <name>              # From a playlist
learn add <channel-url> --name <name>               # From a channel (e.g., @MSE435EconomicsofAI)
learn add <video-url> --name <name>                 # From a single video
learn add --name <name> --empty                     # Empty course (add videos manually)

# Manage courses
learn add-video <course> <youtube-url>              # Add a single video to existing course
learn status [course]                               # Show processing status per lecture
learn refresh <course>                              # Check playlist/channel for new lectures
learn remove <course> <lecture-id>                  # Remove a lecture
learn remove <course> <id> --keep-files             # Remove from YAML only
```

### Content Processing

```bash
# Process from YouTube
learn process <youtube-url> --course <name>         # Single video, on-demand
learn ingest <course> --auto                        # All pending lectures, fully automated
learn ingest <course> --review                      # Pause for editor review after each
learn ingest <course> --lectures 3-7                # Process a specific range
learn ingest <course> --lectures 3,5,8              # Process specific lectures
learn ingest <course> --skip 5,8                    # Skip problematic lectures

# Process from external files (Coursera, edX, conference talks)
learn import ./transcript.srt --course cs229 --title "Gradient Descent"
learn import ./lecture.vtt --course cs229 --title "Backpropagation"

# Reprocess and correct
learn correct <course> <id>                         # Open transcript in editor for correction
learn correct <course> <id> --show-diff             # Show what you changed
learn reprocess <course> <id>                       # Regenerate notes with diff preview
learn reprocess <course> <id> --dry-run             # Preview changes without saving
learn reprocess <course> <id> --provider claude     # Reprocess with a different model

# Translation
learn translate <course> <id> --to Spanish          # Translate notes to another language
learn translate <course> <id> --source transcript   # Translate the transcript instead

# Modes
learn process <url> --course <name> --transcribe-only   # No API key needed
learn ingest <course> --provider gemini                  # Override provider
```

### Reading & Discovery

```bash
# View content
learn notes <course> [lecture-id]                   # View AI-generated notes
learn transcript <course> <lecture-id>              # View raw transcript

# Search
learn search "attention mechanism"                  # Search across everything
learn search --concept "RLHF"                      # Search concept index only
learn search --course cs153 "scaling"               # Scoped to one course

# Q&A (single lecture, whole course, or cross-course)
learn ask <course> <id> "What did they say about inference cost?"
learn ask <course> "Compare all speakers' views on scaling"
learn ask <course> --all "What is the consensus on GPU vs custom silicon?"

# Synthesis & comparison
learn synthesize "transformers"                     # Cross-course synthesis (the killer feature)
learn compare cs153/01 cs153/04                     # Compare two lectures
learn compare cs153/01 mse435/03                    # Compare across courses
```

### Knowledge Graph

```bash
learn graph build                                   # Full rebuild from all concepts.yaml
learn graph update                                  # Incremental (only if concepts changed)
learn graph serve                                   # Open interactive D3.js graph in browser
learn graph deps "Transformer Architecture"         # Show prerequisite chain
learn graph "attention"                             # Search concepts in terminal
```

### Learning Progress

```bash
# Track what you've watched
learn watch <course> <id>                           # Mark as watched (default: medium confidence)
learn watch <course> <id> --confidence high         # Confidence: none, low, medium, high
learn watch <course> <id> --revisit                 # Flag for later review
learn watch <course> <id> --note "Key insight..."   # Add a personal note
learn watch <course> <id> --unwatch                 # Undo

# Review & plan
learn progress                                      # Visual dashboard per course
learn review                                        # Show low-confidence + flagged lectures
learn review --course cs153                         # Scoped to one course
learn next                                          # Suggest the next lecture to watch
learn next --focus "transformers"                   # Focus on a topic
learn plan --hours 2                                # Build a 2-hour study session
learn plan --hours 3 --focus "infrastructure"       # Topic-focused plan
```

**Example outputs:**

```
📊 Learning Progress                         🎯 Recommended Next:

  CS153 Frontier Systems                     👉 Ben Horowitz — Venture Capital Systems (66 min)
  ████░░░░░░░░░░░░░░░░ 2/11 (18%)              CS153 · notes ready, next in sequence
  1 confident | 1 to revisit
                                               2. Class #1 | Economics of AI (50 min)
  MSE435 Economics of the AI Supercycle           MSE435 · only 0% through this course
  ░░░░░░░░░░░░░░░░░░░░ 0/6 (0%)
```

### Annotations, Bookmarks & Resources

```bash
# Personal annotations (never overwritten by pipeline)
learn annotate <course> <id>                        # Open annotations.md in your editor

# Bookmarks with YouTube deep-links
learn bookmark <course> <id> 23:45 "great point"   # Save a timestamp
learn bookmark <course> <id> --list                 # List all bookmarks for a lecture

# Topic tags
learn tag <course> <id>                             # View auto-derived tags from concepts
learn tag <course> <id> --add "gpu,hardware"        # Add manual tags
learn lectures --tag transformers                   # Filter across all courses by tag
learn lectures --tag safety --unwatched             # Unwatched lectures about safety

# Course readings and resources
learn add-reading <course> --title "Attention Is All You Need" \
  --url "https://arxiv.org/abs/1706.03762" --type paper --lecture 3
learn readings [course]                             # List all linked resources

# Course schedules
learn schedule <course> --day Tuesday --time "12:00 PM"
learn due                                           # Check for new lectures today
```

### Web Interface

The full knowledge base is available as a static site with search, quizzes, and an interactive knowledge graph.

**Live on GitHub Pages:** [jamesshastry.github.io/learning_ai](https://jamesshastry.github.io/learning_ai/)
Auto-deployed on every push to `main` via GitHub Actions.

**Run locally** (for AI-powered Q&A via `/api/ask`):

```bash
learn site                                          # Generate the static site
learn serve                                         # Start local server at http://localhost:3000
```

The floating ⚡ toolbar (bottom-right) has three tabs: **Search**, **Quiz**, and **Ask**. Search and Quiz work on the hosted site; Ask requires the local server with an API key configured.

### Export & Active Recall

```bash
# Export
learn export <course> --format anki                 # Concepts → Anki flashcards
learn export <course> --format md                   # Full course as markdown study guide
learn export --topic "RLHF" --format md             # Topic-scoped guide across courses
learn export <course> <id> --format md              # Single lecture export

# Quiz (interactive, in terminal)
learn quiz <course> <id>                            # Quiz from one lecture
learn quiz <course>                                 # Quiz across entire course
learn quiz --topic "attention"                      # Topic-scoped quiz

# Obsidian integration
learn obsidian                                      # Configure as Obsidian vault
```

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

The pipeline tracks state at every stage. Transcripts are written to disk *before* the LLM analysis stage, so they survive API failures without re-transcription.

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

### Cross-Course Synthesis ⭐

The killer feature — no other tool can do this because no other tool has structured notes from 10+ courses simultaneously.

`learn synthesize "transformers"` collects all relevant content across every course and produces:
- **Coverage Map** — which courses/lectures cover this topic and how deeply
- **Key Perspectives** — what each source says, synthesized by theme
- **Areas of Agreement/Disagreement** — where sources align or conflict
- **Recommended Learning Order** — optimal sequence across courses
- **Knowledge Gaps** — what aspects aren't covered by any of your courses

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
        notes.md                 # AI-generated structured notes (YAML frontmatter + markdown)
        concepts.yaml            # Extracted concepts + relations
        annotations.md           # Personal notes (never overwritten)
  mse435/
    course.yaml                  # Supports playlists, channels, or manual videos
    lectures/
      ...
  synthesis/
    transformers.md              # Cross-course synthesis documents

papers/                          # Seminal AI papers in OKF-inspired format
  index.md                       # Hub page — chronological paper listing
  foundations/                   # Architecture breakthroughs (AlexNet, ResNet, Transformer, GAN)
  scaling/                       # Scaling philosophy & laws (Bitter Lesson, Kaplan et al.)
  language-models/               # LLM lineage (BERT → GPT-3 → InstructGPT → Constitutional AI)
  agents/                        # Agentic AI (CoT, ReAct, RAG)
  reinforcement-learning/        # RL foundations (DQN)

knowledge-graph/
  concepts/                      # Obsidian-compatible concept files
  graph.json                     # Machine-readable graph data
  index.html                     # Interactive D3.js visualization
  concept-index.txt              # Flat concept name index

site/                            # Generated static HTML site (gitignored)
```

### Paper Format (OKF-inspired)

Papers use [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)-inspired markdown: **YAML frontmatter** (type, title, authors, year, venue, tags) + **markdown body** (summary, key contributions, connections). Papers cross-link to each other and to course lectures via standard markdown links, forming an implicit knowledge graph alongside the explicit concept graph.

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
  editor: code                     # Editor for --review, annotate, correct
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

**Strategy:** Use `--provider gemini` for bulk ingestion, `learn ask --provider claude` for deep Q&A, `learn reprocess` with a better model for important lectures.

## Requirements

- **Node.js 22+**
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** (for fallback transcription): `brew install yt-dlp`
- **At least one API key** (Anthropic or Google), OR use `--transcribe-only` mode

## License

MIT
