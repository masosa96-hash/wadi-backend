# 🚀 WADI Quick Verification Script
# Verifica que todo está listo para deployment

Write-Host "🔍 WADI Project Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check TypeScript compilation
Write-Host "1️⃣ Checking Backend TypeScript..." -ForegroundColor Yellow
cd apps\api
$apiErrors = npx tsc --noEmit --skipLibCheck 2>&1 | Select-String -Pattern "error TS" | Measure-Object -Line
if ($apiErrors.Lines -eq 0) {
    Write-Host "   ✅ Backend: No TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend: $($apiErrors.Lines) TypeScript errors found" -ForegroundColor Red
}
cd ..\..

Write-Host ""
Write-Host "2️⃣ Checking Frontend TypeScript..." -ForegroundColor Yellow
cd apps\frontend
$frontendErrors = npx tsc --noEmit --skipLibCheck 2>&1 | Select-String -Pattern "error TS" | Measure-Object -Line
if ($frontendErrors.Lines -eq 0) {
    Write-Host "   ✅ Frontend: No TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend: $($frontendErrors.Lines) TypeScript errors found" -ForegroundColor Red
}
cd ..\..

# 2. Check critical files
Write-Host ""
Write-Host "3️⃣ Checking Critical Files..." -ForegroundColor Yellow

$criticalFiles = @(
    "apps\api\src\index.ts",
    "apps\api\src\controllers\workspacesController.ts",
    "apps\api\src\controllers\billingController.ts",
    "apps\api\src\controllers\presetsController.ts",
    "apps\api\src\controllers\runsController.ts",
    "apps\api\src\services\websocket.ts",
    "apps\frontend\src\router.tsx",
    "apps\frontend\src\pages\Projects.tsx",
    "apps\frontend\src\pages\ProjectDetail.tsx",
    "apps\frontend\src\pages\WorkspaceDetail.tsx",
    "apps\frontend\src\pages\Billing.tsx",
    "apps\frontend\src\pages\Presets.tsx",
    "apps\frontend\src\store\workspacesStore.ts",
    "apps\frontend\src\store\billingStore.ts",
    "apps\frontend\src\store\presetsStore.ts"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING)" -ForegroundColor Red
        $missingFiles += $file
    }
}

# 3. Check SQL schemas
Write-Host ""
Write-Host "4️⃣ Checking SQL Schemas..." -ForegroundColor Yellow

$sqlFiles = @(
    "docs\database\phase1-workspaces-schema.sql",
    "docs\database\phase2-billing-schema.sql",
    "docs\database\phase3-presets-schema.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING)" -ForegroundColor Red
    }
}

# 4. Check environment files
Write-Host ""
Write-Host "5️⃣ Checking Environment Configuration..." -ForegroundColor Yellow

if (Test-Path "apps\api\.env") {
    Write-Host "   ✅ Backend .env exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend .env missing (copy from .env.example)" -ForegroundColor Yellow
}

if (Test-Path "apps\frontend\.env") {
    Write-Host "   ✅ Frontend .env exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend .env missing (copy from .env.example)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($apiErrors.Lines -eq 0 -and $frontendErrors.Lines -eq 0 -and $missingFiles.Count -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "🚀 Project is ready for deployment" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some issues found:" -ForegroundColor Yellow
    if ($apiErrors.Lines -gt 0) { Write-Host "   - Backend has TypeScript errors" -ForegroundColor Red }
    if ($frontendErrors.Lines -gt 0) { Write-Host "   - Frontend has TypeScript errors" -ForegroundColor Red }
    if ($missingFiles.Count -gt 0) { Write-Host "   - $($missingFiles.Count) critical files missing" -ForegroundColor Red }
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Execute SQL schemas in Supabase SQL Editor" -ForegroundColor White
Write-Host "   2. Configure .env files" -ForegroundColor White
Write-Host "   3. Run 'pnpm --filter api dev' to start backend" -ForegroundColor White
Write-Host "   4. Run 'pnpm --filter frontend dev' to start frontend" -ForegroundColor White
Write-Host ""
