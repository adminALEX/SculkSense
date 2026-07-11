export type ReviewResult =
  | { status: 'pass' }
  | { status: 'fail'; reason: string }
  | { status: 'skip'; reason: string };

export function parseReviewResponse(response: string): ReviewResult {
  const trimmed = response.trim();

  if (/^PASS\b/i.test(trimmed)) {
    return { status: 'pass' };
  }

  const failMatch = trimmed.match(/^FAIL:\s*([\s\S]+)/i);
  if (failMatch) {
    return { status: 'fail', reason: failMatch[1].trim() };
  }

  return { status: 'skip', reason: 'Malformed AI response' };
}
