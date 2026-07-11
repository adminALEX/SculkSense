import { generate, OLLAMA_BASE_URL } from './client.js';

type PsResponse = {
  models?: Array<{ name: string; model: string }>;
};

export async function isModelLoaded(
  model: string,
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/ps`, {
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as PsResponse;
    return (data.models ?? []).some(
      (entry) =>
        entry.name === model ||
        entry.model === model ||
        entry.name.startsWith(`${model}:`),
    );
  } catch {
    return false;
  }
}

export async function warmModel(
  model: string,
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<number> {
  const start = Date.now();

  await generate(
    {
      model,
      prompt: 'PASS',
      stream: false,
      keep_alive: '5m',
      options: { temperature: 0, num_predict: 1 },
    },
    60_000,
    baseUrl,
  );

  return Date.now() - start;
}
