VERDICT: NEEDS_REVISION

## Summary Assessment

The design is well-structured and the core pipeline is sound, but it has several critical gaps: it treats usetranscribe.io (a self-described "hobby project" with no SLA) as load-bearing infrastructure without a fallback plan, the knowledge graph merge strategy lacks detail on how to handle the hard cases that will dominate real-world use, and the phased plan has a dependency ordering problem where concept extraction is deferred to Phase 3 but should be captured from the start.

## Critical Issues (must fix)

### 1. Single-vendor dependency on usetranscribe.io with no fallback

The entire pipeline halts if usetranscribe.io goes down, changes its undocumented API, or starts requiring authentication. The AGENTS.md itself says: "No SLA" and "a hobby project." At 50 transcriptions/day with 200-300 lectures across 10-15 courses, you are looking at 4-6 days of sustained transcription at max throughput. If the service disappears mid-run or rate limits change, there is no alternative path.

**Fix:** Add a fallback strategy. Options include: (a) support YouTube's own auto-generated captions via `ytdl` or `yt-dlp` as a degraded-quality fallback, (b) support local Whisper transcription for when the service is unavailable, or (c) at minimum, document this as a known risk and design the transcript format so the source is swappable without changing downstream stages.

### 2. Concept extraction deferred to Phase 3 creates rework

Phase 1 generates structured notes. Phase 3 adds concept extraction. But the notes template in Phase 1 already includes a "Concepts Introduced" section with wiki-links like `[[GPU Architecture]]`. If you generate notes in Phase 1 without the concept extraction pipeline, those wiki-links will either be (a) hardcoded by Claude with no consistency guarantees, or (b) absent, requiring re-processing all lectures when Phase 3 lands. Either way, you pay the Claude API cost twice.

**Fix:** Move concept extraction into Phase 1. The summarize and extract prompts can run as a single call or back-to-back in the same pipeline step. The knowledge graph *visualization* can wait for Phase 3, but concept extraction and `concepts.yaml` generation should happen at ingestion time so you never need to re-process.

### 3. Knowledge graph merge/alias strategy is underspecified

The design says "Merges concepts with matching names/aliases (case-insensitive, alias-aware)" but this is where all the complexity lives and it gets one sentence. Real-world problems:

- **Near-duplicates:** "Reinforcement Learning from Human Feedback" vs "RLHF" vs "reward modeling" — are these the same concept, related concepts, or a parent-child relationship?
- **Context-dependent concepts:** "Attention" in a transformer context vs "Attention" in a cognitive science context.
- **Alias conflicts:** Two different concepts could share an alias.
- **Merge ordering:** When two `concepts.yaml` files define the same concept with conflicting definitions or different relationship sets, which wins?
- **Drift over time:** As you add more courses, concepts that seemed distinct may turn out to be the same, requiring retroactive merges.

**Fix:** Define a concrete merge algorithm. At minimum: (a) specify what constitutes a match (exact name match? any alias overlap?), (b) define conflict resolution rules (union of relationships? most recent definition wins?), (c) consider adding a `learn graph resolve` command for manual disambiguation of ambiguous merges, and (d) consider using Claude to assist with fuzzy merge decisions rather than pure string matching.

### 4. No handling for videos exceeding the 90-minute limit

The design acknowledges the 90-minute limit exists but has no strategy for handling it. While the CS153 playlist videos are all under 75 minutes, other courses (e.g., MIT OCW lectures, many conference talks) routinely run 90-120 minutes. A lecture at 91 minutes will fail silently or produce an error with no recovery path.

**Fix:** Add explicit handling: detect duration before transcribing (it is available in `ytInitialData`), warn the user, and either (a) skip with a clear message, (b) fall back to YouTube auto-captions, or (c) document a manual workflow (e.g., user provides their own transcript file).

### 5. Playlist scraping requires the permalink slug for cached transcript fetch

The design says to check cache via `/api/check`, which returns `{cached: true, permalink: "/yt/{id}/{slug}"}`. But then to fetch the actual transcript JSON, you need the full permalink path — `/yt/{id}?format=json` returns a 301 redirect to `/yt/{id}/{slug}?format=json`. The design does not mention this redirect behavior. If the HTTP client does not follow redirects (many Node.js `fetch` implementations do not follow redirects by default for non-GET or need explicit configuration), the cached transcript fetch will fail silently.

**Fix:** Document that the cached fetch URL must be constructed from the `/api/check` permalink response, not from the video ID alone. Or explicitly configure the HTTP client to follow 301 redirects. Add a test for this specific flow.

## Suggestions (nice to have)

### 1. CLI surface area is too large for MVP

Phase 1 lists 7+ commands. For a true MVP, you need exactly three: `learn add`, `learn process` (single video), and `learn notes`. The `learn ingest --auto` command (full playlist) is tempting to include early but involves concurrency management, rate limit tracking, and resume-on-failure — each of which is a meaningful engineering effort. Ship the single-video path first, prove the pipeline works end-to-end, then add batch processing.

### 2. Consider storing transcripts as plain text, not markdown

The design stores `transcript.md` but a raw transcript is not markdown — it is timestamped plain text. Calling it `.md` and putting it through markdown processing adds no value and may cause issues with markdown parsers interpreting transcript content (e.g., square brackets in timestamps, special characters in speech). Consider `transcript.txt` or keeping the raw JSON and generating markdown views on demand.

### 3. Course website scraping (Phase 2) will be fragile

The design includes `scraper.ts` for course website scraping. I verified that CS153's site is static HTML and scrapable. But course websites vary enormously: some use Canvas LMS, some are behind authentication, some are pure PDFs, some are React SPAs. This feature will require per-site custom logic that is expensive to maintain. Consider making it optional/manual rather than a pipeline stage.

### 4. `learn ask` via usetranscribe.io's `/ask` endpoint is a separate rate limit

The design lists `learn ask` as a Phase 2 feature that sends questions to usetranscribe.io's `/yt/{id}/ask` endpoint. The AGENTS.md confirms this has its own rate limit (50 questions/day/IP) separate from transcription. However, you already have the full transcript and Claude API access. Routing Q&A through usetranscribe.io adds another external dependency for something you can do locally with better results (you have the full context, not just one video). Consider implementing `learn ask` as a Claude API call with the transcript as context instead.

### 5. No data migration strategy

The `course.yaml` schema and `concepts.yaml` format will inevitably change as you iterate. There is no versioning or migration plan for when you need to update the schema across 200+ lecture directories. Consider adding a `version` field to `course.yaml` and a `learn migrate` command early.

### 6. The two-prompt strategy (summarize + extract) could be one prompt

Sending the transcript to Claude twice (once for notes, once for concepts) doubles API cost and adds latency. Consider combining them into a single prompt that outputs both structured notes and concept YAML in one response. Claude handles multi-format output well, and the transcript is the same input both times.

### 7. `raw.json` gitignored but critical for reprocessing

The design gitignores `raw.json` (the cached API response), which is the right call for repo size. But this file is described as critical for avoiding re-transcription on re-runs. If you lose it (new machine, fresh clone), you lose the ability to reprocess without re-transcribing, which burns your daily rate limit. Consider an optional local backup strategy or a `learn cache export/import` command.

### 8. YouTube playlist pagination for very large playlists

I verified that `ytInitialData` contains video IDs for playlists up to ~36 videos without issue. However, YouTube's server-rendered HTML does include `continuationCommand` tokens, which means very large playlists (100+ videos) may not include all videos in the initial page load. For the target use case (lecture playlists of 10-40 videos) this is fine, but the design should document this limitation.

### 9. D3.js visualization complexity

A force-directed graph with community detection, filtering, click-to-sidebar, and search is a substantial frontend project on its own. For Phase 3, consider starting with a simpler visualization (e.g., a static SVG or a flat concept list with links) and iterating toward the full interactive version. Alternatively, lean harder on the Obsidian vault — Obsidian's built-in graph view already does force-directed layout with filtering.

## Verified Claims (things I confirmed are correct)

1. **usetranscribe.io API endpoints and rate limits match the design.** The AGENTS.md at `/AGENTS.md` confirms: `/api/check` for cache, `/transcribe` for SSE, 50/day limit, 2 concurrent, 90-min max. The SSE event names and schema differences between cached and streamed responses are correctly documented.

2. **YouTube playlist scraping via `ytInitialData` works.** I confirmed that `ytInitialData` is present in server-rendered HTML for YouTube playlist pages and that video IDs can be reliably extracted via regex. For the CS153 playlist (11 videos), all 11 IDs were extracted. Also verified on a 21-video and 36-video playlist — all IDs present.

3. **CS153 lecture durations are within the 90-minute limit.** All 11 lectures in the CS153 playlist are between 47-68 minutes, well under the 90-minute cap.

4. **Stanford CS153 website is static HTML and scrapable.** The site is server-rendered with no JavaScript framework requirement for content access.

5. **Cached transcript schema matches the design's description.** Confirmed: cached responses have `summary` field and segments under `transcript.segments`. Top-level keys are `platform`, `external_id`, `slug`, `permalink`, `title`, `creator`, `duration_seconds`, `thumbnail_url`, `source_url`, `published_at`, `transcript`, `summary`, `pipeline_version`, `view_count`, `created_at`.

6. **Claude API context window is sufficient.** A 75-minute lecture produces roughly 11,000 words (~15K tokens). With prompt overhead, each call is well within Claude's 200K context limit. Estimated API cost is ~$0.19/lecture or ~$38-57 total for 200-300 lectures — reasonable for personal use.

7. **The tech stack choices are appropriate.** TypeScript + Node.js 22 + Commander.js + ES modules is a solid, modern choice for a CLI tool. No overengineering detected in the stack selection itself.
