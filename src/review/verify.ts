import {
  formatFailure,
  parseAddedDiffLines,
  type AddedDiffLine,
} from './diffLines.js';

function matchAddedLine(
  added: AddedDiffLine[],
  predicate: (content: string) => boolean,
): AddedDiffLine | undefined {
  return added.find((entry) => predicate(entry.content.trim()));
}

export function findStaticIssues(diff: string): string | null {
  const added = parseAddedDiffLines(diff);

  const consoleLog = matchAddedLine(added, (line) =>
    /console\.(log|debug|info)\s*\(/.test(line),
  );
  if (consoleLog) {
    return formatFailure(
      'console.log left in code',
      consoleLog.file,
      consoleLog.line,
    );
  }

  const debuggerLine = matchAddedLine(added, (line) => /\bdebugger\b/.test(line));
  if (debuggerLine) {
    return formatFailure(
      'debugger statement left in code',
      debuggerLine.file,
      debuggerLine.line,
    );
  }

  return null;
}

export function verifyFailReason(reason: string, diff: string): boolean {
  const added = parseAddedDiffLines(diff);
  const addedText = added.map((entry) => entry.content).join('\n');
  const lower = reason.toLowerCase();

  if (lower.includes('console.log') || lower.includes('console.debug')) {
    return /console\.(log|debug|info)\s*\(/.test(addedText);
  }

  if (lower.includes('debugger')) {
    return /\bdebugger\b/.test(addedText);
  }

  if (
    lower.includes('secret') ||
    lower.includes('api key') ||
    lower.includes('password')
  ) {
    return /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]+['"]/i.test(
      addedText,
    );
  }

  if (lower.includes('missing await')) {
    return (
      /\basync\b/.test(addedText) &&
      /(?<!await\s)\b\w+\([^)]*\)\s*;/.test(addedText)
    );
  }

  return true;
}

export function enrichFailReason(reason: string, diff: string): string {
  if (/:[0-9]+\s*$/.test(reason) || /:[0-9]+(\s|$)/.test(reason)) {
    return reason;
  }

  const added = parseAddedDiffLines(diff);
  const lower = reason.toLowerCase();

  if (lower.includes('console.log') || lower.includes('console.debug')) {
    const match = matchAddedLine(added, (line) =>
      /console\.(log|debug|info)\s*\(/.test(line),
    );
    if (match) {
      return formatFailure(
        reason.split('\n')[0].trim(),
        match.file,
        match.line,
      );
    }
  }

  if (lower.includes('debugger')) {
    const match = matchAddedLine(added, (line) => /\bdebugger\b/.test(line));
    if (match) {
      return formatFailure(
        reason.split('\n')[0].trim(),
        match.file,
        match.line,
      );
    }
  }

  const firstAdded = added[0];
  if (firstAdded && added.length === 1) {
    return formatFailure(
      reason.split('\n')[0].trim(),
      firstAdded.file,
      firstAdded.line,
    );
  }

  return reason;
}
