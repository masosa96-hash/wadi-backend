#!/usr/bin/env node

/**
 * Production Build Verification Script
 * Checks that production builds are working correctly
 */

const { execSync } = require('child_process');
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

function exec(command, cwd = process.cwd()) {
    try {
        return execSync(command, { cwd, encoding: 'utf-8', stdio: 'pipe' });
    } catch (error) {
        return null;
    }
}

async function verifyBuild() {
    log('\n🏗️  WADI Production Build Verification\n', 'blue');
    log('════════════════════════════════════════\n', 'cyan');

    let allPassed = true;

    // 1. Backend Build
    log('📦 Building Backend...', 'yellow');
    const backendBuild = exec('pnpm --filter api build');

    if (backendBuild === null) {
        log('✗ Backend build failed', 'red');
        allPassed = false;
    } else {
        log('✓ Backend build successful', 'green');

        // Check dist exists
        const distPath = path.join(process.cwd(), 'apps/api/dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            log(`  → Generated ${files.length} files`, 'cyan');
        }
    }

    log('');

    // 2. Frontend Build
    log('📦 Building Frontend...', 'yellow');
    const frontendBuild = exec('pnpm --filter frontend build');

    if (frontendBuild === null) {
        log('✗ Frontend build failed', 'red');
        allPassed = false;
    } else {
        log('✓ Frontend build successful', 'green');

        // Check dist exists and analyze
        const distPath = path.join(process.cwd(), 'apps/frontend/dist');
        if (fs.existsSync(distPath)) {
            const indexHtml = path.join(distPath, 'index.html');
            const assetsDir = path.join(distPath, 'assets');

            if (fs.existsSync(indexHtml)) {
                log('  → index.html created', 'cyan');
            }

            if (fs.existsSync(assetsDir)) {
                const assets = fs.readdirSync(assetsDir);
                const jsFiles = assets.filter(f => f.endsWith('.js'));
                const cssFiles = assets.filter(f => f.endsWith('.css'));

                log(`  → ${jsFiles.length} JS files`, 'cyan');
                log(`  → ${cssFiles.length} CSS files`, 'cyan');

                // Calculate total size
                let totalSize = 0;
                assets.forEach(file => {
                    const filePath = path.join(assetsDir, file);
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                });

                const totalMB = (totalSize / 1024 / 1024).toFixed(2);
                log(`  → Total size: ${totalMB} MB`, 'cyan');

                if (totalSize > 5 * 1024 * 1024) { // > 5MB
                    log('  ⚠️  Warning: Bundle size is large', 'yellow');
                }
            }
        }
    }

    log('');

    // 3. TypeScript Check
    log('📝 Checking TypeScript...', 'yellow');
    const tsCheck = exec('pnpm --filter api exec tsc --noEmit');

    if (tsCheck === null) {
        log('✗ TypeScript errors found', 'red');
        allPassed = false;
    } else {
        log('✓ No TypeScript errors', 'green');
    }

    log('');

    // 4. Package.json Verification
    log('📋 Verifying package.json...', 'yellow');

    const backendPkg = JSON.parse(
        fs.readFileSync('apps/api/package.json', 'utf-8')
    );

    const frontendPkg = JSON.parse(
        fs.readFileSync('apps/frontend/package.json', 'utf-8')
    );

    const checks = [
        { name: 'Backend has start script', value: !!backendPkg.scripts?.start },
        { name: 'Frontend has build script', value: !!frontendPkg.scripts?.build },
        { name: 'Backend has build script', value: !!backendPkg.scripts?.build },
    ];

    checks.forEach(check => {
        if (check.value) {
            log(`✓ ${check.name}`, 'green');
        } else {
            log(`✗ ${check.name}`, 'red');
            allPassed = false;
        }
    });

    log('');
    log('════════════════════════════════════════\n', 'cyan');

    // Summary
    if (allPassed) {
        log('✅ Build verification passed!', 'green');
        log('\nProduction builds are ready to deploy.', 'cyan');
        log('See DEPLOYMENT_GUIDE.md for next steps.\n');
        process.exit(0);
    } else {
        log('❌ Build verification failed!', 'red');
        log('\nPlease fix the issues above before deploying.\n', 'yellow');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    verifyBuild().catch(err => {
        log(`\n❌ Error: ${err.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { verifyBuild };
