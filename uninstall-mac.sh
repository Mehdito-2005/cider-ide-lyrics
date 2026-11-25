#!/usr/bin/env bash
# ==============================================================================
# Cider IDE Lyrics Visualizer — macOS Uninstaller
# ==============================================================================
set -e

CANONICAL_ID="sh.cider.ide-lyric-visualizer"
LEGACY_ID="cider-ide-lyrics-visualizer"

echo "Uninstalling Cider IDE Lyrics Visualizer on macOS..."

# Stop running Cider processes
killall -9 "Cider" 2>/dev/null || true
killall -9 "cider" 2>/dev/null || true
if command -v pkill >/dev/null 2>&1; then
  pkill -x "Cider" 2>/dev/null || true
  pkill -x "cider" 2>/dev/null || true
fi
sleep 0.3

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

REMOVED_COUNT=0

for BASE_DIR in "${CANDIDATE_DIRS[@]}"; do
  for PLUGIN_NAME in "$CANONICAL_ID" "$LEGACY_ID"; do
    TARGET="$BASE_DIR/$PLUGIN_NAME"
    if [ -d "$TARGET" ]; then
      rm -rf "$TARGET"
      echo "Removed: $TARGET"
      REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
  done
done

for C_DIR in "${CACHE_ROOTS[@]}"; do
  if [ -d "$C_DIR" ]; then
    rm -rf "$C_DIR"/* 2>/dev/null || true
    echo "Cleared cache: $C_DIR"
  fi
done

if [ "$REMOVED_COUNT" -gt 0 ]; then
  echo "Cider plugin removed successfully."
else
  echo "No installed Cider plugin found in candidate directories."
fi
