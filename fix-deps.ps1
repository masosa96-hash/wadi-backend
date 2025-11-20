Write-Host '=== FIX DEPENDENCIAS API ==='

Set-Location apps/api
pnpm add @supabase/supabase-js express-rate-limit
Set-Location ../..

Write-Host '=== Reinstalar monorepo ==='
pnpm install

Write-Host '=== Build API ==='
pnpm -F api tsc

Write-Host '=== LISTO ==='
