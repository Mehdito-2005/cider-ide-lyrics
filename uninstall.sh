#!/usr/bin/env bash
# ==============================================================================
# Cider & Spicetify IDE Lyrics Visualizer — Unified Uninstaller (Linux & macOS)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OS_NAME="$(uname -s)"

if [ "$OS_NAME" = "Darwin" ]; then
  if [ -f "$SCRIPT_DIR/uninstall-mac.sh" ]; then
    bash "$SCRIPT_DIR/uninstall-mac.sh"
  fi

  SPICE_UNINSTALLER=""
  if [ -f "$SCRIPT_DIR/spicetify-ide-lyrics/uninstall-spicetify.sh" ]; then
    SPICE_UNINSTALLER="$SCRIPT_DIR/spicetify-ide-lyrics/uninstall-spicetify.sh"
  elif [ -f "$SCRIPT_DIR/../spicetify-ide-lyrics/uninstall-spicetify.sh" ]; then
    SPICE_UNINSTALLER="$SCRIPT_DIR/../spicetify-ide-lyrics/uninstall-spicetify.sh"
  fi
  if [ -n "$SPICE_UNINSTALLER" ]; then
    bash "$SPICE_UNINSTALLER"
  fi

elif [ "$OS_NAME" = "Linux" ]; then
  if [ -f "$SCRIPT_DIR/uninstall-linux.sh" ]; then
    bash "$SCRIPT_DIR/uninstall-linux.sh"
  fi

  SPICE_UNINSTALLER=""
  if [ -f "$SCRIPT_DIR/spicetify-ide-lyrics/uninstall-spicetify.sh" ]; then
    SPICE_UNINSTALLER="$SCRIPT_DIR/spicetify-ide-lyrics/uninstall-spicetify.sh"
  elif [ -f "$SCRIPT_DIR/../spicetify-ide-lyrics/uninstall-spicetify.sh" ]; then
    SPICE_UNINSTALLER="$SCRIPT_DIR/../spicetify-ide-lyrics/uninstall-spicetify.sh"
  fi
  if [ -n "$SPICE_UNINSTALLER" ]; then
    bash "$SPICE_UNINSTALLER"
  fi

else
  echo "Unsupported OS environment: $OS_NAME"
  echo "On Windows PowerShell, run: .\\uninstall-windows.ps1"
  exit 1
fi

echo "All components uninstalled cleanly."
