import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { isOllamaRunning } from './health.js';
import { listModels } from './models.js';
import { OLLAMA_BASE_URL } from './client.js';

const execFileAsync = promisify(execFile);

async function unloadModels(): Promise<void> {
  try {
    const models = await listModels();
    for (const model of models) {
      await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.name,
          keep_alive: 0,
        }),
        signal: AbortSignal.timeout(3000),
      });
    }
  } catch {
    // Best effort unload.
  }
}

async function killOllamaProcess(): Promise<boolean> {
  const commands: Array<{ cmd: string; args: string[] }> =
    process.platform === 'darwin'
      ? [
          { cmd: 'killall', args: ['Ollama'] },
          { cmd: 'pkill', args: ['-f', 'ollama'] },
        ]
      : [
          { cmd: 'pkill', args: ['-f', 'ollama'] },
          { cmd: 'killall', args: ['ollama'] },
        ];

  for (const { cmd, args } of commands) {
    try {
      await execFileAsync(cmd, args);
      return true;
    } catch {
      // Try next strategy.
    }
  }

  return false;
}

export async function stopOllamaServer(): Promise<{
  stopped: boolean;
  detail: string;
}> {
  const running = await isOllamaRunning();
  if (!running) {
    return { stopped: false, detail: 'Ollama was not running' };
  }

  await unloadModels();

  const killed = await killOllamaProcess();
  const stillRunning = await isOllamaRunning();

  if (!stillRunning) {
    return { stopped: true, detail: 'Ollama stopped' };
  }

  if (killed) {
    return {
      stopped: false,
      detail: 'Ollama is still running — quit the Ollama app manually',
    };
  }

  return {
    stopped: false,
    detail: 'Could not stop Ollama automatically',
  };
}
