# ==============================================================================
# Cider & Spicetify IDE Lyrics Visualizer — Windows Uninstaller
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Uninstalling IDE Lyrics Visualizer" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Stop running Cider processes
try {
    Get-Process -Name "Cider" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 300
} catch {}

$CanonicalPluginId = "sh.cider.ide-lyric-visualizer"
$LegacyDuplicateId = "cider-ide-lyrics-visualizer"

$CandidatePaths = @(
    Join-Path $env:APPDATA "sh.cider.dotnet\plugins"
    Join-Path $env:APPDATA "Cider\plugins"
    Join-Path $env:APPDATA "Cider2\plugins"
    Join-Path $env:APPDATA "sh.cider.electron\plugins"
    Join-Path $env:LOCALAPPDATA "Programs\Cider\resources\plugins"
)

$WebViewCacheRoots = @(
    Join-Path $env:APPDATA "sh.cider.dotnet\EBWebView\Default"
    Join-Path $env:LOCALAPPDATA "sh.cider.dotnet\EBWebView\Default"
    Join-Path $env:APPDATA "Cider\EBWebView\Default"
)

$PackagesDir = Join-Path $env:LOCALAPPDATA "Packages"
if (Test-Path $PackagesDir) {
    $StorePackages = Get-ChildItem -Path $PackagesDir -Directory -Filter "CiderCollective.Cider_*" -ErrorAction SilentlyContinue
    foreach ($Pkg in $StorePackages) {
        $CandidatePaths += Join-Path $Pkg.FullName "LocalCache\Roaming\sh.cider.dotnet\plugins"
        $CandidatePaths += Join-Path $Pkg.FullName "LocalCache\Roaming\Cider\plugins"
        $CandidatePaths += Join-Path $Pkg.FullName "LocalCache\Roaming\sh.cider.electron\plugins"

        $WebViewCacheRoots += Join-Path $Pkg.FullName "LocalCache\WebView2\EBWebView\Default"
        $WebViewCacheRoots += Join-Path $Pkg.FullName "LocalCache\Roaming\sh.cider.dotnet\EBWebView\Default"
        $WebViewCacheRoots += Join-Path $Pkg.FullName "LocalCache\Local\sh.cider.dotnet\EBWebView\Default"
    }
}

$UninstalledCount = 0

foreach ($BasePath in ($CandidatePaths | Select-Object -Unique)) {
    foreach ($PluginName in @($CanonicalPluginId, $LegacyDuplicateId)) {
        $TargetDir = Join-Path $BasePath $PluginName
        if (Test-Path $TargetDir) {
            try {
                Remove-Item -Recurse -Force $TargetDir -ErrorAction Stop
                if (Test-Path $TargetDir) {
                    throw "Directory still exists after removal: $TargetDir"
                }
                Write-Host "Removed Cider plugin: $TargetDir" -ForegroundColor Green
                $UninstalledCount++
            } catch {
                Write-Host "Notice removing $TargetDir : $_" -ForegroundColor Yellow
            }
        }
    }
}

# Clear WebView2 disk cache and JS code cache
foreach ($WvRoot in ($WebViewCacheRoots | Select-Object -Unique)) {
    if (Test-Path $WvRoot) {
        foreach ($SubCache in @("Cache\Cache_Data", "Code Cache\js")) {
            $CacheTarget = Join-Path $WvRoot $SubCache
            if (Test-Path $CacheTarget) {
                Get-ChildItem -Path $CacheTarget -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
                Write-Host "Cleared cache: $CacheTarget" -ForegroundColor DarkGray
            }
        }
    }
}

# 2. Check for Spicetify uninstallation if extension was installed
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$SpicetifyUninstaller = Join-Path $ScriptDir "spicetify-ide-lyrics\uninstall-spicetify.ps1"
if (-not (Test-Path $SpicetifyUninstaller)) {
    $SpicetifyUninstaller = Join-Path $ScriptDir "..\spicetify-ide-lyrics\uninstall-spicetify.ps1"
}
if (Test-Path $SpicetifyUninstaller) {
    try {
        & $SpicetifyUninstaller
    } catch {
        Write-Host "Spicetify uninstaller encountered notice: $_" -ForegroundColor DarkGray
    }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Uninstallation complete. Restart Cider / Spotify." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
