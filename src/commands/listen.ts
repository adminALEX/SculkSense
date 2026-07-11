import { existsSync, statSync, watch } from 'node:fs';
import {
  appendLogLine,
  ensureLogDir,
  getLogPath,
  readLogLines,
  readLogTail,
} from '../logging/fileLogger.js';
import { logger } from '../ui/logger.js';

type ListenOptions = {
  lines?: string;
};

export async function listenCommand(options: ListenOptions): Promise<void> {
  const cwd = process.cwd();
  const logPath = getLogPath(cwd);
  const previewLines = Number(options.lines ?? 10);

  logger.brand();
  console.log('');
  logger.info('Listening for review logs...');
  logger.dim(`Log file: ${logPath}`);
  logger.dim('Press Ctrl+C to stop.\n');

  ensureLogDir(cwd);

  if (!existsSync(logPath)) {
    appendLogLine('LISTEN_READY Waiting for reviews...', cwd);
  }

  if (previewLines > 0) {
    const recent = readLogLines(cwd, previewLines);
    if (recent.length > 0) {
      logger.dim(`--- last ${recent.length} lines ---`);
      for (const line of recent) {
        console.log(line);
      }
      console.log('');
    }
  }

  let position = statSync(logPath).size;

  const printNew = (): void => {
    const { content, nextByte } = readLogTail(cwd, position);
    if (content) {
      process.stdout.write(content);
    }
    position = nextByte;
  };

  watch(logPath, { persistent: true }, () => {
    printNew();
  });

  await new Promise<void>(() => {
    // Keep process alive until Ctrl+C.
  });
}
