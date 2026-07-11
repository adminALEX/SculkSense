import type { SculkSenseConfig } from '../config/defaults.js';
import { countChangedLines, getStagedDiff } from '../git/diff.js';
import { getStagedFiles } from '../git/stagedFiles.js';
import { generate } from '../ollama/client.js';
import { isOllamaInstalled, isOllamaRunning } from '../ollama/health.js';
import { filterReviewableFiles } from './filters.js';
import { parseReviewResponse, type ReviewResult } from './parser.js';
import { buildReviewPrompt } from './prompt.js';

export type ReviewOutcome = ReviewResult & {
  durationMs: number;
  model?: string;
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

  const diff = await getStagedDiff(cwd);
  const changedLines = countChangedLines(diff);

  if (changedLines < config.minChangedLines) {
    return {
      status: 'skip',
      reason: `Diff below threshold (${changedLines} < ${config.minChangedLines} lines)`,
      durationMs: Date.now() - start,
    };
  }

  try {
    const prompt = buildReviewPrompt(diff);
    const response = await generate(
      {
        model: config.model,
        prompt,
        stream: false,
        options: { temperature: 0, num_predict: 128 },
      },
      config.timeout,
    );

    const parsed = parseReviewResponse(response.response);
    return {
      ...parsed,
      durationMs: Date.now() - start,
      model: config.model,
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
