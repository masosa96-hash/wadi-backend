# WADI Beta 1 - Implementation Plan

## Objective

Transform the current WADI prototype (a simple chat interface with local memory) into a complete Beta 1 platform that enables users to register, create projects, and execute AI runs per project with full history tracking.

## Current Repository Analysis

### Structure Assessment

The repository follows a monorepo architecture with PNPM workspaces:

- **apps/api**: Express-based backend service (TypeScript, CommonJS)
- **apps/frontend**: React + Vite frontend (TypeScript, ESM)
- **packages/chat-core**: Shared library (currently minimal usage)
- **Root src/**: Contains shared components and stores (appears to be legacy or misplaced)
- **Electron integration**: Desktop wrapper via main.js and preload.js

### Current Capabilities

The existing implementation provides:

- Basic chat interface with local message storage
- User profiling based on word frequency analysis
- JSON file-based persistence (users.json, memory.json)
- Simple intent interpretation without real AI integration
- Dark-themed UI with chat bubbles

### Gaps vs. Beta 1 Scope

The current system lacks:

- Authentication and user management
- Project organization and multi-project support
- Real OpenAI integration
- Supabase database integration
- Proper API structure for projects and runs
- Multi-screen navigation in frontend

## Strategic Approach

### Architecture Alignment

The current monorepo structure aligns well with Beta 1 requirements. The apps/frontend and apps/api separation matches the expected architecture. No major restructuring is needed.

### Migration Strategy

The transition from local JSON storage to Supabase will require replacing the current file-based persistence while preserving the API patterns. The brain modules (memory.ts, adaptiveStyle.ts) represent experimental features that fall outside Beta 1 scope and should be deactivated but preserved for future iterations.

### Component Reusability

The root-level src/ directory contains components (InsightsPanel, SettingsPanel) and a Zustand store that may conflict with the new frontend structure. These should be evaluated for integration or archival.

## Implementation Phases

### Phase 1: Foundation Setup

**Goal**: Establish infrastructure and authentication base

#### Task 1.1: Environment Configuration
- **Description**: Create comprehensive environment variable configuration for all services
- **Files/Folders**:
  - Create `.env.example` in root
  - Create `apps/api/.env.example`
  - Create `apps/frontend/.env.example`
- **Variables needed**:
  - Supabase URL and anon key
  - OpenAI API key
  - API base URL
  - Frontend base URL
  - Port configurations
- **Dependencies**: None
- **Rationale**: All subsequent tasks depend on proper environment configuration

#### Task 1.2: Install Required Dependencies
- **Description**: Add necessary packages for Supabase, OpenAI, and authentication
- **Files/Folders**:
  - `apps/api/package.json`
  - `apps/frontend/package.json`
- **Packages for API**:
  - @supabase/supabase-js (database client)
  - openai (OpenAI SDK)
  - dotenv (environment variables)
  - jsonwebtoken (token validation)
- **Packages for Frontend**:
  - @supabase/supabase-js (auth client)
  - react-router-dom (navigation)
  - zustand (state management)
- **Dependencies**: Task 1.1
- **Rationale**: Required libraries must be available before implementation

#### Task 1.3: Database Schema Design
- **Description**: Document the Supabase table structures and relationships
- **Tables Required**:
  - profiles (user_id UUID PK, display_name TEXT, created_at TIMESTAMP)
  - projects (id UUID PK, user_id UUID FK, name TEXT, description TEXT, created_at TIMESTAMP)
  - runs (id UUID PK, project_id UUID FK, user_id UUID FK, input TEXT, output TEXT, model TEXT, created_at TIMESTAMP)
- **Relationships**:
  - profiles.user_id references auth.users.id
  - projects.user_id references profiles.user_id
  - runs.project_id references projects.id
  - runs.user_id references profiles.user_id
- **Indexes**:
  - Index on projects.user_id
  - Index on runs.project_id
  - Index on runs.created_at (for chronological queries)
- **Row Level Security**:
  - Users can only read/write their own profiles
  - Users can only read/write their own projects
  - Users can only read/write runs for their own projects
- **Files/Folders**: Document in `docs/database-schema.md` (informational)
- **Dependencies**: Task 1.2
- **Rationale**: Clear schema definition prevents implementation errors

### Phase 2: Backend API Implementation

**Goal**: Build RESTful API with Supabase integration

#### Task 2.1: Supabase Client Configuration
- **Description**: Set up centralized Supabase client for backend use
- **Files/Folders**:
  - Create `apps/api/src/config/supabase.ts`
  - Modify `apps/api/src/index.ts` (initialization)
- **Implementation Details**:
  - Export configured Supabase client instance
  - Implement connection health check
  - Handle initialization errors gracefully
- **Dependencies**: Task 1.2, Task 1.1
- **Rationale**: Centralized configuration ensures consistency across API endpoints

#### Task 2.2: Authentication Middleware
- **Description**: Create middleware to validate Supabase JWT tokens
- **Files/Folders**:
  - Create `apps/api/src/middleware/auth.ts`
- **Functionality**:
  - Extract bearer token from Authorization header
  - Verify token with Supabase
  - Attach user_id to request object
  - Handle invalid/expired tokens with 401 response
- **Dependencies**: Task 2.1
- **Rationale**: All protected endpoints require user authentication

#### Task 2.3: Projects API Endpoints
- **Description**: Implement project CRUD operations
- **Files/Folders**:
  - Create `apps/api/src/routes/projects.ts`
  - Create `apps/api/src/controllers/projectsController.ts`
  - Modify `apps/api/src/index.ts` (register routes)
- **Endpoints**:
  - GET /api/projects (list user's projects, ordered by created_at DESC)
  - POST /api/projects (create new project with name and description)
- **Validation**:
  - Name: required, max 100 characters
  - Description: optional, max 500 characters
- **Response Format**:
  - GET returns array of project objects
  - POST returns created project object with id
- **Dependencies**: Task 2.2
- **Rationale**: Core functionality for project organization

#### Task 2.4: OpenAI Integration Service
- **Description**: Create service layer for OpenAI API calls
- **Files/Folders**:
  - Create `apps/api/src/services/openai.ts`
- **Functionality**:
  - Configure OpenAI client with API key
  - Implement chat completion method
  - Support model selection (default: gpt-3.5-turbo)
  - Handle API errors and rate limits
  - Return formatted response
- **Dependencies**: Task 1.2
- **Rationale**: Isolated service layer enables testing and model switching

#### Task 2.5: Runs API Endpoints
- **Description**: Implement run creation and retrieval with AI integration
- **Files/Folders**:
  - Create `apps/api/src/routes/runs.ts`
  - Create `apps/api/src/controllers/runsController.ts`
  - Modify `apps/api/src/index.ts` (register routes)
- **Endpoints**:
  - GET /api/projects/:id/runs (retrieve runs for specific project, ordered by created_at DESC)
  - POST /api/projects/:id/runs (create run, call OpenAI, store result)
- **POST Flow**:
  - Validate project exists and belongs to user
  - Extract input text and optional model parameter
  - Call OpenAI service with input
  - Store input, output, and model in runs table
  - Return created run object
- **Validation**:
  - Project ownership verification
  - Input: required, max 5000 characters
  - Model: optional, must be valid OpenAI model name
- **Dependencies**: Task 2.4, Task 2.3, Task 2.2
- **Rationale**: Core AI execution functionality

#### Task 2.6: Refactor Legacy Code
- **Description**: Disable or archive brain modules and file-based storage
- **Files/Folders**:
  - `apps/api/src/brain/memory.ts` (archive)
  - `apps/api/src/brain/adaptiveStyle.ts` (archive)
  - `apps/api/data/users.json` (remove)
  - `apps/api/data/memory.json` (remove)
  - Modify `apps/api/src/index.ts` (remove old /chat endpoint)
- **Action**:
  - Move brain folder to apps/api/src/_archived/brain
  - Remove references to saveInteraction and buildUserProfile
  - Clean up old endpoint logic
- **Dependencies**: Task 2.5
- **Rationale**: Eliminate confusion between legacy and new implementation

### Phase 3: Frontend Implementation

**Goal**: Build multi-screen React application with authentication

#### Task 3.1: Supabase Client Configuration
- **Description**: Set up Supabase client for frontend authentication
- **Files/Folders**:
  - Create `apps/frontend/src/config/supabase.ts`
  - Create `apps/frontend/src/config/api.ts` (API base URL)
- **Implementation Details**:
  - Export configured Supabase client
  - Export helper methods for auth operations
  - Configure API client with token injection
- **Dependencies**: Task 1.2, Task 1.1
- **Rationale**: Centralized configuration for auth and API calls

#### Task 3.2: Authentication State Management
- **Description**: Create global auth state using Zustand
- **Files/Folders**:
  - Create `apps/frontend/src/store/authStore.ts`
- **State Properties**:
  - user (current user object or null)
  - session (Supabase session or null)
  - loading (boolean)
- **Actions**:
  - signIn (email, password)
  - signUp (email, password, displayName)
  - signOut
  - initialize (restore session on load)
- **Dependencies**: Task 3.1
- **Rationale**: Centralized auth state accessible across components

#### Task 3.3: Router Setup
- **Description**: Configure React Router with protected routes
- **Files/Folders**:
  - Create `apps/frontend/src/router.tsx`
  - Modify `apps/frontend/src/main.tsx` (wrap with router)
- **Routes**:
  - /login (public)
  - /register (public)
  - /projects (protected)
  - /projects/:id (protected)
- **Protected Route Logic**:
  - Check auth state
  - Redirect to /login if unauthenticated
- **Dependencies**: Task 3.2
- **Rationale**: Navigation structure for multi-screen application

#### Task 3.4: Login and Register Screens
- **Description**: Build authentication UI
- **Files/Folders**:
  - Create `apps/frontend/src/pages/Login.tsx`
  - Create `apps/frontend/src/pages/Register.tsx`
- **Login Screen**:
  - Email input field
  - Password input field
  - Submit button
  - Link to register screen
  - Error message display
- **Register Screen**:
  - Email input field
  - Password input field
  - Display name input field
  - Submit button
  - Link to login screen
  - Error message display
  - On success: create profile record in Supabase, then redirect to /projects
- **Styling**: Maintain dark theme consistent with current design
- **Dependencies**: Task 3.3, Task 3.2
- **Rationale**: User onboarding and access control

#### Task 3.5: Projects State Management
- **Description**: Create Zustand store for projects data
- **Files/Folders**:
  - Create `apps/frontend/src/store/projectsStore.ts`
- **State Properties**:
  - projects (array of project objects)
  - loading (boolean)
  - error (string or null)
- **Actions**:
  - fetchProjects (GET from API)
  - createProject (POST to API, add to local state)
- **Dependencies**: Task 3.1
- **Rationale**: Centralized projects data management

#### Task 3.6: Projects List Screen
- **Description**: Display user's projects with creation capability
- **Files/Folders**:
  - Create `apps/frontend/src/pages/Projects.tsx`
  - Create `apps/frontend/src/components/ProjectCard.tsx`
  - Create `apps/frontend/src/components/CreateProjectModal.tsx`
- **Projects Screen Layout**:
  - Header with user display name and logout button
  - "Create Project" button
  - Grid or list of project cards
  - Loading state indicator
  - Empty state message
- **Project Card**:
  - Display project name and description
  - Click navigates to /projects/:id
  - Show creation date
- **Create Project Modal**:
  - Name input field
  - Description textarea
  - Cancel and Create buttons
  - Form validation
- **Dependencies**: Task 3.5, Task 3.3
- **Rationale**: Primary navigation hub for user's work

#### Task 3.7: Runs State Management
- **Description**: Create Zustand store for runs data per project
- **Files/Folders**:
  - Create `apps/frontend/src/store/runsStore.ts`
- **State Properties**:
  - runs (array of run objects)
  - loading (boolean)
  - error (string or null)
  - currentProjectId (string or null)
- **Actions**:
  - fetchRuns (projectId, GET from API)
  - createRun (projectId, input, model optional, POST to API)
  - clearRuns (reset state when leaving project)
- **Dependencies**: Task 3.1
- **Rationale**: Manage AI execution history per project

#### Task 3.8: Project Detail Screen
- **Description**: Display run history and input interface
- **Files/Folders**:
  - Create `apps/frontend/src/pages/ProjectDetail.tsx`
  - Create `apps/frontend/src/components/RunHistoryList.tsx`
  - Create `apps/frontend/src/components/RunInputForm.tsx`
- **Project Detail Layout**:
  - Back button to /projects
  - Project name as header
  - Run input form at top or bottom
  - Run history list (chronological, newest first)
- **Run Input Form**:
  - Large textarea for input
  - Send button
  - Loading state during API call
  - Disable during submission
- **Run History List**:
  - Each run shows input and output
  - Display timestamp and model used
  - Scroll to newest after creation
  - Empty state message
- **Dependencies**: Task 3.7, Task 3.3
- **Rationale**: Core user interaction for AI execution

#### Task 3.9: UI Cleanup and Legacy Component Handling
- **Description**: Integrate or remove root-level src/ components
- **Files/Folders**:
  - `src/components/InsightsPanel.tsx` (evaluate)
  - `src/components/SettingsPanel.tsx` (evaluate)
  - `src/store/settingsStore.ts` (evaluate)
  - `apps/frontend/src/App.tsx` (refactor)
- **Decision**:
  - InsightsPanel: Out of Beta 1 scope, move to apps/frontend/src/_archived/
  - SettingsPanel: Language selection could be useful, integrate if time permits, otherwise archive
  - settingsStore: Archive if SettingsPanel is archived
  - App.tsx: Replace chat UI with router outlet
- **Dependencies**: Task 3.8
- **Rationale**: Clean separation between Beta 1 and experimental features

### Phase 4: Integration and Testing

**Goal**: Ensure end-to-end functionality and fix integration issues

#### Task 4.1: API-Frontend Integration Testing
- **Description**: Verify complete user flows work correctly
- **Test Scenarios**:
  - User registration creates profile and allows login
  - Login redirects to projects list
  - Projects list displays existing projects
  - Create project adds new project to list
  - Navigate to project detail loads runs
  - Create run calls OpenAI and displays result
  - Logout clears session and redirects to login
- **Files/Folders**: No specific files, manual testing
- **Dependencies**: All Phase 3 and Phase 2 tasks
- **Rationale**: Validate complete user journey

#### Task 4.2: Error Handling Review
- **Description**: Ensure graceful handling of common error cases
- **Error Scenarios**:
  - Network failures (API unavailable)
  - Invalid credentials
  - OpenAI API errors or rate limits
  - Missing environment variables
  - Invalid project IDs
  - Unauthorized access attempts
- **Files/Folders**: Review all API controllers and frontend pages
- **Dependencies**: Task 4.1
- **Rationale**: Production-ready error handling

#### Task 4.3: Environment Variables Documentation
- **Description**: Document all required environment variables
- **Files/Folders**:
  - Update README.md with setup instructions
  - Verify .env.example files are complete
- **Documentation Content**:
  - Where to obtain Supabase credentials
  - Where to obtain OpenAI API key
  - Example values for local development
  - Required vs optional variables
- **Dependencies**: Task 4.2
- **Rationale**: Enable other developers to run the project

#### Task 4.4: Development Scripts Verification
- **Description**: Ensure pnpm scripts work correctly
- **Files/Folders**:
  - Verify `pnpm --filter api dev` starts backend
  - Verify `pnpm --filter frontend dev` starts frontend
  - Update root package.json scripts if needed
- **Dependencies**: Task 4.3
- **Rationale**: Smooth development experience

### Phase 5: Polish and Documentation

**Goal**: Finalize Beta 1 release

#### Task 5.1: UI/UX Polish
- **Description**: Refine visual design and user experience
- **Improvements**:
  - Consistent spacing and typography
  - Loading indicators for all async operations
  - Success messages for create operations
  - Responsive layout considerations
  - Focus states and keyboard navigation
- **Files/Folders**: All frontend page and component files
- **Dependencies**: Task 4.4
- **Rationale**: Professional user experience

#### Task 5.2: Code Cleanup
- **Description**: Remove debug code and improve code quality
- **Actions**:
  - Remove console.log statements
  - Add comments for complex logic
  - Ensure consistent code formatting
  - Remove unused imports
- **Files/Folders**: All source files
- **Dependencies**: Task 5.1
- **Rationale**: Maintainable codebase

#### Task 5.3: Beta 1 Scope Verification
- **Description**: Cross-check implementation against BETA_SCOPE.md
- **Checklist**:
  - Auth with Supabase (registration and login) ✓
  - Profiles table ✓
  - Projects table and API endpoints ✓
  - Runs table and API endpoints ✓
  - OpenAI integration ✓
  - Frontend screens (Login, Register, Projects, Project Detail) ✓
  - Environment variables configuration ✓
  - Development scripts ✓
- **Files/Folders**: BETA_SCOPE.md reference
- **Dependencies**: Task 5.2
- **Rationale**: Ensure nothing is missing

#### Task 5.4: Final Documentation
- **Description**: Update repository documentation
- **Files/Folders**:
  - Update README.md with project overview
  - Document API endpoints (informal, in comments or separate doc)
  - Update BETA_SCOPE.md status if needed
- **Dependencies**: Task 5.3
- **Rationale**: Knowledge transfer and onboarding

## Structural Recommendations

### Current Structure Analysis

The repository structure is already well-aligned with Beta 1 objectives. The apps/ directory contains both frontend and frontend as expected. No major restructuring is required.

### Minor Adjustments Needed

| Current Location | Issue | Recommended Action |
|-----------------|-------|-------------------|
| `src/components/` at root | Components should be within apps/frontend for clarity | Move to `apps/frontend/src/_archived/` or integrate |
| `src/store/` at root | Store should be within apps/frontend | Move to `apps/frontend/src/_archived/` or integrate |
| `apps/api/data/` | File-based storage conflicts with Supabase approach | Remove directory after migration |
| `apps/api/src/brain/` | Experimental features outside Beta 1 scope | Move to `apps/api/src/_archived/` |

### Packages Organization

The packages/chat-core directory is currently underutilized. For Beta 1, it is acceptable to leave shared logic in individual apps. Future iterations may benefit from moving common types or utilities to this package.

## Implementation Priority

### Recommended Starting Point

**Begin with Phase 1 (Foundation Setup)** as it establishes the infrastructure required for all subsequent work. Specifically:

1. Task 1.1 (Environment Configuration) - enables all other tasks
2. Task 1.2 (Install Dependencies) - must complete before any coding
3. Task 1.3 (Database Schema) - defines data structure for both backend and frontend

### Critical Path

The critical path through the implementation is:

Phase 1 → Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4 → Task 2.5 → Task 3.1 → Task 3.2 → Task 3.3 → Task 3.4 → Task 3.6 → Task 3.8

This path represents the minimum viable implementation of Beta 1 scope.

### Parallelization Opportunities

After Phase 1 is complete:
- Backend work (Phase 2) and Frontend configuration (Task 3.1, 3.2, 3.3) can proceed in parallel
- UI component development (Task 3.4 onwards) can begin once API contracts are defined, even before backend implementation is complete (using mock data)

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| OpenAI API rate limits during testing | Medium | Medium | Implement retry logic with exponential backoff; use lower rate model for development |
| Supabase schema migration issues | Low | High | Test schema thoroughly in development environment before production |
| Token expiration handling | Medium | Medium | Implement token refresh logic in frontend middleware |
| Large run outputs exceeding TEXT limits | Low | Medium | Set reasonable max_tokens limit in OpenAI calls; consider TEXT column type limits |

### Process Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Scope creep from FUTURE_IDEAS.md | Medium | High | Strict adherence to BETA_SCOPE.md; document all new ideas in FUTURE_IDEAS.md only |
| Breaking existing Electron integration | Low | Medium | Test desktop build after major changes; ensure main.js and preload.js remain compatible |

## Out of Scope (Future Considerations)

The following capabilities are explicitly **not** part of Beta 1 and should be logged in FUTURE_IDEAS.md if they arise during implementation:

- Store of apps
- Multi-user workspaces
- Advanced flow templates
- External integrations
- Real-time collaboration
- Run sharing or export
- Advanced analytics on runs
- Custom model fine-tuning
- Conversation threading or context management
- User avatar or profile customization
- Dark/light theme toggle
- Keyboard shortcuts beyond basic form submission
- Search or filter functionality for projects or runs
- Pagination for large run histories
- Run editing or deletion
- Project archiving or deletion

Any feature not explicitly listed in BETA_SCOPE.md should be deferred to Beta 2 or later.
