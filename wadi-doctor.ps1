#!/usr/bin/env pwsh
# WADI Monorepo Doctor - Diagnostic and Fix Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   WADI Monorepo Doctor v1.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Test 1: Check Node.js version
Write-Host "[1/8] Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$matches[1]
        if ($major -ge 18) {
            Write-Host "  ✓ Node.js $nodeVersion detected" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Node.js $nodeVersion is too old (need v18+)" -ForegroundColor Red
            $errors++
        }
    }
} catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    $errors++
}

# Test 2: Check PNPM
Write-Host "[2/8] Checking PNPM..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✓ PNPM $pnpmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "  ✗ PNPM not found - run: npm install -g pnpm" -ForegroundColor Red
    $errors++
}

# Test 3: Check workspace structure
Write-Host "[3/8] Checking monorepo structure..." -ForegroundColor Yellow
$requiredPaths = @(
    "apps/api",
    "apps/frontend",
    "packages/chat-core",
    "pnpm-workspace.yaml"
)

foreach ($path in $requiredPaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ $path exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $path" -ForegroundColor Red
        $errors++
    }
}

# Test 4: Check environment files
Write-Host "[4/8] Checking environment files..." -ForegroundColor Yellow
$envFiles = @{
    ".env" = "Root"
    "apps/api/.env" = "API"
    "apps/frontend/.env" = "Frontend"
}

foreach ($file in $envFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "  ✓ $($envFiles[$file]) .env exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Missing: $($envFiles[$file]) .env" -ForegroundColor Yellow
        $warnings++
    }
}

# Test 5: Verify required env vars
Write-Host "[5/8] Checking required environment variables..." -ForegroundColor Yellow
if (Test-Path "apps/api/.env") {
    $apiEnv = Get-Content "apps/api/.env" -Raw
    $requiredVars = @("SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY", "PORT")
    
    foreach ($var in $requiredVars) {
        if ($apiEnv -match "$var=") {
            Write-Host "  ✓ API $var configured" -ForegroundColor Green
        } else {
            Write-Host "  ✗ API missing: $var" -ForegroundColor Red
            $errors++
        }
    }
}

# Test 6: Check node_modules
Write-Host "[6/8] Checking dependencies..." -ForegroundColor Yellow
$nodeModulesPaths = @("node_modules", "apps/api/node_modules", "apps/frontend/node_modules")
$installedCount = 0

foreach ($nmPath in $nodeModulesPaths) {
    if (Test-Path $nmPath) {
        $installedCount++
    }
}

if ($installedCount -eq $nodeModulesPaths.Count) {
    Write-Host "  ✓ All dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some dependencies missing - run: pnpm install" -ForegroundColor Yellow
    $warnings++
}

# Test 7: Check TypeScript configuration
Write-Host "[7/8] Checking TypeScript configuration..." -ForegroundColor Yellow
$tsconfigs = @("apps/api/tsconfig.json", "apps/frontend/tsconfig.json")

foreach ($tsconfig in $tsconfigs) {
    if (Test-Path $tsconfig) {
        Write-Host "  ✓ $tsconfig exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $tsconfig" -ForegroundColor Red
        $errors++
    }
}

# Test 8: Check Railway configuration
Write-Host "[8/8] Checking deployment configuration..." -ForegroundColor Yellow
if (Test-Path "railway.json") {
    Write-Host "  ✓ Railway configuration exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Missing railway.json" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Diagnostic Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your monorepo is ready to use:" -ForegroundColor Green
    Write-Host "  pnpm dev:api      - Start API server" -ForegroundColor Cyan
    Write-Host "  pnpm dev:front    - Start frontend" -ForegroundColor Cyan
    Write-Host "  pnpm dev          - Start both" -ForegroundColor Cyan
} elseif ($errors -eq 0) {
    Write-Host "⚠ $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "The monorepo should work but some features may be limited." -ForegroundColor Yellow
} else {
    Write-Host "✗ $errors error(s) and $warnings warning(s) found" -ForegroundColor Red
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Red
    exit 1
}

Write-Host ""
