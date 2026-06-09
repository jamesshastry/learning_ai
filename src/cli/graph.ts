import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readLines, readYaml, readText } from '../utils/files.js';
import { buildGraph } from '../graph/builder.js';
import { error, info, success, warn } from '../utils/logger.js';
import type { ConceptsYaml } from '../types.js';
import chalk from 'chalk';

/**
 * Register the `learn graph` command group.
 */
export function graphCommand(program: Command): void {
  const graph = program
    .command('graph')
    .description('Knowledge graph commands');

  // learn graph build
  graph
    .command('build')
    .description('Build the knowledge graph from all extracted concepts')
    .action(async () => {
      try {
        const config = loadConfig();
        const result = buildGraph(config.projectRoot);
        success(`Knowledge graph built: ${result.concepts.length} concepts`);
        if (result.ambiguities.length > 0) {
          info(`Review ${result.ambiguities.length} ambiguities in knowledge-graph/merge-log.yaml`);
        }
        info('View the interactive graph: open knowledge-graph/index.html');
      } catch (e) {
        error(`Graph build failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn graph update — incremental: only rebuild if concepts changed
  graph
    .command('update')
    .description('Incrementally update the graph (only new/changed lectures)')
    .action(async () => {
      try {
        const config = loadConfig();
        const graphJsonPath = resolve(config.projectRoot, 'knowledge-graph', 'graph.json');

        // Check if any concepts.yaml is newer than graph.json
        const graphMtime = existsSync(graphJsonPath)
          ? statSync(graphJsonPath).mtimeMs
          : 0;

        let newConceptFiles = 0;
        const coursesDir = resolve(config.projectRoot, 'courses');

        if (existsSync(coursesDir)) {
          for (const courseDir of readdirSync(coursesDir)) {
            const lecturesDir = resolve(coursesDir, courseDir, 'lectures');
            if (!existsSync(lecturesDir)) continue;

            for (const lectureDir of readdirSync(lecturesDir)) {
              const conceptsPath = resolve(lecturesDir, lectureDir, 'concepts.yaml');
              if (existsSync(conceptsPath) && statSync(conceptsPath).mtimeMs > graphMtime) {
                newConceptFiles++;
              }
            }
          }
        }

        if (newConceptFiles === 0 && graphMtime > 0) {
          info('Knowledge graph is up to date — no new concepts since last build.');
          return;
        }

        info(`${newConceptFiles} concept file(s) updated since last build. Rebuilding...`);
        const result = buildGraph(config.projectRoot);
        success(`Knowledge graph updated: ${result.concepts.length} concepts`);
        if (result.ambiguities.length > 0) {
          info(`Review ${result.ambiguities.length} ambiguities in knowledge-graph/merge-log.yaml`);
        }
      } catch (e) {
        error(`Graph update failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn graph serve
  graph
    .command('serve')
    .description('Open the interactive knowledge graph in your browser')
    .action(async () => {
      try {
        const config = loadConfig();
        const htmlPath = resolve(config.projectRoot, 'knowledge-graph', 'index.html');

        if (!existsSync(htmlPath)) {
          error('Knowledge graph not built yet. Run `learn graph build` first.');
          process.exit(1);
        }

        const { execSync } = await import('child_process');
        execSync(`open "${htmlPath}"`);
        success('Opened knowledge graph in browser');
      } catch (e) {
        error(`Failed to open graph: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn graph deps — show concept dependency chain
  graph
    .command('deps <concept>')
    .description('Show prerequisite chain for a concept')
    .action(async (conceptName: string) => {
      try {
        const config = loadConfig();
        const conceptsDir = resolve(config.projectRoot, 'knowledge-graph', 'concepts');

        if (!existsSync(conceptsDir)) {
          error('Knowledge graph not built yet. Run `learn graph build` first.');
          process.exit(1);
        }

        // Load all concept files and build a dependency map
        const conceptFiles = readdirSync(conceptsDir).filter(f => f.endsWith('.md'));
        const deps = new Map<string, string[]>(); // concept → prerequisites
        const enables = new Map<string, string[]>(); // concept → what it enables
        const allNames = new Set<string>();

        for (const file of conceptFiles) {
          const content = readText(resolve(conceptsDir, file));
          if (!content) continue;

          // Extract concept name from heading
          const nameMatch = content.match(/^#\s+(.+)$/m);
          const name = nameMatch ? nameMatch[1].trim() : file.replace('.md', '');
          allNames.add(name);

          // Extract relations from the "Related Concepts" section
          const relSection = content.match(/## Related Concepts\n([\s\S]*?)(?=\n##|$)/);
          if (!relSection) continue;

          const relLines = relSection[1].match(/\[\[(.+?)\]\]\s*\((.+?)\)/g) ?? [];
          for (const relLine of relLines) {
            const match = relLine.match(/\[\[(.+?)\]\]\s*\((.+?)\)/);
            if (!match) continue;

            const target = match[1];
            const type = match[2];

            if (type === 'prerequisite for') {
              // This concept is a prerequisite for target
              if (!deps.has(target)) deps.set(target, []);
              deps.get(target)!.push(name);
              if (!enables.has(name)) enables.set(name, []);
              enables.get(name)!.push(target);
            } else if (type === 'part of') {
              // This concept is part of target
              if (!deps.has(name)) deps.set(name, []);
              deps.get(name)!.push(target);
            } else if (type === 'enables') {
              if (!enables.has(name)) enables.set(name, []);
              enables.get(name)!.push(target);
            }
          }
        }

        // Find the concept (fuzzy match)
        const searchLower = conceptName.toLowerCase();
        const matchedName = Array.from(allNames).find(n =>
          n.toLowerCase().includes(searchLower)
        );

        if (!matchedName) {
          error(`Concept "${conceptName}" not found in knowledge graph.`);
          info('Available concepts:');
          const matches = Array.from(allNames)
            .filter(n => n.toLowerCase().includes(searchLower.substring(0, 3)))
            .slice(0, 5);
          for (const m of matches) console.log(`  • ${m}`);
          process.exit(1);
          return;
        }

        // Display dependency tree
        console.log(chalk.bold(`\n🔗 Dependency Chain: ${matchedName}\n`));

        // Prerequisites (what you need to know first)
        const prereqs = deps.get(matchedName) ?? [];
        if (prereqs.length > 0) {
          console.log(chalk.yellow('  Prerequisites (learn these first):'));
          for (const p of prereqs) {
            console.log(`    ← ${p}`);
          }
        } else {
          console.log(chalk.green('  No prerequisites — good starting point!'));
        }

        console.log();
        console.log(chalk.bold(`  ★ ${matchedName}`));
        console.log();

        // What this enables (what you can learn after)
        const unlocks = enables.get(matchedName) ?? [];
        if (unlocks.length > 0) {
          console.log(chalk.cyan('  Unlocks (learn these after):'));
          for (const u of unlocks) {
            console.log(`    → ${u}`);
          }
        }

        // Also show all related concepts
        const conceptsYamlDir = resolve(config.projectRoot, 'knowledge-graph', 'concepts');
        const slug = matchedName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        const conceptContent = readText(resolve(conceptsYamlDir, `${slug}.md`));
        if (conceptContent) {
          const relatedMatch = conceptContent.match(/## Related Concepts\n([\s\S]*?)(?=\n##|$)/);
          if (relatedMatch) {
            console.log(chalk.dim('\n  All relationships:'));
            const lines = relatedMatch[1].trim().split('\n').filter(l => l.trim());
            for (const line of lines) {
              console.log(`  ${line.trim()}`);
            }
          }
        }

        console.log();
      } catch (e) {
        error(`Deps lookup failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });

  // learn graph <query> — search concepts in terminal
  graph
    .argument('[query]', 'Search for a concept in the knowledge graph')
    .action(async (query?: string) => {
      if (!query) return; // Handled by subcommands

      try {
        const config = loadConfig();
        const indexPath = resolve(config.projectRoot, 'knowledge-graph', 'concept-index.txt');
        const concepts = readLines(indexPath);

        if (concepts.length === 0) {
          info('Knowledge graph is empty. Run `learn graph build` first.');
          return;
        }

        const queryLower = query.toLowerCase();
        const matches = concepts.filter(c => c.toLowerCase().includes(queryLower));

        if (matches.length === 0) {
          info(`No concepts matching "${query}"`);
          return;
        }

        console.log(chalk.bold(`\n🔗 Concepts matching "${query}":\n`));
        for (const concept of matches) {
          console.log(`  • ${concept}`);
        }
        console.log();
      } catch (e) {
        error(`Graph query failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
