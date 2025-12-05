# Zalo Clone - Quick Start Script
# This script starts all services needed to run the application

Write-Host "`n🚀 Starting Zalo Clone Application..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Change to project root
$projectRoot = "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone"
Set-Location $projectRoot

# Step 1: Check Docker services
Write-Host "`n[1/4] Checking Docker services..." -ForegroundColor Yellow
docker-compose ps | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main Docker services (MongoDB, PostgreSQL, Redis) are running" -ForegroundColor Green
} else {
    Write-Host "❌ Starting Docker services..." -ForegroundColor Red
    docker-compose up -d
}

# Step 2: Check Auth services
Write-Host "`n[2/4] Checking Auth services..." -ForegroundColor Yellow
Set-Location "$projectRoot\src\auth-user-monorepo"
docker-compose ps | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth services (auth-service, user-service) are running" -ForegroundColor Green
} else {
    Write-Host "❌ Starting Auth services..." -ForegroundColor Red
    docker-compose up -d
}

# Step 3: Start Backend Server
Write-Host "`n[3/4] Starting Backend Server..." -ForegroundColor Yellow
Set-Location $projectRoot

# Check if backend is already running on port 5000
$backendRunning = netstat -ano | findstr ":5000.*LISTENING"
if ($backendRunning) {
    Write-Host "✅ Backend server already running on port 5000" -ForegroundColor Green
} else {
    Write-Host "⏳ Starting backend server in new window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run dev:server" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "✅ Backend server started" -ForegroundColor Green
}

# Step 4: Start Frontend
Write-Host "`n[4/4] Starting Frontend..." -ForegroundColor Yellow
$frontendPath = "$projectRoot\src\client\webapp"

# Check if frontend is already running on port 3003
$frontendRunning = netstat -ano | findstr ":3003.*LISTENING"
if ($frontendRunning) {
    Write-Host "✅ Frontend already running on port 3003" -ForegroundColor Green
} else {
    Write-Host "⏳ Starting frontend in new window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 5
    Write-Host "✅ Frontend started" -ForegroundColor Green
}

# Summary
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ APPLICATION READY!" -ForegroundColor Green -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n📍 Access the application:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend:     http://localhost:3003" -ForegroundColor White
Write-Host "   🔧 Backend:      http://localhost:5000" -ForegroundColor White
Write-Host "   🔐 Auth Service: http://localhost:3001" -ForegroundColor White
Write-Host "   👤 User Service: http://localhost:3002" -ForegroundColor White

Write-Host "`n📖 Documentation:" -ForegroundColor Cyan
Write-Host "   See AUTHENTICATION_GUIDE.md for usage instructions" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Register a new account" -ForegroundColor White
Write-Host "   2. Verify email (see guide)" -ForegroundColor White
Write-Host "   3. Login and start chatting!" -ForegroundColor White

# Open browser
Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3003"

Write-Host "`n✨ Done! Happy chatting! ✨`n" -ForegroundColor Magenta
