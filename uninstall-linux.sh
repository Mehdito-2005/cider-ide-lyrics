#!/usr/bin/env bash
# ==============================================================================
# Cider IDE Lyrics Visualizer — Linux Uninstaller
# ==============================================================================
set -e

CANONICAL_ID="sh.cider.ide-lyric-visualizer"
LEGACY_ID="cider-ide-lyrics-visualizer"

echo "Uninstalling Cider IDE Lyrics Visualizer on Linux..."

# Stop running Cider processes
if command -v pkill >/dev/null 2>&1; then
  pkill -x "cider" 2>/dev/null || true
  pkill -x "Cider" 2>/dev/null || true
  pkill -x "cider-bin" 2>/dev/null || true
fi
if command -v killall >/dev/null 2>&1; then
  killall -9 "cider" "Cider" 2>/dev/null || true
fi
sleep 0.3

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
