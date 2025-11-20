Write-Host '=== FIX WADI ==='

# 1) Forzar Node 20 para Railway
'nodeVersion = "20"' | Out-File -Encoding utf8 railway.toml

# 2) Regenerar pnpm
if (Test-Path .pnpm-store) { Remove-Item .pnpm-store -Recurse -Force }
if (Test-Path node_modules) { Remove-Item node_modules -Recurse -Force }
pnpm install

# 3) Limpiar dist
Get-ChildItem -Recurse -Filter dist | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 4) Rebuild de API
Set-Location apps/api
pnpm install
pnpm tsc
Set-Location ../..

# 5) Rebuild frontend
Set-Location apps/frontend
pnpm install
Set-Location ../..

Write-Host '=== LISTO ==='
