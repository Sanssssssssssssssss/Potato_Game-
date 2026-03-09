$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$packageJsonPath = Join-Path $projectRoot "package.json"
$package = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$version = $package.version

$desktopDir = Join-Path $projectRoot "release\\Spud Arena-win32-x64"
if (-not (Test-Path $desktopDir)) {
  throw "Desktop build not found. Run 'npm run build:win' first."
}

$outputDir = Join-Path $projectRoot "release"
$stageDir = Join-Path $outputDir "_single-exe-stage"
$sedPath = Join-Path $stageDir "spud-arena-single-exe.sed"
$archivePath = Join-Path $stageDir "spud-arena.zip"
$launcherPs1Path = Join-Path $stageDir "launch-spud.ps1"
$launcherCmdPath = Join-Path $stageDir "launch-spud.cmd"
$targetPath = Join-Path $outputDir ("Spud-Arena-" + $version + "-single-file.exe")

if (Test-Path $stageDir) {
  Remove-Item $stageDir -Recurse -Force
}

New-Item -ItemType Directory -Path $stageDir | Out-Null
Compress-Archive -Path (Join-Path $desktopDir "*") -DestinationPath $archivePath -Force

@'
param()

$sourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeRoot = Join-Path $env:TEMP ("SpudArena-" + [guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Path $runtimeRoot | Out-Null
Expand-Archive -Path (Join-Path $sourceRoot "spud-arena.zip") -DestinationPath $runtimeRoot -Force
Set-Location $runtimeRoot
Start-Process -FilePath (Join-Path $runtimeRoot "Spud Arena.exe") -Wait
Remove-Item $runtimeRoot -Recurse -Force
'@ | Set-Content -Path $launcherPs1Path -Encoding ASCII

@'
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0launch-spud.ps1"
'@ | Set-Content -Path $launcherCmdPath -Encoding ASCII

$files = Get-ChildItem -Path $stageDir -File | Sort-Object Name
$stringLines = @(
  "[Version]",
  "Class=IEXPRESS",
  "SEDVersion=3",
  "[Options]",
  "PackagePurpose=InstallApp",
  "ShowInstallProgramWindow=0",
  "HideExtractAnimation=1",
  "UseLongFileName=1",
  "InsideCompressed=0",
  "CAB_FixedSize=0",
  "CAB_ResvCodeSigning=0",
  "RebootMode=N",
  "InstallPrompt=",
  "DisplayLicense=",
  "FinishMessage=",
  "TargetName=$targetPath",
  "FriendlyName=Spud Arena",
  "AppLaunched=launch-spud.cmd",
  "PostInstallCmd=<None>",
  "AdminQuietInstCmd=",
  "UserQuietInstCmd=",
  "SourceFiles=SourceFiles",
  "[SourceFiles]",
  "SourceFiles0=$stageDir",
  "[SourceFiles0]"
)

$index = 0
foreach ($file in $files) {
  $stringLines += "%FILE$index%="
  $index += 1
}

$stringLines += "[Strings]"
$index = 0
foreach ($file in $files) {
  $stringLines += "FILE$index=$($file.Name)"
  $index += 1
}

$stringLines | Set-Content -Path $sedPath -Encoding ASCII

$iexpress = Join-Path $env:SystemRoot "System32\\iexpress.exe"
& $iexpress /N $sedPath | Out-Null

if (-not (Test-Path $targetPath)) {
  throw "Single-file EXE was not created."
}

Write-Host ""
Write-Host "Single-file build complete."
Write-Host "Output: $targetPath"
Write-Host ""
