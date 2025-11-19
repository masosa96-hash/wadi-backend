# WADI Automatic Setup Script
# This script automates the initial setup process for WADI development environment

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color output functions
function Write-Header($message) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $message" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✔ $message" -ForegroundColor Green
}

function Write-Info($message) {
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "✖ $message" -ForegroundColor Red
}

# Get script root directory
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApiDir = Join-Path $RootDir "apps\api"
$FrontendDir = Join-Path $RootDir "apps\frontend"
$ApiEnvExample = Join-Path $ApiDir ".env.example"
$ApiEnv = Join-Path $ApiDir ".env"
$FrontendEnvExample = Join-Path $FrontendDir ".env.example"
$FrontendEnv = Join-Path $FrontendDir ".env"

# Function to validate prerequisites
function Test-Prerequisites {
    Write-Header "Validating Prerequisites"
    
    # Check Node.js
    Write-Host "Checking Node.js installation..." -NoNewline
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Error "`nNode.js is not installed or not in PATH"
        Write-Host "Please install Node.js v18 or later from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check pnpm
    Write-Host "Checking pnpm installation..." -NoNewline
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " $pnpmVersion" -ForegroundColor Green
        } else {
            throw "pnpm not found"
        }
    } catch {
        Write-Error "`npnpm is not installed or not in PATH"
        Write-Host "Please install pnpm by running: npm install -g pnpm" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "All prerequisites validated"
}

# Function to setup backend environment
function Set-BackendEnvironment {
    Write-Header "Configuring Backend Environment"
    
    # Check if .env already exists
    if (Test-Path $ApiEnv) {
        Write-Info "Backend .env file already exists, skipping configuration"
        return $null
    }
    
    # Verify .env.example exists
    if (-not (Test-Path $ApiEnvExample)) {
        Write-Error "Backend .env.example file not found at: $ApiEnvExample"
        exit 1
    }
    
    # Copy .env.example to .env
    Write-Host "Creating backend .env file..." -NoNewline
    Copy-Item $ApiEnvExample $ApiEnv
    Write-Success "Done"
    
    # Prompt for user inputs
    Write-Host "`nPlease provide the following configuration values:" -ForegroundColor Cyan
    Write-Host "(You can find these in your Supabase project settings)" -ForegroundColor Gray
    
    $supabaseUrl = Read-Host "`nEnter your Supabase project URL (e.g., https://yourproject.supabase.co)"
    $supabaseAnonKey = Read-Host "Enter your Supabase anon key"
    $openaiApiKey = Read-Host "Enter your OpenAI API key (starts with sk-)"
    
    # Trim whitespace
    $supabaseUrl = $supabaseUrl.Trim()
    $supabaseAnonKey = $supabaseAnonKey.Trim()
    $openaiApiKey = $openaiApiKey.Trim()
    
    # Read current .env content
    $envContent = Get-Content $ApiEnv -Raw
    
    # Replace placeholder values with user inputs
    $envContent = $envContent -replace 'SUPABASE_URL=.*', "SUPABASE_URL=$supabaseUrl"
    $envContent = $envContent -replace 'SUPABASE_ANON_KEY=.*', "SUPABASE_ANON_KEY=$supabaseAnonKey"
    $envContent = $envContent -replace 'OPENAI_API_KEY=.*', "OPENAI_API_KEY=$openaiApiKey"
    
    # Write updated content back to .env
    Set-Content -Path $ApiEnv -Value $envContent -NoNewline
    
    Write-Success "Backend environment configured successfully"
    
    # Return credentials for frontend setup
    return @{
        SupabaseUrl = $supabaseUrl
        SupabaseAnonKey = $supabaseAnonKey
    }
}

# Function to setup frontend environment
function Set-FrontendEnvironment {
    param(
        [hashtable]$Credentials
    )
    
    Write-Header "Configuring Frontend Environment"
    
    # Check if .env already exists
    if (Test-Path $FrontendEnv) {
        Write-Info "Frontend .env file already exists, skipping configuration"
        return
    }
    
    # Verify .env.example exists
    if (-not (Test-Path $FrontendEnvExample)) {
        Write-Error "Frontend .env.example file not found at: $FrontendEnvExample"
        exit 1
    }
    
    # Copy .env.example to .env
    Write-Host "Creating frontend .env file..." -NoNewline
    Copy-Item $FrontendEnvExample $FrontendEnv
    Write-Success "Done"
    
    # If credentials were provided, update frontend .env
    if ($Credentials) {
        # Read current .env content
        $envContent = Get-Content $FrontendEnv -Raw
        
        # Replace placeholder values with credentials from backend setup
        $envContent = $envContent -replace 'VITE_SUPABASE_URL=.*', "VITE_SUPABASE_URL=$($Credentials.SupabaseUrl)"
        $envContent = $envContent -replace 'VITE_SUPABASE_ANON_KEY=.*', "VITE_SUPABASE_ANON_KEY=$($Credentials.SupabaseAnonKey)"
        
        # Write updated content back to .env
        Set-Content -Path $FrontendEnv -Value $envContent -NoNewline
        
        Write-Success "Frontend environment configured with Supabase credentials"
    } else {
        Write-Info "Backend credentials not available, frontend .env created with default values"
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    Write-Host "Running pnpm install in root directory..."
    Write-Host "This may take a few minutes...`n" -ForegroundColor Gray
    
    Push-Location $RootDir
    try {
        pnpm install
        if ($LASTEXITCODE -ne 0) {
            throw "pnpm install failed"
        }
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        Write-Host "Error: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    } finally {
        Pop-Location
    }
}

# Function to display next steps
function Show-NextSteps {
    Write-Header "Setup Complete!"
    
    Write-Host "✔ WADI setup completed successfully!`n" -ForegroundColor Green
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "`n1. " -NoNewline -ForegroundColor Yellow
    Write-Host "Set up your Supabase database schema:"
    Write-Host "   - Go to your Supabase project's SQL Editor"
    Write-Host "   - Execute the schema from docs/database-schema.md"
    
    Write-Host "`n2. " -NoNewline -ForegroundColor Yellow
    Write-Host "Start the backend API (in a terminal):"
    Write-Host "   " -NoNewline
    Write-Host "pnpm --filter api dev" -ForegroundColor White -BackgroundColor DarkGray
    
    Write-Host "`n3. " -NoNewline -ForegroundColor Yellow
    Write-Host "Start the frontend (in a separate terminal):"
    Write-Host "   " -NoNewline
    Write-Host "pnpm --filter frontend dev" -ForegroundColor White -BackgroundColor DarkGray
    
    Write-Host "`n4. " -NoNewline -ForegroundColor Yellow
    Write-Host "Access the application:"
    Write-Host "   - Frontend: " -NoNewline
    Write-Host "http://localhost:5173" -ForegroundColor Cyan
    Write-Host "   - API:      " -NoNewline
    Write-Host "http://localhost:4000" -ForegroundColor Cyan
    
    Write-Host "`n5. " -NoNewline -ForegroundColor Yellow
    Write-Host "Verify the setup by testing the application flow:"
    Write-Host "   - Register a new user account"
    Write-Host "   - Create a project"
    Write-Host "   - Execute a test run with an AI prompt"
    
    Write-Host "`n" -NoNewline
    Write-Host "Note: " -ForegroundColor Yellow -NoNewline
    Write-Host "Don't forget to configure your Supabase database schema before using the app!"
    Write-Host ""
}

# Main execution
try {
    Write-Header "WADI Automatic Setup"
    
    # Step 1: Validate prerequisites
    Test-Prerequisites
    
    # Step 2: Setup backend environment
    $credentials = Set-BackendEnvironment
    
    # Step 3: Setup frontend environment
    Set-FrontendEnvironment -Credentials $credentials
    
    # Step 4: Install dependencies
    Install-Dependencies
    
    # Step 5: Display next steps
    Show-NextSteps
    
    exit 0
    
} catch {
    Write-Host "`n" -NoNewline
    Write-Error "Setup failed: $_"
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
