#!/usr/bin/env bash
# ==============================================================================
# Cider IDE Lyrics Visualizer — macOS Installer
# ==============================================================================
set -e

CANONICAL_ID="sh.cider.ide-lyric-visualizer"
LEGACY_ID="cider-ide-lyrics-visualizer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop running Cider processes
killall -9 "Cider" 2>/dev/null || true
killall -9 "cider" 2>/dev/null || true
if command -v pkill >/dev/null 2>&1; then
  pkill -x "Cider" 2>/dev/null || true
  pkill -x "cider" 2>/dev/null || true
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

# Potential Cider plugin directories across native macOS installations
CANDIDATE_DIRS=(
  "$HOME/Library/Application Support/sh.cider.dotnet/plugins"
  "$HOME/Library/Application Support/Cider/plugins"
  "$HOME/Library/Application Support/Cider2/plugins"
  "$HOME/Library/Application Support/sh.cider.electron/plugins"
  "$HOME/Library/Application Support/CiderCollective.Cider/plugins"
  "$HOME/Library/Containers/sh.cider.Cider/Data/Library/Application Support/Cider/plugins"
  "$HOME/Library/Containers/sh.cider.dotnet/Data/Library/Application Support/sh.cider.dotnet/plugins"
  "$HOME/Library/Containers/Cider/Data/Library/Application Support/Cider/plugins"
)

CACHE_ROOTS=(
  "$HOME/Library/Caches/sh.cider.Cider"
  "$HOME/Library/Caches/Cider"
  "$HOME/Library/Application Support/Cider/Cache"
  "$HOME/Library/Application Support/Cider/Code Cache"
  "$HOME/Library/Application Support/sh.cider.dotnet/Cache"
  "$HOME/Library/Application Support/sh.cider.dotnet/Code Cache"
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
    "$HOME/Library/Application Support/sh.cider.dotnet/plugins/$CANONICAL_ID"
    "$HOME/Library/Application Support/Cider/plugins/$CANONICAL_ID"
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
