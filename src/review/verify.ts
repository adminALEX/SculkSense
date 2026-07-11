function getAddedLines(diff: string): string[] {
  return diff
    .split('\n')
    .filter(
      (line) =>
        line.startsWith('+') && !line.startsWith('+++') && !line.startsWith('++'),
    )
    .map((line) => line.slice(1));
}

export function findStaticIssues(diff: string): string | null {
  const added = getAddedLines(diff);

  for (const line of added) {
    const trimmed = line.trim();
    if (/console\.(log|debug|info)\s*\(/.test(trimmed)) {
      return 'console.log left in code';
    }
    if (/\bdebugger\b/.test(trimmed)) {
      return 'debugger statement left in code';
    }
  }

  return null;
}

export function verifyFailReason(reason: string, diff: string): boolean {
  const added = getAddedLines(diff).join('\n');
  const lower = reason.toLowerCase();

  if (lower.includes('console.log') || lower.includes('console.debug')) {
    return /console\.(log|debug|info)\s*\(/.test(added);
  }

  if (lower.includes('debugger')) {
    return /\bdebugger\b/.test(added);
  }

  if (lower.includes('secret') || lower.includes('api key') || lower.includes('password')) {
    return /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]+['"]/i.test(
      added,
    );
  }

  if (lower.includes('missing await')) {
    return /\basync\b/.test(added) && /(?<!await\s)\b\w+\([^)]*\)\s*;/.test(added);
  }

  return true;
}
