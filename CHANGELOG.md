# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project scaffold
- CLI commands: `init`, `review`, `doctor`, `version`
- Ollama integration for local AI review
- Husky pre-commit hook setup
- Config via `skulksense.config.json`
- Skip logic for infrastructure failures

## [0.1.7] - 2026-07-12

### Fixed

- Zero-config: auto-upgrade outdated Husky hooks on review (no manual hook edits)
- Zero-config: enforce safe minimum timeout and always merge default ignore patterns
- Detect commit context via Husky env vars for accurate logs

## [0.1.6] - 2026-07-12

### Fixed

- Pre-warm Ollama model when unloaded (fixes timeouts on small diffs after idle)
- Increase default review timeout to 10s; model load uses a separate 60s window
- Show "Loading Ollama model..." spinner on first run

## [0.1.5] - 2026-07-12

### Fixed

- Send only non-ignored file diffs to Ollama (fixes timeouts on lockfile commits)
- Truncate very large diffs with `maxDiffChars` (default 4000)
- Use faster Husky hook (`skulksense review` instead of `npx`)
- Keep model warm with `keep_alive` and shorter `num_predict` for PASS/FAIL

## [0.1.4] - 2026-07-12

### Changed

- Increase default AI review timeout from 3s to 5s to reduce false skips

## [0.1.3] - 2026-07-12

### Changed

- Store review logs in `~/.skulksense/logs/` instead of the project root

## [0.1.2] - 2026-07-12

### Added

- `skulksense log` command to view recent review logs
- `skulksense listen` command to watch logs in real time during commits
- Review events written to `~/.skulksense/logs/<project-id>/review.log`

## [0.1.1] - 2026-07-12

### Fixed

- Add Node shebang to CLI entry so `npx skulksense` runs correctly

## [0.1.0] - 2026-07-11

### Added

- Project initialization and open source foundation
