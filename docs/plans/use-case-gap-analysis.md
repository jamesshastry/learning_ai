# Use Case Gap Analysis: Learning AI as a Multi-Course Study System

**Date:** 2026-06-09
**Perspective:** A learner taking 10-15 online AI courses simultaneously
**Scope:** What the tool covers, what it misses, and what would make it transformative

---

## Confirmed Covered (things the tool does well)

### 1. Lecture-level ingestion and note generation
The core pipeline — transcribe a YouTube lecture, generate structured notes with TL;DR / key takeaways / detailed sections / timestamps / quotes — is solid. The notes format is well-designed for review: someone can skim the TL;DR to decide if a lecture is relevant, then drill into timestamped sections. The two-call Claude strategy (text for notes, tool_use for concepts) is the right architecture choice.

### 2. Multi-course organization
The `courses/` directory structure with per-course `course.yaml` and per-lecture directories provides a clean mental model. `learn status` gives a quick dashboard across courses. The data model supports the 10-15 course scenario without confusion about where things live.

### 3. Cross-course concept linking via knowledge graph
The concept extraction + merge algorithm + Obsidian-compatible concept files is the system's most distinctive feature. A concept like "Transformer Architecture" appearing in 5 different courses with different perspectives is exactly what a multi-course learner needs. The wiki-link format (`[[Concept Name]]`) means notes are naturally interlinked.

### 4. Full-text search across all content
`learn search "attention mechanism"` scanning all notes, transcripts, and concepts across all courses addresses the "where did I hear about X?" problem. Concept-scoped search (`--concept`) adds a useful second dimension.

### 5. Lecture Q&A with full context
`learn ask cs153 3 "What did the speaker say about inference cost?"` with the full transcript as Claude context is genuinely useful for post-lecture review. This is better than re-watching a 75-minute video to find one point.

### 6. Fallback transcription for long/unavailable videos
The yt-dlp fallback with quality tracking (`transcript_source` field) means the system degrades gracefully rather than failing. This matters for courses with 2-hour lectures (common in MIT OCW, Berkeley webcasts).

### 7. Cost-aware provider selection
The Gemini free tier for bulk ingestion + Claude for deep Q&A pattern is practical for a learner processing hundreds of lectures. The `--provider` flag and auto-detection make this easy to manage.

---

## Critical Gaps (things a learner definitely needs)

### 1. No "what should I watch next?" workflow
**The problem:** A learner with 10 courses and 8-12 pending lectures across them has no way to decide what to watch next. The system tracks `pending` status but provides no prioritization, sequencing, or recommendation.

**What a learner actually does:**
- Check which courses have assignments due soon
- Look for topical overlap (e.g., "I'm studying transformers this week, which courses cover that next?")
- Balance breadth (don't fall too far behind in any course) vs. depth (binge one course for a project)
- Follow prerequisite chains (lecture 7 assumes you watched lecture 6)

**What the tool should provide:**
- A unified view of pending lectures across all courses, sortable by date added, course, or topic
- A `learn next` command that surfaces the highest-priority unwatched lecture based on configurable criteria
- Tagging lectures with topics so cross-course "study sessions" can be assembled (e.g., "show me all pending lectures about reinforcement learning")

### 2. No personal progress or comprehension tracking
**The problem:** The system tracks whether a lecture has been *processed* (transcribed + notes generated), but not whether the learner has *watched* or *understood* it. Processing status is about the tool's pipeline, not the learner's journey.

**What a learner actually does:**
- Mark lectures as watched, partially watched, or skipped
- Rate their own understanding (strong / shaky / need to revisit)
- Track time spent per course
- Review weak areas before exams

**What the tool should provide:**
- A `watched` status separate from `completed` (processing status)
- Personal annotations: confidence level, "revisit" flags, personal notes appended to AI-generated notes
- `learn review` command that surfaces lectures where the learner flagged low confidence
- Simple time tracking: when did I watch this, how long ago was that

### 3. No support for non-YouTube content
**The problem:** Real AI courses involve much more than YouTube lectures. The system is entirely YouTube-centric. The pipeline begins with a playlist URL and the transcription services only handle YouTube videos.

**What actual courses include:**
- PDF slides (nearly every university course)
- Academic papers (assigned readings in ML/AI courses)
- Coursera/edX videos with their own transcript formats (SRT, not YouTube)
- Jupyter notebooks and code assignments
- Textbook chapters (e.g., Goodfellow's Deep Learning book)
- Conference talks that aren't in playlists (individual NeurIPS/ICML videos)

**Minimum viable fix:**
- Support adding individual YouTube URLs that aren't part of a playlist (partially addressed by `learn process <url>`)
- Support importing a pre-existing transcript file (SRT, VTT, or plain text) for non-YouTube sources
- Support adding PDF slide decks as supplementary material linked to a lecture
- A `readings/` directory per course for papers and supplementary material with basic metadata

### 4. No spaced repetition or active recall
**The problem:** The system generates excellent reference material but does nothing to help the learner *retain* it. Research on learning science consistently shows that passive review (re-reading notes) is far less effective than active recall (testing yourself) and spaced repetition (reviewing at increasing intervals).

**What a learner needs:**
- Auto-generated quiz questions from lecture content (flashcard-style)
- Spaced repetition scheduling: surface old concepts at optimal review intervals
- A way to distinguish "I read the notes" from "I can explain this concept"

**Why this matters for multi-course learning:**
With 10-15 courses, the volume of material makes it impossible to retain everything through passive review alone. After 3 weeks, the learner has forgotten most of the details from early lectures unless they actively review. The system currently has all the raw material (concepts, definitions, key points) to generate high-quality quiz cards automatically.

### 5. No export or sharing capability
**The problem:** The system is a single-user, local-only tool. There is no way to share notes, study guides, or the knowledge graph with study partners, publish summaries, or export content to other tools.

**What learners do in practice:**
- Share notes with classmates
- Create study guides for exam prep (combining notes from multiple lectures)
- Export to Notion, Google Docs, or Anki
- Post summaries to course discussion forums
- Collaborate on a shared knowledge graph

**What the tool should provide:**
- `learn export` — generate a clean markdown or PDF study guide for a topic, lecture, or course
- Anki deck export from concepts (name = front, definition = back, with tags)
- The Obsidian vault in `knowledge-graph/concepts/` is already somewhat shareable, but there's no documentation on how to use it collaboratively

---

## High-Value Additions (would significantly accelerate learning)

### 1. Cross-course topic synthesis command
**Use case:** "Show me everything all my courses say about transformers."

`learn search "transformers"` returns raw search hits. What the learner actually wants is a synthesized view:
- Which courses cover this topic, and in which lectures?
- What perspective does each source bring? (e.g., CS153's Jensen Huang talks about GPU optimization for transformers; CS229 covers the math of attention)
- Where do sources agree or disagree?
- What's the recommended reading order across courses?

A `learn synthesize "transformers"` command could use Claude with all relevant concept files and notes sections as context to produce a cross-course synthesis document. This is the tool's unique value proposition — no other tool can do this because no other tool has structured notes from 10+ courses.

### 2. Lecture comparison and contrast
**Use case:** "Compare what Jensen Huang and Sam Altman say about scaling."

The data already exists in the notes and concepts. What's missing is a command that takes two or more lectures and produces a comparison: shared themes, different perspectives, contradictions, and complementary points. This is especially valuable in a course like CS153 where each guest speaker brings their own viewpoint on overlapping topics.

### 3. Study session planning
**Use case:** "I have 3 hours tonight. Build me a study plan."

Given: available time, current progress across courses, upcoming deadlines (if tracked), and topic goals. The system could recommend which lectures to watch, which notes to review, and which concepts to quiz on. This requires the progress tracking from Critical Gap #2 plus some scheduling logic.

### 4. Concept dependency visualization
The knowledge graph currently shows concept relationships (related_to, enables, part_of, prerequisite_for). But it doesn't surface *learning dependencies*: "You should understand X before watching Lecture Y." Mining the `prerequisite_for` relations and lecture ordering could generate a suggested learning path — a personal curriculum that respects prerequisites across courses.

### 5. Incremental knowledge graph updates
Currently, `learn graph build` rebuilds the entire graph from scratch. As the system scales to 200+ lectures across 15 courses, this becomes slow and opaque. Incremental updates — adding new concepts from a freshly processed lecture without rebuilding everything — would make the graph feel alive rather than a periodic batch job.

### 6. Lecture-level tagging and filtering
The system extracts concepts and tags per lecture, but there's no way to filter lectures by topic across courses. A learner should be able to say `learn lectures --tag reinforcement-learning` and get a list of all lectures across all courses that discuss RL, sorted by depth or relevance.

### 7. Personal annotations layer
The AI-generated notes are read-only in practice — editing them means they'll be overwritten on reprocessing. A separate `annotations.md` or a personal notes section appended below a delimiter would let learners add their own insights, questions, corrections, and connections without conflicting with the generated content.

---

## Nice-to-Have (useful but not essential)

### 1. Course website scraping for supplementary materials
The design doc correctly deferred this (course websites vary too much). But a semi-manual workflow — `learn add-reading cs153 3 "https://arxiv.org/abs/1706.03762" --title "Attention Is All You Need"` — would let learners manually link readings to lectures without trying to auto-scrape anything.

### 2. Obsidian plugin integration
The knowledge graph already generates Obsidian-compatible files. A lightweight Obsidian plugin that understands the `learning-ai` directory structure could provide: a course status dashboard, a "random concept review" button, and direct links from concept files back to the YouTube timestamp. This leverages Obsidian's existing graph view instead of building a custom D3.js visualization from scratch.

### 3. Mobile-friendly review mode
A learner reviewing notes on their phone (commute, waiting room) needs a different format than the terminal CLI. A static site generator that builds a browseable HTML site from all notes and concepts — similar to what `learn graph serve` does for the graph but for the full corpus — would make the content accessible anywhere.

### 4. Transcript correction workflow
YouTube auto-captions and even Whisper transcripts contain errors, especially with technical terms (e.g., "CUDA" transcribed as "kuda," model names mangled). A `learn correct cs153 3` command that opens the transcript alongside the notes for manual correction would improve downstream note quality for important lectures.

### 5. Audio/video bookmarking
When watching a lecture, learners often want to bookmark a moment: "come back to this at 23:45." A `learn bookmark cs153 3 23:45 "great explanation of backprop"` command that stores bookmarks in a per-lecture file and surfaces them in notes or review would bridge the gap between passive watching and active engagement.

### 6. Diff-based note updates
When a lecture is reprocessed (e.g., with a better model or after transcript correction), the current system overwrites notes.md entirely. Showing a diff of what changed — especially in key takeaways and concepts — would let the learner evaluate whether the reprocessing improved quality.

### 7. Multi-language support
Many AI courses and conference talks are in languages other than English, or have English auto-captions with heavy accents that degrade quality. Supporting non-English transcripts and optional translation would expand the tool's reach significantly.

### 8. Calendar integration for course schedules
Some courses release lectures on a schedule (e.g., new CS153 lecture every Tuesday). Tracking release dates and surfacing "new lecture available" notifications would keep the learner's queue current.

---

## Recommended Priority Order

Prioritized by impact on the core use case (someone managing 10-15 AI courses) relative to implementation effort:

### Tier 1 — Build now (high impact, reasonable effort)
1. **Personal progress tracking** (Critical Gap #2) — Add `watched`, `confidence`, and `revisit` fields to course.yaml per lecture. Add `learn watch cs153 3 --confidence medium` and `learn review --low-confidence`. This is a small data model change with large workflow impact.
2. **Non-YouTube transcript import** (Critical Gap #3, partial) — Add `learn process --transcript ./my-transcript.srt --course cs229` to accept external transcript files. This unblocks Coursera, edX, and conference talk ingestion with minimal pipeline changes (skip transcription, go straight to normalize + analyze).
3. **Personal annotations layer** (High-Value #7) — Add a `## My Notes` section below a delimiter (`---` or `<!-- personal notes below -->`) in notes.md that is preserved on reprocessing. Alternatively, a separate `annotations.md` per lecture.
4. **Cross-course topic synthesis** (High-Value #1) — `learn synthesize "transformers"` that collects all concept files and note sections mentioning the query, sends them to Claude, and produces a cross-course synthesis. This is the tool's killer feature.

### Tier 2 — Build next (high impact, more effort)
5. **"What's next?" prioritization** (Critical Gap #1) — `learn next` command with unified pending view. Requires topic tagging and some heuristic or user-configured prioritization logic.
6. **Lecture comparison** (High-Value #2) — `learn compare cs153/01 cs153/04` producing a structured comparison of perspectives. Uses existing data, just needs a new prompt template and CLI command.
7. **Anki/flashcard export** (Critical Gap #4, partial) — `learn export --anki cs153` that converts concepts into Anki-importable CSV or APKG format. This gets spaced repetition without building a custom SRS engine.
8. **Export to markdown/PDF** (Critical Gap #5) — `learn export --format md --topic "scaling laws"` that produces a clean study guide.

### Tier 3 — Build when core is solid (medium impact)
9. **Quiz generation from lectures** (Critical Gap #4, full) — Generate multiple-choice and short-answer questions from lecture content, track which the learner got right, surface weak areas.
10. **Concept dependency learning paths** (High-Value #4) — Mine prerequisite_for relations to suggest learning order across courses.
11. **Incremental graph updates** (High-Value #5) — `learn graph update` that adds new lectures without full rebuild.
12. **Lecture tagging and filtering** (High-Value #6) — `learn lectures --tag transformers` across all courses.
13. **Add-reading command** (Nice-to-Have #1) — Simple metadata linking for papers and slides.

### Tier 4 — Polish and extend (lower priority)
14. **Static site generation for mobile review** (Nice-to-Have #3)
15. **Obsidian plugin** (Nice-to-Have #2)
16. **Transcript correction workflow** (Nice-to-Have #4)
17. **Audio/video bookmarking** (Nice-to-Have #5)
18. **Diff-based note updates** (Nice-to-Have #6)
19. **Study session planner** (High-Value #3) — Depends on progress tracking and scheduling logic; high value but high effort

---

## Summary

The tool's current strengths — automated transcription, AI-powered note generation, concept extraction, and cross-course knowledge graph — address the **volume** and **discovery** bottlenecks well. The biggest gaps are around the **learner's own journey**: the system knows what the lectures contain but not what the learner has understood, what they should study next, or how to help them retain material over time. The recommended Tier 1 items (progress tracking, transcript import, annotations, cross-course synthesis) would transform this from a content processing pipeline into an actual learning acceleration system.
