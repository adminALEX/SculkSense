import { cosmiconfig } from 'cosmiconfig';
import { DEFAULT_CONFIG, type SculkSenseConfig } from './defaults.js';

const explorer = cosmiconfig('skulksense');

export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<SculkSenseConfig> {
  const result = await explorer.search(cwd);

  if (!result?.config) {
    return { ...DEFAULT_CONFIG, ignore: [...DEFAULT_CONFIG.ignore] };
  }

  const config = result.config as Partial<SculkSenseConfig>;

  return {
    model: config.model ?? DEFAULT_CONFIG.model,
    timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    minChangedLines: config.minChangedLines ?? DEFAULT_CONFIG.minChangedLines,
    ignore: config.ignore ?? [...DEFAULT_CONFIG.ignore],
  };
}

export function getConfigFilename(): string {
  return 'skulksense.config.json';
}
