#!/usr/bin/env pwsh
# Minimal WADI Deployment Script

Write-Host "🚀 WADI - Minimal Deployment Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check required files
Write-Host "🔍 Checking required files..." -ForegroundColor Cyan

$requiredFiles = @(
    "render.yaml",
    "apps/frontend/vercel.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Deployment check complete!" -ForegroundColor Green