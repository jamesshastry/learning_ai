import { readdirSync, existsSync, readFileSync, statSync } from 'fs';
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
  nodeType: 'concept' | 'paper';  // distinguish in the graph visualization
  first_seen: string;  // "courseName/lecture-id" or "papers/category"
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

  // Load all papers
  const allPapers = loadAllPapers(projectRoot);
  info(`Loaded ${allPapers.length} paper entries from papers/`);

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
        nodeType: 'concept',
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

  // Add paper nodes (papers don't merge with concepts — they are distinct node types)
  for (const paper of allPapers) {
    const normalizedName = normalize(paper.name);

    // Don't merge with existing concepts — papers are separate nodes
    if (!merged.has(normalizedName)) {
      merged.set(normalizedName, paper);
      aliasIndex.set(normalizedName, normalizedName);
    }
  }

  // Post-merge: create edges between papers and concepts that share tags
  linkPapersToConcepts(merged);

  const mergedConcepts = Array.from(merged.values());

  // Pass 2: Ambiguity detection
  const ambiguities = detectAmbiguities(mergedConcepts);

  info(`Merged into ${mergedConcepts.length} unique nodes (${mergedConcepts.filter(c => c.nodeType === 'concept').length} concepts + ${mergedConcepts.filter(c => c.nodeType === 'paper').length} papers)`);
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
 * Load all papers from the papers/ directory.
 * Parses YAML frontmatter for metadata and markdown links for relationships.
 */
function loadAllPapers(projectRoot: string): MergedConcept[] {
  const papersDir = resolve(projectRoot, 'papers');
  if (!existsSync(papersDir)) return [];

  const papers: MergedConcept[] = [];
  const categories = readdirSync(papersDir).filter(d => {
    const full = resolve(papersDir, d);
    return d !== 'index.md' && !d.startsWith('.') && existsSync(full) && statSync(full).isDirectory();
  });

  for (const category of categories) {
    const catDir = resolve(papersDir, category);
    const files = readdirSync(catDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const content = readFileSync(resolve(catDir, file), 'utf-8');
      const parsed = parsePaperFile(content, category, file);
      if (parsed) papers.push(parsed);
    }
  }

  return papers;
}

/**
 * Parse a paper markdown file into a MergedConcept node.
 * Extracts frontmatter fields and markdown links as relations.
 */
function parsePaperFile(content: string, category: string, filename: string): MergedConcept | null {
  // Parse YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/m);
  if (!fmMatch) return null;

  const yamlStr = fmMatch[1];
  const body = fmMatch[2];

  // Extract key fields from YAML
  const titleMatch = yamlStr.match(/^title:\s*"?(.+?)"?\s*$/m);
  const yearMatch = yamlStr.match(/^year:\s*(\d+)/m);
  const venueMatch = yamlStr.match(/^venue:\s*(.+)/m);
  const resourceMatch = yamlStr.match(/^resource:\s*(.+)/m);

  const title = titleMatch?.[1] ?? filename.replace('.md', '');
  const year = yearMatch?.[1] ?? '';
  const venue = venueMatch?.[1]?.trim() ?? '';

  // Extract tags from YAML (inline array or multi-line)
  const tags: string[] = [];
  const inlineTagsMatch = yamlStr.match(/^tags:\s*\[(.+)\]/m);
  if (inlineTagsMatch) {
    tags.push(...inlineTagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, '')));
  } else {
    const tagLines = yamlStr.match(/^tags:\s*\n((?:\s+-\s+.+\n?)*)/m);
    if (tagLines) {
      const items = tagLines[1].match(/^\s+-\s+(.+)$/gm);
      if (items) tags.push(...items.map(l => l.replace(/^\s+-\s+/, '').trim()));
    }
  }

  // Extract authors
  const authors: string[] = [];
  const inlineAuthorsMatch = yamlStr.match(/^authors:\s*\[(.+)\]/m);
  if (inlineAuthorsMatch) {
    authors.push(...inlineAuthorsMatch[1].split(',').map(a => a.trim().replace(/^["']|["']$/g, '')));
  }

  // Extract markdown links to other papers as relations
  const relations: ConceptRelation[] = [];
  const linkRegex = /\[([^\]]+)\]\((?:\.\.\/)?(?:[\w-]+\/)?[\w-]+\.md\)/g;
  let match;
  while ((match = linkRegex.exec(body)) !== null) {
    const linkText = match[1];
    // Don't create self-links
    if (normalize(linkText) !== normalize(title)) {
      relations.push({
        target: linkText,
        type: 'related_to',
        note: 'referenced in paper',
      });
    }
  }

  // Deduplicate relations by target
  const seenTargets = new Set<string>();
  const uniqueRelations = relations.filter(r => {
    const key = normalize(r.target);
    if (seenTargets.has(key)) return false;
    seenTargets.add(key);
    return true;
  });

  const definition = year && venue
    ? `${title} (${year}, ${venue}). Seminal paper in ${category.replace(/-/g, ' ')}.`
    : `${title}. Seminal paper in ${category.replace(/-/g, ' ')}.`;

  // Add 'paper' tag so we can style paper nodes differently
  if (!tags.includes('paper')) tags.unshift('paper');

  return {
    name: title,
    aliases: [],
    definition,
    tags,
    nodeType: 'paper',
    first_seen: `papers/${category}`,
    sources: [{
      course: 'papers',
      lecture: category,
      timestamps: [],
    }],
    relations: uniqueRelations,
  };
}

/**
 * Create edges between papers and concepts that share tags or have name overlaps.
 * This links the paper nodes to the course concept nodes in the graph.
 */
function linkPapersToConcepts(merged: Map<string, MergedConcept>): void {
  const papers = Array.from(merged.values()).filter(c => c.nodeType === 'paper');
  const concepts = Array.from(merged.values()).filter(c => c.nodeType === 'concept');

  // Tags that are too generic to create meaningful paper↔concept edges
  const genericTags = new Set([
    'theory', 'application', 'architecture', 'optimization', 'training',
    'data', 'infrastructure', 'hardware', 'safety',
  ]);

  // Words too common/short to match on
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'chain', 'deep',
    'learning', 'model', 'models', 'neural', 'network', 'networks',
  ]);

  for (const paper of papers) {
    const paperTags = new Set(paper.tags.filter(t => t !== 'paper' && !genericTags.has(t)));
    const paperNameWords = new Set(
      normalize(paper.name).split(' ')
        .filter(w => w.length > 4 && !stopWords.has(w))
    );

    for (const concept of concepts) {
      const conceptTags = new Set(concept.tags.filter(t => !genericTags.has(t)));
      const conceptNameWords = normalize(concept.name).split(' ')
        .filter(w => w.length > 4 && !stopWords.has(w));
      const tagOverlap = [...paperTags].filter(t => conceptTags.has(t));

      // Name overlap: concept word must match a paper word (5+ chars, not stop word)
      const nameOverlap = conceptNameWords.some(w => paperNameWords.has(w));

      if (tagOverlap.length >= 1 || nameOverlap) {
        const alreadyLinked = paper.relations.some(
          r => normalize(r.target) === normalize(concept.name)
        );
        if (!alreadyLinked) {
          const reason = tagOverlap.length > 0
            ? `shared tags: ${tagOverlap.join(', ')}`
            : 'name overlap';
          paper.relations.push({
            target: concept.name,
            type: 'related_to',
            note: reason,
          });
        }
      }
    }
  }
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
