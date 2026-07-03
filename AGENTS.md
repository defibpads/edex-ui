# Agent Instructions for eDEX-UI

## Project context

- eDEX-UI is an Electron desktop application with native runtime dependencies.
- The upstream project was archived in 2021; treat modernization as careful porting work.
- Root `package.json` manages build tooling. `src/package.json` manages the packaged Electron app runtime.

## Working rules

- Prefer small, reviewable changes over broad dependency jumps.
- Do not wrap imports or `require` calls in try/catch blocks.
- Keep cross-platform behavior in mind: Linux, macOS Intel, macOS Apple Silicon, and Windows.
- When changing Electron settings, document the security and compatibility trade-off.
- When changing native dependencies, test or document the affected Node/Electron ABI.

## Useful checks

- `npm run check:metadata`
- `npm run audit:deps`
- `npm --prefix src audit`
- `npm run doctor:native`

Full install/build checks may require platform-specific compilers, Python, and Electron native rebuild support.
