# ==============================================================================
# DISPLAY & CELL PROS - VERCEL DEPLOYMENT AUTOMATION (POWERSHELL)
# ==============================================================================
# This script streamlines the Vercel deployment workflow for Windows users.
# ==============================================================================

$ErrorActionPreference = "Stop"

# Check if Vercel CLI is installed
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Vercel CLI is not installed. Please run: npm i -g vercel"
    exit 1
}

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "🚀 Vercel Deployment Pre-flight (Windows)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Sync environment variables
$sync = Read-Host "Sync environment variables from Vercel? (y/n)"
if ($sync -eq "y") {
    Write-Host "📥 Pulling environment variables..." -ForegroundColor Yellow
    vercel env pull .env.local
}

# 2. Production Build Verification
$build = Read-Host "Run local production build check? (y/n)"
if ($build -eq "y") {
    Write-Host "🏗️  Running npm run build..." -ForegroundColor Yellow
    npm run build
}

# 3. Deploy
Write-Host "`n🌐 Choose deployment target:" -ForegroundColor Cyan
Write-Host "1) Preview (Development/Staging)"
Write-Host "2) Production (Live Site)"
$target = Read-Host "Select option [1-2]"

switch ($target) {
    "1" {
        Write-Host "🚀 Deploying to Preview..." -ForegroundColor Green
        vercel
    }
    "2" {
        Write-Host "🔥 Deploying to Production..." -ForegroundColor Red
        vercel --prod
    }
    Default {
        Write-Host "❌ Invalid option. Canceled." -ForegroundColor Gray
        exit 1
    }
}

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT SEQUENCE COMPLETED!" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
