#!/usr/bin/env pwsh
# Script de verificación rápida para Chat WADI
# Ejecutar: .\test-chat-ready.ps1

Write-Host "🔍 Verificando configuración de Chat WADI..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# ==========================================
# 1. Verificar estructura de archivos
# ==========================================
Write-Host "📁 Verificando estructura de archivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "apps\api\src\routes\chat.ts",
    "apps\api\src\controllers\chatController.ts",
    "apps\api\src\services\openai.ts",
    "apps\frontend\src\pages\Chat.tsx",
    "apps\frontend\src\pages\Home.tsx",
    "apps\frontend\src\store\chatStore.ts",
    "apps\frontend\src\config\api.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
        $errors += "Archivo faltante: $file"
    }
}

Write-Host ""

# ==========================================
# 2. Verificar .env del Backend
# ==========================================
Write-Host "🔧 Verificando .env del Backend..." -ForegroundColor Yellow

if (Test-Path "apps\api\.env") {
    Write-Host "  ✅ apps\api\.env existe" -ForegroundColor Green
    
    $backendEnv = Get-Content "apps\api\.env" -Raw
    
    # Verificar OPENAI_API_KEY
    if ($backendEnv -match "OPENAI_API_KEY=sk-[a-zA-Z0-9\-_]+") {
        Write-Host "  ✅ OPENAI_API_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ OPENAI_API_KEY faltante o inválida" -ForegroundColor Red
        $errors += "Backend: OPENAI_API_KEY no configurada"
    }
    
    # Verificar OPENAI_DEFAULT_MODEL
    if ($backendEnv -match "OPENAI_DEFAULT_MODEL=.+") {
        $model = ($backendEnv | Select-String "OPENAI_DEFAULT_MODEL=(.+)" -AllMatches).Matches.Groups[1].Value
        Write-Host "  ✅ OPENAI_DEFAULT_MODEL: $model" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  OPENAI_DEFAULT_MODEL no configurado (usará gpt-3.5-turbo)" -ForegroundColor Yellow
        $warnings += "Backend: OPENAI_DEFAULT_MODEL no configurado"
    }
    
    # Verificar SUPABASE_URL
    if ($backendEnv -match "SUPABASE_URL=https://.+\.supabase\.co") {
        Write-Host "  ✅ SUPABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SUPABASE_URL faltante o inválida" -ForegroundColor Red
        $errors += "Backend: SUPABASE_URL no configurada"
    }
    
    # Verificar SUPABASE_ANON_KEY
    if ($backendEnv -match "SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9\-_\.]+") {
        Write-Host "  ✅ SUPABASE_ANON_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SUPABASE_ANON_KEY faltante o inválida" -ForegroundColor Red
        $errors += "Backend: SUPABASE_ANON_KEY no configurada"
    }
    
    # Verificar SUPABASE_SERVICE_KEY
    if ($backendEnv -match "SUPABASE_SERVICE_KEY=eyJ[a-zA-Z0-9\-_\.]+") {
        Write-Host "  ✅ SUPABASE_SERVICE_KEY configurada" -ForegroundColor Green
    } elseif ($backendEnv -match "SUPABASE_SERVICE_KEY=your-service-role-key-here") {
        Write-Host "  ⚠️  SUPABASE_SERVICE_KEY usa valor de ejemplo" -ForegroundColor Yellow
        $warnings += "Backend: SUPABASE_SERVICE_KEY necesita valor real"
    } else {
        Write-Host "  ❌ SUPABASE_SERVICE_KEY faltante" -ForegroundColor Red
        $errors += "Backend: SUPABASE_SERVICE_KEY no configurada"
    }
    
    # Verificar PORT
    if ($backendEnv -match "PORT=4000") {
        Write-Host "  ✅ PORT=4000" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  PORT no es 4000" -ForegroundColor Yellow
        $warnings += "Backend: PORT debería ser 4000"
    }
    
} else {
    Write-Host "  ❌ apps\api\.env no existe" -ForegroundColor Red
    $errors += "Backend .env faltante"
}

Write-Host ""

# ==========================================
# 3. Verificar .env del Frontend
# ==========================================
Write-Host "🎨 Verificando .env del Frontend..." -ForegroundColor Yellow

if (Test-Path "apps\frontend\.env") {
    Write-Host "  ✅ apps\frontend\.env existe" -ForegroundColor Green
    
    $frontendEnv = Get-Content "apps\frontend\.env" -Raw
    
    # Verificar SUPABASE_URL (con VITE_ prefix)
    if ($frontendEnv -match "(VITE_)?SUPABASE_URL=https://.+\.supabase\.co") {
        Write-Host "  ✅ SUPABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SUPABASE_URL faltante o inválida" -ForegroundColor Red
        $errors += "Frontend: SUPABASE_URL no configurada"
    }
    
    # Verificar SUPABASE_ANON_KEY (con VITE_ prefix)
    if ($frontendEnv -match "(VITE_)?SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9\-_\.]+") {
        Write-Host "  ✅ SUPABASE_ANON_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SUPABASE_ANON_KEY faltante o inválida" -ForegroundColor Red
        $errors += "Frontend: SUPABASE_ANON_KEY no configurada"
    }
    
    # Verificar API_URL
    if ($frontendEnv -match "(VITE_)?API_URL=http://localhost:4000") {
        Write-Host "  ✅ API_URL=http://localhost:4000" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  API_URL no apunta a localhost:4000" -ForegroundColor Yellow
        $warnings += "Frontend: API_URL debería ser http://localhost:4000"
    }
    
} else {
    Write-Host "  ❌ apps\frontend\.env no existe" -ForegroundColor Red
    $errors += "Frontend .env faltante"
}

Write-Host ""

# ==========================================
# 4. Verificar dependencias instaladas
# ==========================================
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "  ✅ node_modules existe en root" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  node_modules no existe en root" -ForegroundColor Yellow
    $warnings += "Ejecutar 'pnpm install' en la raíz"
}

if (Test-Path "apps\api\node_modules") {
    Write-Host "  ✅ node_modules existe en apps/api" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  node_modules no existe en apps/api" -ForegroundColor Yellow
    $warnings += "Ejecutar 'pnpm install' en apps/api"
}

if (Test-Path "apps\frontend\node_modules") {
    Write-Host "  ✅ node_modules existe en apps/frontend" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  node_modules no existe en apps/frontend" -ForegroundColor Yellow
    $warnings += "Ejecutar 'pnpm install' en apps/frontend"
}

Write-Host ""

# ==========================================
# 5. Verificar que los puertos están libres
# ==========================================
Write-Host "🔌 Verificando puertos..." -ForegroundColor Yellow

$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($port4000) {
    Write-Host "  ⚠️  Puerto 4000 está en uso (puede ser el backend corriendo)" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Puerto 4000 está libre" -ForegroundColor Green
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "  ⚠️  Puerto 5173 está en uso (puede ser el frontend corriendo)" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Puerto 5173 está libre" -ForegroundColor Green
}

Write-Host ""

# ==========================================
# RESUMEN
# ==========================================
Write-Host "================================" -ForegroundColor Cyan
Write-Host "           RESUMEN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ¡Todo listo! El chat está configurado correctamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Terminal 1: pnpm --filter api dev" -ForegroundColor White
    Write-Host "  2. Terminal 2: pnpm --filter frontend dev" -ForegroundColor White
    Write-Host "  3. Abrir: http://localhost:5173/login" -ForegroundColor White
    Write-Host ""
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Errores encontrados ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Advertencias ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "🔧 Corregí los errores antes de continuar." -ForegroundColor Red
    } else {
        Write-Host "⚠️  Revisá las advertencias. El sistema puede funcionar, pero es recomendable corregirlas." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📄 Ver checklist completo en: CHECKLIST_PRUEBA_CHAT.md" -ForegroundColor Cyan
Write-Host ""
