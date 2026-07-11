import { cosmiconfig } from 'cosmiconfig';
import { DEFAULT_CONFIG, type SculkSenseConfig } from './defaults.js';

const explorer = cosmiconfig('skulksense');

const MIN_TIMEOUT_MS = 10_000;

function mergeIgnorePatterns(userIgnore?: string[]): string[] {
  const merged: string[] = [...DEFAULT_CONFIG.ignore];

  for (const pattern of userIgnore ?? []) {
    if (!merged.includes(pattern)) {
      merged.push(pattern);
    }
  }

  return merged;
}

function resolveTimeout(userTimeout?: number): number {
  const configured = userTimeout ?? DEFAULT_CONFIG.timeout;
  return Math.max(configured, MIN_TIMEOUT_MS);
}

export function resolveConfig(
  partial?: Partial<SculkSenseConfig>,
): SculkSenseConfig {
  const config: SculkSenseConfig = {
    model: partial?.model ?? DEFAULT_CONFIG.model,
    timeout: resolveTimeout(partial?.timeout),
    minChangedLines:
      partial?.minChangedLines ?? DEFAULT_CONFIG.minChangedLines,
    maxDiffChars: partial?.maxDiffChars ?? DEFAULT_CONFIG.maxDiffChars,
    ignore: mergeIgnorePatterns(partial?.ignore),
  };

  if (partial?.customInstructions?.trim()) {
    config.customInstructions = partial.customInstructions.trim();
  }

  if (partial?.rulesFile?.trim()) {
    config.rulesFile = partial.rulesFile.trim();
  }

  return config;
}

export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<SculkSenseConfig> {
  const result = await explorer.search(cwd);

  if (!result?.config) {
    return resolveConfig();
  }

  return resolveConfig(result.config as Partial<SculkSenseConfig>);
}

export function getConfigFilename(): string {
  return 'skulksense.config.json';
}
