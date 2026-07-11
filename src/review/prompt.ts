export function buildReviewPrompt(diff: string): string {
  return `You are a strict pre-commit code reviewer. Review ONLY the staged git diff below.

FAIL only for high-confidence issues:
- Missing await on async calls
- Null/undefined access
- Secrets or API keys
- debugger statements
- console.log left in code
- SQL injection vulnerabilities
- XSS vulnerabilities
- Obvious logic bugs

IGNORE completely:
- Formatting
- Naming
- Refactoring suggestions
- Architecture
- Documentation
- Style preferences

Respond with EXACTLY one of these formats:

PASS

or

FAIL:
<single concise reason on next lines, include file:line if known>

Do not include any other text.

STAGED DIFF:
${diff}`;
}
