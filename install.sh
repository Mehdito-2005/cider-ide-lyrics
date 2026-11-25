#!/usr/bin/env bash
# ==============================================================================
# Cider IDE Lyrics Visualizer — Unified Installer (Linux & macOS)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OS_NAME="$(uname -s)"

if [ "$OS_NAME" = "Darwin" ]; then
  if [ -f "$SCRIPT_DIR/install-mac.sh" ]; then
    bash "$SCRIPT_DIR/install-mac.sh"
  fi

  SPICE_INSTALLER=""
  if [ -f "$SCRIPT_DIR/spicetify-ide-lyrics/install-spicetify.sh" ]; then
    SPICE_INSTALLER="$SCRIPT_DIR/spicetify-ide-lyrics/install-spicetify.sh"
  elif [ -f "$SCRIPT_DIR/../spicetify-ide-lyrics/install-spicetify.sh" ]; then
    SPICE_INSTALLER="$SCRIPT_DIR/../spicetify-ide-lyrics/install-spicetify.sh"
  fi
  if [ -n "$SPICE_INSTALLER" ]; then
    if command -v spicetify >/dev/null 2>&1 || [ -d "$HOME/spicetify_data" ] || [ -d "$HOME/.config/spicetify" ]; then
      bash "$SPICE_INSTALLER"
    fi
  fi

elif [ "$OS_NAME" = "Linux" ]; then
  if [ -f "$SCRIPT_DIR/install-linux.sh" ]; then
    bash "$SCRIPT_DIR/install-linux.sh"
  fi

  SPICE_INSTALLER=""
  if [ -f "$SCRIPT_DIR/spicetify-ide-lyrics/install-spicetify.sh" ]; then
    SPICE_INSTALLER="$SCRIPT_DIR/spicetify-ide-lyrics/install-spicetify.sh"
  elif [ -f "$SCRIPT_DIR/../spicetify-ide-lyrics/install-spicetify.sh" ]; then
    SPICE_INSTALLER="$SCRIPT_DIR/../spicetify-ide-lyrics/install-spicetify.sh"
  fi
  if [ -n "$SPICE_INSTALLER" ]; then
    if command -v spicetify >/dev/null 2>&1 || [ -d "$HOME/.config/spicetify" ]; then
      bash "$SPICE_INSTALLER"
    fi
  fi

else
  echo "Unsupported OS environment: $OS_NAME"
  echo "On Windows PowerShell, run: .\\install-windows.ps1"
  exit 1
fi
