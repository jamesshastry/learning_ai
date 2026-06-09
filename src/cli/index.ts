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
import { exportCommand } from './export.js';
import { quizCommand } from './quiz.js';
import { compareCommand } from './compare.js';
import { removeCommand } from './remove.js';
import { tagCommand, lecturesCommand } from './tag.js';
import { addReadingCommand } from './reading.js';
import { nextCommand } from './next.js';

const program = new Command();

program
  .name('learn')
  .description('Personal learning acceleration system for AI courses')
  .version('0.3.0');

// Course management
addCommand(program);
statusCommand(program);
refreshCommand(program);
removeCommand(program);

// Content processing
processCommand(program);
ingestCommand(program);
importCommand(program);

// Reading & discovery
notesCommand(program);
searchCommand(program);
askCommand(program);
synthesizeCommand(program);
compareCommand(program);

// Knowledge graph
graphCommand(program);

// Learning progress
watchCommand(program);
reviewCommand(program);
progressCommand(program);
nextCommand(program);

// Annotations & resources
annotateCommand(program);
tagCommand(program);
lecturesCommand(program);
addReadingCommand(program);

// Export & active recall
exportCommand(program);
quizCommand(program);

program.parse();
