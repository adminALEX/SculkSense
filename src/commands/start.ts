import { isGitRepository } from '../git/run.js';
import { ensureOptimalPreCommitHook } from '../git/upgrade.js';
import { isReviewStopped, startReviews } from '../state/disabled.js';
import { logger } from '../ui/logger.js';

export async function startCommand(): Promise<void> {
  const cwd = process.cwd();
  logger.brand();
  console.log('');

  const isGit = await isGitRepository(cwd);
  if (!isGit) {
    logger.error('Error: Not a Git repository.');
    process.exit(1);
  }

  if (!isReviewStopped(cwd)) {
    logger.info('SkulkSense is already active in this repository.');
    process.exit(0);
  }

  startReviews(cwd);
  ensureOptimalPreCommitHook(cwd);

  logger.success('✓ SkulkSense resumed for this repository');
  logger.info('  Pre-commit reviews are enabled again');
  console.log('');
  logger.info('Start Ollama if needed: ollama serve');
}
