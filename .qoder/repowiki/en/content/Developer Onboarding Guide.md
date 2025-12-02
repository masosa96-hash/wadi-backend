# Developer Onboarding Guide

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [package.json](file://package.json)
- [SETUP_INSTRUCTIONS.md](file://SETUP_INSTRUCTIONS.md)
- [QUICK_START.md](file://QUICK_START.md)
- [DEBUGGING_GUIDE.md](file://DEBUGGING_GUIDE.md)
- [TESTING_GUIDE.md](file://TESTING_GUIDE.md)
- [apps/api/package.json](file://apps/api/package.json)
- [apps/frontend/package.json](file://apps/frontend/package.json)
- [apps/api/src/config/env.ts](file://apps/api/src/config/env.ts)
- [apps/frontend/vite.config.ts](file://apps/frontend/vite.config.ts)
- [scripts/health-check.js](file://scripts/health-check.js)
- [apps/api/src/index.ts](file://apps/api/src/index.ts)
- [apps/frontend/src/main.tsx](file://apps/frontend/src/main.tsx)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Development Environment Setup](#development-environment-setup)
3. [Local Development Configuration](#local-development-configuration)
4. [Starting the Development Servers](#starting-the-development-servers)
5. [Development Workflow](#development-workflow)
6. [Debugging Tips](#debugging-tips)
7. [Testing and Verification](#testing-and-verification)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Best Practices](#best-practices)

## Introduction

This Developer Onboarding Guide provides comprehensive instructions for setting up a local development environment for WADI, a modern AI conversational assistant with a dual-brain architecture (Kivo + Wadi). The guide covers environment configuration, dependency installation, service initialization, development workflow, debugging techniques, and contribution guidelines.

WADI is built as a monorepo with two main applications: a Node.js/Express backend API and a React/Vite frontend. The platform features guest mode with localStorage persistence, user authentication with Supabase, real-time WebSocket communication, and a beautiful dark UI theme. This guide will help both beginners and experienced developers quickly get started with contributing to the WADI platform.

The documentation uses terminology consistent with the codebase such as 'development workflow' and 'debugging tips', and provides practical examples for common tasks like starting servers, running tests, and making code changes.

**Section sources**

- [README.md](file://README.md#L1-L330)

## Development Environment Setup

To begin developing on WADI, you'll need to set up your local development environment with the required tools and dependencies. The project uses a monorepo structure managed with pnpm workspaces, with the backend built on Node.js 20+ and the frontend on React 18 with Vite.

### Prerequisites

Before starting, ensure you have the following tools installed on your system:

- **Node.js 20+**: The runtime environment for both backend and frontend
- **pnpm 10+**: The package manager used for dependency management
- **OpenAI API Key**: Required for AI functionality
- **Supabase account**: Needed for authentication and database services

The project structure follows a monorepo pattern with the following organization:

- `apps/api`: Backend application with Express, controllers, services, and routes
- `apps/frontend`: Frontend application with React components, stores, and pages
- `packages/chat-core`: Shared package for chat functionality
- `scripts/`: Development and deployment scripts

### Installing Dependencies

Once you have the prerequisites installed, clone the repository and install the dependencies using pnpm:

```powershell
# Clone repository
git clone https://github.com/yourusername/wadi.git
cd wadi

# Install dependencies
pnpm install
```

The `pnpm install` command will install all dependencies for both the frontend and backend applications, as well as any shared packages. The installation process is managed through the `pnpm-workspace.yaml` file which defines the workspace packages.

**Section sources**

- [README.md](file://README.md#L64-L88)
- [package.json](file://package.json#L1-L40)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L7)

## Local Development Configuration

Proper configuration of environment variables is essential for the WADI application to function correctly in development mode. The system uses multiple `.env` files to manage configuration across different environments.

### Environment Variables Setup

WADI requires configuration of environment variables for both the backend and frontend applications. These variables control API keys, database connections, and application behavior.

#### Root Environment File

Create a `.env` file in the root directory (E:\WADI\.env) with the following content:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# API Configuration
PORT=4000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment File

Create a `.env` file in the frontend directory (E:\WADI\apps\frontend\.env) with the following content:

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The backend configuration is loaded from the root `.env` file through the `apps/api/src/config/env.ts` module, which resolves the path relative to the monorepo root. This ensures consistent environment variable loading regardless of the current working directory or execution context.

### Database Setup

The WADI application requires a Supabase database with specific tables and Row Level Security (RLS) policies configured. The required tables include:

- `profiles` (user_id, email, created_at, updated_at)
- `projects` (id, user_id, name, description, created_at, default_mode)
- `sessions` (id, project_id, user_id, name, description, is_active, created_at, updated_at)
- `runs` (id, project_id, user_id, session_id, input, output, model, custom_name, created_at)
- `tags` (id, user_id, name, color, created_at)
- `project_tags` (project_id, tag_id)
- `run_tags` (run_id, tag_id)

Ensure that RLS policies are enabled and configured to allow authenticated users to read and write their own data.

**Section sources**

- [SETUP_INSTRUCTIONS.md](file://SETUP_INSTRUCTIONS.md#L44-L88)
- [apps/api/src/config/env.ts](file://apps/api/src/config/env.ts#L1-L34)

## Starting the Development Servers

WADI provides multiple ways to start the development servers for both the frontend and backend applications. The recommended approach is to run both servers simultaneously to enable full functionality.

### Development Scripts

The project includes several npm scripts in the root `package.json` file to facilitate development:

- `pnpm dev:api`: Starts the backend API server
- `pnpm dev:front`: Starts the frontend development server
- `pnpm dev:all`: Starts both backend and frontend servers simultaneously
- `pnpm health`: Runs a health check on the backend service

#### Starting the Backend Server

To start the backend API server, use the following command:

```powershell
cd E:\WADI
pnpm --filter api dev
```

This will start the Express server on port 4000. You should see output indicating that the server is running:

```
🚀 WADI API running on http://localhost:4000
📊 Health check: http://localhost:4000/health
🔌 WebSocket: ws://localhost:4000/ws
```

#### Starting the Frontend Server

To start the frontend development server, use the following command:

```powershell
cd E:\WADI
pnpm --filter frontend dev
```

This will start the Vite development server on port 5173. You should see output indicating that the server is ready:

```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

#### Running Both Servers

For convenience, you can start both servers simultaneously using the `dev:all` script:

```powershell
pnpm dev:all
```

This uses the `concurrently` package to run both development servers in separate terminal windows.

### Access Points

Once both servers are running, you can access the application at the following URLs:

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

The health check endpoint should return a JSON response indicating the status of the services:

```json
{
  "status": "ok",
  "supabase": "connected"
}
```

**Section sources**

- [QUICK_START.md](file://QUICK_START.md#L7-L35)
- [package.json](file://package.json#L7-L11)
- [apps/api/package.json](file://apps/api/package.json#L9-L12)
- [apps/frontend/package.json](file://apps/frontend/package.json#L10-L11)

## Development Workflow

The WADI development workflow follows a standard pattern for monorepo projects, with clear processes for making changes, testing, and contributing to the codebase.

### Making Code Changes

When making changes to the WADI codebase, follow these steps:

1. Identify the component or feature you want to modify
2. Locate the relevant files in the appropriate directory (`apps/api` for backend, `apps/frontend` for frontend)
3. Make your changes following the existing code patterns and style
4. Test your changes locally using the development servers
5. Run tests to ensure your changes don't break existing functionality

The backend is organized into controllers, services, middleware, and routes, following a clean architecture pattern. The frontend uses React with Zustand for state management, organized into components, pages, and stores.

### Building and Testing

Before committing your changes, ensure that the application builds successfully and passes all tests:

```bash
# Build production versions
pnpm build

# Run all tests
pnpm test

# Preview production build
pnpm preview:frontend
```

The build process will compile TypeScript files and generate production-ready assets in the `dist` directories for both frontend and backend.

### Health Check Script

WADI includes a comprehensive health check script that verifies the development environment is properly configured:

```bash
# Run health check
node scripts/health-check.js
```

This script checks for:

- Required project structure directories
- Backend and frontend environment variables
- Services health (backend API connectivity)

The health check script will provide detailed feedback on any issues with the setup and guide you through resolving them.

**Section sources**

- [README.md](file://README.md#L212-L224)
- [scripts/health-check.js](file://scripts/health-check.js#L1-L164)

## Debugging Tips

Effective debugging is essential for productive development on the WADI platform. The system provides multiple tools and techniques for identifying and resolving issues.

### Frontend Debugging

For frontend debugging, use the browser's Developer Tools with the following techniques:

#### Console Logging

Use the browser console to inspect application state:

```javascript
// View Zustand store state
console.log(useAuthStore.getState());
console.log(useChatStore.getState());

// Inspect localStorage
Object.keys(localStorage).forEach((key) => {
  console.log(key, localStorage.getItem(key));
});
```

#### Network Monitoring

Use the Network tab to monitor API requests:

- Filter by `/api/chat` to view chat-related requests
- Check for 4xx (client) and 5xx (server) status codes
- Inspect request payloads and response data

#### React DevTools

Use React DevTools to inspect component hierarchy and state:

- Examine props and state of key components like Chat, GuestNicknameModal, and BottomNav
- Monitor store usage in useAuthStore and useChatStore

### Backend Debugging

The backend provides comprehensive logging to help identify issues:

#### Request Logging

The backend logs detailed information about each request:

```
[Auth] Checking auth for: GET /api/projects
[Auth] Success: User authenticated: user-id-here
[getProjects] Request from user: user-id-here
[getProjects] Success: Found 5 projects
```

#### Error Handling

The system uses structured error responses:

```json
{
  "ok": false,
  "error": {
    "code": "auth_required",
    "message": "Authentication required"
  }
}
```

### Common Issues and Solutions

#### 401 Unauthorized Errors

- Verify user is logged in (check browser session storage)
- Confirm Supabase token is valid
- Check backend logs for authentication messages
- Verify Supabase RLS policies allow user access

#### 500 Database Errors

- Ensure database tables exist
- Verify RLS policies are configured
- Check that user_id column is present in all tables
- Run Supabase migrations if needed

#### CORS Errors

- Verify FRONTEND_URL=http://localhost:5173 in backend .env
- Restart the backend server after configuration changes
- Ensure no trailing slashes in URLs

**Section sources**

- [DEBUGGING_GUIDE.md](file://DEBUGGING_GUIDE.md#L1-L632)
- [SETUP_INSTRUCTIONS.md](file://SETUP_INSTRUCTIONS.md#L130-L178)

## Testing and Verification

Comprehensive testing is essential to ensure the stability and reliability of the WADI platform. The system includes both automated and manual testing procedures.

### Automated Testing

The project includes several scripts for automated testing:

```bash
# Run health check
pnpm health

# Run all tests
pnpm test

# Build production version
pnpm build
```

These scripts verify that the application is functioning correctly and that all dependencies are properly configured.

### Manual Testing Procedures

Follow the testing guide to verify key functionality:

#### Health Check Verification

1. Access http://localhost:4000/health
2. Verify response contains "status": "ok" and "supabase": "connected"

#### Guest Mode Testing

1. Clear localStorage and reload the page
2. Verify the nickname modal appears
3. Enter a nickname and begin chatting
4. Verify messages are saved in localStorage
5. Reload the page and confirm chat history persists

#### API Testing

Use curl or Postman to test API endpoints:

```powershell
# Health check
curl http://localhost:4000/health

# Get projects (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/projects

# Create project
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Test Project","description":"Test"}' http://localhost:4000/api/projects
```

### Verification Checklist

Before submitting changes, verify the following:

- [ ] Backend health check returns status "ok"
- [ ] Can create a new account via /register
- [ ] Can login via /login
- [ ] Projects page loads without errors
- [ ] Can create a new project
- [ ] Can view project details
- [ ] Can create a run (AI conversation)
- [ ] No "Uncaught (in promise) Object" errors in console
- [ ] Error messages are user-friendly
- [ ] Retry button works when API fails

**Section sources**

- [TESTING_GUIDE.md](file://TESTING_GUIDE.md#L1-L288)
- [SETUP_INSTRUCTIONS.md](file://SETUP_INSTRUCTIONS.md#L279-L291)

## Contribution Guidelines

Contributions to the WADI project are welcome and encouraged. Follow these guidelines to ensure a smooth contribution process.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style and Patterns

When contributing code, follow these guidelines:

- Maintain consistency with existing code patterns
- Use TypeScript with proper type annotations
- Follow the existing directory structure and naming conventions
- Include appropriate error handling and logging
- Write clear, concise comments for complex logic

### Testing Requirements

All contributions must include appropriate testing:

- Add unit tests for new functionality
- Update existing tests when modifying behavior
- Verify that all tests pass before submitting
- Include manual testing steps in the pull request description

### Documentation

Update documentation when adding new features or changing existing behavior:

- Update relevant README files
- Add or modify documentation in the docs directory
- Include usage examples and configuration options

**Section sources**

- [README.md](file://README.md#L253-L259)

## Best Practices

Follow these best practices for efficient and effective development on the WADI platform.

### Environment Management

- Use the root `.env` file for shared environment variables
- Keep sensitive information out of version control
- Use different environment files for development, staging, and production
- Regularly update API keys and rotate credentials

### Performance Optimization

- Minimize re-renders in React components
- Use memoization for expensive calculations
- Optimize API calls with batching and caching
- Monitor bundle size and code splitting

### Debugging Efficiency

- Use the health check script regularly during development
- Leverage browser Developer Tools for frontend debugging
- Monitor backend logs for error patterns
- Use structured logging for easier troubleshooting

### Collaboration

- Communicate early about planned changes
- Review pull requests promptly
- Document decisions and rationale
- Share knowledge and best practices

By following these guidelines and best practices, you can contribute effectively to the WADI platform and help maintain its high quality and reliability.

**Section sources**

- [README.md](file://README.md#L263-L270)
- [PERFORMANCE_OPTIMIZATION.md](file://PERFORMANCE_OPTIMIZATION.md)
