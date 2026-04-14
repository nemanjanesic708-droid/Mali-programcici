$ErrorActionPreference = "Stop"

Set-Location "c:\Users\XEON\Desktop\Garancija"

$logPath = "c:\Users\XEON\Desktop\Garancija\prod-server-3001.log"

if (Test-Path -LiteralPath $logPath) {
  Remove-Item -LiteralPath $logPath -Force
}

npm.cmd run start -- --port 3001 *> $logPath
