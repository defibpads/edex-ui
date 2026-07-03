# 2026 Modernization Audit

This document captures a first-pass audit of eDEX-UI from the perspective of keeping a 2021-era Electron app usable on 2026 developer machines and automation workflows.

## Current baseline

- **Runtime:** Electron `^12.1.0`, which bundles an old Chromium and Node runtime.
- **Native modules:** `node-pty`, `osx-temperature-sensor`, and modules that depend on native compilation make install/build sensitive to the host Node, Python, compiler, and CPU architecture.
- **Packaging:** `electron-builder` targets Linux AppImage, macOS DMG, and Windows NSIS. macOS packaging was x64-only before this audit.
- **Security posture:** The renderer still keeps `nodeIntegration: true` and `@electron/remote` for compatibility, but the first hardening pass now enables `contextIsolation`, adds a preload boundary, denies permission prompts, constrains navigation/window creation, and tightens CSP. Removing renderer Node and remote remains the next major security migration.
- **Maintenance status:** The upstream README states the project was archived on October 18, 2021. Treat dependency updates as a porting project, not a routine patch bump.

## Highest-value improvements for 2026

### 1. Apple Silicon and modern CPU packaging

The repository should build first-class artifacts for both Intel and Apple Silicon macOS users. This audit updates the macOS builder configuration so `build-darwin` can emit `x64` and `arm64` DMGs. It also adds explicit `build-darwin-x64`, `build-darwin-arm64`, and `install-darwin` scripts so maintainers can test each architecture intentionally.

Follow-up options:

- Add a `universal` macOS target once native modules are verified on both architectures.
- Add release CI on `macos-15` or newer runners to test Apple Silicon packaging.
- Document Rosetta fallback expectations for legacy x64-only native module builds.

### 2. Electron modernization path

A direct jump from Electron 12 to current Electron is risky because of native modules, deprecated remote APIs, and renderer assumptions. Recommended sequence:

1. Upgrade `node-pty` to a version that supports current Electron/Node ABIs.
2. Continue expanding the preload bridge introduced by the hardening pass.
3. Replace `@electron/remote` usage with explicit `ipcMain`/`ipcRenderer` bridges.
4. Disable renderer `nodeIntegration` after the required APIs are bridged.
5. Only then update Electron and `electron-builder` in controlled steps.

### 3. AI coding-agent context

The repo benefits from first-party instructions for coding agents because the project has unusual constraints: Electron, native modules, asset mirroring, archived upstream context, and cross-platform scripts. This audit adds:

- `AGENTS.md` for Codex-style agents.
- `CLAUDE.md` for Claude Code users.
- `.codex/instructions.md` as a concise Codex workspace brief.
- Built-in terminal launcher shortcuts for local Codex and Claude Code CLIs when those commands are present on `PATH`.

### 4. CI and health checks

This audit adds a lightweight GitHub Actions workflow that verifies JSON metadata and runs dependency-audit commands without attempting a full native rebuild on every push. Native rebuilds should be covered by release workflows per OS/architecture.

### 5. Dependency and supply-chain hygiene

Recommended ongoing checks:

- `npm run audit:deps` from the repository root.
- `npm --prefix src audit` for runtime dependencies.
- `npm run doctor:native` to print the host architecture, Node ABI, Electron/native dependency versions, and available compiler tools before debugging native rebuild failures.
- `npm outdated` for both root and `src` packages before any modernization sprint.
- Manual review of native module support tables before changing Electron.

## Risks to track

- **Renderer privilege:** Node-enabled renderer code still means any XSS-class issue can become local code execution until the remaining Node/remote migration is complete.
- **Stale Chromium:** Electron 12 carries years of browser security fixes missing from the runtime.
- **Native ABI drift:** New Node/Electron releases may break `node-pty` until the dependency is upgraded.
- **macOS signing/notarization:** Unsigned builds are increasingly difficult for users to run on modern macOS.
- **Archived dependencies:** Some dependencies may be abandoned and need replacement rather than upgrade.

## Suggested next implementation milestones

1. Create a dependency update branch focused only on native module compatibility.
2. Add a preload bridge while keeping existing APIs stable.
3. Move one renderer feature at a time away from `remote`.
4. Add signed/notarized release support for macOS if maintainers have certificates.
5. Add smoke tests that launch Electron headlessly and verify the boot window reaches the renderer handshake.
6. Continue expanding AI-assistant affordances beyond launch shortcuts, such as prompt templates or workspace context export, after the security model is modernized.
