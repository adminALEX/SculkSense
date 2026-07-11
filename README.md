# SculkSense

Fast, local AI pre-commit review using Ollama. Zero API costs. Your code never leaves your machine.

## Features

- **Free forever** — no cloud APIs required
- **Fast** — typical reviews under 2 seconds
- **Local only** — staged diffs reviewed via Ollama on localhost
- **Non-blocking** — skips review when Ollama is unavailable
- **Husky-ready** — one-command setup

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
| `skulksense version` | Show package version |
| `skulksense --help` | Show help |

## Viewing logs

Every review writes to `.skulksense/review.log` in your project.

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
[2026-07-12T00:14:01.234Z] REVIEW_START trigger=commit
[2026-07-12T00:14:02.102Z] REVIEW_PASS duration=868ms model=qwen2.5-coder:1.5b
```

## Configuration

Create `skulksense.config.json` in your project root:

```json
{
  "model": "qwen2.5-coder:1.5b",
  "timeout": 3000,
  "minChangedLines": 5,
  "ignore": [
    "*.md",
    "*.png",
    "*.jpg",
    "*.svg",
    "*.lock",
    "dist/**",
    "build/**"
  ]
}
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
