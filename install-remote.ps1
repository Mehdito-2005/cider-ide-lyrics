# One-line remote installer for Cider IDE Lyrics (Windows)
# Usage: irm https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main/install-remote.ps1 | iex
$ErrorActionPreference = "Stop"

$RepoRaw = "https://raw.githubusercontent.com/Mehdito-2005/cider-ide-lyrics/main"
$CanonicalId = "sh.cider.ide-lyric-visualizer"
$LegacyId = "cider-ide-lyrics-visualizer"
$Files = @("plugin.js", "plugin.yml", "index.js", "updater.js", "styles.css", "plugin.json", "plugin.config.ts")

Write-Host "=== Cider IDE Lyrics — Remote Windows Installer ===" -ForegroundColor Cyan

$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("cider-ide-lyrics-" + [System.Guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

try {
    foreach ($f in $Files) {
        Write-Host "  Downloading $f..." -ForegroundColor DarkGray
        Invoke-WebRequest -UseBasicParsing -Uri "$RepoRaw/$f" -OutFile (Join-Path $TempDir $f)
    }

    try {
        Get-Process -Name "Cider" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 300
    } catch {}

    $Candidates = @(
        Join-Path $env:APPDATA "sh.cider.dotnet\plugins"
        Join-Path $env:APPDATA "C2Windows\plugins"
        Join-Path $env:APPDATA "Cider\plugins"
        Join-Path $env:APPDATA "Cider2\plugins"
        Join-Path $env:APPDATA "sh.cider.electron\plugins"
        Join-Path $env:LOCALAPPDATA "Programs\Cider\resources\plugins"
    )
    $PackagesDir = Join-Path $env:LOCALAPPDATA "Packages"
    if (Test-Path $PackagesDir) {
        Get-ChildItem -Path $PackagesDir -Directory -Filter "CiderCollective.Cider_*" -ErrorAction SilentlyContinue | ForEach-Object {
            $Candidates += Join-Path $_.FullName "LocalCache\Roaming\sh.cider.dotnet\plugins"
            $Candidates += Join-Path $_.FullName "LocalCache\Roaming\Cider\plugins"
            $Candidates += Join-Path $_.FullName "LocalCache\Roaming\sh.cider.electron\plugins"
        }
    }

    $InstalledAny = $false
    foreach ($BasePath in ($Candidates | Select-Object -Unique)) {
        $Parent = Split-Path $BasePath -Parent
        if (Test-Path $Parent) {
            $Target = Join-Path $BasePath $CanonicalId
            $Legacy = Join-Path $BasePath $LegacyId
            New-Item -ItemType Directory -Force -Path $Target | Out-Null
            if (Test-Path $Legacy) { Remove-Item -Recurse -Force $Legacy -ErrorAction SilentlyContinue }
            foreach ($f in $Files) {
                Copy-Item -Path (Join-Path $TempDir $f) -Destination $Target -Force
            }
            Write-Host "[OK] Installed to: $Target" -ForegroundColor Green
            $InstalledAny = $true
        }
    }

    if (-not $InstalledAny) {
        $Fallback = Join-Path $env:APPDATA "Cider\plugins\$CanonicalId"
        New-Item -ItemType Directory -Force -Path $Fallback | Out-Null
        foreach ($f in $Files) {
            Copy-Item -Path (Join-Path $TempDir $f) -Destination $Fallback -Force
        }
        Write-Host "[OK] Installed to default path: $Fallback" -ForegroundColor Green
    }

    Write-Host "`nDone! Restart Cider and open Lyrics View to enjoy IDE Lyrics." -ForegroundColor Green
} finally {
    if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue }
}
