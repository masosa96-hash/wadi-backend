# End-to-End Run Tracking Investigation and Fix

## Problem Statement

Users can register, log in, create projects, and navigate to the "Project Runs" screen. However, when submitting a prompt via the "Send" button, no run appears in the history, and the UI continues displaying "No runs yet. Create your first AI run above!". The Supabase database has tables for profiles, projects, and runs with RLS disabled.

## Root Cause Analysis

### Frontend Investigation

**API Request Path:**

- runsStore calls: `POST /api/projects/${projectId}/runs`
- runsStore calls: `GET /api/projects/${projectId}/runs`

**Frontend Configuration:**

- API Base URL: `http://localhost:4000` (from `VITE_API_URL`)
- Authentication: Bearer token from Supabase session attached to all requests
- Request format: JSON with `input` and optional `model` fields

**Frontend Flow:**

1. User submits prompt in ProjectDetail component
2. Calls `createRun(id, input)` from runsStore
3. Makes POST request to `/api/projects/${projectId}/runs`
4. On success, adds returned run to local state array
5. Displays runs in history section

### Backend Investigation

**Route Configuration:**

```
Backend Router Setup:
- app.use("/api/projects", projectsRouter)
- app.use("/api/projects", runsRouter)

Runs Router (from routes/runs.ts):
- POST /:id/runs → createRun controller
- GET /:id/runs → getRuns controller
```

**CRITICAL ISSUE IDENTIFIED:**

The backend route registration creates the following endpoints:

- Actual: `POST /api/projects/:id/runs`
- Actual: `GET /api/projects/:id/runs`

However, the runs router is mounted at `/api/projects` and defines routes as `/:id/runs`, which means:

- The parameter `:id` in the runs router conflicts with the mount path
- This creates a route pattern: `/api/projects/:id/runs` where `:id` is interpreted by the runs router, not as the project ID in the URL structure `/api/projects/{projectId}/runs`

**Route Mismatch:**

- Frontend expects: `/api/projects/{projectId}/runs`
- Backend actually handles: `/api/projects/:id/runs` (where :id is a router parameter, not part of the base path)

The issue is that both routers are mounted at the same base path `/api/projects`, causing route conflicts and confusion in parameter resolution.

### OpenAI Service

**Configuration:**

- API Key: Configured in backend `.env`
- Default Model: `gpt-3.5-turbo`
- Validation: Checks for valid model names before making API calls
- Error Handling: Handles rate limits (429) and authentication errors (401)

### Database Operations

**Create Run Flow:**

1. Validates user authentication
2. Verifies project belongs to authenticated user
3. Calls OpenAI API to generate response
4. Inserts record into `runs` table with fields: `project_id`, `user_id`, `input`, `output`, `model`
5. Returns created run with auto-generated `id` and `created_at` timestamp

**Fetch Runs Flow:**

1. Validates user authentication
2. Verifies project ownership
3. Queries `runs` table filtered by `project_id`
4. Orders results by `created_at` descending
5. Returns array of runs

## Solution Design

### Backend Route Restructuring

**Current Problem:**
Two routers mounted at the same base path cause routing ambiguity.

**Solution Strategy:**
Reorganize routes to separate projects and runs endpoints clearly, ensuring project-specific runs are accessible through a properly nested route structure.

**Updated Route Structure:**

| Method | Endpoint                        | Router   | Handler       | Purpose                        |
| ------ | ------------------------------- | -------- | ------------- | ------------------------------ |
| GET    | `/api/projects`                 | projects | getProjects   | List user's projects           |
| POST   | `/api/projects`                 | projects | createProject | Create new project             |
| GET    | `/api/projects/:projectId/runs` | projects | getRuns       | List runs for specific project |
| POST   | `/api/projects/:projectId/runs` | projects | createRun     | Create new run in project      |

**Implementation Approach:**

1. Move run-related route definitions from `routes/runs.ts` into `routes/projects.ts`
2. Register run handlers as nested routes under the projects router
3. Update route parameters from `:id` to `:projectId` for clarity
4. Remove the separate runs router registration from `index.ts`
5. Keep the runs router file as a deprecated reference or delete it

**Rationale:**

- Runs are inherently scoped to projects (parent-child relationship)
- Single router mounting eliminates route conflicts
- Clear parameter naming (`:projectId`) improves code readability
- Maintains RESTful hierarchy: `/projects/{id}/runs`

### Controller Parameter Updates

**Affected Files:**

- `controllers/runsController.ts`

**Changes:**
Update parameter extraction from `req.params.id` to `req.params.projectId` to match the updated route definition.

**Locations:**

- `getRuns` function: line 12
- `createRun` function: line 59

**Validation:**
No changes needed to validation logic, database queries, or business logic. Only the parameter extraction point changes.

### Error Handling Enhancements

**Frontend Error Visibility:**

Add user-facing error notifications in the ProjectDetail component:

- Display error messages from failed API calls
- Show specific error states (network errors, validation errors, AI generation failures)
- Provide retry mechanisms for transient failures

**Error Categories:**

| Error Type          | HTTP Status | User Message                                                 | Technical Action            |
| ------------------- | ----------- | ------------------------------------------------------------ | --------------------------- |
| Network Error       | -           | "Unable to connect to server. Please check your connection." | Log error, allow retry      |
| Unauthorized        | 401         | "Session expired. Please log in again."                      | Redirect to login           |
| Not Found           | 404         | "Project not found."                                         | Return to projects list     |
| Validation Error    | 400         | Display specific validation message                          | Show field-level error      |
| AI Generation Error | 500         | "Failed to generate response. Please try again."             | Log error, allow retry      |
| Database Error      | 500         | "An error occurred. Please try again later."                 | Log error, alert monitoring |

### Data Flow Verification

**Complete Flow After Fix:**

1. User enters prompt in ProjectDetail UI
2. Frontend submits POST to `/api/projects/{projectId}/runs`
3. Backend validates:
   - Authentication token present and valid
   - Project exists and belongs to user
   - Input is non-empty and within character limit
4. Backend calls OpenAI API with user input
5. Backend receives AI response
6. Backend inserts record into `runs` table:
   - `project_id`: from URL parameter
   - `user_id`: from authenticated session
   - `input`: user's prompt (trimmed)
   - `output`: AI-generated response
   - `model`: selected model or default
   - `created_at`: auto-generated timestamp
7. Backend returns created run object to frontend
8. Frontend adds new run to local state array (prepends to list)
9. UI immediately displays new run in history
10. On page reload, frontend fetches runs via GET `/api/projects/{projectId}/runs`
11. Backend queries and returns all runs for the project
12. UI renders full run history

### Configuration Validation

**Environment Variables Checklist:**

Backend (apps/api/.env):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Backend server port (default: 4000)
- `FRONTEND_URL`: Frontend origin for CORS

Frontend (apps/frontend/.env):

- `VITE_SUPABASE_URL`: Must match backend Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Must match backend anon key
- `VITE_API_URL`: Backend API base URL (http://localhost:4000)

**Verification Steps:**

1. Confirm API_URL points to correct backend port
2. Verify Supabase credentials are identical between frontend and backend
3. Ensure OpenAI API key is valid and has sufficient quota
4. Check CORS configuration allows frontend origin

## Testing Strategy

### Manual Testing Checklist

**Run Creation:**

- [ ] Submit prompt with valid input
- [ ] Verify "Generating..." state displays during processing
- [ ] Confirm new run appears in history immediately after creation
- [ ] Check run contains correct input text
- [ ] Verify AI output is displayed
- [ ] Validate model name is shown
- [ ] Confirm timestamp is accurate

**Run Persistence:**

- [ ] Create multiple runs
- [ ] Reload page
- [ ] Verify all runs remain in history
- [ ] Confirm runs are ordered by newest first

**Error Scenarios:**

- [ ] Submit empty input (should be disabled)
- [ ] Submit with no authentication (should redirect to login)
- [ ] Submit to non-existent project (should show error)
- [ ] Simulate network failure (should show retry option)
- [ ] Test with invalid OpenAI key (should display error message)

**Database Validation:**

- [ ] Query Supabase runs table directly
- [ ] Verify records contain all required fields
- [ ] Confirm user_id matches authenticated user
- [ ] Check project_id matches URL parameter
- [ ] Validate timestamps are in correct timezone

### Debugging Enhancements

**Backend Logging:**

Add structured logging at critical points:

- Request received: log projectId, userId, input length
- Before OpenAI call: log model, prompt preview
- After OpenAI response: log response length, latency
- Before database insert: log full record structure
- After successful creation: log run ID
- On any error: log full error object with context

**Frontend Logging:**

Add console logs for debugging:

- Before API call: log endpoint, payload
- After success: log returned run object
- On error: log full error response
- State updates: log runs array length

**Network Inspection:**

Verify in browser DevTools:

- Request URL matches expected pattern
- Request headers include Authorization
- Request body contains input and model
- Response status is 201 on success
- Response body contains run object with all fields

## Implementation Summary

### Files Modified

**Backend:**

1. `apps/api/src/index.ts`
   - Remove separate runs router registration
   - Keep only projects router mounted at `/api/projects`

2. `apps/api/src/routes/projects.ts`
   - Add run routes as nested routes under projects router
   - Define POST `/:projectId/runs` route
   - Define GET `/:projectId/runs` route
   - Import createRun and getRuns from runsController

3. `apps/api/src/controllers/runsController.ts`
   - Update parameter extraction from `req.params.id` to `req.params.projectId`
   - Add enhanced error logging
   - No changes to validation or business logic

**Frontend:**
No changes required. Frontend already uses correct endpoint pattern.

**Deprecated:**

- `apps/api/src/routes/runs.ts` - Can be removed after migration

### Root Cause Summary

**Primary Issue:**
Conflicting route registrations. Both projects and runs routers were mounted at `/api/projects`, causing the parameter `:id` in the runs router to conflict with the intended URL structure `/api/projects/{projectId}/runs`.

**Secondary Issues:**

- Inconsistent parameter naming (`:id` instead of `:projectId`)
- Lack of error visibility in frontend UI
- Insufficient logging for debugging

**Why Runs Weren't Created:**
The backend route handler was likely not being reached due to route mismatch, or if reached, the parameter extraction was pulling the wrong value, causing project ownership validation to fail silently.

### Post-Fix Flow

**Successful Run Creation:**

1. User submits prompt "Hello, AI!"
2. Frontend POSTs to `/api/projects/abc-123/runs`
3. Backend extracts projectId = "abc-123" from route parameter
4. Validates user owns project "abc-123"
5. Calls OpenAI with input "Hello, AI!"
6. Receives response "Hello! How can I help you today?"
7. Inserts into runs table: { project_id: "abc-123", user_id: "user-xyz", input: "Hello, AI!", output: "Hello! How can I help you today!", model: "gpt-3.5-turbo" }
8. Returns run object with id, timestamps
9. Frontend displays run in history
10. Database persists record for future page loads

**Successful Run Fetch:**

1. ProjectDetail component loads with projectId = "abc-123"
2. Frontend GETs `/api/projects/abc-123/runs`
3. Backend validates user owns project
4. Queries runs table WHERE project_id = "abc-123"
5. Returns array ordered by created_at DESC
6. Frontend populates runs state
7. UI renders run history with input/output pairs

## Configuration Reference

### API Endpoints

Base URL: `http://localhost:4000`

**Authentication:**
All endpoints require `Authorization: Bearer {token}` header with valid Supabase JWT.

**Projects:**

- `GET /api/projects` - List all projects for authenticated user
- `POST /api/projects` - Create new project

**Runs:**

- `GET /api/projects/:projectId/runs` - List all runs for specified project
- `POST /api/projects/:projectId/runs` - Create new run in specified project

**Request Body (Create Run):**

```
{
  "input": "User prompt text (required, max 5000 chars)",
  "model": "gpt-3.5-turbo (optional, defaults to gpt-3.5-turbo)"
}
```

**Response Body (Create Run):**

```
{
  "run": {
    "id": "uuid",
    "project_id": "uuid",
    "user_id": "uuid",
    "input": "User prompt",
    "output": "AI response",
    "model": "gpt-3.5-turbo",
    "created_at": "ISO timestamp"
  }
}
```

### Database Schema

**runs table:**

- `id` (uuid, primary key)
- `project_id` (uuid, foreign key to projects)
- `user_id` (uuid, foreign key to profiles)
- `input` (text)
- `output` (text)
- `model` (text)
- `created_at` (timestamp with timezone)

**Required Indexes:**

- `project_id` for efficient filtering
- `created_at` for efficient ordering

**RLS Status:**
Currently disabled for testing. Should be enabled in production with policies:

- Users can only read runs for their own projects
- Users can only create runs in their own projects
- `created_at` for efficient ordering

**RLS Status:**
Currently disabled for testing. Should be enabled in production with policies:

- Users can only read runs for their own projects
- Users can only create runs in their own projects
- `project_id` for efficient filtering
