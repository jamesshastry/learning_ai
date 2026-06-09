/**
 * Shared type definitions for the learning-ai system.
 */

export interface CourseConfig {
  schema_version: number;
  name: string;
  title: string;
  university?: string;
  website?: string;
  playlist: string;
  tags: string[];
  added: string;
  lectures: LectureEntry[];
}

export interface LectureEntry {
  id: string;
  title: string;
  video_id: string;
  status: LectureStatus;
  transcript_source?: TranscriptSource;
  duration_seconds?: number;
  date?: string;
  error?: string;
  // Personal learning state (separate from pipeline status)
  watched?: boolean;
  watched_date?: string;
  confidence?: ConfidenceLevel;
  revisit?: boolean;
  personal_notes?: string;
  tags?: string[];  // Manual topic tags for filtering
}

export type LectureStatus =
  | 'pending'
  | 'transcribing'
  | 'analyzing'
  | 'completed'
  | 'partial'
  | 'error';

export type ConfidenceLevel = 'none' | 'low' | 'medium' | 'high';

export type TranscriptSource = 'usetranscribe' | 'yt-dlp-captions' | 'manual';

export interface TranscriptSegment {
  timestamp: string;    // "HH:MM:SS" or "MM:SS"
  text: string;
}

export interface TranscribeResult {
  source: TranscriptSource;
  segments: TranscriptSegment[];
  title: string;
  duration_seconds: number;
  raw?: unknown;       // Raw API response for caching
}

export interface Concept {
  name: string;
  aliases?: string[];
  definition: string;
  tags: string[];
  timestamps: string[];
  relations?: ConceptRelation[];
}

export interface ConceptRelation {
  target: string;
  type: 'related_to' | 'enables' | 'part_of' | 'contrasts_with' | 'prerequisite_for';
  note?: string;
}

export interface ConceptsYaml {
  concepts: Concept[];
}

export interface AnalysisResult {
  notes: string;       // Markdown content for notes.md
  concepts: Concept[]; // Structured concepts for concepts.yaml
}

export interface PlaylistVideo {
  videoId: string;
  title: string;
  index: number;
}
