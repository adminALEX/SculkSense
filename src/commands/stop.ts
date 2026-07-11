import { isGitRepository } from '../git/run.js';
import { ensureOptimalPreCommitHook } from '../git/upgrade.js';
import { stopOllamaServer } from '../ollama/stop.js';
import { isReviewStopped, stopReviews } from '../state/disabled.js';
import { logger } from '../ui/logger.js';

export async function stopCommand(): Promise<void> {
  const cwd = process.cwd();
  logger.brand();
  console.log('');

  const isGit = await isGitRepository(cwd);
  if (!isGit) {
    logger.error('Error: Not a Git repository.');
    process.exit(1);
  }

  if (isReviewStopped(cwd)) {
    logger.info('SkulkSense is already paused in this repository.');
    process.exit(0);
  }

  stopReviews(cwd);
  ensureOptimalPreCommitHook(cwd);

  const ollama = await stopOllamaServer();

  logger.success('✓ SkulkSense paused for this repository');
  logger.info('  Pre-commit reviews will be skipped');
  logger.dim('  Marker: .skulksense/disabled');

  if (ollama.stopped) {
    logger.success(`✓ ${ollama.detail}`);
  } else {
    logger.warn(`⚠ ${ollama.detail}`);
  }

  console.log('');
  logger.info('Commits will proceed without SkulkSense checks.');
  logger.info('Run `skulksense start` to resume.');
}
