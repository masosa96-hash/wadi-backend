# Feature Design: WADI Beta Public Launch Preparation

## Context and Objective

WADI/Kivo has completed Phase 1 development, including WebSocket infrastructure, vector memory, AI tools framework, task management, and Docker containerization. The system is currently functional for development and testing but requires critical enhancements before opening to public beta users.

**Primary Goal**: Enable real users to safely register, test, and provide feedback on WADI through a stable, secure, and production-ready environment.

**Explicit Constraint**: This design focuses exclusively on beta readiness requirements. Phase 2 features (advanced collaboration, full OAuth, 2FA) are explicitly excluded from scope.

---

## Current State Assessment

### Implemented and Working

- Authentication flow via Supabase (email/password)
- Project, Session, and Run management with database persistence
- WebSocket streaming for AI responses
- Vector memory system with embeddings
- AI tools framework (PDF, Image, Code, ZIP)
- Task management system
- Docker deployment configuration
- Frontend navigation (Login → Projects → Sessions → Chat)

### Critical Gaps for Public Beta

1. **Security**: No refresh token rotation, no rate limiting, missing production security headers
2. **Stability**: Auth tokens expire without graceful handling, no retry mechanisms for failed API calls
3. **Error Handling**: Generic error messages, no network/timeout handling, missing user feedback
4. **Deployment**: Environment configuration not validated, missing health monitoring, no automated database migrations
5. **Access Control**: No invitation system for controlled beta access

---

## Design Principles

1. **Minimal Viable Security**: Implement only what's essential to prevent abuse and protect user data
2. **Progressive Enhancement**: Build on existing Phase 1 infrastructure without major architectural changes
3. **Fail-Safe Operations**: Graceful degradation when services are unavailable
4. **Clear User Feedback**: Users should always understand system state and errors
5. **Deploy-Ready**: Configuration and monitoring must support immediate production deployment

---

## Priority 1: Minimal Security Hardening

### 1.1 Token Refresh Mechanism

**Problem**: Supabase access tokens expire after 1 hour, causing sudden auth failures and forcing re-login.

**Solution**: Implement automatic token refresh with silent renewal.

#### Frontend Token Refresh Strategy

**Components**:

- Automatic refresh detection (monitor token expiration)
- Silent token renewal using Supabase refresh tokens
- Token refresh queue to prevent race conditions
- Graceful session expiration handling

**Behavior**:

- Check token expiration before each API call
- Refresh tokens when less than 5 minutes remain
- Handle refresh failures by redirecting to login with preserved redirect path
- Store refresh timestamp to prevent excessive refresh attempts

**Integration Points**:

- Enhance `apps/frontend/src/config/api.ts` to intercept requests
- Update `apps/frontend/src/store/authStore.ts` with refresh logic
- Add token validation to auth state initialization

#### Backend Token Validation Enhancement

**Current Limitation**: Backend validates tokens but doesn't handle expiration edge cases.

**Enhancement**:

- Return specific error code for expired tokens (401 with `token_expired` reason)
- Distinguish between invalid and expired tokens in middleware
- Add token metadata to request context (expiration time, issued time)

**Modified Component**: `apps/api/src/middleware/auth.ts`

---

### 1.2 Simple Rate Limiting

**Rationale**: Prevent API abuse without complex infrastructure during beta phase.

**Scope**: Apply rate limits to high-risk endpoints only.

#### Rate-Limited Endpoints

| Endpoint Pattern                         | Limit       | Window    | Rationale                   |
| ---------------------------------------- | ----------- | --------- | --------------------------- |
| `POST /api/projects/:id/runs`            | 20 requests | 1 minute  | Prevent AI API cost abuse   |
| `POST /api/auth/*` (if implemented)      | 5 requests  | 5 minutes | Prevent credential stuffing |
| `POST /api/projects/:projectId/sessions` | 10 requests | 1 minute  | Prevent session spam        |
| `POST /api/shares/*`                     | 10 requests | 5 minutes | Prevent share link abuse    |

#### Implementation Approach

**Strategy**: In-memory rate limiting using simple middleware (suitable for single-instance beta deployment).

**Components**:

- Rate limit middleware with sliding window algorithm
- Per-user tracking using `user_id` from auth middleware
- Response headers indicating limit status (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- HTTP 429 response for exceeded limits with retry-after time

**Technology**: Use `express-rate-limit` package with memory store for simplicity.

**Future Migration Path**: When scaling horizontally, replace memory store with Redis store (already configured in docker-compose).

**New File**: `apps/api/src/middleware/rateLimit.ts`

#### Error Response Structure

When rate limit exceeded:

```
Status: 429 Too Many Requests
Headers:
  X-RateLimit-Limit: 20
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1234567890
  Retry-After: 45

Body:
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limit": 20,
  "window": "1 minute"
}
```

---

### 1.3 Production Security Headers

**Current State**: Basic CORS configuration exists but missing security headers.

**Required Headers**:

| Header                      | Value                                 | Purpose                       |
| --------------------------- | ------------------------------------- | ----------------------------- |
| `X-Content-Type-Options`    | `nosniff`                             | Prevent MIME sniffing attacks |
| `X-Frame-Options`           | `DENY`                                | Prevent clickjacking          |
| `X-XSS-Protection`          | `1; mode=block`                       | Enable browser XSS filters    |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS                   |
| `Content-Security-Policy`   | See below                             | Restrict resource loading     |

**Content Security Policy (CSP)**:

- Allow scripts only from same origin and Supabase/OpenAI APIs
- Restrict frame ancestors to prevent embedding
- Disable inline scripts (requires build configuration adjustment)

**Implementation**: Add security middleware using `helmet` package.

**Modified File**: `apps/api/src/index.ts`

---

### 1.4 Environment Variable Validation

**Problem**: Missing or invalid environment variables cause runtime failures.

**Solution**: Validate all required environment variables at startup with clear error messages.

#### Required Variables

**Backend (Critical)**:

- `SUPABASE_URL` - Must be valid HTTPS URL
- `SUPABASE_ANON_KEY` - Must be non-empty JWT format
- `SUPABASE_SERVICE_KEY` - Must be non-empty JWT format
- `OPENAI_API_KEY` - Must start with `sk-`
- `PORT` - Must be valid port number (1024-65535)
- `FRONTEND_URL` - Must be valid HTTP/HTTPS URL

**Backend (Optional with Defaults)**:

- `OPENAI_DEFAULT_MODEL` - Defaults to `gpt-3.5-turbo`
- `NODE_ENV` - Defaults to `development`

**Frontend (Critical)**:

- `VITE_SUPABASE_URL` - Must match backend Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Must match backend anon key
- `VITE_API_URL` - Must be valid HTTP/HTTPS URL

#### Validation Behavior

**Startup Validation**:

- Check all variables before starting server
- Exit with code 1 and clear error message if validation fails
- Log all validated variables (mask sensitive values)

**Example Error Output**:

```
❌ Environment Validation Failed:
  - SUPABASE_URL: Invalid format, must be HTTPS URL
  - OPENAI_API_KEY: Missing or invalid, must start with 'sk-'
  - PORT: Invalid, must be between 1024-65535

Please check your .env file and try again.
```

**New File**: `apps/api/src/config/env-validator.ts`

**Modified File**: `apps/api/src/index.ts` (add validation before server start)

---

## Priority 2: UI and Navigation Stabilization

### 2.1 Complete Navigation Flow

**Current State**: Navigation works but lacks consistency and error recovery.

#### Enhanced Navigation Patterns

**Login Flow**:

1. Unauthenticated user lands on `/login`
2. After successful login, redirect to `/projects`
3. Failed login shows specific error (invalid credentials, network error, server error)
4. "Forgot password" link redirects to Supabase password reset flow

**Registration Flow**:

1. User fills registration form with email, password, display name
2. Validate password strength client-side (min 8 chars, 1 uppercase, 1 number)
3. Create Supabase auth user and profile atomically
4. Handle profile creation failure by deleting auth user (rollback)
5. After successful registration, auto-login and redirect to `/projects`

**Project Selection Flow**:

1. Projects page shows grid of user's projects
2. Click project navigates to `/projects/:id`
3. Empty state encourages creating first project
4. Project creation modal validates name (required, 3-100 chars)

**Session and Chat Flow**:

1. Project detail page auto-creates first session if none exists
2. Session list shows in sidebar with active indicator
3. Run history grouped by session
4. Create new session button in header
5. Empty session shows welcome message

#### Session Management Enhancement

**Current Gap**: Sessions exist in backend but not fully integrated in frontend navigation.

**Required Changes**:

- Display session selector in project detail header
- Allow switching between sessions without page reload
- Show session metadata (created date, run count)
- Provide "New Session" and "Rename Session" actions
- Display active session indicator

**Modified File**: `apps/frontend/src/pages/ProjectDetail.tsx`

---

### 2.2 Loading and Empty States

**Philosophy**: Users should never see a blank screen or wonder if something is happening.

#### Loading State Patterns

**Global Loading** (app initialization):

- Full-screen centered spinner with "Loading WADI..." message
- Shown during auth state initialization

**Component Loading** (data fetching):

- Skeleton screens for lists (projects, sessions, runs)
- Inline spinners for actions (creating run, creating project)
- Disable action buttons during submission

**Skeleton Screen Specification**:

- Projects grid: Show 6 card skeletons with pulsing animation
- Session list: Show 3 session item skeletons
- Run history: Show 5 message bubble skeletons

#### Empty State Patterns

**No Projects**:

- Icon: Empty folder illustration
- Message: "Welcome to WADI! Create your first project to get started."
- Action: Prominent "Create Project" button

**No Sessions in Project**:

- Icon: Chat bubble illustration
- Message: "Start a new conversation to begin."
- Action: Auto-create first session on first message

**No Runs in Session**:

- Icon: Sparkle/AI illustration
- Message: "Send a message to start the conversation."
- Action: Input field remains visible and focused

**Network Offline**:

- Icon: WiFi off illustration
- Message: "You're offline. Please check your connection."
- Action: "Retry" button

**Enhanced Files**:

- `apps/frontend/src/pages/Projects.tsx`
- `apps/frontend/src/pages/ProjectDetail.tsx`

---

### 2.3 Navigation Guards and Redirects

**Purpose**: Prevent invalid navigation states and provide smooth user experience.

#### Protected Route Enhancement

**Current Implementation**: Basic auth check in router.

**Enhancement**:

- Store intended destination when redirecting to login
- After login, redirect to stored destination (not always `/projects`)
- Clear stored destination after successful redirect
- Handle expired sessions with modal prompt to re-login

**Example Flow**:

1. User clicks share link while logged out: `/shares/abc123`
2. Router redirects to `/login?redirect=/shares/abc123`
3. After login, automatically navigate to `/shares/abc123`

**Modified File**: `apps/frontend/src/router.tsx`

#### Invalid State Prevention

**Scenarios to Handle**:

- Accessing non-existent project: Redirect to `/projects` with toast notification
- Accessing deleted session: Redirect to project page with error message
- Invalid project ID format: Show 404 page

**Implementation**: Add data validation in route loader functions.

---

## Priority 3: Comprehensive Error Handling

### 3.1 Backend Error Standardization

**Current State**: Inconsistent error responses across controllers.

**Standard Error Response Structure**:

```
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE_CONSTANT",
  "details": {
    "field": "Specific field that caused error",
    "constraint": "Validation rule that failed"
  },
  "retryable": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Error Categories and HTTP Status Codes

| Category             | HTTP Status | Code Example               | Retryable            |
| -------------------- | ----------- | -------------------------- | -------------------- |
| Validation Error     | 400         | `INVALID_INPUT`            | false                |
| Authentication Error | 401         | `AUTH_TOKEN_EXPIRED`       | true (after refresh) |
| Authorization Error  | 403         | `INSUFFICIENT_PERMISSIONS` | false                |
| Not Found            | 404         | `RESOURCE_NOT_FOUND`       | false                |
| Rate Limit           | 429         | `RATE_LIMIT_EXCEEDED`      | true (after wait)    |
| Server Error         | 500         | `INTERNAL_SERVER_ERROR`    | true                 |
| Service Unavailable  | 503         | `SERVICE_UNAVAILABLE`      | true                 |

#### Specific Error Codes

**Authentication**:

- `AUTH_MISSING` - No authorization header
- `AUTH_INVALID` - Invalid token format
- `AUTH_EXPIRED` - Token expired (refresh needed)
- `AUTH_USER_NOT_FOUND` - User account deleted

**Resource Errors**:

- `PROJECT_NOT_FOUND`
- `SESSION_NOT_FOUND`
- `RUN_NOT_FOUND`
- `TASK_NOT_FOUND`

**Validation Errors**:

- `INVALID_PROJECT_NAME` - Name too short/long or invalid characters
- `INVALID_EMAIL` - Email format validation failed
- `WEAK_PASSWORD` - Password doesn't meet requirements

**External Service Errors**:

- `OPENAI_API_ERROR` - OpenAI service failure
- `OPENAI_RATE_LIMIT` - OpenAI rate limit hit
- `SUPABASE_ERROR` - Database operation failed

**Implementation**: Create centralized error handler middleware.

**New File**: `apps/api/src/middleware/errorHandler.ts`

---

### 3.2 Frontend Error Display and Recovery

**Philosophy**: Users should understand what went wrong and what they can do about it.

#### Error Display Components

**Toast Notifications** (transient errors):

- Auto-dismiss after 5 seconds
- Use for successful operations and minor errors
- Position: Top-right corner
- Variants: success (green), error (red), warning (yellow), info (blue)

**Banner Alerts** (persistent errors):

- Remain visible until dismissed or error resolved
- Use for critical errors blocking functionality
- Position: Top of content area
- Include retry action when applicable

**Inline Validation** (form errors):

- Show immediately below form field
- Red border on invalid field
- Specific validation message
- Clear on field change

**Modal Dialogs** (critical errors requiring user decision):

- Overlay with backdrop
- Use for session expired, network offline
- Provide clear action buttons ("Retry", "Go to Login")

#### Error Recovery Strategies

**Network Errors**:

- Show "Network error" banner with retry button
- Implement exponential backoff for retries (1s, 2s, 4s, 8s, stop)
- Cache last successful data and show with "stale data" indicator

**Authentication Errors**:

- Expired token: Attempt silent refresh first, fallback to login redirect
- Invalid token: Immediate redirect to login with session expiration message

**Rate Limit Errors**:

- Show countdown timer until retry allowed
- Disable submit buttons during limit period
- Display current limit status in UI

**OpenAI Errors**:

- Rate limit: Queue request and retry automatically
- Service error: Show user-friendly message "AI service temporarily unavailable"
- Provide option to retry or cancel

**Validation Errors**:

- Highlight specific field with error
- Show validation message inline
- Prevent form submission until resolved

**New Components**:

- `apps/frontend/src/components/Toast.tsx`
- `apps/frontend/src/components/Banner.tsx`
- `apps/frontend/src/hooks/useErrorHandler.ts`

---

### 3.3 Backend Logging and Monitoring

**Purpose**: Detect and diagnose issues in production environment.

#### Structured Logging

**Log Levels**:

- `error`: Exceptions, failures, critical issues
- `warn`: Degraded performance, fallback behavior
- `info`: Key operations (user login, run created)
- `debug`: Detailed trace (development only)

**Log Structure**:

```
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "error",
  "message": "Failed to create run",
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "error": {
    "name": "OpenAIError",
    "message": "Rate limit exceeded",
    "stack": "..."
  },
  "context": {
    "endpoint": "POST /api/projects/:id/runs",
    "duration": 1234,
    "statusCode": 503
  }
}
```

**What to Log**:

- All API requests (method, path, user ID, duration, status code)
- Authentication attempts (success/failure, method)
- External API calls (OpenAI, Supabase operations)
- Rate limit triggers
- Errors with full stack traces (sanitize PII)

**What NOT to Log**:

- User passwords or tokens
- Full API keys (mask after first 8 chars)
- Personal information (email, names) in debug logs
- AI conversation content in production

**Implementation**: Use `winston` or `pino` for structured JSON logging.

**New File**: `apps/api/src/config/logger.ts`

#### Health Check Enhancement

**Current**: Basic health endpoint exists.

**Enhancement**: Add detailed health information.

**Endpoint**: `GET /health`

**Response**:

```
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "healthy",
      "latency": 15
    },
    "openai": {
      "status": "degraded",
      "latency": 2500
    }
  },
  "version": "1.0.0-beta"
}
```

**Status Values**: `healthy`, `degraded`, `unhealthy`

**Modified File**: `apps/api/src/index.ts`

---

## Priority 4: Production Deployment Readiness

### 4.1 Environment Configuration Validation

**Already Designed in Priority 1.4** - See section 1.4 for complete specification.

**Additional Requirement**: Create environment setup checklist for deployment team.

---

### 4.2 Database Migration System

**Current State**: Manual SQL execution required for schema changes.

**Problem**: No version control or rollback capability for database schema.

**Solution**: Introduce migration management for controlled schema evolution.

#### Migration Strategy

**Approach**: Use Supabase migration files with version tracking.

**Migration Structure**:

```
docs/migrations/
  ├── 001_initial_schema.sql
  ├── 002_add_sessions_table.sql
  ├── 003_add_vector_memory.sql
  └── 004_add_beta_indexes.sql
```

**Migration Metadata**:
Each migration file includes header comment:

```sql
-- Migration: 004_add_beta_indexes
-- Description: Add database indexes for beta performance
-- Author: Development Team
-- Date: 2025-01-15
-- Rollback: See 004_add_beta_indexes_rollback.sql
```

**Version Tracking**:
Create `schema_migrations` table to track applied migrations:

```
| version | name | applied_at | checksum |
```

**Application Behavior**:

- On startup, check for pending migrations
- Log warning if unapplied migrations detected (don't auto-apply)
- Provide admin command to apply migrations: `pnpm run migrate:up`

**Beta Deployment Process**:

1. Developer creates migration file
2. Test migration in staging environment
3. Include migration in deployment checklist
4. DBA or automation applies migration before code deployment
5. Verify migration success via health endpoint

**New Directory**: `docs/migrations/`

**New Script**: Migration runner utility (optional for beta, required for production)

---

### 4.3 Docker Deployment Validation

**Current State**: docker-compose.yml exists but not fully tested in production scenario.

#### Pre-Deployment Checklist

**Docker Configuration**:

- [ ] All environment variables defined in .env file
- [ ] .env file NOT committed to repository (add to .gitignore)
- [ ] Volume mounts configured for persistence (api-temp, redis-data)
- [ ] Health checks configured and tested
- [ ] Resource limits defined (memory, CPU)
- [ ] Logging drivers configured for centralized logs

**Network Configuration**:

- [ ] Reverse proxy configured (Nginx or Traefik)
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Firewall rules allow only necessary ports (443, 80)
- [ ] CORS origins restricted to production domain
- [ ] DNS records configured and propagated

**Security Configuration**:

- [ ] Secrets stored in secure secrets manager (not in .env)
- [ ] Database credentials rotated from defaults
- [ ] Supabase RLS policies enabled and tested
- [ ] Rate limiting active and tested
- [ ] Security headers verified in production

**Monitoring Configuration**:

- [ ] Health endpoint accessible
- [ ] Log aggregation configured
- [ ] Uptime monitoring configured
- [ ] Error tracking (Sentry) configured
- [ ] Alert rules defined for critical errors

#### Docker Compose Enhancement

**Required Changes**:

**Resource Limits**:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: "1.0"
        memory: 1G
      reservations:
        cpus: "0.5"
        memory: 512M
```

**Logging Configuration**:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

**Restart Policies**: Already configured (`unless-stopped`).

**Modified File**: `docker-compose.yml`

---

### 4.4 Deployment Documentation

**Create**: Comprehensive deployment runbook.

**New File**: `docs/BETA_DEPLOYMENT_GUIDE.md`

**Contents**:

**Prerequisites Section**:

- Server requirements (Ubuntu 22.04, 2GB RAM, 20GB disk)
- Required accounts (Supabase, OpenAI)
- Domain and DNS setup
- SSL certificate acquisition

**Step-by-Step Deployment**:

1. Server provisioning and initial setup
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Setup Supabase database
6. Run database migrations
7. Build and start containers
8. Verify health checks
9. Configure reverse proxy
10. Test complete user flow

**Rollback Procedure**:

- Steps to revert to previous version
- Database rollback strategy
- Data backup restoration

**Troubleshooting Common Issues**:

- Container won't start
- Database connection fails
- OpenAI API errors
- CORS errors from frontend

**Monitoring and Maintenance**:

- Log locations and access methods
- Health check interpretation
- Backup schedule and verification
- Update and patch procedures

---

## Priority 5: Secure Invitation System

### 5.1 Beta Access Control Strategy

**Objective**: Allow controlled access to beta testers without public registration.

**Approach**: Invitation link system with limited-use registration tokens.

### 5.2 Invitation Link Architecture

#### Database Schema

**New Table**: `beta_invitations`

**Columns**:

- `id` - UUID primary key
- `code` - Unique 32-char alphanumeric invitation code
- `created_by` - UUID reference to admin user who created invite
- `email` - Optional email address (pre-assigned invitation)
- `max_uses` - Integer, null for unlimited
- `current_uses` - Integer, tracks redemptions
- `expires_at` - Timestamp, null for no expiration
- `created_at` - Timestamp
- `metadata` - JSONB for tracking notes, source, etc.

**Indexes**:

- Unique index on `code`
- Index on `email` for lookup
- Index on `expires_at` for cleanup

**RLS Policy**: Admin-only table access (or no RLS if accessed via service role only).

**SQL File**: `docs/migrations/005_beta_invitations.sql`

#### Invitation Types

**Single-Use Personal Invite**:

- Tied to specific email address
- Valid for one registration only
- Expires after 7 days if not used

**Multi-Use Generic Invite**:

- Not tied to specific email
- Limited use count (e.g., 50 registrations)
- Longer expiration (e.g., 30 days)

**Permanent Admin Invite**:

- No expiration or use limit
- Used for internal team and trusted partners
- Can be revoked manually

#### Invitation Flow

**Creation** (Admin Interface):

1. Admin navigates to invitation management page (future admin panel)
2. Selects invitation type and parameters
3. System generates unique code
4. Admin receives shareable link: `https://app.wadi.com/register?invite=ABC123XYZ...`
5. Admin can copy link or send directly

**Registration with Invitation**:

1. User clicks invitation link
2. Frontend extracts `invite` parameter from URL
3. Registration form pre-validates invitation code via API
4. User fills registration form (email, password, name)
5. Backend validates invitation:
   - Code exists and not expired
   - Use count not exceeded
   - Email matches if invitation is personalized
6. If valid, create user account and increment use count
7. If invalid, show specific error (expired, used, invalid code)

**Without Invitation**:

- Regular `/register` route disabled or shows "Beta invitation required" message
- Provide contact form for requesting beta access

#### API Endpoints

**Admin Endpoints** (for future admin panel or CLI):

- `POST /api/admin/invitations` - Create invitation
- `GET /api/admin/invitations` - List all invitations
- `DELETE /api/admin/invitations/:id` - Revoke invitation

**Public Endpoints**:

- `GET /api/invitations/validate/:code` - Check if code is valid (without consuming)
- `POST /api/auth/register-with-invite` - Register using invitation code

#### Backend Implementation

**New Files**:

- `apps/api/src/controllers/invitationsController.ts`
- `apps/api/src/routes/invitations.ts`
- `apps/api/src/middleware/adminAuth.ts` (simple admin check based on user role)

**Modified Files**:

- `apps/frontend/src/pages/Register.tsx` - Add invitation code handling

#### Security Considerations

**Code Generation**:

- Use cryptographically secure random string (32 chars)
- Include checksum to detect typos
- Format: `ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456`

**Rate Limiting**:

- Invitation validation: 10 requests per minute per IP
- Registration with invite: 3 attempts per hour per IP

**Revocation**:

- Admin can disable invitation at any time
- Disabled invitations show clear error on validation

**Audit Trail**:

- Log all invitation creations, uses, and revocations
- Track which user registered with which invitation code (in metadata)

---

### 5.3 Initial Admin Bootstrap

**Problem**: How to create first admin user without invitation system.

**Solution**: Environment-based initial admin creation.

#### Bootstrap Process

**Environment Variable**:

- `INITIAL_ADMIN_EMAIL` - Email address for first admin account
- `INITIAL_ADMIN_PASSWORD` - Password for first admin (change immediately after first login)

**Startup Behavior**:

1. On first server start, check if any users exist
2. If no users and admin credentials provided, create admin user
3. Assign admin role in profiles table
4. Log creation with warning to change password
5. Disable auto-creation on subsequent starts

**Database Enhancement**:
Add `role` column to `profiles` table:

- Values: `user`, `admin`
- Default: `user`
- Used for admin permission checks

**Migration File**: `docs/migrations/006_add_user_roles.sql`

---

### 5.4 Invitation Management Interface

**For Beta**: Command-line utility or direct database manipulation.

**CLI Utility**: `pnpm run invite:create`

**Functionality**:

- Interactive prompts for invitation parameters
- Outputs shareable link
- Lists active invitations
- Revokes invitations by code

**Implementation**: Simple Node.js script using Supabase client.

**New File**: `apps/api/scripts/manage-invites.ts`

**Future Enhancement**: Web-based admin panel for invitation management (Phase 2+).

---

## Implementation Roadmap

### Phase A: Security Foundations (Week 1)

**Tasks**:

1. Implement token refresh mechanism (frontend + backend)
2. Add rate limiting middleware
3. Enable security headers (helmet)
4. Implement environment variable validation
5. Test auth flow with token expiration scenarios

**Deliverables**:

- Users can stay logged in beyond 1 hour
- API rate limits prevent abuse
- Security scan passes (no critical vulnerabilities)

**Validation**:

- Manual test: Leave app open for 2 hours, verify no logout
- Load test: Send 100 requests in 10 seconds, verify rate limiting
- Security audit: Run OWASP ZAP or similar scanner

---

### Phase B: Error Handling and Stability (Week 1-2)

**Tasks**:

1. Standardize backend error responses
2. Implement error handler middleware
3. Create frontend error display components (Toast, Banner)
4. Add retry logic for transient failures
5. Implement structured logging
6. Enhance health check endpoint

**Deliverables**:

- All API errors return consistent format
- Frontend shows user-friendly error messages
- Failed operations can be retried
- Logs capture sufficient debugging information

**Validation**:

- Simulate network failure, verify retry behavior
- Check logs for error stack traces and context
- Trigger rate limit, verify countdown UI

---

### Phase C: Navigation and UX Polish (Week 2)

**Tasks**:

1. Add loading skeletons to all list views
2. Create empty states for projects, sessions, runs
3. Implement navigation guards with redirect preservation
4. Add session management to project detail page
5. Improve form validation feedback

**Deliverables**:

- No blank screens during loading
- Clear guidance when data is empty
- Smooth navigation with preserved context
- Helpful validation messages

**Validation**:

- User testing: New user completes full flow without confusion
- Check all empty states display correctly
- Verify redirect works after login

---

### Phase D: Deployment Infrastructure (Week 2-3)

**Tasks**:

1. Create database migration system
2. Consolidate migration files
3. Update docker-compose with resource limits and logging
4. Write deployment runbook
5. Create deployment checklist
6. Test deployment on staging server

**Deliverables**:

- Migration system ready for production
- Docker configuration production-ready
- Complete deployment documentation
- Successful staging deployment

**Validation**:

- Fresh deployment on clean server succeeds
- All health checks pass
- User can register and create project

---

### Phase E: Invitation System (Week 3)

**Tasks**:

1. Create beta_invitations table and migration
2. Implement invitation API endpoints
3. Add admin role to profiles
4. Create initial admin bootstrap logic
5. Build CLI invitation management utility
6. Modify registration flow to require invitation
7. Test complete invitation redemption flow

**Deliverables**:

- Invitation system functional
- Registration requires valid invitation code
- Admin can create and manage invitations
- Initial admin can be created automatically

**Validation**:

- Create invitation, register new user successfully
- Attempt registration without code, verify rejection
- Revoke invitation, verify it cannot be used
- Test single-use and multi-use invitations

---

## Acceptance Criteria

### Minimal Security

- [ ] Users remain logged in for at least 4 hours without re-authentication
- [ ] Token refresh happens automatically without user awareness
- [ ] AI run creation rate limited to 20/minute per user
- [ ] All API responses include security headers
- [ ] Invalid environment variables prevent server startup with clear error

### Stable Navigation

- [ ] Login → Projects → Project Detail flow works without errors
- [ ] Back button navigation preserves state
- [ ] Redirect after login returns user to intended destination
- [ ] Session switching updates run history without page reload
- [ ] Form validation shows specific field errors

### Clear Error Handling

- [ ] Network errors show retry button
- [ ] Rate limit errors display countdown timer
- [ ] Expired session prompts re-login with explanation
- [ ] Failed AI requests show user-friendly message (not raw error)
- [ ] All errors logged with sufficient debug context

### Production Deployment

- [ ] Fresh deployment on Ubuntu server succeeds following runbook
- [ ] Health check endpoint returns detailed status
- [ ] Database migrations apply successfully
- [ ] All environment variables validated on startup
- [ ] Docker containers restart automatically on failure

### Invitation System

- [ ] User cannot register without valid invitation code
- [ ] Single-use invitation works exactly once
- [ ] Multi-use invitation respects use limit
- [ ] Expired invitations rejected with clear message
- [ ] Admin can create, list, and revoke invitations
- [ ] Initial admin created automatically from environment variables

---

## Risk Assessment and Mitigation

### Risk 1: Token Refresh Race Conditions

**Risk**: Multiple parallel API calls trigger simultaneous refresh attempts, causing token invalidation.

**Likelihood**: Medium | **Impact**: High

**Mitigation**:

- Implement refresh lock/queue in frontend
- Only one refresh in flight at a time
- Queued requests wait for refresh completion
- Test with 10 simultaneous API calls

---

### Risk 2: Rate Limiting False Positives

**Risk**: Legitimate users hit rate limits during normal usage.

**Likelihood**: Low | **Impact**: Medium

**Mitigation**:

- Set conservative limits (20 AI runs/minute is generous)
- Implement exponential backoff on client
- Monitor rate limit metrics in first week
- Adjust limits based on real usage patterns

---

### Risk 3: Invitation Code Enumeration

**Risk**: Attacker brute-forces invitation codes.

**Likelihood**: Low | **Impact**: Medium

**Mitigation**:

- Use 32-character codes (astronomically large keyspace)
- Rate limit validation endpoint (10/min per IP)
- Log excessive validation attempts
- Consider CAPTCHA if abuse detected

---

### Risk 4: Database Migration Failures

**Risk**: Migration fails mid-execution, leaving schema in inconsistent state.

**Likelihood**: Low | **Impact**: High

**Mitigation**:

- Wrap migrations in transactions where possible
- Test migrations on staging before production
- Keep rollback scripts for each migration
- Backup database before applying migrations

---

### Risk 5: Insufficient Logging Performance

**Risk**: Structured logging creates performance bottleneck or storage issues.

**Likelihood**: Low | **Impact**: Low

**Mitigation**:

- Use async logging (non-blocking)
- Set log retention to 7 days
- Monitor log volume and disk usage
- Implement log rotation and compression

---

## Success Metrics

### Week 1 Post-Launch

- Zero critical security incidents
- < 5% authentication failure rate
- Average session duration > 10 minutes
- < 1% rate limit hits from legitimate users

### Week 2 Post-Launch

- 50+ active beta users registered
- Average project creation rate: 2 per user
- Average AI runs per session: 5+
- < 2% error rate on API requests

### Week 4 Post-Launch

- 90% user retention (return within 1 week)
- Positive feedback on stability and usability
- No emergency rollbacks required
- < 0.1% unhandled exception rate

---

## Out of Scope (Explicitly Excluded)

The following features are **NOT** included in this beta preparation design:

- Full OAuth integration (Google, GitHub, Microsoft)
- Two-factor authentication (2FA)
- Advanced role-based access control (RBAC) beyond basic admin flag
- Real-time collaborative features (multiple users in same session)
- Project sharing and permissions management (beyond share links)
- Payment integration or subscription tiers
- Advanced analytics and usage dashboards
- Email notifications and transactional emails
- Mobile app or responsive mobile optimization
- Internationalization (i18n) and localization
- Advanced AI model selection and configuration
- Custom branding or white-label options

These features remain in the backlog for Phase 2 and beyond.

---

## Dependencies and Prerequisites

### External Services

- Supabase project with database created
- OpenAI API account with credits
- Domain name with DNS configured (for production)
- SSL certificate (Let's Encrypt recommended)

### Infrastructure

- Ubuntu 22.04 or similar Linux server
- Minimum 2GB RAM, 20GB disk
- Docker Engine 20.10+ and Docker Compose 2.0+
- Reverse proxy (Nginx or Traefik) for SSL termination

### Development Tools

- Node.js 18+ and PNPM 8+
- Access to Supabase dashboard for manual schema changes
- Basic familiarity with Docker and command-line operations

---

## Future Considerations

### Post-Beta Enhancements

Once beta feedback is collected, consider:

- Email verification for new registrations
- Password reset flow enhancement
- User profile management page
- Invitation analytics (track which invites perform best)
- Waitlist system for users without invitations
- Automated onboarding tour for first-time users

### Scalability Preparations

Current design supports single-instance deployment. For growth:

- Migrate rate limiting to Redis (already in docker-compose)
- Implement session affinity or stateless WebSocket reconnection
- Add read replicas for database
- Introduce CDN for static assets
- Implement horizontal scaling with load balancer

### Monitoring Evolution

As user base grows, enhance monitoring:

- Integrate APM tool (New Relic, DataDog)
- Add custom metrics (registrations/day, active users, AI cost tracking)
- Implement anomaly detection alerts
- Create operational dashboard for team

---

## Conclusion

This design provides a complete roadmap to transform WADI from a Phase 1 development platform into a beta-ready product suitable for real user testing. The focus on minimal viable security, clear error handling, and controlled access ensures a safe and stable experience while maintaining development velocity.

The implementation is designed to build on existing Phase 1 infrastructure without requiring architectural rewrites, allowing rapid deployment within a 3-week timeline. All enhancements are scoped to critical beta requirements, explicitly excluding Phase 2 features to maintain focus and reduce risk.

Upon successful deployment, WADI will be ready to onboard beta testers, collect feedback, and iterate toward a production-ready release.
