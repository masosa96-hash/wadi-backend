# Environment Variable Configuration Fix

## Problem Statement

The backend API service fails to load environment variables from the root-level `.env` file when executed via `pnpm --filter api dev`. The error occurs because the current environment variable loading mechanism uses `dotenv/config` without specifying the correct path to the root `.env` file, causing the API to look for environment variables in the wrong location.

**Error Message:**

```
Error: Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in .env
```

## Root Cause Analysis

### Current Implementation Issues

1. **Implicit dotenv Loading**: The API entry point (`apps/api/src/index.ts`) imports `dotenv/config`, which by default searches for `.env` in the current working directory
2. **Execution Context Mismatch**: When running `pnpm --filter api dev`, the working directory context may vary, causing dotenv to search in the wrong location
3. **No Explicit Path Configuration**: The code does not explicitly specify that the `.env` file is located at the monorepo root

### File Structure Context

```
E:\WADI intento mil\
├── .env                          # Root environment file (current location)
├── apps/
│   └── api/
│       └── src/
│           ├── index.ts          # Entry point with dotenv import
│           └── config/
│               └── supabase.ts   # Validates environment variables
```

## Design Solution

### Strategy

Implement explicit environment variable loading with monorepo-aware path resolution to ensure the backend API consistently loads the root `.env` file regardless of execution context.

### Core Changes

#### 1. Environment Loading Module

**Location**: `apps/api/src/config/env.ts` (new file)

**Purpose**: Centralized environment variable initialization with explicit root path resolution

**Responsibilities**:

- Calculate the monorepo root path relative to the API package
- Load `.env` file from the monorepo root explicitly
- Provide early validation of critical environment variables
- Serve as single source of truth for environment configuration

**Path Resolution Logic**:

- Use Node.js `path` module to resolve from API package directory to monorepo root
- The relationship is: `apps/api/src/config` → `../../..` → root
- Construct absolute path to ensure consistency across different execution contexts

#### 2. Modified Entry Point

**Location**: `apps/api/src/index.ts`

**Changes**:

- Remove generic `import "dotenv/config"`
- Import the new environment configuration module at the very top (before any other imports that use environment variables)
- Ensure environment variables are loaded before Supabase config initialization

#### 3. Enhanced Supabase Configuration

**Location**: `apps/api/src/config/supabase.ts`

**Changes**:

- Update error message to reference the correct `.env` location (monorepo root)
- Optionally add diagnostic information showing where dotenv searched for the file

## Expected Environment Variables

The following variables from the root `.env` file must be accessible:

| Variable Name       | Purpose                   | Used By                        |
| ------------------- | ------------------------- | ------------------------------ |
| `SUPABASE_URL`      | Supabase project URL      | Supabase client initialization |
| `SUPABASE_ANON_KEY` | Supabase anonymous key    | Supabase client initialization |
| `OPENAI_API_KEY`    | OpenAI API authentication | OpenAI service integration     |
| `API_URL`           | Backend API base URL      | CORS, service discovery        |
| `FRONTEND_URL`      | Frontend application URL  | CORS configuration             |
| `API_PORT`          | Backend server port       | Express server binding         |
| `FRONTEND_PORT`     | Frontend dev server port  | Development environment        |

## Implementation Approach

### Phase 1: Create Environment Loading Module

Create `apps/api/src/config/env.ts` with the following behavior:

1. Import `dotenv` and `path` modules
2. Calculate root path: `path.resolve(__dirname, '../../../..')` from the config directory
3. Call `dotenv.config()` with explicit path option pointing to root `.env`
4. Add inline comment documenting the resolved path for debugging purposes

### Phase 2: Update Entry Point

Modify `apps/api/src/index.ts`:

1. Replace `import "dotenv/config"` with `import "./config/env"`
2. Ensure this import occurs as the first line (before Express, Supabase, or any other imports)
3. Preserve all existing application logic

### Phase 3: Update Error Messages

Modify `apps/api/src/config/supabase.ts`:

1. Update error message to indicate `.env` should be at monorepo root
2. Consider adding path information for troubleshooting

## Validation Criteria

After implementation, the solution must satisfy:

1. **Successful Variable Loading**: Running `pnpm --filter api dev` from the monorepo root successfully reads all environment variables from `E:\WADI intento mil\.env`
2. **No Manual Configuration Required**: No environment variable duplication or app-specific `.env` files needed
3. **Clear Error Messages**: If `.env` is missing or incomplete, error messages clearly indicate the expected location (monorepo root)
4. **Consistent Behavior**: Environment loading works identically whether executed via PNPM filter, from API directory, or from monorepo root
5. **No Breaking Changes**: All existing environment variable names remain unchanged

## File Modification Summary

| File                              | Modification Type    | Purpose                                                |
| --------------------------------- | -------------------- | ------------------------------------------------------ |
| `apps/api/src/config/env.ts`      | Create New           | Explicit root `.env` loading with path resolution      |
| `apps/api/src/index.ts`           | Modify Import        | Replace generic dotenv import with explicit env module |
| `apps/api/src/config/supabase.ts` | Update Error Message | Clarify `.env` location in error output                |

## Implementation Notes

### Path Resolution Explanation

From `apps/api/src/config/env.ts`, the path traversal to monorepo root is:

- `__dirname` = `E:\WADI intento mil\apps\api\src\config`
- `../` = `E:\WADI intento mil\apps\api\src`
- `../../` = `E:\WADI intento mil\apps\api`
- `../../../` = `E:\WADI intento mil\apps`
- `../../../../` = `E:\WADI intento mil` (monorepo root)

Therefore, the resolution path is: `path.resolve(__dirname, '../../../../.env')`

### Execution Context Independence

By using `path.resolve` with `__dirname`, the solution works regardless of:

- Current working directory when executing the command
- Whether PNPM executes from root or from the API package
- How `ts-node-dev` resolves file paths

### No Changes to Environment Variables

All existing variable names are preserved:

- No renaming required
- No prefix additions (e.g., no `VITE_` prefix needed for backend)
- Backend code continues to access variables via `process.env.VARIABLE_NAME`

## Risk Mitigation

### Build Tool Compatibility

The solution uses standard Node.js path resolution compatible with:

- `ts-node-dev` (current dev tool)
- Future migration to `tsx`, `nodemon`, or other TypeScript runners
- Production builds with compiled JavaScript

### Monorepo Structure Changes

If the API package location changes in the future:

- Only `apps/api/src/config/env.ts` path resolution needs updating
- Error messages will clearly indicate environment loading failure
- The centralized approach makes debugging straightforward
