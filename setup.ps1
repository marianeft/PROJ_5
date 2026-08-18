#!/usr/bin/env pwsh
# Setup script for IESIS Portal Local Development

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   IESIS Portal - Local Setup Script            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if public folder exists
$publicPath = ".\public"
if (-not (Test-Path $publicPath)) {
    Write-Host "📁 Creating public directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $publicPath | Out-Null
}

# Check if node_modules exists
if (-not (Test-Path ".\node_modules")) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n✓ Dependencies already installed" -ForegroundColor Green
}

# Copy HTML files to public directory
$filesToCopy = @(
    "nsrp.html",
    "peso-services.html",
    "labor-market.html",
    "cdsp-programs.html"
)

Write-Host "`n📋 Copying HTML files to public directory..." -ForegroundColor Yellow
foreach ($file in $filesToCopy) {
    if (Test-Path ".\$file") {
        Copy-Item ".\$file" "$publicPath\$file" -Force
        Write-Host "  ✓ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: $file not found in root directory" -ForegroundColor Yellow
    }
}

# Copy assets folder
if (Test-Path ".\assets") {
    Write-Host "`n📦 Copying assets folder..." -ForegroundColor Yellow
    if (Test-Path "$publicPath\assets") {
        Remove-Item "$publicPath\assets" -Recurse -Force
    }
    Copy-Item ".\assets" "$publicPath\assets" -Recurse
    Write-Host "  ✓ Assets folder copied" -ForegroundColor Green
}

# Copy images folder
if (Test-Path ".\images") {
    Write-Host "`n📸 Copying images folder..." -ForegroundColor Yellow
    if (Test-Path "$publicPath\images") {
        Remove-Item "$publicPath\images" -Recurse -Force
    }
    Copy-Item ".\images" "$publicPath\images" -Recurse
    Write-Host "  ✓ Images folder copied" -ForegroundColor Green
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the server: npm start" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Login with: username=admin, password=admin123" -ForegroundColor White
Write-Host ""
