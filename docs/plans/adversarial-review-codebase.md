# Adversarial Codebase Review — learning-ai

**Date:** 2026-06-09
**Scope:** All source files under `src/`
**Goal:** Find real bugs, data-loss risks, and robustness gaps

---

## Critical Issues (blocks correctness or causes data loss)

### 1. Ctrl+C during ingest leaves course.yaml in a transient state with no recovery

**Files:** `src/cli/ingest.ts:198-199`, `src/cli/process.ts:105-106`

When the pipeline sets `lecture.status = 'transcribing'` and writes `course.yaml`, then the user hits Ctrl+C (or the process is killed), the lecture is permanently stuck in `'transcribing'` status. The `toProcess` filter at line 72-73 does re-process `'transcribing'` and `'analyzing'` statuses, which partially addresses this — but only if the user re-runs `learn ingest`. There is no signal handler (`process.on('SIGINT', ...)`) to clean up.

More critically, if the process dies between `writeYaml(courseYamlPath, courseConfig)` at line 199 and the transcript file write at line 229, the status says "transcribing" but no work products exist. The smart resume at line 168 checks for transcript files, not the status field, so this particular case is actually handled. However, if the kill happens between writing the transcript (line 229) and writing the YAML status update (line 293), the transcript exists on disk but `course.yaml` still says `'transcribing'`, which means the next run will find the existing transcript (correct) but the status field will be stale until overwritten.

**Impact:** Not data loss, but confusing stale state. The real data-loss scenario is if `writeYaml` itself is interrupted mid-write, producing a truncated/corrupt `course.yaml`. `writeFileSync` is not atomic — it calls `write()` which can be partially completed if the process is killed.

**Fix:** Write to a temp file, then `renameSync` (atomic on most filesystems). Add a `SIGINT` handler that writes a clean state before exiting.

### 2. Concept index (`concept-index.txt`) append is not idempotent — duplicates accumulate

**Files:** `src/pipeline/analyze.ts:220-226`, `src/pipeline/analyze-gemini.ts:214-220`

Both analyze functions check if a concept name exists in the concept index before appending:
```typescript
const newConcepts = concepts
  .map(c => c.name)
  .filter(name => !existingConcepts.includes(name));
```
But `existingConcepts` is loaded once at the start of `analyzeLecture()`. When `learn ingest` processes multiple lectures sequentially in a single run, each lecture's `analyzeLecture` call re-reads the file from disk (line 96), so this works across lectures. However, if `--force` is used to reprocess a lecture, the concepts from the first run are still in the index. The filter only checks by exact name match, but the LLM may return a slightly different name for the same concept (e.g., "Transformer Architecture" vs "Transformer architecture"). This leads to near-duplicate entries in `concept-index.txt`.

The `learn graph build` command rebuilds the index from scratch (line 66-67 in `builder.ts`), which fixes the drift. But between graph builds, the index can be misleading.

**Impact:** Medium. The index is used as context for future LLM calls — duplicates pollute the prompt and waste tokens but don't cause incorrect behavior.

### 3. `findExistingFile` matches wrong lecture when IDs share a prefix

**File:** `src/cli/ingest.ts:311-326`

The function searches by prefix:
```typescript
const paddedId = lectureId.padStart(2, '0');
const dirs = readdirSync(lecturesDir).filter(d => d.startsWith(paddedId + '-'));
```

If lecture IDs are `01` and `010` (possible with 100+ lectures since `padStart(2, '0')` would produce `010` for id `'010'`), then searching for ID `01` would match both `01-intro` and `010-conclusion` since `'010-conclusion'.startsWith('01-')` is true.

In practice, with the current `padStart(2, '0')` logic in `add.ts` line 62, IDs only go up to 2-digit zero-padded numbers. But if a course has more than 99 lectures (e.g., a full semester), ID `100` gets padded to `100` (padStart is a no-op), and searching for ID `10` would match both `10-*` and `100-*`.

**Impact:** Data corruption — the wrong lecture's transcript would be loaded, and the resume logic would incorrectly skip transcription.

**Fix:** Match with a stricter regex: `d.match(new RegExp('^' + paddedId + '-'))` is already correct, but the core issue is that `padStart(2, '0')` doesn't handle 3-digit IDs. The ID generation in `add.ts` line 62 caps at 2 digits, so a playlist with 100+ videos would produce `100` which collides with `10` prefix searches. Use `padStart(3, '0')` consistently or match `{id}-` as a delimiter.

---

## Important Issues (causes poor UX or subtle bugs)

### 4. Lecture title changes between runs cause orphaned directories

**Files:** `src/cli/ingest.ts:163-165`, `src/cli/ingest.ts:213-215`

The lecture directory path is derived from `slugify(lecture.title)`:
```typescript
const lectureDir = resolve(..., `${lecture.id}-${titleSlug}`);
```

If the transcription service returns a different title than what the playlist scraper found (line 213: `lecture.title = result.title`), the slug changes. The next run creates a new directory with the updated title, but the old directory with the previous slug is still on disk. The `findExistingTranscript` helper searches by ID prefix, so it finds the old transcript — but the new directory is what gets written to.

Sequence:
1. `learn add` sets title to "Lecture 1 - Introduction" from playlist → dir `01-lecture-1---introduction`
2. `learn ingest` transcribes, usetranscribe returns title "Introduction to ML" → `lecture.title` is updated → dir `01-introduction-to-ml`
3. Transcript written to `01-introduction-to-ml/transcript.txt`
4. Old dir `01-lecture-1---introduction/` never cleaned up

The `findExistingTranscript` function would find the old directory first (alphabetical order), which could cause it to load a stale transcript from a previous interrupted run.

**Impact:** Confusing orphaned directories; potential stale data loaded on retry.

**Fix:** After computing the new `lectureDir`, check if a different directory with the same ID prefix exists, and if so, rename/merge it.

### 5. VTT deduplication produces empty segments for certain rolling patterns

**File:** `src/pipeline/fallback.ts:160-195`

The `deduplicateText` function has a subtle issue with YouTube's 2-line rolling captions. Consider this sequence:

```
Cue 1: "hello world"
Cue 2: "hello world\nfoo bar"
Cue 3: "foo bar\nbaz qux"
```

- Cue 1: emitted as "hello world", `lastEmitted = "hello world"`
- Cue 2: text "hello world\nfoo bar" starts with `lastEmitted` "hello world" (line 164 check). `newPart = "foo bar"`. Emitted. `lastEmitted` is set to `"foo bar"` (line 121: `currentText.split('\n').pop()`).
- Cue 3: text "foo bar\nbaz qux". First line "foo bar" matches last line of lastEmitted. `overlapLines = 1`. Remaining = "baz qux". Correct.

This works. But if a cue has *only* overlapping content (e.g., a repeated line with no new text), `deduplicateText` returns an empty string, and the segment is silently dropped (line 115: `if (deduped)`). This is correct behavior — no data loss.

However, the `lastEmitted` tracking is inconsistent. On line 121, after emitting a deduped result, `lastEmitted` is set to `currentText.split('\n').pop()` — the last line of the *original* (non-deduped) text. This is correct because the next cue will overlap with the raw cue content, not the deduped version. This is actually well-designed.

**Revised assessment:** The VTT deduplication is correct for standard YouTube rolling caption format. No bug here.

### 6. YouTube page scraping is fragile — no validation of parsed data

**File:** `src/pipeline/playlist.ts:37-47`

The regex `var\s+ytInitialData\s*=\s*({.+?});\s*<\/script>` uses a non-greedy match (`.+?`), which works when the JSON doesn't contain the string `};</script>`. YouTube's JSON payloads routinely contain escaped HTML and template strings, but the actual terminating pattern `};\s*</script>` is specific enough. The bigger risk is YouTube changing the variable name or the embedding format (e.g., to `window.ytInitialData`, or inlining it differently).

The fallback regex extractor (`extractVideosFromDataFallback`) at line 128 uses:
```typescript
/"playlistVideoRenderer"\s*:\s*\{[^}]*?"videoId"/
```
The `[^}]*?` pattern fails on nested objects — if there's a `}` between `playlistVideoRenderer` and `videoId`, this regex won't match. In practice, `videoId` is typically the first or second field in the renderer, so this works, but it's fragile.

**Impact:** A YouTube format change would silently return 0 videos. The `learn add` command handles this (exits with error if 0 videos), but `learn refresh` just prints "No new lectures found" — indistinguishable from "playlist hasn't changed" vs "scraping broke."

### 7. `learn ask` uses the wrong model when `--provider` is specified

**File:** `src/cli/ask.ts:82-98`

When the user passes `--provider gemini` but their `config.model` is set to `claude-sonnet-4-6` (because Claude is the default and auto-detected), the Gemini call uses the Claude model name:
```typescript
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
const response = await ai.models.generateContent({
  model: config.model,  // ← This is "claude-sonnet-4-6"
  contents: prompt,
});
```

The `config.model` is set in `config.ts` line 108 based on `defaultModel(provider)`, where `provider` is the *config-level* provider, not the command-line override. So if the user has both API keys set with Claude as default, then runs `learn ask ... --provider gemini`, the Gemini API receives `model: "claude-sonnet-4-6"` which will fail with an API error.

The same bug does NOT exist in `ingest.ts` or `process.ts` because those commands route to `analyzeLectureGemini` which uses `config.model` — but `analyze-gemini.ts` also passes `config.model` directly (line 130), so it has the same bug. In practice, the `config.model` in the gemini path should always be a Gemini model name, but the `--provider` override breaks this assumption.

**Impact:** `learn ask --provider gemini` crashes when Claude is the default provider. Same for `learn process --provider gemini` and `learn ingest --provider gemini`.

**Fix:** Resolve the model name based on the effective provider, not the config-level provider. When `--provider` overrides, also override the model to `defaultModel(effectiveProvider)`.

### 8. `learn process` assigns wrong lecture IDs when playlist order changes

**File:** `src/cli/process.ts:76`

When processing a video not already in `course.yaml`, the new lecture gets:
```typescript
const nextId = String(courseConfig.lectures.length + 1).padStart(2, '0');
```

This creates sequential IDs based on array length. If a video was removed from the playlist (or the user manually deleted a lecture entry from `course.yaml`), the new ID could collide with an existing directory on disk. For example: 20 lectures exist, user deletes lecture 15 from YAML (19 remain), processes a new video → gets ID `20`, but directory `20-*` already exists from the original lecture 20.

**Impact:** Overwrites the directory of an existing lecture.

### 9. No timeout on Claude API calls

**File:** `src/pipeline/analyze.ts:102-157`

The `client.messages.create()` calls have no timeout. For very long transcripts (the prompt includes the full transcript text), the API call can hang indefinitely. The Gemini path has retry logic with backoff (`analyze-gemini.ts:24-47`) but Claude does not.

`AbortSignal.timeout()` is used for HTTP calls in `transcribe.ts` and `playlist.ts`, but the Anthropic SDK calls are naked.

**Impact:** `learn ingest` hangs indefinitely on a single lecture if the Claude API is unresponsive.

### 10. Regex-based search query injection in `highlightMatch`

**File:** `src/cli/search.ts:142-145`

```typescript
function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, chalk.yellow.bold('$1'));
}
```

The `escapeRegex` function is correctly used to escape special characters. This is safe. No issue.

---

## Missing Use Cases

### 11. No way to delete or remove a lecture from a course

If a video is removed from a playlist, or the user adds the wrong URL, there is no `learn remove` command. The user must manually edit `course.yaml` and delete the corresponding directory. This is error-prone because:
- The lecture ID numbering in `course.yaml` won't be updated
- Stale entries in `concept-index.txt` won't be cleaned
- The knowledge graph will reference nonexistent sources

### 12. No way to process a range of lectures

`learn ingest` processes all pending lectures. There's no `--from 5 --to 10` or `learn ingest cs153 --lectures 5,8,12` to process a specific subset. This matters when a single lecture keeps failing and you want to skip it.

### 13. No export/backup of course state

There's no way to export a course's processed data (transcript + notes + concepts) to a portable format. If the project directory is lost, all LLM-generated notes are gone and must be regenerated (costing API credits).

### 14. `learn ask` is single-lecture only

The `ask` command takes a single lecture ID. There's no cross-lecture or cross-course Q&A. The most natural question a user would ask is "What did lecture 3 and lecture 7 say about transformers?" — this requires manually concatenating context.

### 15. No progress persistence for ingest

If `learn ingest` is processing lecture 15 of 30 and is interrupted, it resumes correctly via file existence checks. But there's no ETA, no progress bar, and no way to see "12/30 completed, estimated 45 minutes remaining." The `step()` logger only shows per-lecture steps, not overall batch progress.

---

## Scalability Concerns

### 16. Levenshtein near-duplicate check is O(n^2) with full matrix allocation

**File:** `src/graph/merge.ts:188-209`

The `detectAmbiguities` function compares every pair of concept names. With `n` concepts, this is `O(n^2)` comparisons, each requiring `O(m*k)` work for the Levenshtein computation (where `m` and `k` are string lengths).

For 500 concepts: 500 * 499 / 2 = 124,750 Levenshtein computations. Each one allocates a 2D array (`Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))`). For concept names averaging 25 characters, that's ~26 * 26 = 676 cells per computation, ~124,750 * 676 * 8 bytes ≈ 675 MB of allocations (though most are short-lived and GC'd).

**Impact:** Noticeable slowdown with 500+ concepts. Will not OOM, but `learn graph build` could take several seconds. For 1000+ concepts (plausible with 10+ courses), it becomes genuinely slow.

**Fix:** Use a cheaper pre-filter (e.g., only compare names with the same first 3 characters, or similar length), or switch to a more efficient algorithm. A simple optimization: skip the Levenshtein check if `abs(a.length - b.length) > maxLen * 0.25` (if the lengths differ by more than 25%, the normalized distance is guaranteed > 0.25).

### 17. `learn search` reads every file from disk on every query

**File:** `src/cli/search.ts:46-89`

Each search call reads every `notes.md` and `transcript.txt` file in every course. With 300 lectures, each with a ~100KB transcript, that's ~30MB of disk reads per search. On SSDs this is fast (<1s), but it's worth noting there's no index.

For the current use case (personal tool, <100 lectures), this is fine. It would become noticeable at 500+ lectures.

### 18. Full transcript is sent in every LLM prompt

**Files:** `src/pipeline/analyze.ts:152-153`, `src/pipeline/analyze-gemini.ts:123`

The prompt includes the full transcript text with no truncation. A 90-minute lecture at ~150 words/minute is ~13,500 words ≈ ~18,000 tokens. The prompt template adds another ~500 tokens. The concept extraction call (Call 2) includes both the full transcript AND the first 2000 characters of the notes. For Claude with 8192 `max_tokens` output, the total context window usage could approach 30K+ tokens per lecture.

This is within model limits but costs approximately $0.10-0.15 per lecture with Claude Sonnet (2 calls). Processing 30 lectures costs ~$3-4.50.

For Gemini with the free tier, the 15 RPM rate limit (not the token limit) is the bottleneck. The `withRetry` handles 429 errors but with exponential backoff up to 16 seconds — processing 30 lectures could take 30+ minutes due to rate limiting.

---

## Suggestions

### 19. Make `writeYaml` atomic

Replace `writeFileSync` with write-to-temp + `renameSync`:
```typescript
export function writeYaml(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  const content = yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false });
  const tmpPath = filePath + '.tmp';
  writeFileSync(tmpPath, content, 'utf-8');
  renameSync(tmpPath, filePath);
}
```
This prevents corrupt YAML from partial writes.

### 20. Add `--provider` model resolution to `ask`, `process`, and `ingest`

When `--provider` overrides the config provider, also override the model:
```typescript
const effectiveModel = provider !== config.llmProvider
  ? defaultModel(provider)
  : config.model;
```

### 21. Add SIGINT handler for clean shutdown

In `ingest.ts`, register a handler before the processing loop:
```typescript
let interrupted = false;
process.on('SIGINT', () => {
  warn('\nInterrupted — saving current state...');
  writeYaml(courseYamlPath, courseConfig);
  interrupted = true;
});
// In the loop: if (interrupted) break;
```

### 22. Add `--skip <id>` to `learn ingest`

Allow skipping specific lectures without `--force` reprocessing everything:
```
learn ingest cs153 --auto --skip 7,12
```

### 23. Validate concepts.yaml before loading in graph builder

In `src/graph/merge.ts:232-239`, the `readYaml` call does no validation. If a `concepts.yaml` file has malformed data (e.g., `concepts` is a string instead of an array, or a concept is missing `name`), the merge will throw a confusing runtime error deep in the merge logic.

Add a validation check:
```typescript
if (!Array.isArray(data.concepts)) continue;
for (const concept of data.concepts) {
  if (!concept.name || !concept.definition) continue;
  entries.push({ concept, course: courseDir, lectureId });
}
```

### 24. Rate-limit tracking is per-machine, not per-API-key

**File:** `src/utils/http.ts:6-7`

Usage is tracked in `~/.learning-ai/usage.json` globally. If the user runs the tool from two different project directories, or two users share a machine, the rate counter is shared. This is probably fine for a personal tool but worth documenting.

### 25. XSS in the D3.js visualization is mitigated but has an edge case

**File:** `src/graph/builder.ts:277`

The `esc()` function uses `textContent`/`innerHTML` which is the standard DOM-based escaping approach. This correctly handles `<`, `>`, `&`, and `"`. However, the graph data is embedded directly into the HTML via `JSON.stringify`:
```javascript
const data = ${JSON.stringify(graphData)};
```
If a concept name contains `</script>`, the JSON serialization would produce `"</script>"` which terminates the script tag early. `JSON.stringify` does NOT escape `</` by default.

**Impact:** A concept named something containing `</script>` would break the HTML page. This is unlikely from LLM-generated concept names but possible with adversarial input.

**Fix:** Use `JSON.stringify(graphData).replace(/</g, '\\u003c')` to escape the `<` character in the JSON output.
