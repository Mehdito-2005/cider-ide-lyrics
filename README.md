# Cider IDE Lyrics

A 3D IDE-style synchronized lyrics visualizer plugin for **Cider** (Windows, macOS, and Linux). Turns Cider's lyrics panel and fullscreen view into a tilted syntax-highlighted code stage with audio-reactive background waves, dynamic album-art color palettes, and an optional Edit / Recording Studio mode.

## Features

- **3D Code Lyrics Stage**: Tokenizes real-time synced lyrics with live word tracking, depth-of-field blur, and dynamic vocal zoom.
- **Song-Adaptive Palettes**: Automatically extracts vibrant syntax colors from the current track's album art, plus built-in themes (Matrix, Cyber, Monokai, and more).
- **Adlib & Multi-Language Support**: Formats adlibs as IDE `// comments` (`Separate`, `Hide`, or `Inline`), renders optional romanization/translation inline comments, and supports RTL scripts (Persian, Arabic, Hebrew).
- **Edit & Recording Mode**: Toggle **Clean Feed** (`E`), choose solid/chroma/vignette/custom image or video backdrops, and lock 9:16, 16:9, or 1:1 safe framing.
- **Fullscreen Player Dock & Keybinds**: Floating controls (auto-hides until hovered in fullscreen), quick sync nudge (`[` / `]` / `\`), active-line-only focus, and customizable shortcuts.

## Installation

### Windows (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

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

## Uninstallation

- **Windows**: `powershell -ExecutionPolicy Bypass -File .\uninstall-windows.ps1`
- **macOS**: `./uninstall-mac.sh`
- **Linux**: `./uninstall-linux.sh`

## License

MIT — see [LICENSE](LICENSE).
