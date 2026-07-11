import type { SculkSenseConfig } from '../config/defaults.js';
import {
  countChangedLines,
  getStagedDiffForFiles,
} from '../git/diff.js';
import { getStagedFiles } from '../git/stagedFiles.js';
import { generate } from '../ollama/client.js';
import { isOllamaInstalled, isOllamaRunning } from '../ollama/health.js';
import { isModelLoaded, warmModel } from '../ollama/warmup.js';
import { filterReviewableFiles } from './filters.js';
import { parseReviewResponse, type ReviewResult } from './parser.js';
import { buildReviewPrompt } from './prompt.js';
import { truncateDiff } from './truncate.js';
import { findStaticIssues, verifyFailReason, enrichFailReason } from './verify.js';

export type ReviewOutcome = ReviewResult & {
  durationMs: number;
  model?: string;
  modelWarmupMs?: number;
};

export async function reviewStagedChanges(
  config: SculkSenseConfig,
  cwd: string = process.cwd(),
): Promise<ReviewOutcome> {
  const start = Date.now();

  const installed = await isOllamaInstalled();
  if (!installed) {
    return {
      status: 'skip',
      reason: 'Ollama not installed',
      durationMs: Date.now() - start,
    };
  }

  const running = await isOllamaRunning();
  if (!running) {
    return {
      status: 'skip',
      reason: 'Ollama not running',
      durationMs: Date.now() - start,
    };
  }

  const stagedFiles = await getStagedFiles(cwd);
  if (stagedFiles.length === 0) {
    return {
      status: 'skip',
      reason: 'No staged changes',
      durationMs: Date.now() - start,
    };
  }

  const reviewableFiles = filterReviewableFiles(stagedFiles, config.ignore);
  if (reviewableFiles.length === 0) {
    return {
      status: 'skip',
      reason: 'Only ignored files changed',
      durationMs: Date.now() - start,
    };
  }

  const diff = await getStagedDiffForFiles(reviewableFiles, cwd);
  const changedLines = countChangedLines(diff);

  if (changedLines < config.minChangedLines) {
    return {
      status: 'skip',
      reason: `Diff below threshold (${changedLines} < ${config.minChangedLines} lines)`,
      durationMs: Date.now() - start,
    };
  }

  const truncatedDiff = truncateDiff(diff, config.maxDiffChars);
  const staticIssue = findStaticIssues(truncatedDiff);

  if (staticIssue) {
    return {
      status: 'fail',
      reason: staticIssue,
      durationMs: Date.now() - start,
      model: config.model,
    };
  }

  try {
    let modelWarmupMs = 0;
    if (!(await isModelLoaded(config.model))) {
      modelWarmupMs = await warmModel(config.model);
    }

    const prompt = buildReviewPrompt(truncatedDiff);
    const response = await generate(
      {
        model: config.model,
        prompt,
        stream: false,
        keep_alive: '5m',
        options: { temperature: 0, num_predict: 32 },
      },
      config.timeout,
    );

    const parsed = parseReviewResponse(response.response);

    if (
      parsed.status === 'fail' &&
      !verifyFailReason(parsed.reason, truncatedDiff)
    ) {
      return {
        status: 'pass',
        durationMs: Date.now() - start,
        model: config.model,
        modelWarmupMs: modelWarmupMs || undefined,
      };
    }

    if (parsed.status === 'fail') {
      return {
        status: 'fail',
        reason: enrichFailReason(parsed.reason, truncatedDiff),
        durationMs: Date.now() - start,
        model: config.model,
        modelWarmupMs: modelWarmupMs || undefined,
      };
    }

    return {
      ...parsed,
      durationMs: Date.now() - start,
      model: config.model,
      modelWarmupMs: modelWarmupMs || undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'AI timeout'
        : 'AI review failed';

    return {
      status: 'skip',
      reason: message,
      durationMs: Date.now() - start,
    };
  }
}
