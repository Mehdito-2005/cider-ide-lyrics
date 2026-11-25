#!/usr/bin/env bash
# ==============================================================================
# Cider IDE Lyrics Visualizer — Linux Installer
# ==============================================================================
set -e

CANONICAL_ID="sh.cider.ide-lyric-visualizer"
LEGACY_ID="cider-ide-lyrics-visualizer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop running Cider processes so files and caches can be safely updated
if command -v pkill >/dev/null 2>&1; then
  pkill -f -i "cider" 2>/dev/null || true
fi
if command -v killall >/dev/null 2>&1; then
  killall -9 "cider" "Cider" 2>/dev/null || true
fi
sleep 0.3

FILES_TO_COPY=(
  "plugin.js"
  "plugin.yml"
  "index.js"
  "updater.js"
  "styles.css"
  "plugin.json"
  "plugin.config.ts"
)

# Potential Cider plugin directories across native packages, Flatpak, Snap
CANDIDATE_DIRS=(
  "$HOME/.config/sh.cider.dotnet/plugins"
  "$HOME/.config/Cider/plugins"
  "$HOME/.config/Cider2/plugins"
  "$HOME/.config/sh.cider.electron/plugins"
  "$HOME/.var/app/sh.cider.Cider/config/sh.cider.dotnet/plugins"
  "$HOME/.var/app/sh.cider.Cider/config/Cider/plugins"
  "$HOME/.var/app/sh.cider.electron/config/sh.cider.electron/plugins"
  "$HOME/snap/cider/current/.config/sh.cider.dotnet/plugins"
  "$HOME/snap/cider/current/.config/Cider/plugins"
  "$HOME/snap/cider/common/.config/Cider/plugins"
)

if [ -n "$XDG_CONFIG_HOME" ]; then
  CANDIDATE_DIRS=(
    "$XDG_CONFIG_HOME/sh.cider.dotnet/plugins"
    "$XDG_CONFIG_HOME/Cider/plugins"
    "${CANDIDATE_DIRS[@]}"
  )
fi

CACHE_ROOTS=(
  "$HOME/.config/Cider/Cache"
  "$HOME/.config/Cider/Code Cache"
  "$HOME/.config/sh.cider.dotnet/Cache"
  "$HOME/.config/sh.cider.dotnet/Code Cache"
  "$HOME/.var/app/sh.cider.Cider/cache"
  "$HOME/.var/app/sh.cider.Cider/config/Cider/Cache"
  "$HOME/.var/app/sh.cider.Cider/config/Cider/Code Cache"
)

INSTALLED_COUNT=0

for BASE_DIR in "${CANDIDATE_DIRS[@]}"; do
  PARENT="$(dirname "$BASE_DIR")"
  if [ -d "$PARENT" ]; then
    TARGET="$BASE_DIR/$CANONICAL_ID"
    mkdir -p "$TARGET"

    LEGACY="$BASE_DIR/$LEGACY_ID"
    if [ -d "$LEGACY" ]; then
      rm -rf "$LEGACY"
    fi

    for F in "${FILES_TO_COPY[@]}"; do
      if [ -f "$SCRIPT_DIR/$F" ]; then
        cp -f "$SCRIPT_DIR/$F" "$TARGET/"
      fi
    done

    echo "Installed: $TARGET"
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
  fi
done

if [ "$INSTALLED_COUNT" -eq 0 ]; then
  FALLBACK_DIRS=(
    "$HOME/.config/sh.cider.dotnet/plugins/$CANONICAL_ID"
    "$HOME/.config/Cider/plugins/$CANONICAL_ID"
  )
  for FALLBACK in "${FALLBACK_DIRS[@]}"; do
    mkdir -p "$FALLBACK"
    for F in "${FILES_TO_COPY[@]}"; do
      if [ -f "$SCRIPT_DIR/$F" ]; then
        cp -f "$SCRIPT_DIR/$F" "$FALLBACK/"
      fi
    done
    echo "Installed: $FALLBACK"
  done
fi

for C_DIR in "${CACHE_ROOTS[@]}"; do
  if [ -d "$C_DIR" ]; then
    rm -rf "$C_DIR"/* 2>/dev/null || true
  fi
done

echo "Installation complete. Restart Cider and open Lyrics View to use the visualizer."
