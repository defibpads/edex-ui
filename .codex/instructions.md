# Codex Workspace Brief

You are working on eDEX-UI, a GPL-3.0 Electron terminal/system-monitor UI. The app is legacy but valuable; optimize for safe modernization.

## Before editing

- Read `AGENTS.md` and `docs/2026-modernization-audit.md`.
- Check both root `package.json` and `src/package.json`; dependencies are split between build tooling and packaged runtime.

## Preferred approach

- Make focused commits.
- Avoid sweeping Electron upgrades unless the task is explicitly about dependency porting.
- Preserve Linux, macOS x64, macOS arm64, and Windows compatibility.
- Explain any security trade-offs around renderer privileges, preload scripts, IPC, or remote-module removal.

## Validation

Start with:

```sh
npm run check:metadata
```

Then run dependency audits as environment allows:

```sh
npm run audit:deps
npm --prefix src audit
npm run doctor:native
```
