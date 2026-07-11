export const OLLAMA_BASE_URL = 'http://localhost:11434';

export type OllamaGenerateRequest = {
  model: string;
  prompt: string;
  stream: false;
  keep_alive?: string;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
};

export type OllamaGenerateResponse = {
  response: string;
  done: boolean;
};

export async function generate(
  request: OllamaGenerateRequest,
  timeoutMs: number,
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<OllamaGenerateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    return (await response.json()) as OllamaGenerateResponse;
  } finally {
    clearTimeout(timeout);
  }
}
