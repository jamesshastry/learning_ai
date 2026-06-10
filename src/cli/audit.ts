import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readYaml } from '../utils/files.js';
import { resolvePlaylist } from '../pipeline/playlist.js';
import { success, error, info, warn, progress } from '../utils/logger.js';
import type { CourseConfig } from '../types.js';
import chalk from 'chalk';

interface AuditFinding {
  level: 'error' | 'warning' | 'info';
  message: string;
}

/**
 * Register the `learn audit` command.
 *
 * Validates course configs for completeness, consistency, and
 * cross-references against live YouTube data when possible.
 */
export function auditCommand(program: Command): void {
  program
    .command('audit [course]')
    .description('Audit courses for missing lectures, broken links, and inconsistencies')
    .option('--live', 'Check video IDs against YouTube (slower, requires network)', false)
    .option('--fix', 'Auto-fix issues where possible (e.g. fill missing durations)', false)
    .action(async (courseName: string | undefined, opts: { live: boolean; fix: boolean }) => {
      try {
        const config = loadConfig();
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (!existsSync(coursesDir)) {
          error('No courses found.');
          process.exit(1);
        }

        const courseDirs = courseName
          ? [courseName]
          : readdirSync(coursesDir)
              .filter(d => !d.startsWith('.') && d !== 'synthesis')
              .filter(d => existsSync(resolve(coursesDir, d, 'course.yaml')))
              .sort();

        if (courseDirs.length === 0) {
          error(courseName ? `Course "${courseName}" not found.` : 'No courses found.');
          process.exit(1);
        }

        let totalFindings = 0;
        const allVideoIds = new Map<string, string[]>(); // videoId -> [course names]

        // First pass: collect all video IDs for cross-course dedup check
        for (const dir of courseDirs) {
          const courseConfig = readYaml<CourseConfig>(resolve(coursesDir, dir, 'course.yaml'));
          if (!courseConfig) continue;
          for (const lecture of courseConfig.lectures) {
            const existing = allVideoIds.get(lecture.video_id) ?? [];
            existing.push(courseConfig.name);
            allVideoIds.set(lecture.video_id, existing);
          }
        }

        for (const dir of courseDirs) {
          const courseYamlPath = resolve(coursesDir, dir, 'course.yaml');
          const courseConfig = readYaml<CourseConfig>(courseYamlPath);
          if (!courseConfig) continue;

          console.log(chalk.bold(`\n─── ${courseConfig.name.toUpperCase()} ${courseConfig.title} ───`));

          const findings: AuditFinding[] = [];

          // 1. Schema checks
          auditSchema(courseConfig, findings);

          // 2. Lecture consistency
          auditLectures(courseConfig, findings);

          // 3. Cross-course duplicates
          auditCrossCourseDuplicates(courseConfig, allVideoIds, findings);

          // 4. File system checks — do transcript/notes files exist for completed lectures?
          auditFiles(courseConfig, coursesDir, findings);

          // 5. Live YouTube checks (optional)
          if (opts.live) {
            await auditLive(courseConfig, findings, opts.fix ? courseYamlPath : undefined);
          }

          // Print findings
          if (findings.length === 0) {
            console.log(chalk.green('  ✓ No issues found'));
          } else {
            for (const f of findings) {
              const icon = f.level === 'error' ? chalk.red('✗')
                : f.level === 'warning' ? chalk.yellow('⚠')
                : chalk.blue('ℹ');
              console.log(`  ${icon} ${f.message}`);
            }
          }

          totalFindings += findings.length;
        }

        // Summary
        console.log(chalk.bold(`\n─── Summary ───`));
        console.log(`  Courses audited: ${courseDirs.length}`);
        const totalLectures = courseDirs.reduce((sum, dir) => {
          const c = readYaml<CourseConfig>(resolve(coursesDir, dir, 'course.yaml'));
          return sum + (c?.lectures.length ?? 0);
        }, 0);
        console.log(`  Total lectures: ${totalLectures}`);

        if (totalFindings === 0) {
          success('All courses pass audit');
        } else {
          warn(`${totalFindings} finding(s) across ${courseDirs.length} course(s)`);
        }
      } catch (e) {
        error(`Audit failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Check required fields and schema version.
 */
function auditSchema(course: CourseConfig, findings: AuditFinding[]): void {
  if (!course.schema_version) {
    findings.push({ level: 'error', message: 'Missing schema_version' });
  }
  if (!course.name) {
    findings.push({ level: 'error', message: 'Missing course name' });
  }
  if (!course.title) {
    findings.push({ level: 'error', message: 'Missing course title' });
  }
  if (!course.playlist) {
    findings.push({ level: 'warning', message: 'No playlist URL configured — `learn refresh` won\'t work' });
  }
  if (!course.website) {
    findings.push({ level: 'info', message: 'No course website URL' });
  }
  if (!course.tags || course.tags.length === 0) {
    findings.push({ level: 'info', message: 'No tags defined' });
  }
  if (course.lectures.length === 0) {
    findings.push({ level: 'warning', message: 'Course has no lectures' });
  }
}

/**
 * Check lectures for consistency issues.
 */
function auditLectures(course: CourseConfig, findings: AuditFinding[]): void {
  const videoIds = new Set<string>();
  const ids = new Set<string>();
  let prevIdNum = 0;

  for (const lecture of course.lectures) {
    const idNum = parseInt(lecture.id, 10);

    // Duplicate lecture IDs
    if (ids.has(lecture.id)) {
      findings.push({ level: 'error', message: `Duplicate lecture ID: ${lecture.id}` });
    }
    ids.add(lecture.id);

    // Gaps in numbering
    if (idNum !== prevIdNum + 1) {
      if (prevIdNum > 0) {
        findings.push({
          level: 'warning',
          message: `ID gap: ${String(prevIdNum).padStart(2, '0')} → ${lecture.id} (missing ${idNum - prevIdNum - 1} ID(s))`,
        });
      }
    }
    prevIdNum = idNum;

    // Duplicate video IDs within course
    if (videoIds.has(lecture.video_id)) {
      findings.push({ level: 'error', message: `Duplicate video_id within course: ${lecture.video_id} (lecture ${lecture.id})` });
    }
    videoIds.add(lecture.video_id);

    // Empty or missing fields
    if (!lecture.title || lecture.title.trim() === '') {
      findings.push({ level: 'error', message: `Lecture ${lecture.id}: missing title` });
    }
    if (!lecture.video_id || lecture.video_id.trim() === '') {
      findings.push({ level: 'error', message: `Lecture ${lecture.id}: missing video_id` });
    }

    // Status vs content consistency
    if (lecture.status === 'completed' && !lecture.transcript_source) {
      findings.push({
        level: 'warning',
        message: `Lecture ${lecture.id}: completed but no transcript_source recorded`,
      });
    }
    if (lecture.status === 'error' && !lecture.error) {
      findings.push({
        level: 'info',
        message: `Lecture ${lecture.id}: error status but no error message`,
      });
    }

    // Date ordering — lectures should be chronological
    if (lecture.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(lecture.date)) {
        findings.push({
          level: 'warning',
          message: `Lecture ${lecture.id}: date "${lecture.date}" not in YYYY-MM-DD format`,
        });
      }
    }
  }

  // Check date ordering
  const datedLectures = course.lectures.filter(l => l.date);
  for (let i = 1; i < datedLectures.length; i++) {
    if (datedLectures[i].date! < datedLectures[i - 1].date!) {
      findings.push({
        level: 'warning',
        message: `Lectures out of chronological order: ${datedLectures[i - 1].id} (${datedLectures[i - 1].date}) before ${datedLectures[i].id} (${datedLectures[i].date})`,
      });
    }
  }
}

/**
 * Check for the same video_id appearing in multiple courses.
 */
function auditCrossCourseDuplicates(
  course: CourseConfig,
  allVideoIds: Map<string, string[]>,
  findings: AuditFinding[]
): void {
  for (const lecture of course.lectures) {
    const courses = allVideoIds.get(lecture.video_id) ?? [];
    const others = courses.filter(c => c !== course.name);
    if (others.length > 0) {
      findings.push({
        level: 'warning',
        message: `Lecture ${lecture.id} (${lecture.video_id}) also appears in: ${others.join(', ')}`,
      });
    }
  }
}

/**
 * Check that completed lectures have the expected files on disk.
 */
function auditFiles(course: CourseConfig, coursesDir: string, findings: AuditFinding[]): void {
  const lecturesDir = resolve(coursesDir, course.name, 'lectures');

  for (const lecture of course.lectures) {
    if (lecture.status === 'completed' || lecture.status === 'partial') {
      // Find matching directory
      if (!existsSync(lecturesDir)) {
        findings.push({
          level: 'warning',
          message: `Lecture ${lecture.id}: status is ${lecture.status} but no lectures/ directory exists`,
        });
        continue;
      }

      const dirs = readdirSync(lecturesDir).filter(d => d.startsWith(lecture.id + '-'));
      if (dirs.length === 0) {
        findings.push({
          level: 'warning',
          message: `Lecture ${lecture.id}: status is ${lecture.status} but no lecture directory found`,
        });
        continue;
      }

      const lectureDir = resolve(lecturesDir, dirs[0]);
      const hasTranscript = existsSync(resolve(lectureDir, 'transcript.txt'));
      const hasNotes = existsSync(resolve(lectureDir, 'notes.md'));
      const hasConcepts = existsSync(resolve(lectureDir, 'concepts.yaml'));

      if (!hasTranscript) {
        findings.push({
          level: 'warning',
          message: `Lecture ${lecture.id}: missing transcript.txt`,
        });
      }
      if (lecture.status === 'completed' && !hasNotes) {
        findings.push({
          level: 'warning',
          message: `Lecture ${lecture.id}: completed but missing notes.md`,
        });
      }
      if (lecture.status === 'completed' && !hasConcepts) {
        findings.push({
          level: 'info',
          message: `Lecture ${lecture.id}: completed but missing concepts.yaml`,
        });
      }
    }
  }
}

/**
 * Live checks: validate video IDs are reachable and compare against playlist.
 */
async function auditLive(
  course: CourseConfig,
  findings: AuditFinding[],
  fixPath?: string
): Promise<void> {
  progress(`Live checks for ${course.name}...`);

  // Check each video ID is reachable via oembed
  let unreachable = 0;
  for (const lecture of course.lectures) {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${lecture.video_id}&format=json`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!response.ok) {
        findings.push({
          level: 'error',
          message: `Lecture ${lecture.id}: video ${lecture.video_id} is unreachable (HTTP ${response.status}) — may be private or deleted`,
        });
        unreachable++;
      }
    } catch {
      findings.push({
        level: 'warning',
        message: `Lecture ${lecture.id}: could not reach YouTube to verify ${lecture.video_id}`,
      });
    }
  }

  if (unreachable === 0) {
    findings.push({ level: 'info', message: `All ${course.lectures.length} video IDs are reachable` });
  }

  // Compare against playlist if it's a proper YouTube playlist URL
  if (course.playlist && (course.playlist.includes('/playlist') || course.playlist.includes('list='))) {
    try {
      const playlistVideos = await resolvePlaylist(course.playlist);
      const yamlIds = new Set(course.lectures.map(l => l.video_id));
      const playlistIds = new Set(playlistVideos.map(v => v.videoId));

      // Videos in playlist but not in course.yaml
      const missing = playlistVideos.filter(v => !yamlIds.has(v.videoId));
      if (missing.length > 0) {
        for (const v of missing) {
          findings.push({
            level: 'warning',
            message: `Playlist has video not in course.yaml: "${v.title}" (${v.videoId})`,
          });
        }
      }

      // Videos in course.yaml but not in playlist
      const extra = course.lectures.filter(l => !playlistIds.has(l.video_id));
      if (extra.length > 0) {
        for (const l of extra) {
          findings.push({
            level: 'info',
            message: `Lecture ${l.id} (${l.video_id}) not found in playlist — may have been added manually`,
          });
        }
      }

      if (missing.length === 0 && extra.length === 0) {
        findings.push({
          level: 'info',
          message: `Playlist and course.yaml are in sync (${playlistVideos.length} videos)`,
        });
      }
    } catch (e) {
      findings.push({
        level: 'warning',
        message: `Could not resolve playlist: ${(e as Error).message}`,
      });
    }
  } else {
    findings.push({
      level: 'info',
      message: 'No YouTube playlist URL — skipping playlist sync check',
    });
  }

  // Fill missing durations if --fix
  if (fixPath) {
    const courseConfig = readYaml<CourseConfig>(fixPath);
    if (!courseConfig) return;

    let fixed = 0;
    for (const lecture of courseConfig.lectures) {
      if (!lecture.duration_seconds) {
        try {
          const response = await fetch(
            `https://www.youtube.com/watch?v=${lecture.video_id}`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
              },
              signal: AbortSignal.timeout(15000),
            }
          );
          if (response.ok) {
            const html = await response.text();
            const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
            if (lengthMatch) {
              lecture.duration_seconds = parseInt(lengthMatch[1], 10);
              fixed++;
            }
          }
        } catch {
          // Skip — leave duration empty
        }
      }
    }

    if (fixed > 0) {
      const { writeYaml } = await import('../utils/files.js');
      writeYaml(fixPath, courseConfig);
      findings.push({
        level: 'info',
        message: `Fixed: filled ${fixed} missing duration(s)`,
      });
    }
  }
}
