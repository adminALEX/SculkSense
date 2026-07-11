import { createHash } from 'node:crypto';
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { ReviewOutcome } from '../review/reviewer.js';

const APP_DIR = '.skulksense';
const LOG_FILE = 'review.log';

export function getGlobalLogRoot(): string {
  if (process.env.SKULKSENSE_LOG_DIR) {
    return process.env.SKULKSENSE_LOG_DIR;
  }
  return join(homedir(), APP_DIR, 'logs');
}

function getProjectId(cwd: string): string {
  return createHash('sha256').update(resolve(cwd)).digest('hex').slice(0, 16);
}

export function getLogDir(cwd: string = process.cwd()): string {
  return join(getGlobalLogRoot(), getProjectId(cwd));
}

export function getLogPath(cwd: string = process.cwd()): string {
  return join(getLogDir(cwd), LOG_FILE);
}

export function ensureLogDir(cwd: string = process.cwd()): void {
  const dir = getLogDir(cwd);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

export function appendLogLine(
  message: string,
  cwd: string = process.cwd(),
): void {
  ensureLogDir(cwd);
  appendFileSync(getLogPath(cwd), `[${timestamp()}] ${message}\n`, 'utf-8');
}

export function logReviewStart(
  cwd: string = process.cwd(),
  trigger: 'commit' | 'manual' = 'manual',
): void {
  appendLogLine(
    `REVIEW_START trigger=${trigger} project=${resolve(cwd)}`,
    cwd,
  );
}

export function logReviewOutcome(
  outcome: ReviewOutcome,
  cwd: string = process.cwd(),
): void {
  const parts = [
    `REVIEW_${outcome.status.toUpperCase()}`,
    `duration=${outcome.durationMs}ms`,
  ];

  if (outcome.model) {
    parts.push(`model=${outcome.model}`);
  }

  if (outcome.modelWarmupMs) {
    parts.push(`modelLoad=${outcome.modelWarmupMs}ms`);
  }

  if (outcome.status === 'fail' || outcome.status === 'skip') {
    parts.push(`reason="${outcome.reason}"`);
  }

  appendLogLine(parts.join(' '), cwd);
}

export function readLogLines(
  cwd: string = process.cwd(),
  lines = 50,
): string[] {
  const logPath = getLogPath(cwd);
  if (!existsSync(logPath)) {
    return [];
  }

  const content = readFileSync(logPath, 'utf-8').trim();
  if (!content) {
    return [];
  }

  const allLines = content.split('\n');
  if (lines <= 0) {
    return allLines;
  }

  return allLines.slice(-lines);
}

export function readLogTail(
  cwd: string = process.cwd(),
  fromByte = 0,
): { content: string; nextByte: number } {
  const logPath = getLogPath(cwd);
  if (!existsSync(logPath)) {
    return { content: '', nextByte: 0 };
  }

  const size = statSync(logPath).size;
  if (fromByte >= size) {
    return { content: '', nextByte: size };
  }

  const fd = openSync(logPath, 'r');
  const buffer = Buffer.alloc(size - fromByte);
  readSync(fd, buffer, 0, buffer.length, fromByte);
  closeSync(fd);

  return { content: buffer.toString('utf-8'), nextByte: size };
}
