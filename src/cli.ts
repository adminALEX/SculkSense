#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { reviewCommand } from './commands/review.js';
import { doctorCommand } from './commands/doctor.js';
import { versionCommand } from './commands/version.js';
import { logCommand } from './commands/log.js';
import { listenCommand } from './commands/listen.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getPackageVersion(): string {
  const packagePath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
    version: string;
  };
  return pkg.version;
}

const program = new Command();

program
  .name('skulksense')
  .description('Fast local AI pre-commit review using Ollama')
  .version(getPackageVersion());

program
  .command('init')
  .description('Initialize SculkSense in the current repository')
  .action(initCommand);

program
  .command('review')
  .description('Review staged changes manually')
  .action(reviewCommand);

program
  .command('doctor')
  .description('Check Git, Husky, Ollama, config, and model health')
  .action(doctorCommand);

program
  .command('version')
  .description('Display package version')
  .action(versionCommand);

program
  .command('log')
  .description('View recent review logs')
  .option('-n, --lines <count>', 'number of lines to show', '50')
  .option('-a, --all', 'show all log lines')
  .action(logCommand);

program
  .command('listen')
  .description('Watch review logs in real time during commits')
  .option('-n, --lines <count>', 'preview recent lines before listening', '10')
  .action(listenCommand);

program.parse();
