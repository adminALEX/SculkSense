# SculkSense

Fast, local AI pre-commit review using Ollama. Zero API costs. Your code never leaves your machine.

## Features

- **Free forever** — no cloud APIs required
- **Fast** — typical reviews under 2 seconds
- **Local only** — staged diffs reviewed via Ollama on localhost
- **Non-blocking** — skips review when Ollama is unavailable
- **Custom rules** — project-specific instructions or markdown rules file
- **Husky-ready** — one-command setup
- **Pause anytime** — `skulksense stop` skips reviews and stops Ollama without uninstalling

## Requirements

- Node.js 20+
- Git
- [Ollama](https://ollama.com/) (optional but recommended)

## Install

```bash
npm install --save-dev skulksense
```

## Quick Start

```bash
npx skulksense init
```

This will:

- Ask for optional custom review rules (inline or markdown file)
- Detect your Git repository
- Install/configure Husky if needed
- Create `.husky/pre-commit`
- Create `skulksense.config.json`
- Verify Ollama and the configured model

Then commit as usual:

```bash
git add .
git commit -m "feat: add user service"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `skulksense init` | Initialize in the current repo |
| `skulksense review` | Run review manually on staged changes |
| `skulksense doctor` | Check Git, Husky, Ollama, config, model |
| `skulksense log` | View recent review logs |
| `skulksense listen` | Watch logs in real time during commits |
| `skulksense stop` | Pause reviews for this repo and stop Ollama |
| `skulksense start` | Resume pre-commit reviews for this repo |
| `skulksense version` | Show package version |
| `skulksense --help` | Show help |

## Viewing logs

Every review writes to your user directory (not the project root):

```text
~/.skulksense/logs/<project-id>/review.log
```

Each Git project gets its own log file based on its path.

**Terminal 1** — watch logs live while you work:

```bash
npx skulksense listen
```

**Terminal 2** — commit as usual:

```bash
git commit -m "feat: add feature"
```

**View past logs:**

```bash
npx skulksense log
npx skulksense log --lines 100
npx skulksense log --all
```

Example log lines:

```text
[2026-07-12T00:14:01.234Z] REVIEW_START trigger=commit project=/path/to/your/repo
[2026-07-12T00:14:02.102Z] REVIEW_PASS duration=868ms model=qwen2.5-coder:1.5b
```

## Configuration

Create `skulksense.config.json` in your project root:

```json
{
  "model": "qwen2.5-coder:1.5b",
  "timeout": 5000,
  "minChangedLines": 5,
  "maxDiffChars": 4000,
  "ignore": [
    "*.md",
    "*.png",
    "*.jpg",
    "*.svg",
    "*.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "dist/**",
    "build/**"
  ]
}
```

### Custom review rules

During `skulksense init`, you can add project-specific rules:

1. **Inline instructions** — stored in `customInstructions` in config
2. **Markdown rules file** — path stored as `rulesFile` (default: `.skulksense-rules.md`)

Example config with custom rules:

```json
{
  "model": "qwen2.5-coder:1.5b",
  "timeout": 10000,
  "minChangedLines": 5,
  "maxDiffChars": 4000,
  "rulesFile": ".skulksense-rules.md",
  "customInstructions": "Reject commits that add hardcoded API URLs."
}
```

Example `.skulksense-rules.md`:

```markdown
# SkulkSense Review Rules

- Never commit `fetch` calls without error handling
- React hooks must follow the rules of hooks
- Do not add new `any` types in TypeScript files
```

Custom rules are merged with built-in checks during every review.

## Pausing SkulkSense

To temporarily disable pre-commit reviews **in the current repo only** (without uninstalling or leaving the project):

```bash
npx skulksense stop
```

This will:

- Create `.skulksense/disabled` so the Husky hook exits immediately
- Stop any running Ollama process
- Leave config, hooks, and logs in place

Commits behave as if SkulkSense were not installed. Resume anytime:

```bash
npx skulksense start
```

## What It Checks

SculkSense only **fails** commits for high-confidence issues:

- Missing `await`
- Null/undefined access
- Secrets/API keys
- `debugger` statements
- `console.log` left in code
- SQL injection
- XSS
- Obvious logic bugs

It **ignores** formatting, naming, refactoring, architecture, and suggestions.

## Skip Conditions

Review is skipped (commit proceeds) when:

- Ollama is not installed or not running
- No staged changes
- Only ignored files changed
- Diff is below `minChangedLines`
- AI times out or returns a malformed response

## Development

```bash
git clone https://github.com/adminALEX/SculkSense.git
cd SculkSense
npm install
npm run build
npm test
```

## License

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
