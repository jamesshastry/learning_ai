#!/usr/bin/env node

import { Command } from 'commander';
import { addCommand } from './add.js';
import { processCommand } from './process.js';
import { notesCommand } from './notes.js';
import { statusCommand } from './status.js';
import { refreshCommand } from './refresh.js';
import { watchCommand, reviewCommand, progressCommand } from './watch.js';
import { annotateCommand } from './annotate.js';
import { importCommand } from './import.js';
import { ingestCommand } from './ingest.js';
import { searchCommand } from './search.js';
import { askCommand } from './ask.js';
import { synthesizeCommand } from './synthesize.js';
import { graphCommand } from './graph.js';

const program = new Command();

program
  .name('learn')
  .description('Personal learning acceleration system for AI courses')
  .version('0.2.0');

// Phase 1: Core commands
addCommand(program);
processCommand(program);
notesCommand(program);
statusCommand(program);
refreshCommand(program);

// Phase 2: Batch ingestion, search, Q&A
ingestCommand(program);
searchCommand(program);
askCommand(program);

// Phase 3: Knowledge graph
graphCommand(program);

// Phase 4B: Learning workflow
watchCommand(program);
reviewCommand(program);
progressCommand(program);
annotateCommand(program);
importCommand(program);
synthesizeCommand(program);

program.parse();
