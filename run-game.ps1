$port = 4173
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Spud Arena at http://127.0.0.1:$port/index.html"
Set-Location $root
py -m http.server $port
