# ==============================================================================
# Cider IDE Lyrics Visualizer — Windows Installer
# ==============================================================================
param(
    [switch]$DryRun,
    [switch]$Verify
)

$ErrorActionPreference = "Stop"

$CanonicalPluginId = "sh.cider.ide-lyric-visualizer"
$LegacyDuplicateId = "cider-ide-lyrics-visualizer"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

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

$FilesToCopy = @("plugin.js", "plugin.yml", "index.js", "updater.js", "styles.css", "plugin.json", "plugin.config.ts")

if ($Verify) {
    Write-Host "[VERIFY] Checking deployed plugin files and SHA256 parity against $ScriptDir..." -ForegroundColor Cyan
    $TargetDirs = @()
    foreach ($BasePath in $CandidatePaths) {
        $Parent = Split-Path $BasePath -Parent
        if (Test-Path $Parent) {
            $TargetDirs += Join-Path $BasePath $CanonicalPluginId
        }
    }
    if ($TargetDirs.Count -eq 0) {
        $TargetDirs += Join-Path $env:APPDATA "Cider\plugins\$CanonicalPluginId"
    }

    $VerifiedAny = $false
    $VerifyFailures = 0
    foreach ($TargetDir in ($TargetDirs | Select-Object -Unique)) {
        if (-not (Test-Path $TargetDir)) {
            Write-Host "  [MISSING] Target directory not deployed: $TargetDir" -ForegroundColor Yellow
            continue
        }
        $VerifiedAny = $true
        Write-Host "  Checking: $TargetDir" -ForegroundColor Cyan
        foreach ($File in $FilesToCopy) {
            $SrcFile = Join-Path $ScriptDir $File
            if (-not (Test-Path $SrcFile)) {
                continue
            }
            $DstFile = Join-Path $TargetDir $File
            if (-not (Test-Path $DstFile)) {
                Write-Host "    [FAIL] Missing file: $DstFile" -ForegroundColor Red
                $VerifyFailures++
                continue
            }
            $SrcHash = (Get-FileHash -Path $SrcFile -Algorithm SHA256).Hash
            $DstHash = (Get-FileHash -Path $DstFile -Algorithm SHA256).Hash
            if ($SrcHash -ne $DstHash) {
                Write-Host "    [FAIL] SHA256 mismatch for $File (expected $SrcHash, got $DstHash)" -ForegroundColor Red
                $VerifyFailures++
            } else {
                Write-Host "    [PASS] $File ($DstHash)" -ForegroundColor Green
            }
        }
    }

    if (-not $VerifiedAny) {
        Write-Host "[VERIFY FAIL] No deployed plugin directory found." -ForegroundColor Red
        exit 1
    }
    if ($VerifyFailures -gt 0) {
        Write-Host "[VERIFY FAIL] $VerifyFailures file check(s) failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "[VERIFY PASS] All deployed files present and SHA256 parity verified." -ForegroundColor Green
    exit 0
}

if ($DryRun) {
    Write-Host "[DRY-RUN] Previewing installation (Cider will NOT be stopped; no files will be modified)." -ForegroundColor Cyan
    Write-Host "[DRY-RUN] Source directory: $ScriptDir" -ForegroundColor Gray
} else {
    # Stop running Cider processes before copying files and clearing cache
    try {
        Get-Process -Name "Cider" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 300
    } catch {}
}

$Installed = $false

foreach ($BasePath in $CandidatePaths) {
    $Parent = Split-Path $BasePath -Parent
    if (Test-Path $Parent) {
        $TargetDir = Join-Path $BasePath $CanonicalPluginId
        $LegacyDir = Join-Path $BasePath $LegacyDuplicateId

        if ($DryRun) {
            Write-Host "[DRY-RUN] Target install path: $TargetDir" -ForegroundColor Green
            if (Test-Path $LegacyDir) {
                Write-Host "[DRY-RUN] Legacy cleanup path: $LegacyDir" -ForegroundColor Yellow
            }
            foreach ($File in $FilesToCopy) {
                $SrcFile = Join-Path $ScriptDir $File
                if (Test-Path $SrcFile) {
                    Write-Host "[DRY-RUN]   Would copy: $File -> $TargetDir" -ForegroundColor DarkGray
                }
            }
            $Installed = $true
        } else {
            New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

            if (Test-Path $LegacyDir) {
                Remove-Item -Recurse -Force $LegacyDir -ErrorAction SilentlyContinue
            }

            foreach ($File in $FilesToCopy) {
                $SrcFile = Join-Path $ScriptDir $File
                if (Test-Path $SrcFile) {
                    Copy-Item -Path $SrcFile -Destination $TargetDir -Force
                }
            }
            Write-Host "Installed: $TargetDir" -ForegroundColor Green
            $Installed = $true
        }
    }
}

if (-not $Installed) {
    $FallbackDir = Join-Path $env:APPDATA "Cider\plugins\$CanonicalPluginId"
    if ($DryRun) {
        Write-Host "[DRY-RUN] Fallback target install path: $FallbackDir" -ForegroundColor Green
        foreach ($File in $FilesToCopy) {
            $SrcFile = Join-Path $ScriptDir $File
            if (Test-Path $SrcFile) {
                Write-Host "[DRY-RUN]   Would copy: $File -> $FallbackDir" -ForegroundColor DarkGray
            }
        }
    } else {
        New-Item -ItemType Directory -Force -Path $FallbackDir | Out-Null
        foreach ($File in $FilesToCopy) {
            $SrcFile = Join-Path $ScriptDir $File
            if (Test-Path $SrcFile) {
                Copy-Item -Path $SrcFile -Destination $FallbackDir -Force
            }
        }
        Write-Host "Installed: $FallbackDir" -ForegroundColor Green
    }
}

# Clear WebView2 disk cache and JS code cache
foreach ($WvRoot in ($WebViewCacheRoots | Select-Object -Unique)) {
    if (Test-Path $WvRoot) {
        foreach ($SubCache in @("Cache\Cache_Data", "Code Cache\js")) {
            $CacheTarget = Join-Path $WvRoot $SubCache
            if (Test-Path $CacheTarget) {
                if ($DryRun) {
                    Write-Host "[DRY-RUN] Would clear cache: $CacheTarget" -ForegroundColor DarkGray
                } else {
                    Get-ChildItem -Path $CacheTarget -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
                    Write-Host "Cleared cache: $CacheTarget" -ForegroundColor DarkGray
                }
            }
        }
    }
}

if ($DryRun) {
    Write-Host "[DRY-RUN] Complete. No changes were made." -ForegroundColor Cyan
} else {
    Write-Host "Installation complete. Restart Cider and open Lyrics View to use the visualizer." -ForegroundColor Green
}
