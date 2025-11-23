#!/usr/bin/env node

/**
 * WADI Health Check Script
 * Verifies all systems are working correctly
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
    return `${colors.green}✓${colors.reset}`;
}

function cross() {
    return `${colors.red}✗${colors.reset}`;
}

async function checkEnvFile(filePath, requiredVars) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        log(`${cross()} ${filePath} not found`, 'red');
        return false;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const missing = [];

    for (const varName of requiredVars) {
        if (!content.includes(`${varName}=`)) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        log(`${cross()} ${filePath} missing: ${missing.join(', ')}`, 'red');
        return false;
    }

    log(`${checkmark()} ${filePath} has all required variables`, 'green');
    return true;
}

async function checkHttp(url, expectedStatus = 200) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            if (res.statusCode === expectedStatus) {
                log(`${checkmark()} ${url} responding (${res.statusCode})`, 'green');
                resolve(true);
            } else {
                log(`${cross()} ${url} returned ${res.statusCode}`, 'red');
                resolve(false);
            }
        }).on('error', () => {
            log(`${cross()} ${url} not reachable`, 'red');
            resolve(false);
        });
    });
}

async function checkDirectory(dir) {
    const fullPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(fullPath)) {
        log(`${cross()} ${dir} not found`, 'red');
        return false;
    }

    log(`${checkmark()} ${dir} exists`, 'green');
    return true;
}

async function runHealthChecks() {
    log('\n🏥 WADI Health Check\n', 'blue');
    log('════════════════════════════════════════\n', 'cyan');

    const results = {
        structure: true,
        backend: true,
        frontend: true,
        services: true,
    };

    // 1. Project Structure
    log('📁 Checking Project Structure...', 'yellow');
    results.structure = await checkDirectory('apps/api') &&
        await checkDirectory('apps/frontend') &&
        await checkDirectory('packages');

    log('');

    // 2. Backend Environment
    log('⚙️  Checking Backend Configuration...', 'yellow');
    results.backend = await checkEnvFile('apps/api/.env', [
        'PORT',
        'OPENAI_API_KEY',
        'SUPABASE_URL',
        'GUEST_MODE',
    ]);

    log('');

    // 3. Frontend Environment
    log('⚙️  Checking Frontend Configuration...', 'yellow');
    results.frontend = await checkEnvFile('apps/frontend/.env', [
        'VITE_API_URL',
        'VITE_SUPABASE_URL',
        'VITE_GUEST_MODE',
    ]);

    log('');

    // 4. Services Health
    log('🌐 Checking Services...', 'yellow');
    log('Waiting 2 seconds for services to be ready...');
    await new Promise(r => setTimeout(r, 2000));

    results.services = await checkHttp('http://localhost:4000/health');

    log('');
    log('════════════════════════════════════════\n', 'cyan');

    // Summary
    const allPassed = Object.values(results).every(r => r);

    if (allPassed) {
        log('✅ All health checks passed!', 'green');
        log('\nYou can start developing:', 'cyan');
        log('  pnpm dev:api    # Start backend');
        log('  pnpm dev:front  # Start frontend\n');
        process.exit(0);
    } else {
        log('❌ Some health checks failed!', 'red');
        log('\nPlease fix the issues above.', 'yellow');
        log('See DOCUMENTATION_INDEX.md for help.\n');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runHealthChecks().catch(err => {
        log(`\n❌ Error: ${err.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runHealthChecks };
