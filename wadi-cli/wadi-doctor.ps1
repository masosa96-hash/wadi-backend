Write-Host '=== WADI DOCTOR ===' -ForegroundColor Cyan

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  Write-Host '✔ PNPM OK' -ForegroundColor Green
} else {
  Write-Host '❌ PNPM no está instalado (o no está en PATH)' -ForegroundColor Red
}

if (Test-Path 'pnpm-workspace.yaml') { Write-Host '✔ Monorepo OK' -ForegroundColor Green }
else { Write-Host '❌ Falta pnpm-workspace.yaml' -ForegroundColor Red }

if (Test-Path 'apps/api') { Write-Host '✔ API OK' -ForegroundColor Green }
else { Write-Host '❌ Falta carpeta apps/api' -ForegroundColor Red }

if (Test-Path 'apps/frontend') { Write-Host '✔ Frontend OK' -ForegroundColor Green }
else { Write-Host '❌ Falta carpeta apps/frontend' -ForegroundColor Red }

if (Test-Path '.env') { Write-Host '✔ .env OK' -ForegroundColor Green }
else { Write-Host '❌ Falta archivo .env' -ForegroundColor Red }

Write-Host '=== FIN DOCTOR ===' -ForegroundColor Cyan
