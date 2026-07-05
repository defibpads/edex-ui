# AI Assistant Shortcuts

eDEX-UI can now seed terminal shortcuts for local AI coding assistants when their command-line tools are installed on the host.

## Default shortcuts

| Shortcut | Command | Enabled by default when |
| --- | --- | --- |
| `Ctrl+Shift+Alt+C` | `codex` | `codex` is available on `PATH` |
| `Ctrl+Shift+Alt+L` | `claude` | `claude` is available on `PATH` |

The shortcuts are regular shell shortcuts stored in the user's `shortcuts.json`, so users can edit, disable, or change the commands from the shortcuts file just like any other custom command shortcut.

## Migration behavior

At boot, eDEX-UI now merges newly introduced default shortcuts into an existing `shortcuts.json` without overwriting customized shortcuts. This keeps existing user keymaps intact while making the Codex and Claude Code launchers available to current installations.

If a CLI is not installed when eDEX-UI starts, the corresponding shortcut is added with `enabled: false`. Users can install the CLI later, open the shortcuts file, and enable or customize the shortcut.
