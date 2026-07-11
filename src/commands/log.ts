import { existsSync } from 'node:fs';
import { getLogPath, readLogLines } from '../logging/fileLogger.js';
import { logger } from '../ui/logger.js';

type LogOptions = {
  lines?: string;
  all?: boolean;
};

export function logCommand(options: LogOptions): void {
  const cwd = process.cwd();
  const logPath = getLogPath(cwd);

  logger.brand();
  console.log('');

  if (!existsSync(logPath)) {
    logger.warn('No review logs yet.');
    logger.dim(`Log file: ${logPath}`);
    logger.info('\nRun a review or commit to generate logs.');
    logger.info('Tip: use `skulksense listen` in another terminal while committing.');
    return;
  }

  const lineCount = options.all ? 0 : Number(options.lines ?? 50);
  const lines = readLogLines(cwd, lineCount);

  logger.dim(`Log file: ${logPath}`);
  console.log('');

  if (lines.length === 0) {
    logger.info('Log file is empty.');
    return;
  }

  for (const line of lines) {
    console.log(line);
  }
}
