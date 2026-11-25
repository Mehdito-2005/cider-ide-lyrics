/**
 * updater.js — Remote update checker for syntax palettes and presets.
 */
export async function checkAndHotReloadUpdates(pluginInstance) {
  try {
    const res = await fetch(pluginInstance.settings.updateUrl, { cache: "no-store" });
    if (!res.ok) return false;
    const remoteManifest = await res.json();

    if (isNewerVersion(pluginInstance.version, remoteManifest.version)) {
      console.log(`[CiderIDELyrics] Updating ${pluginInstance.version} -> ${remoteManifest.version}`);
      if (remoteManifest.themeVariables) {
        Object.entries(remoteManifest.themeVariables).forEach(([k, v]) => {
          document.documentElement.style.setProperty(k, v);
        });
      }
      if (remoteManifest.settingsPatch) {
        Object.assign(pluginInstance.settings, remoteManifest.settingsPatch);
      }
      pluginInstance.version = remoteManifest.version;
      return true;
    }
  } catch (err) {
    // Offline or custom local build active
  }
  return false;
}

export function isNewerVersion(current, remote) {
  if (!current || !remote) return false;
  const c = String(current).replace(/^v/, "").split(".").map(Number);
  const r = String(remote).replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (c[i] || 0)) return true;
    if ((r[i] || 0) < (c[i] || 0)) return false;
  }
  return false;
}
