export function truncateDiff(diff: string, maxChars: number): string {
  if (diff.length <= maxChars) {
    return diff;
  }

  return `${diff.slice(0, maxChars)}\n\n[diff truncated — ${diff.length - maxChars} chars omitted for speed]`;
}
