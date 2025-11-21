"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
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
const rootPath = path_1.default.resolve(__dirname, "../../../../.env");
// Load environment variables from monorepo root
const result = dotenv_1.default.config({ path: rootPath });
if (result.error) {
    console.error(`⚠️  Warning: Could not load .env file from: ${rootPath}`);
    console.error(`Error: ${result.error.message}`);
}
else {
    console.log(`✅ Environment variables loaded from: ${rootPath}`);
}
// Export the configuration result for potential debugging
exports.default = result;
