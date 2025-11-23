#!/usr/bin/env node

/**
 * WADI Quick Test Script
 * Runs a fast verification of core functionality
 */

const http = require('http');

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

async function testEndpoint(url, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function runQuickTests() {
    log('\n🧪 WADI Quick Test Suite\n', 'blue');
    log('═══════════════════════════════════════\n', 'cyan');

    let passed = 0;
    let failed = 0;

    // Test 1: Backend Health
    log('Test 1: Backend Health Check', 'yellow');
    try {
        const result = await testEndpoint('http://localhost:4000/health');
        if (result.status === 200 && result.data.status === 'ok') {
            log('✓ PASSED - Backend is healthy', 'green');
            passed++;
        } else {
            log(`✗ FAILED - Health check returned: ${result.status}`, 'red');
            failed++;
        }
    } catch (error) {
        log(`✗ FAILED - Cannot connect to backend: ${error.message}`, 'red');
        failed++;
    }

    log('');

    // Test 2: API Health (alternative endpoint)
    log('Test 2: API Health Endpoint', 'yellow');
    try {
        const result = await testEndpoint('http://localhost:4000/api/health');
        if (result.status === 200) {
            log('✓ PASSED - API health endpoint accessible', 'green');
            passed++;
        } else {
            log(`✗ FAILED - API health returned: ${result.status}`, 'red');
            failed++;
        }
    } catch (error) {
        log(`✗ FAILED - API health not accessible: ${error.message}`, 'red');
        failed++;
    }

    log('');

    // Test 3: Guest Message (send test message)
    log('Test 3: Guest Message Sending', 'yellow');
    try {
        const guestId = 'test-' + Date.now();
        const result = await testEndpoint(
            'http://localhost:4000/api/chat',
            'POST',
            {
                message: 'Test message from quick test',
                messages: []
            }
        );

        // Add guest header manually
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-guest-id': guestId
            }
        };

        const testPromise = new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({ status: res.statusCode, data: parsed });
                    } catch {
                        resolve({ status: res.statusCode, data });
                    }
                });
            });

            req.on('error', reject);
            req.write(JSON.stringify({
                message: 'Test message',
                messages: []
            }));
            req.end();
        });

        const testResult = await testPromise;

        if (testResult.status === 200 && testResult.data.ok) {
            log('✓ PASSED - Guest message sent successfully', 'green');
            passed++;
        } else {
            log(`✗ FAILED - Guest message failed: ${testResult.status}`, 'red');
            failed++;
        }
    } catch (error) {
        log(`✗ FAILED - Error sending guest message: ${error.message}`, 'red');
        failed++;
    }

    log('');
    log('═══════════════════════════════════════\n', 'cyan');

    // Summary
    log(`Results: ${passed} passed, ${failed} failed\n`, passed === 3 ? 'green' : 'red');

    if (passed === 3) {
        log('✅ All quick tests passed!', 'green');
        log('\nYour WADI instance is working correctly!', 'cyan');
        log('Open http://localhost:5173 in your browser to use it.\n');
        process.exit(0);
    } else {
        log('❌ Some tests failed!', 'red');
        log('\nCheck the errors above and consult DEBUGGING_GUIDE.md\n', 'yellow');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runQuickTests().catch(err => {
        log(`\n❌ Fatal error: ${err.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runQuickTests };
