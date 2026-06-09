import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { readYaml } from '../utils/files.js';
import { debug, info, warn } from '../utils/logger.js';
import type { Concept, ConceptsYaml, ConceptRelation } from '../types.js';

/**
 * A merged concept in the knowledge graph.
 */
export interface MergedConcept {
  name: string;
  aliases: string[];
  definition: string;
  tags: string[];
  first_seen: string;  // "courseName/lecture-id"
  sources: Array<{
    course: string;
    lecture: string;
    timestamps: string[];
  }>;
  relations: ConceptRelation[];
}

/**
 * An ambiguity detected during merge.
 */
export interface MergeAmbiguity {
  type: 'alias_conflict' | 'near_duplicate';
  concepts: string[];
  detail: string;
}

/**
 * Result of the merge algorithm.
 */
export interface MergeResult {
  concepts: MergedConcept[];
  ambiguities: MergeAmbiguity[];
}

/**
 * Scan all concepts.yaml files across all courses and merge them.
 * Two-pass algorithm:
 *   Pass 1: Exact matching (name/alias overlap) with deterministic merge rules
 *   Pass 2: Ambiguity detection (alias conflicts, near-duplicates)
 */
export function mergeAllConcepts(projectRoot: string): MergeResult {
  // Load all concepts from all courses
  const allConcepts = loadAllConcepts(projectRoot);
  info(`Loaded ${allConcepts.length} concept entries from all courses`);

  // Pass 1: Exact matching
  const merged = new Map<string, MergedConcept>();  // normalized name → merged concept
  const aliasIndex = new Map<string, string>();      // normalized alias → normalized concept name

  for (const entry of allConcepts) {
    const normalizedName = normalize(entry.concept.name);
    const allNames = [normalizedName, ...(entry.concept.aliases ?? []).map(normalize)];

    // Check if any name/alias matches an existing concept
    let matchedKey: string | null = null;
    for (const name of allNames) {
      if (aliasIndex.has(name)) {
        matchedKey = aliasIndex.get(name)!;
        break;
      }
    }

    if (matchedKey && merged.has(matchedKey)) {
      // Merge into existing concept
      const existing = merged.get(matchedKey)!;
      mergeConcept(existing, entry.concept, entry.course, entry.lectureId);
    } else {
      // Create new concept
      const newConcept: MergedConcept = {
        name: entry.concept.name,
        aliases: [...(entry.concept.aliases ?? [])],
        definition: entry.concept.definition,
        tags: [...entry.concept.tags],
        first_seen: `${entry.course}/${entry.lectureId}`,
        sources: [{
          course: entry.course,
          lecture: entry.lectureId,
          timestamps: [...entry.concept.timestamps],
        }],
        relations: [...(entry.concept.relations ?? [])],
      };

      merged.set(normalizedName, newConcept);

      // Register all names in alias index
      for (const name of allNames) {
        aliasIndex.set(name, normalizedName);
      }
    }
  }

  const mergedConcepts = Array.from(merged.values());

  // Pass 2: Ambiguity detection
  const ambiguities = detectAmbiguities(mergedConcepts);

  info(`Merged into ${mergedConcepts.length} unique concepts`);
  if (ambiguities.length > 0) {
    warn(`Found ${ambiguities.length} ambiguities — see merge-log.yaml`);
  }

  return { concepts: mergedConcepts, ambiguities };
}

/**
 * Merge a new concept entry into an existing merged concept.
 */
function mergeConcept(
  existing: MergedConcept,
  incoming: Concept,
  course: string,
  lectureId: string
): void {
  // Name: keep the longer/more descriptive name
  if (incoming.name.length > existing.name.length) {
    existing.name = incoming.name;
  }

  // Aliases: union
  const allAliases = new Set([...existing.aliases, ...(incoming.aliases ?? [])]);
  existing.aliases = Array.from(allAliases);

  // Definition: keep the longer definition
  if (incoming.definition.length > existing.definition.length) {
    existing.definition = incoming.definition;
  }

  // Tags: union
  const allTags = new Set([...existing.tags, ...incoming.tags]);
  existing.tags = Array.from(allTags);

  // Sources: add new source
  existing.sources.push({
    course,
    lecture: lectureId,
    timestamps: [...incoming.timestamps],
  });

  // Relations: union (keep both if same target but different type)
  for (const rel of incoming.relations ?? []) {
    const exists = existing.relations.some(
      r => r.target === rel.target && r.type === rel.type
    );
    if (!exists) {
      existing.relations.push(rel);
    }
  }
}

/**
 * Detect ambiguities in the merged concept set.
 * - Alias conflicts: two distinct concepts share an alias
 * - Near-duplicates: concepts with normalized edit distance ≤ 0.25 (min 6 chars)
 */
function detectAmbiguities(concepts: MergedConcept[]): MergeAmbiguity[] {
  const ambiguities: MergeAmbiguity[] = [];

  // Check for alias conflicts
  const aliasOwners = new Map<string, string[]>();
  for (const concept of concepts) {
    for (const alias of concept.aliases) {
      const norm = normalize(alias);
      if (!aliasOwners.has(norm)) {
        aliasOwners.set(norm, []);
      }
      aliasOwners.get(norm)!.push(concept.name);
    }
  }

  for (const [alias, owners] of aliasOwners) {
    if (owners.length > 1) {
      ambiguities.push({
        type: 'alias_conflict',
        concepts: owners,
        detail: `Shared alias: "${alias}"`,
      });
    }
  }

  // Check for near-duplicates using normalized edit distance
  const names = concepts.map(c => c.name);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      const maxLen = Math.max(a.length, b.length);

      // Only check names with 6+ characters
      if (maxLen < 6) continue;

      const distance = levenshtein(normalize(a), normalize(b));
      const normalizedDistance = distance / maxLen;

      if (normalizedDistance <= 0.25) {
        ambiguities.push({
          type: 'near_duplicate',
          concepts: [a, b],
          detail: `Normalized edit distance: ${normalizedDistance.toFixed(2)}`,
        });
      }
    }
  }

  return ambiguities;
}

/**
 * Load all concept entries from all courses.
 */
function loadAllConcepts(projectRoot: string): Array<{
  concept: Concept;
  course: string;
  lectureId: string;
}> {
  const entries: Array<{ concept: Concept; course: string; lectureId: string }> = [];
  const coursesDir = resolve(projectRoot, 'courses');

  if (!existsSync(coursesDir)) return entries;

  for (const courseDir of readdirSync(coursesDir)) {
    const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
    if (!existsSync(lecturesDir)) continue;

    for (const lectureDir of readdirSync(lecturesDir)) {
      const conceptsPath = resolve(lecturesDir, lectureDir, 'concepts.yaml');
      const data = readYaml<ConceptsYaml>(conceptsPath);
      if (!data?.concepts || !Array.isArray(data.concepts)) continue;

      // Extract lecture ID from directory name (e.g., "01-some-title" → "01")
      const lectureId = lectureDir.split('-')[0];

      for (const concept of data.concepts) {
        // Validate required fields
        if (!concept.name || !concept.definition) {
          debug(`Skipping malformed concept in ${conceptsPath}: missing name or definition`);
          continue;
        }
        entries.push({ concept, course: courseDir, lectureId });
      }
    }
  }

  return entries;
}

/**
 * Normalize a concept name for comparison.
 * Lowercase, trim whitespace, collapse hyphens/underscores to spaces.
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Compute Levenshtein edit distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
