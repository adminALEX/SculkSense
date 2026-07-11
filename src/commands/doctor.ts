import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig, getConfigFilename } from '../config/load.js';
import { hasHusky, getPreCommitHookPath } from '../git/husky.js';
import { isGitRepository } from '../git/run.js';
import { isOllamaInstalled, isOllamaRunning } from '../ollama/health.js';
import { hasModel } from '../ollama/models.js';
import { logger } from '../ui/logger.js';

type CheckResult = { name: string; pass: boolean; detail?: string };

export async function doctorCommand(): Promise<void> {
  const cwd = process.cwd();
  logger.brand();
  console.log('');
  logger.info('Running diagnostics...\n');

  const checks: CheckResult[] = [];

  checks.push({
    name: 'Git',
    pass: await isGitRepository(cwd),
    detail: 'inside a repository',
  });

  checks.push({
    name: 'Husky',
    pass: hasHusky(cwd),
    detail: '.husky directory',
  });

  const hookPath = getPreCommitHookPath(cwd);
  checks.push({
    name: 'Pre-commit hook',
    pass: existsSync(hookPath),
    detail: hookPath,
  });

  const configPath = join(cwd, getConfigFilename());
  checks.push({
    name: 'Config',
    pass: existsSync(configPath),
    detail: getConfigFilename(),
  });

  const ollamaInstalled = await isOllamaInstalled();
  checks.push({
    name: 'Ollama installed',
    pass: ollamaInstalled,
  });

  const ollamaRunning = ollamaInstalled ? await isOllamaRunning() : false;
  checks.push({
    name: 'Ollama running',
    pass: ollamaRunning,
  });

  let modelPass = false;
  let modelDetail = '';
  if (ollamaRunning) {
    try {
      const config = await loadConfig(cwd);
      modelPass = await hasModel(config.model);
      modelDetail = config.model;
    } catch {
      modelDetail = 'could not verify';
    }
  }
  checks.push({
    name: 'Model',
    pass: modelPass,
    detail: modelDetail || undefined,
  });

  for (const check of checks) {
    const icon = check.pass ? '✓ PASS' : '✗ FAIL';
    const detail = check.detail ? ` — ${check.detail}` : '';
    if (check.pass) {
      logger.success(`${check.name}: ${icon}${detail}`);
    } else {
      logger.error(`${check.name}: ${icon}${detail}`);
    }
  }

  const allPass = checks.every((c) => c.pass);
  console.log('');
  if (allPass) {
    logger.success('All checks passed.');
  } else {
    logger.warn('Some checks failed. Commits may skip AI review.');
  }

  process.exit(allPass ? 0 : 1);
}
