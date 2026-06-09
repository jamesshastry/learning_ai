import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readLines } from '../utils/files.js';
import { error, info } from '../utils/logger.js';
import chalk from 'chalk';

/**
 * Register the `learn search` command.
 *
 * Full-text search across all notes, transcripts, and concept files.
 */
export function searchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search across all course notes and concepts')
    .option('--course <name>', 'Limit search to a specific course')
    .option('--concept', 'Search concept index only', false)
    .option('--notes-only', 'Search notes only (skip transcripts)', false)
    .action(async (query: string, opts: { course?: string; concept: boolean; notesOnly: boolean }) => {
      try {
        const config = loadConfig();
        const queryLower = query.toLowerCase();

        if (opts.concept) {
          // Search concept index
          searchConcepts(config.projectRoot, queryLower);
          return;
        }

        // Full-text search across files
        const coursesDir = resolve(config.projectRoot, 'courses');
        if (!existsSync(coursesDir)) {
          info('No courses found.');
          return;
        }

        const courseDirs = opts.course
          ? [opts.course]
          : readdirSync(coursesDir).filter(d => !d.startsWith('.'));

        let totalMatches = 0;

        for (const courseDir of courseDirs) {
          const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
          if (!existsSync(lecturesDir)) continue;

          const lectureDirs = readdirSync(lecturesDir)
            .filter(d => !d.startsWith('.'))
            .sort();

          for (const lectureDir of lectureDirs) {
            const dirPath = resolve(lecturesDir, lectureDir);

            // Search notes.md
            const notesPath = resolve(dirPath, 'notes.md');
            if (existsSync(notesPath)) {
              const matches = searchFile(notesPath, queryLower);
              if (matches.length > 0) {
                console.log(chalk.bold.blue(`\n📝 ${courseDir}/${lectureDir}/notes.md`));
                for (const match of matches) {
                  console.log(chalk.dim(`  L${match.line}:`), highlightMatch(match.text, query));
                }
                totalMatches += matches.length;
              }
            }

            // Search transcript.txt (unless notes-only)
            if (!opts.notesOnly) {
              const transcriptPath = resolve(dirPath, 'transcript.txt');
              if (existsSync(transcriptPath)) {
                const matches = searchFile(transcriptPath, queryLower);
                if (matches.length > 0) {
                  console.log(chalk.bold.cyan(`\n📄 ${courseDir}/${lectureDir}/transcript.txt`));
                  // Show max 5 matches for transcripts (they can be very long)
                  const shown = matches.slice(0, 5);
                  for (const match of shown) {
                    console.log(chalk.dim(`  L${match.line}:`), highlightMatch(match.text, query));
                  }
                  if (matches.length > 5) {
                    console.log(chalk.dim(`  ... and ${matches.length - 5} more matches`));
                  }
                  totalMatches += matches.length;
                }
              }
            }
          }
        }

        // Also search concept files
        searchConcepts(config.projectRoot, queryLower);

        console.log();
        info(`Found ${totalMatches} matches for "${query}"`);
      } catch (e) {
        error(`Search failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}

/**
 * Search a single file for lines matching the query.
 */
function searchFile(filePath: string, queryLower: string): Array<{ line: number; text: string }> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const matches: Array<{ line: number; text: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      matches.push({
        line: i + 1,
        text: lines[i].trim().substring(0, 120),
      });
    }
  }

  return matches;
}

/**
 * Search the concept index for matching concepts.
 */
function searchConcepts(projectRoot: string, queryLower: string): void {
  const indexPath = resolve(projectRoot, 'knowledge-graph', 'concept-index.txt');
  const concepts = readLines(indexPath);
  const matches = concepts.filter(c => c.toLowerCase().includes(queryLower));

  if (matches.length > 0) {
    console.log(chalk.bold.magenta('\n🔗 Matching Concepts:'));
    for (const concept of matches) {
      console.log(`  • ${concept}`);
    }
  }
}

/**
 * Highlight the search query in a text string.
 */
function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, chalk.yellow.bold('$1'));
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
