# Run script for QuantlyNhathuoc without Docker on Windows
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "    QUANLYNHATHUOC - KHOI DONG KHONG CAN DOCKER" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""

# Kiem tra va khoi tao database neu chua co
if (-not (Test-Path "$PSScriptRoot\backend\pharmacy.db")) {
    Write-Host "Co so du lieu chua ton tai. Dang khoi tao va seed du lieu..." -ForegroundColor Yellow
    cd "$PSScriptRoot\backend"
    & "venv/Scripts/python.exe" seed.py
    Write-Host "Khoi tao database thanh cong!" -ForegroundColor Green
    Write-Host ""
}

# 1. Start Backend FastAPI Server
Write-Host "[1/3] Dang khoi dong Backend FastAPI Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'Backend FastAPI Server'; cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate; uvicorn app.main:app --port 8000 --reload"

# 2. Start Frontend Next.js Dev Server
Write-Host "[2/3] Dang khoi dong Frontend Next.js Dev Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'Frontend Next.js Dev Server'; cd '$PSScriptRoot\frontend'; cmd.exe /c npm run dev"

# 3. Wait and Open Browser
Write-Host ""
Write-Host "[3/3] Dang cho 5 giay de cac server khoi dong..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Dang mo ung dung tren trinh duyet: http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Hoan tat! Ban co the kiem tra log cua cac server trong 2 cua so PowerShell moi mo." -ForegroundColor Green
Write-Host "Nhan bat ky phim nao de dong cua so nay..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
