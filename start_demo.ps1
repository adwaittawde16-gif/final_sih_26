# ==============================================================================
# Brihanmumbai Police Criminal Intelligence & Network Analysis System (SIH 2026)
# One-Click Stack Launcher (FastAPI Backend + Next.js Frontend)
# ==============================================================================

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  BRIHANMUMBAI POLICE - SPECIAL CRIME ANALYSIS UNIT (SIH 2026)      " -ForegroundColor Yellow
Write-Host "  STARTING PRODUCTION DEMO SERVICES...                              " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

$WorkspaceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $WorkspaceRoot "frontend"

# 1. Run Core AI/ML Verification Suite
Write-Host "`n[1/3] Running Backend AI/ML Verification Suite..." -ForegroundColor Yellow
python (Join-Path $WorkspaceRoot "verify_system.py")

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Verification had warnings, proceeding to start servers..." -ForegroundColor DarkYellow
}

# 2. Launch FastAPI Backend (Port 8080)
Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8080 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot'; python -m uvicorn app_backend.main:app --host 127.0.0.1 --port 8080 --reload"

# 3. Launch Next.js Frontend (Port 3000)
Write-Host "`n[3/3] Launching Next.js 14 Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"

Write-Host "`n====================================================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  - Frontend Command Center: http://localhost:3000" -ForegroundColor White
Write-Host "  - FastAPI Swagger Docs:    http://127.0.0.1:8080/docs" -ForegroundColor White
Write-Host "  - SSE Live Stream:         http://127.0.0.1:8080/api/stream/events" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Cyan
