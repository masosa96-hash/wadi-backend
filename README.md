# WADI Beta 1 - Setup Guide

WADI is an AI platform that allows users to create projects and execute AI runs with full history tracking.

## Architecture

This is a monorepo with the following structure:

- **apps/api**: Node.js + Express backend (TypeScript)
- **apps/frontend**: React + Vite frontend (TypeScript)
- **docs/**: Documentation including database schema

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Supabase (Auth + Database)
- OpenAI API
- PNPM for package management

### Frontend
- React 19
- TypeScript
- Vite
- React Router v6
- Zustand (state management)
- Supabase client

## Prerequisites

- Node.js (v18 or later)
- PNPM (v10.21.0 or later)
- Supabase account
- OpenAI API key

## Quick Setup

For a streamlined setup experience, use the automated setup script that handles environment configuration and dependency installation.

### Steps

1. **Navigate to the project root directory**

2. **Run the setup script:**
   ```powershell
   .\setup-wadi.ps1
   ```
   
   **Note:** If you encounter execution policy errors, you may need to run:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

3. **Provide your configuration values when prompted:**
   - **Supabase URL**: Found in your Supabase project settings under API (e.g., `https://yourproject.supabase.co`)
   - **Supabase Anon Key**: Found in the same location under "Project API keys"
   - **OpenAI API Key**: Obtain from https://platform.openai.com/api-keys (starts with `sk-`)

4. **The script will automatically:**
   - Create environment files for both backend and frontend
   - Install all project dependencies
   - Display next steps

5. **Set up your Supabase database schema:**
   - Go to your Supabase project's SQL Editor
   - Execute the schema from `docs/database-schema.md`

6. **Start the development services in separate terminals:**
   
   **Terminal 1 - Backend:**
   ```bash
   pnpm --filter api dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   pnpm --filter frontend dev
   ```

7. **Access the application:**
   - Frontend: http://localhost:5173
   - API: http://localhost:4000

8. **Verify the setup by testing the application flow:**
   - Register a new user account
   - Create a project
   - Execute a test run with an AI prompt

**Alternative:** If you prefer manual setup or encounter issues with the automated script, see the detailed "Manual Setup Instructions" section below.

## Manual Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Execute the database schema from `docs/database-schema.md`
4. Copy your Supabase URL and anon key from Project Settings > API

### 3. Configure Environment Variables

#### Backend (.env in apps/api/)

Copy `apps/api/.env.example` to `apps/api/.env` and fill in:

```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env in apps/frontend/)

Copy `apps/frontend/.env.example` to `apps/frontend/.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:4000
```

### 4. Run the Application

#### Development Mode

In separate terminals:

**Terminal 1 - Backend:**
```bash
pnpm --filter api dev
```

**Terminal 2 - Frontend:**
```bash
pnpm --filter frontend dev
```

The API will be available at http://localhost:4000
The frontend will be available at http://localhost:5173

## Features (Beta 1)

### Authentication
- User registration with email/password
- Login/logout functionality
- Session management via Supabase Auth

### Projects
- Create projects with name and description
- View all user projects
- Navigate to individual projects

### AI Runs
- Execute AI prompts using OpenAI
- View run history per project
- Input/output tracking with timestamps
- Model selection support

## API Endpoints

### Health Check
- `GET /health` - Server and database status

### Projects
- `GET /api/projects` - List user's projects (requires auth)
- `POST /api/projects` - Create new project (requires auth)

### Runs
- `GET /api/projects/:id/runs` - List runs for a project (requires auth)
- `POST /api/projects/:id/runs` - Create new run with AI (requires auth)

## Database Schema

See `docs/database-schema.md` for complete database structure and SQL scripts.

## Project Structure

```
wadi-monorepo/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/        # Supabase configuration
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── middleware/    # Auth middleware
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # OpenAI service
│   │   │   └── index.ts       # Server entry point
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── config/        # API and Supabase clients
│       │   ├── pages/         # React pages
│       │   ├── store/         # Zustand stores
│       │   ├── main.tsx       # App entry point
│       │   └── router.tsx     # Route configuration
│       ├── .env.example
│       └── package.json
├── docs/
│   └── database-schema.md     # Database documentation
├── .env.example
├── package.json
└── pnpm-workspace.yaml
```

## Development Workflow

### Adding a New Feature

1. Update the database schema in Supabase if needed
2. Create/update API endpoints in `apps/api/src`
3. Create/update frontend components in `apps/frontend/src`
4. Test the integration end-to-end

### Common Tasks

**Add API dependency:**
```bash
cd apps/api
pnpm add <package-name>
```

**Add frontend dependency:**
```bash
cd apps/frontend
pnpm add <package-name>
```

**Run TypeScript check:**
```bash
cd apps/api
pnpm tsc --noEmit

cd apps/frontend
pnpm tsc --noEmit
```

## Troubleshooting

### API won't start
- Check that `.env` file exists in `apps/api/`
- Verify Supabase URL and keys are correct
- Ensure port 4000 is not in use

### Frontend won't connect to API
- Check that API is running on port 4000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### Database errors
- Verify tables are created in Supabase
- Check Row Level Security policies are enabled
- Ensure user is authenticated when making requests

### OpenAI errors
- Verify API key is valid and has credits
- Check model name is correct (default: gpt-3.5-turbo)
- Review rate limits if getting 429 errors

## Next Steps (Future Features)

See `FUTURE_IDEAS.md` for features planned for Beta 2 and beyond:
- App store functionality
- Multi-user workspaces
- Advanced flow templates
- External integrations
- And more!

## Support

For issues or questions, please review:
1. This README
2. Database schema documentation in `docs/`
3. Environment variable examples in `.env.example` files

---

**WADI Beta 1** - Built with ❤️ using React, Node.js, Supabase, and OpenAI
