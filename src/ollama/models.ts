import { OLLAMA_BASE_URL } from './client.js';

export type OllamaModel = {
  name: string;
  modified_at?: string;
  size?: number;
};

type OllamaTagsResponse = {
  models: OllamaModel[];
};

export async function listModels(
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<OllamaModel[]> {
  const response = await fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = (await response.json()) as OllamaTagsResponse;
  return data.models ?? [];
}

export async function hasModel(
  model: string,
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<boolean> {
  const models = await listModels(baseUrl);
  return models.some((m) => m.name === model || m.name.startsWith(`${model}:`));
}
