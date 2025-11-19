import dotenv from "dotenv";
import path from "path";

/**
 * Environment Configuration Loader
 * 
 * This module loads environment variables from the monorepo root .env file.
 * 
 * Path Resolution:
 * - Current file location: apps/api/src/config/env.ts
 * - Target .env location: E:\WADI intento mil\.env (monorepo root)
 * - Relative path from __dirname: ../../../../.env
 * 
 * This ensures consistent environment variable loading regardless of:
 * - Current working directory when executing commands
 * - Whether PNPM executes from root or from the API package
 * - How ts-node-dev resolves file paths
 */

const rootPath = path.resolve(__dirname, "../../../../.env");

// Load environment variables from monorepo root
const result = dotenv.config({ path: rootPath });

if (result.error) {
  console.error(`⚠️  Warning: Could not load .env file from: ${rootPath}`);
  console.error(`Error: ${result.error.message}`);
} else {
  console.log(`✅ Environment variables loaded from: ${rootPath}`);
}

// Export the configuration result for potential debugging
export default result;
