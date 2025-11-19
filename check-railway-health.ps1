#!/usr/bin/env pwsh
# Railway Service URL Detection and Health Check Script
# This script detects the Railway service URL and validates the /health endpoint

param(
    [string]$RailwayUrl = ""
)

function Write-Header {
    param([string]$Title, [string]$Color = "Cyan")
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Color
    Write-Host "   $Title" -ForegroundColor White
    Write-Host "   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Color
}

function Write-Footer {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Get-RailwayUrl {
    Write-Header "Railway Service URL Detection"
    
    # Method 1: Check Railway CLI
    Write-Host "`nAutomatic detection methods:" -ForegroundColor Yellow
    
    $cliAvailable = $false
    try {
        $null = Get-Command railway -ErrorAction Stop
        $cliAvailable = $true
        Write-Host "  ✓ Railway CLI: Installed" -ForegroundColor Green
        
        try {
            $status = railway status --json 2>&1 | ConvertFrom-Json
            if ($status.serviceUrl) {
                Write-Host "  ✓ URL detected via CLI" -ForegroundColor Green
                Write-Footer
                return $status.serviceUrl
            }
        } catch {
            Write-Host "  ✗ Railway CLI: Could not retrieve URL" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Railway CLI: Not installed" -ForegroundColor Red
    }
    
    # Method 2: Check Environment Variables
    $envUrl = $env:RAILWAY_STATIC_URL
    if (-not $envUrl) { $envUrl = $env:RAILWAY_PUBLIC_DOMAIN }
    
    if ($envUrl) {
        Write-Host "  ✓ Environment Variables: Found" -ForegroundColor Green
        Write-Footer
        return $envUrl
    } else {
        Write-Host "  ✗ Environment Variables: Not set" -ForegroundColor Red
    }
    
    # Method 3: Manual Input
    Write-Host "`nPlease enter the Railway service URL:" -ForegroundColor Yellow
    Write-Host "(Example: https://wadi-backend-production.up.railway.app)" -ForegroundColor Gray
    Write-Host "(Press Ctrl+C to cancel)" -ForegroundColor Gray
    
    $url = Read-Host "`nRailway URL"
    
    if ([string]::IsNullOrWhiteSpace($url)) {
        Write-Host "`n✗ ERROR: URL cannot be empty" -ForegroundColor Red
        Write-Footer
        exit 1
    }
    
    Write-Footer
    return $url.TrimEnd('/')
}

function Test-HealthEndpoint {
    param([string]$BaseUrl)
    
    Write-Header "Health Endpoint Validation" "Cyan"
    
    $healthUrl = "$BaseUrl/health"
    Write-Host "`nEndpoint: $healthUrl" -ForegroundColor White
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10 -UseBasicParsing
        
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        # Parse JSON response
        $healthData = $response.Content | ConvertFrom-Json
        
        # Display results
        Write-Host "Status Code: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        Write-Host "Response Time: ${responseTime}ms" -ForegroundColor $(if ($responseTime -lt 1000) { "Green" } elseif ($responseTime -lt 3000) { "Yellow" } else { "Red" })
        Write-Host "Health Status: $($healthData.status)" -ForegroundColor $(if ($healthData.status -eq "ok") { "Green" } else { "Red" })
        Write-Host "Supabase: $($healthData.supabase)" -ForegroundColor $(if ($healthData.supabase -eq "connected") { "Green" } else { "Yellow" })
        
        # Overall result
        if ($response.StatusCode -eq 200 -and $healthData.status -eq "ok") {
            Write-Host "`nResult: ✓ PASSED" -ForegroundColor Green
            
            if ($healthData.supabase -ne "connected") {
                Write-Host "Warning: Supabase connection is $($healthData.supabase)" -ForegroundColor Yellow
            }
            
            Write-Footer
            return $true
        } else {
            Write-Host "`nResult: ✗ FAILED - Health status is not 'ok'" -ForegroundColor Red
            Write-Footer
            return $false
        }
        
    } catch [System.Net.WebException] {
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__) $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
        Write-Host "Response Time: ${responseTime}ms" -ForegroundColor Red
        Write-Host "`nResult: ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        Write-Footer
        return $false
        
    } catch {
        Write-Host "Status Code: N/A" -ForegroundColor Red
        Write-Host "`nResult: ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        Write-Footer
        return $false
    }
}

# Main execution
try {
    # Detect or get Railway URL
    if ([string]::IsNullOrWhiteSpace($RailwayUrl)) {
        $RailwayUrl = Get-RailwayUrl
    } else {
        $RailwayUrl = $RailwayUrl.TrimEnd('/')
        Write-Header "Railway Service URL (Provided)" "Green"
        Write-Host "URL: $RailwayUrl" -ForegroundColor White
        Write-Footer
    }
    
    # Display detected URL
    Write-Header "Detected Railway Service URL" "Green"
    Write-Host "URL: $RailwayUrl" -ForegroundColor White
    Write-Footer
    
    # Test health endpoint
    $success = Test-HealthEndpoint -BaseUrl $RailwayUrl
    
    if ($success) {
        exit 0
    } else {
        exit 1
    }
    
} catch {
    Write-Host "`n✗ FATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}
