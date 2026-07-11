import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DEFAULT_CONFIG } from '../config/defaults.js';
import { getConfigFilename } from '../config/load.js';
import {
  getPreCommitHookContent,
  getPreCommitHookPath,
  hasHusky,
} from '../git/husky.js';
import { isGitRepository } from '../git/run.js';
import { isOllamaInstalled, isOllamaRunning } from '../ollama/health.js';
import { hasModel } from '../ollama/models.js';
import { logger } from '../ui/logger.js';

const execFileAsync = promisify(execFile);

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

  const configPath = join(cwd, getConfigFilename());
  if (!existsSync(configPath)) {
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          model: DEFAULT_CONFIG.model,
          timeout: DEFAULT_CONFIG.timeout,
          minChangedLines: DEFAULT_CONFIG.minChangedLines,
          ignore: [...DEFAULT_CONFIG.ignore],
        },
        null,
        2,
      ) + '\n',
    );
    logger.success(`✓ Config created (${getConfigFilename()})`);
  } else {
    logger.info(`• Config already exists (${getConfigFilename()})`);
  }

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
        const modelExists = await hasModel(DEFAULT_CONFIG.model);
        if (modelExists) {
          logger.success(`✓ Model available (${DEFAULT_CONFIG.model})`);
        } else {
          logger.warn(
            `⚠ Model not found — run: ollama pull ${DEFAULT_CONFIG.model}`,
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
}
