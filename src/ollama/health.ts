import { OLLAMA_BASE_URL } from './client.js';

export async function isOllamaRunning(
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function isOllamaInstalled(): Promise<boolean> {
  try {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execFileAsync = promisify(execFile);
    await execFileAsync('which', ['ollama']);
    return true;
  } catch {
    return false;
  }
}
