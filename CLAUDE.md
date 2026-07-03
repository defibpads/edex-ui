# Claude Code Notes

This repository is a legacy Electron app with native modules. Keep changes incremental and preserve cross-platform behavior.

## Architecture quick map

- `src/_boot.js`: Electron main process and window creation.
- `src/_renderer.js`: renderer bootstrap and UI initialization.
- `src/classes/`: application modules for terminal, system info, filesystem, networking, media, and UI panels.
- `src/assets/`: themes, fonts, CSS, keyboard layouts, audio, and icons.
- `prebuild-minify.js`: prepares the packaged source tree before electron-builder runs.

## Modernization priorities

1. Apple Silicon packaging and native-module verification.
2. Replace `@electron/remote` with explicit IPC and a preload bridge.
3. Move toward `contextIsolation: true` after renderer APIs are bridged.
4. Upgrade Electron only after native modules are compatible.
5. Add release CI per operating system and architecture.

## Commands

- `npm run check:metadata`
- `npm run audit:deps`
- `npm --prefix src audit`
- `npm run doctor:native`
- `npm run build-darwin-arm64` on Apple Silicon release hosts
