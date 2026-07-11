import { loadConfig } from '../config/load.js';
import { isGitRepository } from '../git/run.js';
import { logReviewOutcome, logReviewStart } from '../logging/fileLogger.js';
import { reviewStagedChanges } from '../review/reviewer.js';
import { colors } from '../ui/colors.js';
import { logger } from '../ui/logger.js';
import { createSpinner } from '../ui/spinner.js';

export async function reviewCommand(): Promise<void> {
  const cwd = process.cwd();
  logger.brand();
  console.log('');

  const isGit = await isGitRepository(cwd);
  if (!isGit) {
    logger.error('Error: Not a Git repository.');
    process.exit(1);
  }

  const config = await loadConfig(cwd);
  const spinner = createSpinner('Reviewing staged changes...');

  logReviewStart(cwd, process.env.HUSKY ? 'commit' : 'manual');

  const outcome = await reviewStagedChanges(config, cwd);
  logReviewOutcome(outcome, cwd);
  spinner.stop();

  if (outcome.status === 'skip') {
    console.log('');
    logger.info('Skipping AI review\n');
    logger.dim('Reason:');
    console.log(outcome.reason);
    process.exit(0);
  }

  if (outcome.model) {
    console.log('');
    logger.dim('Model:');
    console.log(outcome.model);
    console.log('');
  }

  if (outcome.status === 'pass') {
    logger.success('✓ PASS');
  } else {
    console.log(colors.fail('❌ FAIL'));
    console.log('');
    console.log(outcome.reason);
    process.exit(1);
  }

  console.log('');
  logger.dim('Time:');
  console.log(`${outcome.durationMs} ms`);
}
