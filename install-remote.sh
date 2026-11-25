#!/usr/bin/env bash
# One-line remote installer for Cider IDE Lyrics (macOS & Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main/install-remote.sh | bash
set -euo pipefail

REPO_RAW="https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main"
CANONICAL_ID="sh.cider.ide-lyric-visualizer"
LEGACY_ID="cider-ide-lyrics-visualizer"
FILES=(plugin.js plugin.yml index.js updater.js styles.css plugin.json plugin.config.ts)

echo "=== Cider IDE Lyrics - Remote Installer ==="

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

for f in "${FILES[@]}"; do
  echo "  Downloading ${f}..."
  curl -fsSL "${REPO_RAW}/${f}" -o "${TMP_DIR}/${f}"
done

OS_NAME="$(uname -s)"
CANDIDATES=()
if [[ "${OS_NAME}" == "Darwin" ]]; then
  pkill -x "Cider" 2>/dev/null || true
  APP_SUP="${HOME}/Library/Application Support"
  CANDIDATES=(
    "${APP_SUP}/sh.cider.electron/plugins"
    "${APP_SUP}/Cider/plugins"
    "${APP_SUP}/Cider2/plugins"
    "${APP_SUP}/sh.cider.dotnet/plugins"
  )
else
  pkill -x "cider" 2>/dev/null || true
  pkill -x "Cider" 2>/dev/null || true
  pkill -x "cider-bin" 2>/dev/null || true
  XDG_CFG="${XDG_CONFIG_HOME:-${HOME}/.config}"
  CANDIDATES=(
    "${XDG_CFG}/sh.cider.electron/plugins"
    "${XDG_CFG}/Cider/plugins"
    "${XDG_CFG}/Cider2/plugins"
    "${HOME}/.var/app/sh.cider.Cider/config/Cider/plugins"
    "${HOME}/.var/app/sh.cider.Cider/config/sh.cider.electron/plugins"
    "${HOME}/snap/cider/current/.config/Cider/plugins"
  )
fi

INSTALLED_ANY=0
for base in "${CANDIDATES[@]}"; do
  parent="$(dirname "${base}")"
  if [[ -d "${parent}" ]]; then
    target="${base}/${CANONICAL_ID}"
    legacy="${base}/${LEGACY_ID}"
    mkdir -p "${target}"
    rm -rf "${legacy}" 2>/dev/null || true
    for f in "${FILES[@]}"; do
      cp -f "${TMP_DIR}/${f}" "${target}/${f}"
    done
    echo "[OK] Installed to: ${target}"
    INSTALLED_ANY=1
  fi
done

if [[ "${INSTALLED_ANY}" -eq 0 ]]; then
  fallback="${CANDIDATES[1]}/${CANONICAL_ID}"
  mkdir -p "${fallback}"
  for f in "${FILES[@]}"; do
    cp -f "${TMP_DIR}/${f}" "${fallback}/${f}"
  done
  echo "[OK] Installed to default path: ${fallback}"
fi

echo ""
echo "Done! Restart Cider and open Lyrics View to use IDE Lyrics."
