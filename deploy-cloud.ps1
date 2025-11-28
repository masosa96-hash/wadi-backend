#!/usr/bin/env pwsh
# WADI Cloud Deployment Script
# This script helps prepare for cloud deployment

Write-Host "🚀 WADI - Cloud Deployment Preparation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$rootPath = "E:\WADI"
if ((Get-Location).Path -ne $rootPath) {
    Write-Host "📍 Navigating to root directory: $rootPath" -ForegroundColor Yellow
    Set-Location $rootPath
}

Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Verify required files exist
Write-Host "🔍 Checking required deployment files..." -ForegroundColor Cyan

$requiredFiles = @(
    "render.yaml",
    "apps/frontend/vercel.json",
    "apps/frontend/.env.example",
    "apps/api/.env.example"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Missing required deployment files!" -ForegroundColor Red
    Write-Host "Please check the files listed above." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ All required deployment files found!" -ForegroundColor Green
Write-Host ""

# Check if code is committed
Write-Host "🔍 Checking Git status..." -ForegroundColor Cyan
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
        git status --porcelain
        Write-Host ""
        $commitChoice = Read-Host "Commit changes now? (y/N)"
        if ($commitChoice -eq 'y' -or $commitChoice -eq 'Y') {
            $commitMessage = Read-Host "Enter commit message"
            if (-not $commitMessage) {
                $commitMessage = "Prepare for cloud deployment"
            }
            git add .
            git commit -m "$commitMessage"
            Write-Host "✅ Changes committed!" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Git not initialized or not available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Building applications..." -ForegroundColor Cyan

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
try {
    pnpm build:frontend
    Write-Host "✅ Frontend build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Write-Host "Please check for build errors and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
try {
    pnpm build:api
    Write-Host "✅ Backend build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    Write-Host "Please check for build errors and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Both applications built successfully!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "📋 Deployment Preparation Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Repository is ready for cloud deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host "2. Deploy backend to Render" -ForegroundColor White
Write-Host "3. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "4. Configure environment variables in both platforms" -ForegroundColor White
Write-Host ""
Write-Host "Refer to CLOUD_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

$openGuide = Read-Host "Open deployment guide? (y/N)"
if ($openGuide -eq 'y' -or $openGuide -eq 'Y') {
    Write-Host "Opening CLOUD_DEPLOYMENT_GUIDE.md..." -ForegroundColor Yellow
    Invoke-Item "CLOUD_DEPLOYMENT_GUIDE.md"
}

Write-Host "🎉 Ready for deployment!" -ForegroundColor Green