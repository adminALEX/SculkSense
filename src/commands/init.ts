import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getConfigFilename, resolveConfig } from '../config/load.js';
import type { SculkSenseConfig } from '../config/defaults.js';
import {
  ensureRulesFile,
  loadRulesFile,
} from '../config/rules.js';
import {
  getPreCommitHookContent,
  getPreCommitHookPath,
  hasHusky,
} from '../git/husky.js';
import { isGitRepository } from '../git/run.js';
import { isOllamaInstalled, isOllamaRunning } from '../ollama/health.js';
import { hasModel } from '../ollama/models.js';
import { ensureLogDir, getLogPath } from '../logging/fileLogger.js';
import { logger } from '../ui/logger.js';
import { promptCustomRules } from '../ui/promptUser.js';

const execFileAsync = promisify(execFile);

function readExistingConfig(cwd: string): Partial<SculkSenseConfig> {
  const configPath = join(cwd, getConfigFilename());
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(configPath, 'utf-8')) as Partial<SculkSenseConfig>;
  } catch {
    return {};
  }
}

function writeConfig(cwd: string, config: SculkSenseConfig): void {
  const configPath = join(cwd, getConfigFilename());
  const output: Record<string, unknown> = {
    model: config.model,
    timeout: config.timeout,
    minChangedLines: config.minChangedLines,
    maxDiffChars: config.maxDiffChars,
    ignore: config.ignore,
  };

  if (config.customInstructions) {
    output.customInstructions = config.customInstructions;
  }

  if (config.rulesFile) {
    output.rulesFile = config.rulesFile;
  }

  writeFileSync(configPath, JSON.stringify(output, null, 2) + '\n');
}

export async function initCommand(): Promise<void> {
  const cwd = process.cwd();
  logger.brand();
  console.log('');
  logger.info('Initializing SculkSense...\n');

  const isGit = await isGitRepository(cwd);
  if (!isGit) {
    logger.error('Error: Not a Git repository. Run git init first.');
    process.exit(1);
  }
  logger.success('✓ Git repository detected');

  const customRulesInput = await promptCustomRules();
  const existing = readExistingConfig(cwd);
  const config = resolveConfig({
    ...existing,
    ...customRulesInput,
  });

  if (config.rulesFile) {
    const createdPath = ensureRulesFile(config.rulesFile, cwd);
    if (loadRulesFile(config.rulesFile, cwd)) {
      logger.success(`✓ Rules file ready (${config.rulesFile})`);
      logger.dim(`  ${createdPath}`);
    }
  }

  if (config.customInstructions) {
    logger.success('✓ Custom instructions saved to config');
  }

  const huskyPresent = hasHusky(cwd);
  if (!huskyPresent) {
    logger.info('Installing Husky...');
    try {
      await execFileAsync('npm', ['install', '--save-dev', 'husky'], { cwd });
      await execFileAsync('npx', ['husky', 'init'], { cwd });
      logger.success('✓ Husky installed');
    } catch {
      logger.warn('⚠ Could not install Husky automatically. Install manually.');
    }
  } else {
    logger.success('✓ Husky detected');
  }

  const huskyDir = join(cwd, '.husky');
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  const hookPath = getPreCommitHookPath(cwd);
  writeFileSync(hookPath, getPreCommitHookContent(), { mode: 0o755 });
  logger.success('✓ Pre-commit hook created');

  writeConfig(cwd, config);
  logger.success(`✓ Config saved (${getConfigFilename()})`);

  ensureLogDir(cwd);
  logger.success('✓ Logs stored in user directory');
  logger.dim(`  ${getLogPath(cwd)}`);

  const ollamaInstalled = await isOllamaInstalled();
  if (ollamaInstalled) {
    logger.success('✓ Ollama installed');
  } else {
    logger.warn('⚠ Ollama not installed — reviews will be skipped');
  }

  if (ollamaInstalled) {
    const running = await isOllamaRunning();
    if (running) {
      logger.success('✓ Ollama running');
      try {
        const modelExists = await hasModel(config.model);
        if (modelExists) {
          logger.success(`✓ Model available (${config.model})`);
        } else {
          logger.warn(
            `⚠ Model not found — run: ollama pull ${config.model}`,
          );
        }
      } catch {
        logger.warn('⚠ Could not verify model availability');
      }
    } else {
      logger.warn('⚠ Ollama not running — start with: ollama serve');
    }
  }

  console.log('');
  logger.info('Setup complete. SculkSense will review staged changes on commit.');
  if (config.rulesFile || config.customInstructions) {
    logger.info('Custom review rules are active for this repository.');
  }
  logger.info('Tip: run `skulksense listen` in another terminal to watch logs.');
}
