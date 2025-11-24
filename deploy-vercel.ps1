#!/usr/bin/env pwsh
# WADI Vercel Deployment Script
# Run from root: .\deploy-vercel.ps1

Write-Host "🚀 WADI - Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Ensure we're in the root directory
$rootPath = "E:\WADI"
if ((Get-Location).Path -ne $rootPath) {
    Write-Host "📍 Navigating to root directory: $rootPath" -ForegroundColor Yellow
    Set-Location $rootPath
}

Write-Host ""
Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Verify vercel.json exists in frontend
if (-not (Test-Path "apps\frontend\vercel.json")) {
    Write-Host "❌ Error: vercel.json not found in apps/frontend" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Vercel Configuration:" -ForegroundColor Cyan
Write-Host "   Root Directory in Vercel Settings: apps/frontend" -ForegroundColor White
Write-Host "   Deploying from: E:\WADI (monorepo root)" -ForegroundColor White
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Deploy to production? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Deploy with vercel
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Notes:" -ForegroundColor Cyan
    Write-Host "   • Always run this script from E:\WADI" -ForegroundColor White
    Write-Host "   • Vercel Root Directory setting: apps/frontend" -ForegroundColor White
    Write-Host "   • To change this, update Vercel Settings → General → Root Directory" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Verify Vercel CLI is installed: vercel --version" -ForegroundColor White
    Write-Host "   2. Login to Vercel: vercel login" -ForegroundColor White
    Write-Host "   3. Check Vercel Settings → Root Directory = apps/frontend" -ForegroundColor White
    exit 1
}
