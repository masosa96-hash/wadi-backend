# WADI Deployment Verification Script

Write-Host "Verificando configuracion de deployment..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check Node version
Write-Host "Verificando Node.js version..." -ForegroundColor Green
if (Test-Path ".nvmrc") {
    $nodeVersion = Get-Content ".nvmrc"
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Gray
} else {
    $errors += "Archivo .nvmrc no encontrado"
}

# Check pnpm version
Write-Host "Verificando pnpm..." -ForegroundColor Green
try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm version: $pnpmVersion" -ForegroundColor Gray
} catch {
    $errors += "pnpm no esta instalado"
}

# Check deployment configs
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Green

$requiredFiles = @(
    "render.yaml",
    "vercel.json",
    "apps/frontend/vercel.json",
    "apps/frontend/.env.example",
    "apps/api/.env.example",
    ".nvmrc",
    ".node-version"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Gray
    } else {
        $errors += "Archivo faltante: $file"
    }
}

# Check package.json scripts
Write-Host "Verificando scripts..." -ForegroundColor Green
$packageJson = Get-Content "package.json" | ConvertFrom-Json

$requiredScripts = @("build", "build:frontend", "build:api", "deploy:frontend", "deploy:api")
foreach ($script in $requiredScripts) {
    if ($packageJson.scripts.$script) {
        Write-Host "  OK: Script $script" -ForegroundColor Gray
    } else {
        $warnings += "Script faltante: $script"
    }
}

# Check build directories
Write-Host "Verificando builds..." -ForegroundColor Green
if (Test-Path "apps/frontend/dist") {
    Write-Host "  OK: Frontend build exists" -ForegroundColor Gray
} else {
    $warnings += "Frontend no esta buildeado (ejecuta pnpm build:frontend)"
}

if (Test-Path "apps/api/dist") {
    Write-Host "  OK: Backend build exists" -ForegroundColor Gray
} else {
    $warnings += "Backend no esta buildeado (ejecuta pnpm build:api)"
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "TODO LISTO PARA DEPLOYMENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Push a GitHub: git push origin main" -ForegroundColor Gray
    Write-Host "2. Conectar repo a Vercel" -ForegroundColor Gray
    Write-Host "3. Conectar repo a Render" -ForegroundColor Gray
    Write-Host "4. Configurar variables de entorno" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Documentacion: QUICK_DEPLOY_CHECKLIST.md" -ForegroundColor Cyan
} else {
    if ($errors.Count -gt 0) {
        Write-Host "ERRORES ENCONTRADOS:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "ADVERTENCIAS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Por favor, resolve los problemas antes de deployar." -ForegroundColor Yellow
}

Write-Host ""
