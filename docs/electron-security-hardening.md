# Electron Security Hardening

This repository still has a legacy renderer architecture, but the main process now applies a stricter Electron security baseline without breaking the current UI.

## Implemented hardening

- `contextIsolation` is enabled for the main `BrowserWindow`.
- A preload script is installed at `src/preload/security-preload.js` to establish a bridge location for the ongoing Node/remote migration.
- `worldSafeExecuteJavaScript` is enabled.
- `webSecurity` remains enabled and insecure mixed content remains disabled.
- `webviewTag` is explicitly disabled.
- Permission prompts are denied by default.
- New windows are denied; external navigation is only forwarded to the OS browser for `http:` and `https:` URLs.
- Top-level navigation is constrained to the packaged `ui.html` file.
- The Content Security Policy now blocks objects, frames, and base URI injection while allowing the legacy local scripts/styles the app still needs.

## Compatibility debt that remains

The renderer still uses `nodeIntegration: true` and `@electron/remote`. Those are intentionally left in place for this pass because the renderer and class modules call `require()` directly. The safe migration path is:

1. Move filesystem, shell, settings, shortcut, and Electron APIs behind preload-exposed methods.
2. Replace `@electron/remote` calls with explicit IPC handlers.
3. Disable `enableRemoteModule`.
4. Disable renderer `nodeIntegration`.
5. Remove `'unsafe-inline'` from CSP after inline handlers and generated styles are refactored.
