# WADI Automatic Setup Script
# Automates the setup process for WADI local development environment

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host " [OK] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host " [ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host " [INFO] $Message" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

# --- Main Execution ---

Write-Header "WADI Automatic Setup"

# 1. Validate Prerequisites
Write-Info "Checking prerequisites..."

if (-not (Test-Command "node")) {
    Write-ErrorMsg "Node.js is not installed or not in PATH."
    exit 1
}
Write-Success "Node.js is installed"

if (-not (Test-Command "pnpm")) {
    Write-ErrorMsg "pnpm is not installed or not in PATH."
    Write-Host "Please install pnpm: npm install -g pnpm"
    exit 1
}
Write-Success "pnpm is installed"

# 2. Setup Backend Environment
Write-Header "Configuring Backend (API)"

$apiEnvPath = "apps/api/.env"
$apiExamplePath = "apps/api/.env.example"

if (Test-Path $apiEnvPath) {
    Write-Info "Backend .env file already exists. Skipping creation."
}
else {
    if (-not (Test-Path $apiExamplePath)) {
        Write-ErrorMsg "apps/api/.env.example not found!"
        exit 1
    }

    Write-Info "Creating apps/api/.env from example..."
    Copy-Item $apiExamplePath $apiEnvPath

    # Prompt for credentials
    $supabaseUrl = Read-Host "Enter your Supabase URL (e.g., https://yourproject.supabase.co)"
    $supabaseAnonKey = Read-Host "Enter your Supabase Anon Key"
    $openaiApiKey = Read-Host "Enter your OpenAI API Key (starts with sk-)"
    $groqApiKey = Read-Host "Enter your Groq API Key (optional, press Enter to skip)"

    # Update .env content
    $envContent = Get-Content $apiEnvPath -Raw
    
    if ($supabaseUrl) {
        $envContent = $envContent -replace "SUPABASE_URL=.*", "SUPABASE_URL=$supabaseUrl"
    }
    if ($supabaseAnonKey) {
        $envContent = $envContent -replace "SUPABASE_ANON_KEY=.*", "SUPABASE_ANON_KEY=$supabaseAnonKey"
    }
    if ($openaiApiKey) {
        $envContent = $envContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$openaiApiKey"
    }
    if ($groqApiKey) {
        # Check if GROQ_API_KEY exists in example, if not append it
        if ($envContent -match "GROQ_API_KEY=") {
            $envContent = $envContent -replace "GROQ_API_KEY=.*", "GROQ_API_KEY=$groqApiKey"
        }
        else {
            $envContent += "`nGROQ_API_KEY=$groqApiKey"
            $envContent += "`nGROQ_DEFAULT_MODEL=llama-3.1-8b-instant"
        }
    }

    Set-Content -Path $apiEnvPath -Value $envContent
    Write-Success "Backend .env configured"
    
    # Store for frontend setup
    $global:SupabaseUrl = $supabaseUrl
    $global:SupabaseAnonKey = $supabaseAnonKey
}

# 3. Setup Frontend Environment
Write-Header "Configuring Frontend"

$frontendEnvPath = "apps/frontend/.env"
$frontendExamplePath = "apps/frontend/.env.example"

if (Test-Path $frontendEnvPath) {
    Write-Info "Frontend .env file already exists. Skipping creation."
}
else {
    if (-not (Test-Path $frontendExamplePath)) {
        Write-ErrorMsg "apps/frontend/.env.example not found!"
        exit 1
    }

    Write-Info "Creating apps/frontend/.env from example..."
    Copy-Item $frontendExamplePath $frontendEnvPath

    # Use values from backend setup if available, otherwise prompt
    if (-not $global:SupabaseUrl) {
        $global:SupabaseUrl = Read-Host "Enter your Supabase URL (e.g., https://yourproject.supabase.co)"
    }
    if (-not $global:SupabaseAnonKey) {
        $global:SupabaseAnonKey = Read-Host "Enter your Supabase Anon Key"
    }

    # Update .env content
    $envContent = Get-Content $frontendEnvPath -Raw
    
    if ($global:SupabaseUrl) {
        $envContent = $envContent -replace "VITE_SUPABASE_URL=.*", "VITE_SUPABASE_URL=$global:SupabaseUrl"
    }
    if ($global:SupabaseAnonKey) {
        $envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$global:SupabaseAnonKey"
    }

    Set-Content -Path $frontendEnvPath -Value $envContent
    Write-Success "Frontend .env configured"
}

# 4. Install Dependencies
Write-Header "Installing Dependencies"
Write-Info "Running pnpm install..."

try {
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    }
    else {
        throw "pnpm install failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-ErrorMsg "Failed to install dependencies: $_"
    exit 1
}

# 5. Completion
Write-Header "Setup Complete!"

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Start the backend API:"
Write-Host "   pnpm --filter api dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start the frontend (in a separate terminal):"
Write-Host "   pnpm --filter frontend dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Access the application:"
Write-Host "   - Frontend: http://localhost:5173"
Write-Host "   - API: http://localhost:4000"
Write-Host ""
Write-Host "Note: You still need to configure your Supabase database schema."
Write-Host "See docs/database-schema.md for instructions."
