# Cider IDE Lyrics

![Platform](https://img.shields.io/badge/Cider-2.5%2B-fa2d48)
![OS](https://img.shields.io/badge/OS-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Release](https://img.shields.io/github/v/release/Mehdito-2005/cider-ide-lyrics)
![License](https://img.shields.io/badge/license-MIT-green)

A 3D IDE-style synchronized lyrics visualizer plugin for **Cider**. Transforms Cider's lyrics panel and fullscreen view into a tilted syntax-highlighted code stage with audio-reactive background waves, dynamic album-art color palettes, adlib comments, and an Edit / Recording Studio mode.

> **Prefer a GUI installer?** [IDE Lyrics Studio](https://github.com/Mehdito-2005/ide-lyrics-studio) includes a built-in **Setup & Integrations Wizard** that installs this Cider plugin in one click alongside optional Spotify (Spicetify) and Live Wallpaper modes.

## Features

- **3D Syntax-Highlighted Lyrics & Live Typewriter Mode**: Tokenizes synced lyrics into syntax-colored code lines with a smooth **Depth-of-Field cascade** (distance-tier blur and sung vs. upcoming word contrast), live word focus, vocal zoom, or **Live Typewriter** mode with character-by-character reveal and a gliding IDE caret (LTR & RTL safe).
- **Song-Adaptive Color Themes & JSON Preset Export / Import**: Extracts vibrant palettes automatically from each track's album artwork alongside built-in presets (`Default`, `Matrix`, `Cyber`, `Monokai`, and more), with one-click **Copy Preset** / **Import Preset** JSON backup and sharing in Settings.
- **Adlib Separation (`// comments`)**: Automatically extracts parenthesized & background vocal adlibs into subtle IDE `// comments` (`Separate`, `Hide`, or `Inline`).
- **Multi-Language & RTL Support**: Automatic Right-to-Left layout & camera perspective inversion for Persian, Arabic, and Hebrew, plus optional inline romanization and translation comments.
- **Edit & Recording Mode**: Toggle **Clean Feed** (`E`) to hide all UI chrome, pick solid/chroma/vignette/custom image or video backdrops, and lock `9:16`, `16:9`, or `1:1` safe framing guides.
- **Fullscreen Dock & Focus Tools**: Auto-hiding top controls (revealed on hover), interlude progress bar, **Active Line Only** mode, quick sync offset nudge, and full custom keybinds.

## Quick 1-Line Install (No Git Required)

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main/install-remote.ps1 | iex
```

### macOS & Linux
```bash
curl -fsSL https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main/install-remote.sh | bash
```

Or download `sh.cider.ide-lyric-visualizer.zip` from [Releases](https://github.com/Mehdito-2005/cider-ide-lyrics/releases) and extract it into your Cider `plugins/` folder.

## Local / Offline Installation

If you cloned this repository locally:

- **Windows**: `powershell -ExecutionPolicy Bypass -File .\install-windows.ps1` (supports `-DryRun` and `-Verify`)
- **macOS**: `chmod +x ./install-mac.sh && ./install-mac.sh`
- **Linux**: `chmod +x ./install-linux.sh && ./install-linux.sh`

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
