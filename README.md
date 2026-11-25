# Cider IDE Lyrics

![Platform](https://img.shields.io/badge/Cider-2.5%2B-fa2d48)
![OS](https://img.shields.io/badge/OS-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A 3D IDE-style synchronized lyrics visualizer plugin for **Cider**. Transforms Cider's lyrics panel and fullscreen view into a tilted syntax-highlighted code stage with audio-reactive background waves, dynamic album-art color palettes, adlib comments, and an Edit / Recording Studio mode.

## Features

- **3D Syntax-Highlighted Lyrics**: Tokenizes synced lyrics into syntax-colored code lines with live word focus, smooth horizontal tracking, depth-of-field blur, and vocal zoom.
- **Song-Adaptive Color Themes**: Extracts vibrant palettes automatically from each track's album artwork, alongside built-in presets (`Default`, `Matrix`, `Cyber`, `Monokai`, and more).
- **Adlib Separation (`// comments`)**: Automatically extracts parenthesized & background vocal adlibs into subtle IDE `// comments` (`Separate`, `Hide`, or `Inline`).
- **Multi-Language & RTL Support**: Automatic Right-to-Left layout & camera perspective inversion for Persian, Arabic, and Hebrew, plus optional inline romanization and translation comments.
- **Edit & Recording Mode**: Toggle **Clean Feed** (`E`) to hide all UI chrome, pick solid/chroma/vignette/custom image or video backdrops, and lock `9:16`, `16:9`, or `1:1` safe framing guides.
- **Fullscreen Dock & Focus Tools**: Auto-hiding top controls (revealed on hover), interlude progress bar, **Active Line Only** mode, quick sync offset nudge, and full custom keybinds.

## Installation

### Windows (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```
Optional flags: `-DryRun` (preview without touching Cider) or `-Verify` (verify installed files).

### macOS
```bash
chmod +x ./install-mac.sh
./install-mac.sh
```

### Linux
```bash
chmod +x ./install-linux.sh
./install-linux.sh
```

Restart Cider after installing and open the lyrics view.

## Keyboard Shortcuts

All shortcuts can be rebound inside **Settings → Keyboard Shortcuts**:

| Key | Action |
| --- | --- |
| `S` | Toggle Settings panel |
| `E` | Toggle Clean Feed (Edit Mode) |
| `F` | Toggle Fullscreen visualizer |
| `Space` | Play / Pause |
| `Left` / `Right` | Seek backward / forward |
| `Up` / `Down` | Jump previous / next lyric line |
| `[` / `]` / `\` | Nudge lyric sync offset (`-50ms` / `+50ms` / reset) |
| `Esc` | Exit Settings or Fullscreen |

## Uninstallation

- **Windows**: `powershell -ExecutionPolicy Bypass -File .\uninstall-windows.ps1`
- **macOS**: `./uninstall-mac.sh`
- **Linux**: `./uninstall-linux.sh`

## Development

`index.js` and `plugin.js` are kept in sync with `styles.css` via `scripts/sync-bundles.ps1`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-bundles.ps1
```

## License

MIT — see [LICENSE](LICENSE).
