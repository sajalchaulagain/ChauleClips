<#
.SYNOPSIS
    Start MongoDB check, FastAPI backend and Vite frontend for local development.

.DESCRIPTION
    Opens the backend and frontend in separate PowerShell windows so you can see
    both logs. Ctrl+C in a window stops only that service.

    Usage:
        .\scripts\setup\dev.ps1
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$venvPython = Join-Path $backend '.venv\Scripts\python.exe'

if (-not (Test-Path $venvPython)) {
    throw "Virtual environment missing. Run .\scripts\setup\setup.ps1 first."
}
if (-not (Test-Path (Join-Path $backend '.env'))) {
    throw "backend\.env is missing. Run .\scripts\setup\setup.ps1 first."
}

# A quick, honest check: is MongoDB already listening?
$mongoUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mongoUp) {
    Write-Host "MongoDB: reachable on 127.0.0.1:27017" -ForegroundColor Green
} else {
    Write-Warning "MongoDB is not reachable on 127.0.0.1:27017. Start the MongoDB service (services.msc) or run mongod manually."
}

Write-Host "Starting backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process -FilePath $venvPython `
    -ArgumentList '-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000' `
    -WorkingDirectory $backend

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev' -WorkingDirectory $frontend

Write-Host "`nOpen http://localhost:5173 — API docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
