import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { loadConfig } from '../utils/config.js';
import { readLines } from '../utils/files.js';
import { buildGraph } from '../graph/builder.js';
import { error, info, success } from '../utils/logger.js';
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
