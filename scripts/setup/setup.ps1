<#
.SYNOPSIS
    One-time setup for ChauleClips on Windows.

.DESCRIPTION
    Checks prerequisites, creates the Python virtual environment, installs
    backend + frontend dependencies, generates .env files with secure secrets
    and prepares the storage folders.

    Run from the repository root in PowerShell:
        .\scripts\setup\setup.ps1

.NOTES
    - Safe to re-run: existing .env files are never overwritten.
    - Use -SkipMediaDeps to skip the large faster-whisper/OpenCV packages.
#>
param(
    [switch]$SkipMediaDeps
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Write-Host "ChauleClips setup — $root" -ForegroundColor Cyan

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

# ---------------------------------------------------------------- prerequisites
$python = if (Test-Command 'python') { 'python' } elseif (Test-Command 'py') { 'py' } else { $null }
if (-not $python) {
    throw "Python not found. Install Python 3.12+ from https://www.python.org/downloads/ and tick 'Add python.exe to PATH'."
}
$pyVersion = & $python -c "import sys; print('.'.join(map(str, sys.version_info[:2])))"
Write-Host "Python $pyVersion found"

if (-not (Test-Command 'node')) { throw "Node.js not found. Install Node 20 LTS from https://nodejs.org/" }
Write-Host ("Node " + (& node --version) + " found")

foreach ($tool in @('ffmpeg', 'ffprobe')) {
    if (Test-Command $tool) { Write-Host "$tool found on PATH" }
    else { Write-Warning "$tool not found. Uploads/rendering will fail until FFmpeg is installed (winget install Gyan.FFmpeg) and PowerShell restarted." }
}
if (-not (Test-Command 'mongosh')) {
    Write-Warning "mongosh not found. Install MongoDB Community Server (see docs/INSTALLATION.md) — login and projects need it."
}

# ------------------------------------------------------------------- backend venv
$venv = Join-Path $root 'backend\.venv'
if (-not (Test-Path $venv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    & $python -m venv $venv
}
$venvPython = Join-Path $venv 'Scripts\python.exe'
& $venvPython -m pip install --upgrade pip --quiet
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
& $venvPython -m pip install -r (Join-Path $root 'backend\requirements-dev.txt')
if (-not $SkipMediaDeps) {
    Write-Host "Installing media/AI dependencies (this takes a while)..." -ForegroundColor Yellow
    & $venvPython -m pip install -r (Join-Path $root 'backend\requirements-media.txt')
}

# --------------------------------------------------------------- frontend deps
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location (Join-Path $root 'frontend')
try { & npm install --no-fund --no-audit } finally { Pop-Location }

# ------------------------------------------------------- env files + storage
& $venvPython (Join-Path $root 'scripts\setup\bootstrap_env.py')

Write-Host "`nSetup finished." -ForegroundColor Green
Write-Host "Start everything with:  .\scripts\setup\dev.ps1" -ForegroundColor Green
