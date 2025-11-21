"use strict";
/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
/**
 * Validate that a string is a valid URL
 */
function isValidUrl(url, requireHttps = false) {
    try {
        const parsed = new URL(url);
        if (requireHttps && parsed.protocol !== 'https:') {
            return false;
        }
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/**
 * Validate that a port number is valid
 */
function isValidPort(port) {
    const num = parseInt(port, 10);
    return !isNaN(num) && num >= 1024 && num <= 65535;
}
/**
 * Mask sensitive values for logging
 */
function maskValue(value, visibleChars = 8) {
    if (value.length <= visibleChars) {
        return '*'.repeat(value.length);
    }
    return value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars);
}
/**
 * Validate all required environment variables
 */
function validateEnvironment() {
    const errors = [];
    const warnings = [];
    // Required variables
    const required = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };
    // Optional variables with defaults
    const optional = {
        PORT: process.env.PORT || '4000',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
        NODE_ENV: process.env.NODE_ENV || 'development',
        OPENAI_DEFAULT_MODEL: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
    };
    // Validate SUPABASE_URL
    if (!required.SUPABASE_URL) {
        errors.push({
            variable: 'SUPABASE_URL',
            message: 'Missing required environment variable',
        });
    }
    else if (!isValidUrl(required.SUPABASE_URL, true)) {
        errors.push({
            variable: 'SUPABASE_URL',
            message: 'Invalid format, must be a valid HTTPS URL',
        });
    }
    // Validate SUPABASE_ANON_KEY
    if (!required.SUPABASE_ANON_KEY) {
        errors.push({
            variable: 'SUPABASE_ANON_KEY',
            message: 'Missing required environment variable',
        });
    }
    else if (required.SUPABASE_ANON_KEY.length < 20) {
        errors.push({
            variable: 'SUPABASE_ANON_KEY',
            message: 'Invalid format, key appears too short',
        });
    }
    // Validate SUPABASE_SERVICE_KEY
    if (!required.SUPABASE_SERVICE_KEY) {
        errors.push({
            variable: 'SUPABASE_SERVICE_KEY',
            message: 'Missing required environment variable',
        });
    }
    else if (required.SUPABASE_SERVICE_KEY.length < 20) {
        errors.push({
            variable: 'SUPABASE_SERVICE_KEY',
            message: 'Invalid format, key appears too short',
        });
    }
    // Validate OPENAI_API_KEY
    if (!required.OPENAI_API_KEY) {
        errors.push({
            variable: 'OPENAI_API_KEY',
            message: 'Missing required environment variable',
        });
    }
    else if (!required.OPENAI_API_KEY.startsWith('sk-')) {
        errors.push({
            variable: 'OPENAI_API_KEY',
            message: 'Invalid format, must start with "sk-"',
        });
    }
    // Validate PORT
    if (!isValidPort(optional.PORT)) {
        errors.push({
            variable: 'PORT',
            message: 'Invalid port number, must be between 1024 and 65535',
        });
    }
    // Validate FRONTEND_URL
    if (!isValidUrl(optional.FRONTEND_URL)) {
        errors.push({
            variable: 'FRONTEND_URL',
            message: 'Invalid format, must be a valid HTTP/HTTPS URL',
        });
    }
    // Check for production environment warnings
    if (optional.NODE_ENV === 'production') {
        if (!required.SUPABASE_URL?.includes('supabase.co')) {
            warnings.push('SUPABASE_URL does not appear to be a Supabase URL in production');
        }
        if (optional.FRONTEND_URL?.includes('localhost')) {
            warnings.push('FRONTEND_URL points to localhost in production environment');
        }
    }
    // Report errors
    if (errors.length > 0) {
        console.error('\n❌ Environment Validation Failed:\n');
        errors.forEach(({ variable, message }) => {
            console.error(`  - ${variable}: ${message}`);
        });
        console.error('\nPlease check your .env file and try again.\n');
        process.exit(1);
    }
    // Report warnings
    if (warnings.length > 0) {
        console.warn('\n⚠️  Environment Warnings:\n');
        warnings.forEach((warning) => {
            console.warn(`  - ${warning}`);
        });
        console.warn('');
    }
    // Log validated configuration (mask sensitive values)
    console.log('✅ Environment validation passed\n');
    console.log('Configuration:');
    console.log(`  NODE_ENV: ${optional.NODE_ENV}`);
    console.log(`  PORT: ${optional.PORT}`);
    console.log(`  SUPABASE_URL: ${required.SUPABASE_URL}`);
    console.log(`  SUPABASE_ANON_KEY: ${maskValue(required.SUPABASE_ANON_KEY || '')}`);
    console.log(`  SUPABASE_SERVICE_KEY: ${maskValue(required.SUPABASE_SERVICE_KEY || '')}`);
    console.log(`  OPENAI_API_KEY: ${maskValue(required.OPENAI_API_KEY || '')}`);
    console.log(`  OPENAI_DEFAULT_MODEL: ${optional.OPENAI_DEFAULT_MODEL}`);
    console.log(`  FRONTEND_URL: ${optional.FRONTEND_URL}\n`);
}
