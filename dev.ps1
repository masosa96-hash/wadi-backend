Write-Host "🔧 Instalando dependencias..." -ForegroundColor Cyan
pnpm install --recursive

Write-Host "🚀 Iniciando BACKEND..." -ForegroundColor Green
Start-Process powershell -ArgumentList "cd apps/api; pnpm dev"

Write-Host "🌐 Iniciando FRONTEND..." -ForegroundColor Green
Start-Process powershell -ArgumentList "cd apps/frontend; pnpm dev"

Write-Host "✅ Todo listo. Backend y Frontend corriendo." -ForegroundColor Yellow
