# run-backend.ps1
# Starts the FastAPI backend using the project's Python interpreter and ensures backend imports resolve.
# Usage (PowerShell):
#   .\run-backend.ps1

$python = "C:/Users/HP/AppData/Local/Microsoft/WindowsApps/python3.13.exe"
if (-not (Test-Path $python)) {
  # fallback to 'python' in PATH
  $python = "python"
}

# Ensure the backend package directory is visible to Python imports
$env:PYTHONPATH = "backend"

Write-Host "Starting backend with PYTHONPATH=$env:PYTHONPATH using interpreter: $python"
& $python -m uvicorn backend.main:app --reload --port 8000
