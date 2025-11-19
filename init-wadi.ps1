Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== WADI INIT START ==="

mkdir apps -ErrorAction Ignore
mkdir packages -ErrorAction Ignore

@"
packages:
  - 'apps/*'
  - 'packages/*'
"@ | Out-File -Encoding utf8 pnpm-workspace.yaml

npm init -y | Out-Null

Write-Host "Creando estructura..."

mkdir apps\frontend -ErrorAction Ignore
mkdir apps\api -ErrorAction Ignore
mkdir packages\chat-core -ErrorAction Ignore

Write-Host "Listo. Ahora corré:"
Write-Host "pnpm install"
Write-Host "=== FIN ==="
