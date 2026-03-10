$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json
$version = $package.version
$iscc = Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe"

if (-not (Test-Path $iscc)) {
  throw "ISCC.exe not found. Expected at $iscc"
}

$desktopBuild = Join-Path $projectRoot "release\Spud Arena-win32-x64"
if (-not (Test-Path $desktopBuild)) {
  throw "Desktop build not found. Run 'npm run build:win' first."
}

$issPath = Join-Path $projectRoot "installer\spud-arena.iss"
& $iscc "/DMyAppVersion=$version" "/DMyAppSource=$desktopBuild" "/DMyOutputDir=$(Join-Path $projectRoot 'release\installer')" $issPath
