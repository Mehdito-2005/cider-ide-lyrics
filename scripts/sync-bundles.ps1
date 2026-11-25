# scripts/sync-bundles.ps1
# Syncs styles.css into INJECTED_CSS of index.js and mirrors bundle files across root and cider-ide-lyrics-visualizer/.
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$StylesPath = Join-Path $RootDir "styles.css"
$IndexPath = Join-Path $RootDir "index.js"
$PluginConfigPath = Join-Path $RootDir "plugin.config.ts"

if (-not (Test-Path $StylesPath)) { throw "Missing $StylesPath" }
if (-not (Test-Path $IndexPath)) { throw "Missing $IndexPath" }

$cssRaw = Get-Content -Raw -Encoding UTF8 $StylesPath
$cssEscaped = $cssRaw.Replace('\', '\\').Replace('`', '\`').Replace('${', '\${')

$indexRaw = Get-Content -Raw -Encoding UTF8 $IndexPath
$pattern = 'const INJECTED_CSS = `(?:\\[\s\S]|[^`\\])*`;'
if ($indexRaw -notmatch $pattern) {
    throw 'Could not locate const INJECTED_CSS = `...`; in index.js'
}

$indexUpdated = [regex]::Replace(
    $indexRaw,
    $pattern,
    { param($m) "const INJECTED_CSS = ``$cssEscaped``;" },
    1
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($IndexPath, $indexUpdated, $utf8NoBom)

$Targets = @(
    @{ Src = $IndexPath; Dst = (Join-Path $RootDir "plugin.js") },
    @{ Src = $IndexPath; Dst = (Join-Path $RootDir "cider-ide-lyrics-visualizer\index.js") },
    @{ Src = $IndexPath; Dst = (Join-Path $RootDir "cider-ide-lyrics-visualizer\plugin.js") },
    @{ Src = $StylesPath; Dst = (Join-Path $RootDir "cider-ide-lyrics-visualizer\styles.css") }
)

if (Test-Path $PluginConfigPath) {
    $Targets += @{ Src = $PluginConfigPath; Dst = (Join-Path $RootDir "cider-ide-lyrics-visualizer\plugin.config.ts") }
}

foreach ($scriptName in @("install-windows.ps1", "uninstall-windows.ps1")) {
    $scriptSrc = Join-Path $RootDir $scriptName
    if (Test-Path $scriptSrc) {
        $Targets += @{ Src = $scriptSrc; Dst = (Join-Path $RootDir ("cider-ide-lyrics-visualizer\" + $scriptName)) }
    }
}

foreach ($t in $Targets) {
    $dstDir = Split-Path -Parent $t.Dst
    if (-not (Test-Path $dstDir)) {
        New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    }
    Copy-Item -Path $t.Src -Destination $t.Dst -Force
    Write-Host "Synced $($t.Src) -> $($t.Dst)" -ForegroundColor Green
}
