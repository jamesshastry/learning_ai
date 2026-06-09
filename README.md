# Learning AI 🧠

Personal learning acceleration system for AI courses. Transcribe YouTube lectures, generate structured notes, extract concepts, and build a connected knowledge graph across all your courses.

## Features

- **📝 Automated Notes** — Transcribe lectures via [usetranscribe.io](https://www.usetranscribe.io) and generate structured notes with Claude AI
- **🔍 Search** — Full-text search across all notes, transcripts, and concepts
- **🔗 Knowledge Graph** — Obsidian-compatible concept files with wiki-links + interactive D3.js visualization
- **❓ Q&A** — Ask questions about any lecture using Claude with the transcript as context
- **📋 Three Ingestion Modes** — Fully automated, review-as-you-go, or on-demand single videos
- **🔄 Fallback Transcription** — Falls back to yt-dlp auto-captions when primary service is unavailable or videos exceed 90 minutes

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build
npm run build

# 3. Set up your API key
cp .env.example .env
# Edit .env with your Anthropic API key

# 4. Link CLI globally
npm link

# 5. Add a course
learn add "https://www.youtube.com/playlist?list=PLoROMvodv4rN447WKQ5oz_YdYbS74M5IA" \
  --name cs153 \
  --title "Frontier Systems" \
  --university Stanford \
  --website "https://cs153.stanford.edu/"

# 6. Process a single lecture
learn process "https://www.youtube.com/watch?v=VIDEO_ID" --course cs153

# 7. Or process all lectures at once
learn ingest cs153 --auto
```

## CLI Commands

### Course Management
```bash
learn add <playlist-url> --name <name>    # Add a course from a YouTube playlist
learn status [course]                      # Show processing status
```

### Processing
```bash
learn process <youtube-url> --course <name>  # Process a single video
learn ingest <course> --auto                 # Process all pending lectures
learn ingest <course> --review               # Process with editor review
```

### Reading & Search
```bash
learn notes <course> [lecture-id]    # View notes for a lecture
learn transcript <course> <id>       # View raw transcript
learn search "query"                 # Search across all content
learn search --concept "RLHF"       # Search concepts only
learn ask <course> <id> "question"   # Ask about a lecture
```

### Knowledge Graph
```bash
learn graph build    # Build graph from all extracted concepts
learn graph serve    # Open interactive visualization in browser
learn graph "query"  # Search concepts in terminal
```

## How It Works

### Pipeline (per lecture)
```
1. Detect duration → Check if video exceeds 90-minute transcription limit
2. Transcribe     → Primary: usetranscribe.io | Fallback: yt-dlp captions
3. Normalize      → Convert to timestamped plain text
4. Analyze        → Claude API generates notes + extracts concepts
5. Write          → Save transcript.txt, notes.md, concepts.yaml
```

### Knowledge Graph
Concepts are extracted during ingestion and stored per-lecture. `learn graph build` merges them using a two-pass algorithm (exact matching + ambiguity detection) and generates:
- **Obsidian vault** — `knowledge-graph/concepts/*.md` with `[[wiki-links]]`
- **Interactive graph** — `knowledge-graph/index.html` (D3.js force-directed layout)

## Project Structure

```
courses/                     # One directory per course
  cs153/
    course.yaml              # Metadata, lecture list, status
    lectures/
      01-jensen-huang/
        transcript.txt       # Timestamped plain text
        notes.md             # AI-generated structured notes
        concepts.yaml        # Extracted concepts + relations
knowledge-graph/
  concepts/                  # Obsidian-compatible concept files
  graph.json                 # Machine-readable graph data
  index.html                 # Interactive D3.js visualization
  concept-index.txt          # Flat concept name index
```

## Configuration

```bash
# .env — set at least one API key, or use transcribe-only mode
ANTHROPIC_API_KEY=sk-ant-...       # For Claude (Haiku/Sonnet/Opus)
GEMINI_API_KEY=your-key-here       # For Gemini (free tier available!)
LLM_PROVIDER=gemini                # Optional: force a provider (auto-detected by default)

# learn.yaml (optional, committed)
defaults:
  provider: gemini                   # claude, gemini, or none
  editor: code                       # Editor for --review mode
  model: gemini-2.5-flash           # Model override (provider-specific)
  max_concurrent_transcriptions: 2
```

### LLM Provider Selection

The system auto-detects which provider to use based on available API keys:

| Keys available | Default provider | Notes |
|---|---|---|
| Both | Claude | Set `LLM_PROVIDER=gemini` to prefer Gemini |
| Only Anthropic | Claude | |
| Only Gemini | Gemini | **Free tier: 15 requests/minute** |
| Neither | None | Transcribe-only mode — saves transcripts, no notes |

Override per-command with `--provider claude|gemini|none` or `--transcribe-only`.

### Cost Optimization

| Provider | Model | Cost per lecture | Best for |
|---|---|---|---|
| Gemini | gemini-2.5-flash | **Free** (free tier) | Batch processing entire courses |
| Claude | claude-haiku-4-5 | ~$0.03 | Cost-effective summarization |
| Claude | claude-sonnet-4-6 | ~$0.25 | Higher quality notes |

**Tip:** Use `--provider gemini` for bulk ingestion, then `learn ask --provider claude` for deep Q&A on specific lectures.

## Requirements

- Node.js 22+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for fallback transcription): `brew install yt-dlp`
- At least one API key (Anthropic or Google), OR use `--transcribe-only` mode

## License

MIT
