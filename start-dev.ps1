# Start Development Servers
Write-Host "Starting ShopHub Development Servers..." -ForegroundColor Cyan

# Start Backend Server
Write-Host "`nStarting Backend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host "`n✓ Both servers starting!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000/" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
