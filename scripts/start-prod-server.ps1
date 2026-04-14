$ErrorActionPreference = "Stop"

Set-Location "c:\Users\XEON\Desktop\Garancija"

$logPath = "c:\Users\XEON\Desktop\Garancija\prod-server-3001.log"
$errorLogPath = "c:\Users\XEON\Desktop\Garancija\prod-server-3001.err.log"
$pidPath = "c:\Users\XEON\Desktop\Garancija\prod-server-3001.pid"

if (Test-Path -LiteralPath $logPath) {
  Remove-Item -LiteralPath $logPath -Force
}

if (Test-Path -LiteralPath $errorLogPath) {
  Remove-Item -LiteralPath $errorLogPath -Force
}

if (Test-Path -LiteralPath $pidPath) {
  $existingPid = Get-Content -LiteralPath $pidPath -ErrorAction SilentlyContinue

  if ($existingPid) {
    $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($existingProcess) {
      Stop-Process -Id $existingPid -Force
    }
  }

  Remove-Item -LiteralPath $pidPath -Force
}

$process = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm.cmd run start -- --port 3001" `
  -WorkingDirectory "c:\Users\XEON\Desktop\Garancija" `
  -RedirectStandardOutput $logPath `
  -RedirectStandardError $errorLogPath `
  -PassThru

Set-Content -LiteralPath $pidPath -Value $process.Id
Write-Output "Started PID $($process.Id)"
