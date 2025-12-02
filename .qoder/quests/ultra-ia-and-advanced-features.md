# WADI Mega Sprint: Ultra-IA and Advanced Features Design

## Design Overview

This document defines the strategic design for transforming WADI from a Beta 1 AI platform into an enterprise-grade, feature-rich AI workspace with advanced capabilities across AI tooling, collaboration, security, user experience, DevOps, and monetization.

### Scope

The design encompasses 10 major domains representing a complete platform evolution:

1. Ultra-IA and Advanced Functionalities
2. Project and Productivity Features
3. Real-Time Collaboration
4. Advanced Security and Authentication
5. Professional UI/UX System
6. Export and Import Capabilities
7. External Integrations
8. User Management and Monetization
9. DevOps and Professional Deployment
10. Documentation and Support Infrastructure

### Strategic Objectives

- Elevate WADI from a basic AI run tracker to a comprehensive AI workspace platform
- Enable enterprise-grade security, scalability, and multi-tenancy
- Provide advanced AI capabilities beyond simple chat completion
- Support team collaboration and project management workflows
- Establish monetization infrastructure for sustainable growth
- Ensure production-ready deployment with professional DevOps practices

---

## Domain 1: Ultra-IA and Advanced Functionalities

### Bidirectional WebSocket Streaming

**Purpose**: Replace or complement Server-Sent Events (SSE) with full-duplex WebSocket communication for real-time, bidirectional AI interactions.

**Architecture**:

- WebSocket server integrated into the Express backend using `ws` library
- Connection management with authentication handshake
- Message protocol supporting multiple message types: user input, AI chunks, status updates, tool invocations, cancellation requests
- Connection pooling and heartbeat mechanism for stability
- Graceful fallback to SSE for environments where WebSocket is blocked

**Data Flow**:

1. Client establishes WebSocket connection with authentication token
2. Server validates token and creates authenticated session
3. Client sends structured messages (input, model selection, context)
4. Server streams AI responses in chunks with metadata
5. Server can send intermediate status updates (thinking, tool execution, completion)
6. Client can send cancellation or interruption commands mid-stream

**State Management**:

- Active connection registry mapping user_id to WebSocket instances
- Session persistence across reconnections using session tokens
- Message queue for handling bursts and rate limiting

---

### Internal AI Tools System

**Purpose**: Extend AI capabilities with specialized tools for document analysis, image processing, code interpretation, and file generation.

**Tool Architecture**:

Each tool follows a standardized interface:

| Tool Component    | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| Tool ID           | Unique identifier (e.g., `pdf_analyzer`, `image_vision`)          |
| Input Schema      | JSON schema defining required and optional parameters             |
| Execution Handler | Async function that processes input and returns structured output |
| Output Schema     | JSON schema for response format                                   |
| Error Handling    | Standardized error codes and messages                             |

**Tool Catalog**:

#### PDF Analysis Tool

- **Capability**: Extract text, structure, metadata from PDF documents
- **Input**: PDF file (upload or URL), extraction mode (text, tables, images, metadata)
- **Processing**: Use library like `pdf-parse` or `pdfjs-dist` for extraction
- **Output**: Structured data with extracted content, page numbers, formatting hints
- **AI Integration**: Feed extracted text into LLM context for analysis, summarization, Q&A

#### Image Analysis Tool

- **Capability**: Describe images, extract text (OCR), identify objects, analyze diagrams
- **Input**: Image file (PNG, JPG, WebP) or URL
- **Processing**: Use OpenAI Vision API (GPT-4o) or similar multimodal model
- **Output**: Textual description, detected objects, extracted text, confidence scores
- **Use Cases**: Document scanning, diagram interpretation, visual debugging

#### Code Interpretation Tool

- **Capability**: Execute code snippets safely, analyze code structure, generate documentation
- **Input**: Code string, language identifier, execution mode (analyze vs execute)
- **Processing**:
  - Analysis: Use AST parsers for static analysis
  - Execution: Sandboxed environment (Docker container with timeout)
- **Output**: Execution results, errors, static analysis findings, complexity metrics
- **Security**: Strict sandboxing, resource limits, network isolation

#### ZIP File Generation Tool

- **Capability**: Package multiple files into downloadable archive
- **Input**: File collection (content + filenames), compression level
- **Processing**: Use `archiver` or `jszip` library
- **Output**: Temporary downloadable ZIP file URL with expiration
- **Cleanup**: Scheduled job to remove expired temporary files

**Tool Invocation Flow**:

```
User Request → AI Decides Tool Needed → Tool Invoked with Parameters →
Result Returned to AI → AI Synthesizes Response → Streamed to User
```

**Function Calling Integration**:

- Use OpenAI Function Calling feature to let AI decide when and how to use tools
- Define tool functions in OpenAI API requests
- Parse function call responses and execute corresponding tool handlers
- Feed tool results back into conversation context

---

### Long-Term Memory System (Vector Store)

**Purpose**: Maintain extended conversational context and semantic search across historical interactions.

**Architecture**:

| Component          | Technology Choice                                    | Purpose                      |
| ------------------ | ---------------------------------------------------- | ---------------------------- |
| Vector Database    | Pinecone, Weaviate, or pgvector (Supabase extension) | Store embedding vectors      |
| Embedding Model    | OpenAI `text-embedding-3-small`                      | Generate semantic embeddings |
| Indexing Strategy  | Namespace per user/project                           | Isolate data                 |
| Retrieval Strategy | Semantic search with score threshold                 | Find relevant context        |

**Data Model**:

- **Memory Entry**: Unique ID, user_id, project_id, content text, embedding vector, timestamp, metadata (tags, run_id)
- **Indexing**: Automatic embedding generation on run creation
- **Namespace Organization**: `user_{user_id}_project_{project_id}`

**Memory Lifecycle**:

1. **Capture**: After each AI run, extract key information and store as memory entry
2. **Embed**: Generate vector embedding from content
3. **Index**: Store in vector database with metadata
4. **Retrieve**: Before new AI request, perform semantic search for relevant memories
5. **Inject**: Add top-K relevant memories to conversation context
6. **Prune**: Implement retention policies (time-based or count-based limits)

**Retrieval Strategy**:

- Query: User's current input or summarized intent
- Semantic Search: Top 5-10 most relevant memories based on cosine similarity
- Threshold: Minimum similarity score (e.g., 0.7) to filter noise
- Context Window Management: Balance between memories and current conversation

---

### Fine-Tuned Assistants per Project

**Purpose**: Allow users to create specialized AI assistants with custom instructions, knowledge bases, and behaviors per project.

**Assistant Configuration Model**:

| Field           | Type      | Description                                 |
| --------------- | --------- | ------------------------------------------- |
| assistant_id    | UUID      | Unique identifier                           |
| project_id      | UUID      | Associated project                          |
| name            | String    | Assistant name (e.g., "Python Code Expert") |
| instructions    | Text      | System prompt defining behavior             |
| model           | String    | Base model (gpt-4o, gpt-3.5-turbo)          |
| knowledge_files | Array     | Uploaded documents for RAG                  |
| tools_enabled   | Array     | Which AI tools are available                |
| temperature     | Float     | Creativity parameter                        |
| created_at      | Timestamp | Creation time                               |

**Knowledge Base (RAG)**:

- **Upload Interface**: Allow users to upload documents (PDF, TXT, MD, DOCX)
- **Processing**: Extract text, chunk into segments (512-1024 tokens)
- **Embedding**: Generate embeddings and store in vector database under assistant namespace
- **Retrieval**: Augment assistant context with relevant document chunks on each query

**Assistant API Integration**:

- Use OpenAI Assistants API if available, or implement custom logic
- Maintain conversation threads per session
- Store assistant state and thread history in database

**User Flow**:

1. Create project
2. Configure assistant (name, instructions, upload knowledge files)
3. All runs in that project use the configured assistant
4. Update assistant configuration anytime without losing history

---

### Custom Context per User/Workspace

**Purpose**: Enable users to define global preferences, company guidelines, or personal context that influences all AI interactions.

**Context Layers**:

1. **Global User Context**: Applies to all projects for a user
   - Preferred communication style
   - Industry domain
   - Technical proficiency level
   - Language preferences
   - Custom instructions

2. **Workspace Context**: Shared among team members in collaborative workspaces (future collaboration feature)
   - Company style guide
   - Technical stack
   - Compliance requirements
   - Brand voice

3. **Project Context**: Specific to individual projects (already supported via assistants)

**Storage Model**:

- **Table**: `user_contexts`
  - user_id, context_type (global, workspace), content (JSON), created_at, updated_at

- **Context Injection**: Prepend user context to system prompts automatically

**Context Management UI**:

- Settings panel for editing global context
- Template library for common professions (developer, writer, analyst)
- Preview how context affects AI responses

---

### AI Playground (OpenAI-Style)

**Purpose**: Provide an experimental environment for testing prompts, comparing models, and fine-tuning parameters without affecting project history.

**Playground Features**:

| Feature                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| Prompt Editor           | Multi-line text area with syntax highlighting                 |
| System Message          | Configurable system prompt                                    |
| Model Selector          | Dropdown with all available models                            |
| Parameter Controls      | Sliders for temperature, max_tokens, top_p, frequency_penalty |
| Multi-Turn Conversation | Add user/assistant messages to build conversation             |
| Response Display        | Formatted output with token count and latency                 |
| Save to Project         | Button to save successful experiments as runs                 |
| History                 | Recent playground sessions (not saved to projects by default) |

**Playground Data Model**:

- **Temporary Sessions**: Not persisted in projects/runs tables
- **Optional Save**: User can explicitly save a playground session as a project run
- **Local Storage**: Recent playground state cached in browser

**Comparison Mode**:

- Split-screen view to test same prompt across multiple models simultaneously
- Side-by-side output comparison
- Performance metrics (latency, token usage) for each model

---

### AI-Driven Actions

**Purpose**: Enable users to trigger high-level AI workflows with single commands that generate complete artifacts.

**Action Catalog**:

#### 1. Create Document

- **Trigger**: User command like "Create a business proposal for [topic]"
- **Process**:
  - AI generates full document structure
  - Sections: Introduction, Body, Conclusion
  - Export as Markdown or PDF
- **Output**: Downloadable document + saved to project

#### 2. Generate React Component

- **Trigger**: "Generate a React component for [description]"
- **Process**:
  - AI writes component code (TypeScript/JavaScript)
  - Includes props interface, state management, styling suggestions
  - Generates accompanying test file
- **Output**: Code files ready for download or copy

#### 3. Create API Endpoint

- **Trigger**: "Create an API for [resource]"
- **Process**:
  - AI generates Express route handler
  - Includes validation, database interaction, error handling
  - Suggests corresponding database schema
- **Output**: Code snippet + schema definition

#### 4. Design Workflow

- **Trigger**: "Design a workflow for [process]"
- **Process**:
  - AI generates Mermaid flowchart diagram
  - Describes each step with rationale
  - Suggests automation opportunities
- **Output**: Visual diagram + textual description

**Action Framework**:

- **Action Registry**: Catalog of available actions with templates
- **Parameter Extraction**: AI parses user intent to extract parameters
- **Template Engine**: Fills templates with AI-generated content
- **Validation**: Check generated artifacts for completeness
- **Delivery**: Present artifact with download/copy options

---

## Domain 2: Project and Productivity Features

### Task System within Projects

**Purpose**: Integrate a to-do list system with AI auto-completion and smart suggestions.

**Task Data Model**:

| Field        | Type      | Description                                |
| ------------ | --------- | ------------------------------------------ |
| task_id      | UUID      | Unique identifier                          |
| project_id   | UUID      | Associated project                         |
| title        | String    | Task description                           |
| status       | Enum      | pending, in_progress, completed, cancelled |
| priority     | Enum      | low, medium, high, urgent                  |
| due_date     | Date      | Optional deadline                          |
| assigned_to  | UUID      | User ID (for collaboration)                |
| ai_generated | Boolean   | Whether task was AI-created                |
| created_at   | Timestamp | Creation time                              |
| completed_at | Timestamp | Completion time                            |

**AI Auto-Complete Features**:

- **Smart Suggestions**: Based on project context, AI suggests next logical tasks
- **Task Breakdown**: User provides high-level goal, AI generates subtasks
- **Priority Assignment**: AI analyzes dependencies and suggests priority levels
- **Time Estimation**: AI estimates effort required for tasks

**User Interactions**:

- Manual task creation with inline editor
- Voice-to-task: Speak task description, AI parses and creates structured task
- Bulk import from text list or AI conversation
- Task completion triggers AI to suggest follow-up actions

---

### Kanban Board

**Purpose**: Visual project management with AI-generated boards, columns, and task organization.

**Board Structure**:

- **Columns**: Customizable stages (e.g., Backlog, To Do, In Progress, Review, Done)
- **Cards**: Tasks with title, priority badge, assignee avatar, tags
- **Drag-and-Drop**: Move tasks between columns
- **Swimlanes**: Optional grouping by priority or assignee

**AI-Powered Features**:

- **Auto-Generate Board**: AI analyzes project description and creates initial board structure
- **Smart Column Naming**: AI suggests column names based on workflow type
- **Task Prioritization**: AI reorders backlog by importance and dependencies
- **Workflow Optimization**: AI suggests column adjustments based on bottlenecks

**Data Model**:

- **Table**: `kanban_boards`
  - board_id, project_id, columns (JSON array), settings (JSON)

- **Table**: `kanban_cards` (or extend `tasks` table)
  - task_id, column_id, position (integer for ordering)

**Views**:

- Kanban board view (drag-and-drop UI)
- List view (traditional task list)
- Calendar view (tasks by due date)

---

### Intelligent Calendar

**Purpose**: Schedule tasks and AI sessions with smart time allocation and conflict detection.

**Calendar Features**:

| Feature            | Description                                    |
| ------------------ | ---------------------------------------------- |
| Task Scheduling    | Drag tasks onto calendar to assign dates/times |
| AI Session Blocks  | Reserve time slots for focused AI work         |
| Conflict Detection | Warn when tasks overlap or deadlines collide   |
| Smart Scheduling   | AI suggests optimal times based on priorities  |
| Recurring Tasks    | Support for daily, weekly, monthly patterns    |
| Reminders          | Email or in-app notifications before deadlines |

**AI Scheduling Logic**:

- Analyze task priorities, estimated durations, and dependencies
- Propose daily/weekly schedule that balances workload
- Detect overcommitments and suggest task rescheduling
- Learn user's productive hours and prefer those for complex tasks

**Data Model**:

- **Table**: `calendar_events`
  - event_id, user_id, project_id, task_id, start_time, end_time, recurrence_rule, reminder_settings

**Integration**:

- Sync with external calendars (Google Calendar, Outlook) via APIs
- Export project timeline as iCal file

---

### Project Insights Dashboard

**Purpose**: Provide automated summaries, pending items, risk analysis, and project health metrics.

**Insight Types**:

#### 1. Project Summary

- **Content**: AI-generated executive summary of project status
- **Update Frequency**: Daily or on-demand
- **Sections**: Completed work, current focus, upcoming milestones

#### 2. Pending Items

- **Content**: List of incomplete tasks, open questions, blockers
- **AI Analysis**: Identify critical path items and bottlenecks

#### 3. Risk Analysis

- **Content**: Potential issues, missed deadlines, resource constraints
- **AI Detection**: Patterns indicating project drift or scope creep
- **Mitigation Suggestions**: AI-recommended actions to address risks

#### 4. Progress Metrics

- **Visualizations**: Task completion rate, velocity trends, burndown charts
- **Comparisons**: Current sprint vs. historical performance

**Data Sources**:

- Tasks and completion status
- Run history and AI interaction frequency
- Time tracking data (if implemented)
- User-provided milestones

**UI Presentation**:

- Dashboard widget with collapsible sections
- Refresh button to regenerate insights with latest data
- Export insights as report (PDF, Markdown)

---

### Project Versioning System

**Purpose**: Track changes to projects, sessions, and runs over time with the ability to revert or compare versions.

**Versioning Strategy**:

- **Snapshots**: Periodic captures of project state (tasks, runs, configurations)
- **Event Log**: Append-only log of all changes (audit trail)
- **Tags**: User-defined version markers (v1.0, beta-release)

**Version Data Model**:

| Field         | Type      | Description               |
| ------------- | --------- | ------------------------- |
| version_id    | UUID      | Unique version identifier |
| project_id    | UUID      | Associated project        |
| snapshot_data | JSONB     | Serialized project state  |
| version_tag   | String    | User-provided label       |
| created_at    | Timestamp | Snapshot time             |
| created_by    | UUID      | User who created version  |

**Versioning Operations**:

- **Create Snapshot**: Manual or automatic (daily, on milestone)
- **View Version**: Browse historical project states read-only
- **Restore Version**: Revert project to previous state (with confirmation)
- **Compare Versions**: Diff view showing changes between two snapshots

**Session and Run Versioning**:

- Sessions already have temporal ordering via timestamps
- Runs immutable once created (no editing)
- Soft delete for runs (retain in database but hide from UI) instead of hard delete

---

### Run Comparison (Diff)

**Purpose**: Compare two runs to identify differences in inputs, outputs, models, or parameters.

**Comparison Features**:

| Aspect              | Comparison Method                      |
| ------------------- | -------------------------------------- |
| Input Text          | Side-by-side diff highlighting changes |
| Output Text         | Word-level or line-level diff          |
| Model/Parameters    | Table showing parameter differences    |
| Performance         | Token usage, latency, cost comparison  |
| Semantic Similarity | AI-generated similarity score          |

**Diff Algorithms**:

- **Text Diff**: Use Myers diff algorithm or similar (library: `diff` or `fast-diff`)
- **Semantic Diff**: Generate embeddings and compute cosine similarity
- **Visualization**: Color-coded additions (green), deletions (red), unchanged (gray)

**User Flow**:

1. Select two runs from project history
2. Click "Compare" button
3. View side-by-side comparison with highlighted differences
4. Option to export comparison report

**Use Cases**:

- A/B testing different prompts or models
- Debugging regressions in AI output quality
- Analyzing impact of parameter changes

---

### Global Intelligent Search

**Purpose**: Search across runs, sessions, tags, and AI-generated content with semantic understanding.

**Search Scopes**:

- **Runs**: Search input and output text
- **Sessions**: Find sessions by topic or keywords
- **Tags**: Filter by tags (exact match or fuzzy)
- **Projects**: Search project names and descriptions
- **Tasks**: Search task titles and descriptions

**Search Modes**:

1. **Keyword Search**: Traditional full-text search using PostgreSQL `tsvector` or Elasticsearch
2. **Semantic Search**: Vector similarity search using embeddings
3. **Hybrid Search**: Combine keyword relevance and semantic similarity scores

**Search Features**:

| Feature         | Description                                |
| --------------- | ------------------------------------------ |
| Auto-Complete   | Suggest queries as user types              |
| Filters         | Narrow by date range, project, model, tags |
| Sorting         | By relevance, date, project                |
| Result Previews | Show snippet with highlighted matches      |
| Search History  | Recent searches saved for quick access     |

**Implementation**:

- **Database**: PostgreSQL full-text search with `tsvector` columns
- **Vector Search**: Integrate with vector store for semantic queries
- **API Endpoint**: `/api/search?q=<query>&scope=<runs|sessions|all>&filters=<JSON>`

**Search Index Maintenance**:

- Automatically index new runs and sessions on creation
- Re-index when content is updated
- Periodic cleanup of orphaned index entries

---

## Domain 3: Real-Time Collaboration

### Project Invitation System

**Purpose**: Enable users to invite collaborators to projects with role-based access control.

**User Roles**:

| Role   | Permissions                                                     |
| ------ | --------------------------------------------------------------- |
| Owner  | Full control: edit project, invite/remove users, delete project |
| Editor | Create/edit runs, tasks, sessions; cannot manage users          |
| Viewer | Read-only access to all project content                         |

**Data Model**:

- **Table**: `project_members`
  - member_id (UUID), project_id (UUID), user_id (UUID), role (enum), invited_by (UUID), invited_at (timestamp), accepted_at (timestamp)

- **Table**: `project_invitations`
  - invitation_id (UUID), project_id (UUID), email (string), role (enum), token (string), expires_at (timestamp), status (pending/accepted/rejected)

**Invitation Flow**:

1. Owner enters collaborator email and selects role
2. System generates unique invitation token
3. Email sent with invitation link containing token
4. Recipient clicks link, logs in or registers
5. Token validated, user added to project_members
6. Invitation marked as accepted

**Access Control**:

- Extend Row Level Security (RLS) policies to check project_members table
- Middleware validates user's role before allowing operations
- UI elements conditionally rendered based on role

**Invitation Management**:

- View pending invitations
- Resend invitation email
- Revoke pending invitations
- Remove existing members (owner only)
- Transfer ownership

---

### Real-Time Collaborative Chat

**Purpose**: Enable team members to discuss projects in real-time with presence indicators and typing status.

**Chat Architecture**:

- **Transport**: WebSocket connections for real-time messaging
- **Message Broker**: Redis Pub/Sub for scaling across multiple server instances
- **Storage**: Messages persisted in database for history

**Chat Data Model**:

- **Table**: `chat_messages`
  - message_id (UUID), project_id (UUID), user_id (UUID), content (text), message_type (text/system/ai_mention), created_at (timestamp), edited_at (timestamp), deleted_at (timestamp)

- **Table**: `chat_reactions`
  - reaction_id (UUID), message_id (UUID), user_id (UUID), emoji (string), created_at (timestamp)

**Real-Time Features**:

| Feature           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Typing Indicators | Show "User is typing..." when collaborator composes message |
| Presence Status   | Online/away/offline indicators                              |
| Message Delivery  | Real-time message delivery without page refresh             |
| Read Receipts     | Track when messages are seen                                |
| Notifications     | Desktop/mobile notifications for new messages               |

**Message Types**:

- **Text Messages**: Standard chat messages
- **System Messages**: Automated notifications (user joined, task completed)
- **AI Mentions**: Tag AI to answer questions directly in chat
- **Rich Content**: Links, code snippets, file attachments

**Chat UI Components**:

- Chat panel (collapsible sidebar or dedicated tab)
- Message list with infinite scroll
- Input field with emoji picker and file upload
- User list with presence indicators

---

### Run Comments

**Purpose**: Allow team members to discuss specific AI runs with threaded comments.

**Comment Data Model**:

- **Table**: `run_comments`
  - comment_id (UUID), run_id (UUID), user_id (UUID), parent_comment_id (UUID, nullable), content (text), created_at (timestamp), updated_at (timestamp), deleted_at (timestamp)

**Comment Features**:

- **Threaded Discussions**: Reply to comments to create conversation threads
- **Mentions**: @mention team members to notify them
- **Reactions**: Add emoji reactions to comments
- **Editing**: Edit own comments with edit history
- **Deletion**: Soft delete (mark as deleted but retain in database)

**Real-Time Updates**:

- WebSocket notifications when new comments are added
- Live comment count badge on runs
- Push notifications for mentions

**Access Control**:

- Only project members can comment
- Users can edit/delete only their own comments
- Owners can moderate (delete any comment)

**UI Integration**:

- Comment icon on each run in history
- Click to expand comment thread
- Inline comment composer
- Comment count indicator

---

### Shared Session Editing (Google Docs Style)

**Purpose**: Enable multiple users to collaboratively edit and interact with the same AI session in real-time.

**Collaborative Editing Architecture**:

- **Operational Transformation (OT)** or **Conflict-Free Replicated Data Types (CRDTs)** for conflict resolution
- **Libraries**: Use `ShareDB` or `Yjs` for collaborative editing framework
- **State Synchronization**: Broadcast cursor positions, selections, and edits

**Shared Session Features**:

| Feature              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| Live Cursors         | See collaborators' cursor positions with name labels      |
| Simultaneous Editing | Multiple users type in shared input field                 |
| Turn-Based Input     | Optional mode where users take turns querying AI          |
| Shared Output        | All collaborators see AI responses in real-time           |
| Version History      | Track who made which contributions                        |
| Merge Conflicts      | Automatic resolution with last-write-wins or manual merge |

**Session Locking**:

- **Optimistic Locking**: Allow concurrent edits with automatic merge
- **Pessimistic Locking**: Lock session when user starts editing (optional mode)
- **Lock Timeout**: Auto-release locks after inactivity

**Data Model**:

- **Table**: `session_collaborators`
  - session_id (UUID), user_id (UUID), cursor_position (integer), last_active (timestamp)

- **Real-Time State**: Stored in Redis for low-latency access

**User Experience**:

- Avatar badges showing active collaborators
- Color-coded cursors and selections per user
- Activity log showing who added which runs
- Notification when collaborator joins/leaves session

---

### Activity Log (Audit Trail)

**Purpose**: Comprehensive audit trail of all project activities for transparency and debugging.

**Activity Types**:

- Project created/updated/deleted
- User invited/joined/removed
- Run created/deleted
- Task created/updated/completed
- Comment added/edited/deleted
- Session started/ended
- File uploaded/deleted
- Settings changed

**Activity Data Model**:

- **Table**: `activity_log`
  - activity_id (UUID), project_id (UUID), user_id (UUID), action_type (enum), entity_type (enum), entity_id (UUID), details (JSONB), created_at (timestamp)

**Activity Details Structure** (JSONB):

```
{
  "action": "task_completed",
  "task_title": "Implement feature X",
  "previous_status": "in_progress",
  "new_status": "completed"
}
```

**Activity Feed UI**:

- Chronological list of activities with timestamps
- User avatars and action descriptions
- Filter by activity type, user, date range
- Expandable details for complex activities
- Export activity log as CSV or JSON

**Real-Time Updates**:

- WebSocket push of new activities to connected clients
- Live activity feed updates without refresh
- Notification badges for new activities

**Retention Policy**:

- Retain activities indefinitely for Free/Pro plans
- Configurable retention for Enterprise (e.g., 1 year, 5 years)
- Data export before deletion for compliance

---

## Domain 4: Advanced Security and Authentication

### OAuth Integration

**Purpose**: Simplify authentication with social login providers for better user experience and security.

**Supported Providers**:

- **Google**: OAuth 2.0 via Google Identity Platform
- **GitHub**: OAuth 2.0 via GitHub Apps
- **Microsoft**: OAuth 2.0 via Microsoft Identity Platform (Azure AD)

**Implementation Strategy**:

- **Supabase Auth**: Leverage Supabase's built-in OAuth support
- **Configuration**: Add provider credentials in Supabase dashboard
- **Callback Handling**: Supabase handles OAuth flow and token exchange
- **Profile Linking**: Map OAuth profile to WADI user profile

**OAuth Flow**:

1. User clicks "Sign in with Google/GitHub/Microsoft"
2. Redirect to provider's authorization page
3. User grants permissions
4. Provider redirects back with authorization code
5. Supabase exchanges code for access token
6. User authenticated, profile created/updated
7. Redirect to application dashboard

**Account Linking**:

- Users can link multiple OAuth providers to one account
- Email verification to prevent unauthorized linking
- Unlink providers with password fallback requirement

**Data Model**:

- **Table**: `oauth_connections`
  - connection_id (UUID), user_id (UUID), provider (enum), provider_user_id (string), email (string), connected_at (timestamp)

---

### Two-Factor Authentication (2FA)

**Purpose**: Add extra security layer requiring password + verification code.

**2FA Methods**:

| Method            | Implementation                                   |
| ----------------- | ------------------------------------------------ |
| Email OTP         | Send 6-digit code to user's email                |
| Authenticator App | TOTP using apps like Google Authenticator, Authy |
| SMS (Optional)    | Send code via Twilio (costly, less secure)       |

**2FA Setup Flow**:

1. User enables 2FA in account settings
2. System generates TOTP secret
3. Display QR code for authenticator app scanning
4. User enters verification code to confirm setup
5. System provides recovery codes for backup
6. 2FA active on next login

**Login Flow with 2FA**:

1. User enters email and password
2. System validates credentials
3. Prompt for 2FA code
4. User enters code from authenticator app or email
5. System validates code (time-based, valid for 30-60 seconds)
6. Authentication complete, session created

**Recovery Codes**:

- Generate 10 single-use recovery codes during 2FA setup
- Allow login when authenticator unavailable
- Mark used codes, prompt to regenerate when low
- Store hashed in database

**Data Model**:

- **Table**: `user_2fa`
  - user_id (UUID), method (enum), secret (encrypted string), backup_codes (encrypted array), enabled_at (timestamp)

**Library Support**:

- **TOTP Generation**: Use `speakeasy` or `otplib` library
- **QR Code**: Use `qrcode` library to generate QR images

---

### Role-Based Access Control (RBAC) with Extended RLS

**Purpose**: Fine-grained permission control beyond simple owner/editor/viewer roles.

**Permission Model**:

- **Resources**: Projects, Runs, Tasks, Sessions, Comments, Settings
- **Actions**: Create, Read, Update, Delete, Share, Export, Configure
- **Roles**: Predefined sets of permissions

**Advanced Roles**:

| Role        | Permissions Summary                                |
| ----------- | -------------------------------------------------- |
| Owner       | All permissions                                    |
| Admin       | All except delete project and manage ownership     |
| Editor      | Create/edit content, cannot invite users           |
| Contributor | Create runs and tasks, cannot edit others' content |
| Commenter   | Read content, add comments only                    |
| Viewer      | Read-only access                                   |

**Permission Matrix** (example):

| Resource       | Owner | Admin | Editor | Contributor | Commenter | Viewer |
| -------------- | ----- | ----- | ------ | ----------- | --------- | ------ |
| Create Run     | ✓     | ✓     | ✓      | ✓           | ✗         | ✗      |
| Delete Run     | ✓     | ✓     | ✓      | Own only    | ✗         | ✗      |
| Invite User    | ✓     | ✓     | ✗      | ✗           | ✗         | ✗      |
| Add Comment    | ✓     | ✓     | ✓      | ✓           | ✓         | ✗      |
| Export Project | ✓     | ✓     | ✓      | ✗           | ✗         | ✗      |

**RLS Policy Implementation**:

- Extend Supabase RLS policies to check user role from `project_members` table
- Example policy:
  ```
  Policy: Users can delete runs if they are owner or admin, or if they created the run
  Condition:
    - user_id matches run creator OR
    - user is member with role 'owner' or 'admin'
  ```

**Dynamic Permission Checks**:

- Backend middleware function: `hasPermission(userId, projectId, resource, action)`
- Frontend guards: Conditionally render UI elements based on permissions
- API endpoints validate permissions before processing requests

---

### Session Management with Refresh Tokens

**Purpose**: Secure, long-lived authentication without frequent logins using access and refresh token pattern.

**Token Strategy**:

| Token Type    | Lifespan        | Purpose                   |
| ------------- | --------------- | ------------------------- |
| Access Token  | 15-60 minutes   | Authenticate API requests |
| Refresh Token | 7-30 days       | Obtain new access tokens  |
| Session Token | Same as refresh | Identify user session     |

**Authentication Flow**:

1. User logs in with credentials
2. Server generates access token (JWT) and refresh token (opaque)
3. Tokens sent to client (access in memory, refresh in httpOnly cookie)
4. Client includes access token in API requests (Authorization header)
5. When access token expires, client uses refresh token to get new access token
6. Refresh token rotation: issue new refresh token each time old one is used

**Token Storage**:

- **Access Token**: Client-side memory (not localStorage to prevent XSS)
- **Refresh Token**: httpOnly, secure, SameSite cookie (prevent CSRF and XSS)
- **Session Mapping**: Server-side database table linking refresh tokens to users

**Data Model**:

- **Table**: `refresh_tokens`
  - token_id (UUID), user_id (UUID), token_hash (string), expires_at (timestamp), created_at (timestamp), revoked_at (nullable timestamp)

**Token Revocation**:

- User logout: Revoke refresh token
- Password change: Revoke all user's refresh tokens
- Suspicious activity: Admin can revoke tokens
- Automatic cleanup of expired tokens (scheduled job)

**Security Enhancements**:

- Store only hashed refresh tokens in database
- Bind tokens to user agent or IP (optional, balance security vs. usability)
- Rate limit refresh token requests
- Alert user on new device login

---

### API Rate Limiting

**Purpose**: Prevent abuse, ensure fair resource usage, and protect against DDoS attacks.

**Rate Limiting Strategies**:

| Strategy            | Description                                       |
| ------------------- | ------------------------------------------------- |
| Per-User Limits     | Different limits based on subscription plan       |
| Per-Endpoint Limits | Stricter limits on expensive operations (AI runs) |
| Per-IP Limits       | Prevent brute-force attacks on login              |
| Global Limits       | Overall system capacity constraints               |

**Rate Limit Tiers**:

| Plan       | AI Runs/Hour | API Requests/Minute | WebSocket Connections |
| ---------- | ------------ | ------------------- | --------------------- |
| Free       | 10           | 30                  | 2 concurrent          |
| Pro        | 100          | 120                 | 10 concurrent         |
| Enterprise | Custom       | Custom              | Unlimited             |

**Implementation**:

- **Library**: Use `express-rate-limit` middleware
- **Storage**: Redis for distributed rate limit counters
- **Algorithm**: Token bucket or sliding window

**Rate Limit Responses**:

- **HTTP 429 Too Many Requests** when limit exceeded
- Response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Timestamp when limit resets
- Client-side handling: Display warning, queue requests, show upgrade prompt

**Bypass Mechanisms**:

- Whitelist trusted IPs (internal services)
- API keys with elevated limits for integrations
- Enterprise customers with custom limits

---

### User and Project API Keys

**Purpose**: Allow programmatic access to WADI platform via API keys for integrations and automation.

**API Key Types**:

| Type            | Scope                             | Use Case                    |
| --------------- | --------------------------------- | --------------------------- |
| User API Key    | Access to all user's projects     | Personal automation scripts |
| Project API Key | Access to specific project only   | Third-party integrations    |
| Temporary Key   | Limited lifespan (e.g., 24 hours) | One-time data imports       |

**API Key Data Model**:

- **Table**: `api_keys`
  - key_id (UUID), user_id (UUID), project_id (nullable UUID), key_hash (string), name (string), permissions (array), expires_at (nullable timestamp), created_at (timestamp), last_used_at (timestamp)

**Key Generation**:

1. User creates API key in settings
2. System generates random key (e.g., `wadi_ak_...` prefix + 32 random characters)
3. Display key ONCE to user with copy button
4. Store only hashed key in database (bcrypt or SHA-256)
5. Associate key with permissions and expiration

**Authentication**:

- Client includes API key in request header: `Authorization: Bearer <api_key>`
- Middleware validates key, checks expiration and permissions
- Rate limits apply based on key's associated plan

**API Key Management**:

- List all API keys (name, last used, created date)
- Revoke keys immediately
- Set expiration dates
- Scope permissions (read-only, write, admin)
- Regenerate keys with confirmation

**Security Best Practices**:

- Never log full API keys
- Rotate keys regularly (prompt user every 90 days)
- Detect and alert on unusual usage patterns
- Require re-authentication for key creation/deletion

---

### Encryption of Sensitive Runs

**Purpose**: Protect confidential AI interactions with end-to-end or at-rest encryption.

**Encryption Strategies**:

1. **At-Rest Encryption**: Encrypt run data in database
2. **In-Transit Encryption**: HTTPS/TLS for all communications (already standard)
3. **End-to-End Encryption (E2EE)**: User-controlled encryption keys (advanced)

**At-Rest Encryption Implementation**:

- **Field-Level Encryption**: Encrypt `input` and `output` fields in `runs` table
- **Encryption Algorithm**: AES-256-GCM
- **Key Management**: Store encryption keys in secure vault (AWS KMS, HashiCorp Vault, or environment variables)
- **Per-User Keys** (optional): Each user has unique encryption key for their runs

**Encryption Flow**:

1. User creates AI run
2. Before saving, server encrypts input and output fields
3. Store encrypted data and initialization vector (IV) in database
4. On retrieval, server decrypts data before sending to client

**Encrypted Run Marking**:

- **Table Field**: `runs.is_encrypted` (boolean)
- UI indicator (lock icon) for encrypted runs
- Search limitations: Encrypted runs not searchable by content (only metadata)

**User Control**:

- Setting to enable encryption for specific projects
- Option to encrypt individual runs
- Enterprise feature: Mandatory encryption for all runs

**Trade-offs**:

- **Pros**: Protects data even if database is compromised
- **Cons**: Reduced search functionality, performance overhead, key management complexity

---

## Domain 5: Professional UI/UX System

### Light and Dark Theme with Auto-Detection

**Purpose**: Provide theme options that respect user preferences and system settings.

**Theme Options**:

- **Light Theme**: High contrast, bright backgrounds
- **Dark Theme**: Low light, dark backgrounds, reduced eye strain
- **Auto Mode**: Match system theme preference (OS-level)
- **Custom Themes** (future): User-defined color palettes

**Implementation**:

- **Detection**: Use `window.matchMedia('(prefers-color-scheme: dark)')` API
- **State Management**: Store theme preference in user settings (database) and localStorage
- **CSS Variables**: Define theme colors as CSS custom properties
- **Theme Toggle**: UI control in header or settings panel

**Theme Persistence**:

- Save user preference to `user_settings` table
- Override system preference if user explicitly chooses theme
- Sync theme across devices via backend storage

**Accessibility**:

- Ensure sufficient contrast ratios (WCAG AA compliance)
- Test with color blindness simulators
- Provide high-contrast mode option

---

### Component Design System (Radix UI Style)

**Purpose**: Build a consistent, accessible, professional component library.

**Design Principles**:

- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- **Consistency**: Unified visual language across all components
- **Customization**: Theming support with CSS variables
- **Performance**: Lightweight, tree-shakeable components

**Core Components**:

| Component     | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| Button        | Primary, secondary, ghost, danger variants           |
| Input         | Text, number, email, password with validation states |
| Select        | Dropdown with search and multi-select                |
| Modal         | Overlay dialogs with focus trapping                  |
| Tooltip       | Contextual hints on hover/focus                      |
| Dropdown Menu | Action menus with keyboard navigation                |
| Tabs          | Content organization with lazy loading               |
| Card          | Content containers with consistent spacing           |
| Badge         | Status indicators and tags                           |
| Avatar        | User profile images with fallback initials           |
| Progress Bar  | Loading states and task completion                   |
| Toast         | Non-intrusive notifications                          |

**Component Library Choice**:

- **Option 1**: Use Radix UI primitives + custom styling (recommended for full control)
- **Option 2**: Adopt existing design system like Chakra UI, Mantine, or shadcn/ui
- **Option 3**: Build from scratch (time-intensive but fully custom)

**Styling Approach**:

- **CSS-in-JS**: Styled-components or Emotion for dynamic theming
- **Utility-First**: Tailwind CSS for rapid development
- **CSS Modules**: Scoped styles for component isolation

**Storybook Integration**:

- Document components with interactive examples
- Visual regression testing
- Design review tool for stakeholders

---

### Dashboard with Metrics and Activity

**Purpose**: Centralized overview of user's projects, AI activity, and platform usage.

**Dashboard Sections**:

#### 1. Overview Panel

- Welcome message with user name
- Quick stats: Total projects, AI runs today, tasks completed this week
- Recent activity timeline (last 10 actions)

#### 2. Projects Grid

- Card-based layout showing all projects
- Each card displays: project name, description, last activity, member count, task progress
- Quick actions: Open project, view insights, settings
- Filter and sort options

#### 3. AI Activity Metrics

- **Visualizations**: Line charts showing runs per day/week, bar charts for models used
- **Token Usage**: Cumulative token consumption with plan limit indicator
- **Cost Tracking**: Estimated costs based on token usage (for Pro/Enterprise)
- **Favorite Models**: Most frequently used AI models

#### 4. Upcoming Deadlines

- Calendar widget showing tasks due in next 7 days
- Overdue task warnings in red
- Click to navigate to task

#### 5. Team Activity (Collaborative Projects)

- Recent actions by team members
- Active sessions with collaborator presence
- Unread comments count

**Dashboard Customization**:

- Drag-and-drop widget rearrangement
- Show/hide widgets based on preference
- Save layout to user settings

**Data Aggregation**:

- Real-time queries for live stats (with caching for performance)
- Background jobs to pre-calculate daily/weekly metrics
- Redis cache for frequently accessed dashboard data

---

### Markdown Editor with Live Preview

**Purpose**: Enable rich text editing for project descriptions, documentation, and notes.

**Editor Features**:

| Feature             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| Syntax Highlighting | Code blocks with language detection                      |
| Live Preview        | Split-pane showing rendered Markdown                     |
| Toolbar             | Quick formatting buttons (bold, italic, headings, lists) |
| Image Upload        | Drag-and-drop images, generate embed links               |
| Table Editor        | Visual table creation and editing                        |
| Emoji Picker        | Insert emojis via shortcodes or picker                   |
| Link Insertion      | Auto-complete for internal project links                 |

**Editor Implementation**:

- **Library Choice**: CodeMirror 6, Monaco Editor, or TipTap
- **Markdown Parser**: `marked` or `remark` for rendering
- **Syntax Highlighting**: `highlight.js` or `prism.js` for code blocks

**Preview Modes**:

- **Split View**: Editor on left, preview on right
- **Toggle View**: Switch between editor and preview
- **Inline Preview**: Render elements in-place (WYSIWYG style)

**Auto-Save**:

- Save draft to localStorage every 10 seconds
- Cloud sync on blur or manual save
- Restore unsaved content on browser crash

**Use Cases**:

- Project README editing
- Task descriptions with formatting
- AI-generated documentation refinement
- Personal notes and knowledge base

---

### AI Prompt Editor with Blocks (Notion AI Style)

**Purpose**: Structured prompt building with reusable blocks and templates.

**Block Types**:

| Block Type          | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| Text Block          | Free-form text input                              |
| Variable Block      | Dynamic placeholders (user name, project context) |
| Context Block       | Inject project data, previous runs, memory        |
| Instruction Block   | System-level directives for AI behavior           |
| Example Block       | Few-shot examples for AI guidance                 |
| Output Format Block | Define expected response structure                |

**Block Editor Features**:

- **Drag-and-Drop Reordering**: Rearrange blocks to adjust prompt flow
- **Block Templates**: Save common block combinations as templates
- **Inline AI Suggestions**: AI recommends blocks based on intent
- **Syntax Validation**: Check for invalid placeholders or format errors

**Prompt Composition Flow**:

1. User creates new prompt
2. Adds text block with base query
3. Inserts context block to include project description
4. Adds instruction block specifying tone and format
5. Previews composed prompt before sending
6. Executes AI run with assembled prompt

**Prompt Library**:

- **User Templates**: Save personal prompts for reuse
- **Community Templates**: Share and discover prompts (marketplace)
- **Version Control**: Track changes to prompt templates

**Variable System**:

- `{{user.name}}`: Current user's name
- `{{project.description}}`: Project description
- `{{context.last_run}}`: Output from previous run
- `{{date.today}}`: Current date
- Custom variables defined by user

---

### Mobile-Responsive Design

**Purpose**: Ensure full functionality and optimal UX on smartphones and tablets.

**Responsive Breakpoints**:

| Breakpoint | Width      | Layout Adjustments                                |
| ---------- | ---------- | ------------------------------------------------- |
| Mobile     | < 640px    | Single column, hamburger menu, stacked components |
| Tablet     | 640-1024px | Two-column where appropriate, collapsible sidebar |
| Desktop    | > 1024px   | Multi-column, persistent sidebar, wide dashboard  |

**Mobile-Specific Features**:

- **Touch Gestures**: Swipe to navigate, pull-to-refresh
- **Bottom Navigation**: Thumb-friendly navigation bar
- **Floating Action Button (FAB)**: Quick access to create new run or task
- **Condensed UI**: Smaller fonts, tighter spacing, hidden secondary elements
- **Offline Support**: Service workers to cache critical resources

**Responsive Components**:

- **Navigation**: Hamburger menu with slide-out drawer on mobile
- **Tables**: Horizontal scroll or card-based representation
- **Modals**: Full-screen on mobile, centered overlay on desktop
- **Forms**: Larger input fields for touch, single-column layout

**Testing Strategy**:

- Test on real devices (iOS Safari, Android Chrome)
- Use browser dev tools device emulation
- Validate touch target sizes (minimum 44x44px)
- Ensure readable font sizes without zoom (16px minimum)

---

### Presentation Mode

**Purpose**: Display AI runs and project content in a clean, distraction-free format for presentations or sharing.

**Presentation Features**:

- **Full-Screen Mode**: Hide all UI chrome (sidebars, headers)
- **Clean Typography**: Large, readable fonts optimized for projection
- **Navigation Controls**: Keyboard arrows or on-screen buttons to step through runs
- **Progress Indicator**: Show current run position (e.g., "Run 3 of 15")
- **Slide Transitions**: Smooth animations between runs
- **Dark/Light Presenter Modes**: Choose theme suitable for room lighting

**Presentation Flow**:

1. User selects project or session to present
2. Clicks "Presentation Mode" button
3. Enters full-screen with first run displayed
4. Use arrow keys or buttons to navigate between runs
5. Press Escape to exit presentation mode

**Customization Options**:

- Show/hide input vs. output
- Display metadata (model, timestamp, tokens)
- Include or exclude specific runs
- Add presenter notes (visible only to presenter, not audience)

**Export Presentation**:

- Generate static HTML presentation (similar to reveal.js)
- Export as PDF with one run per page
- Share public link with read-only presentation view

---

### Dynamic Animated Backgrounds

**Purpose**: Enhance visual appeal with animated gradient, galaxy, or glassmorphic backgrounds.

**Background Themes**:

| Theme          | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| Gradient Flow  | Slow-moving color gradients (CSS animations)                  |
| Particle Stars | Animated star field with parallax effect                      |
| Glassmorphism  | Frosted glass panels with backdrop blur                       |
| Mesh Gradient  | Dynamic 3D mesh with lighting effects                         |
| Minimalist     | Solid color or subtle texture (default, performance-friendly) |

**Implementation**:

- **CSS Animations**: For gradients and simple effects (lightweight)
- **Canvas/WebGL**: For particle systems and complex animations (GPU-accelerated)
- **Library**: Three.js for 3D effects, particles.js for particle systems

**Performance Considerations**:

- Provide toggle to disable animations (user preference)
- Detect low-end devices and default to minimalist theme
- Use `requestAnimationFrame` for smooth 60fps animations
- Lazy load animation libraries only when theme selected

**User Controls**:

- Background selector in settings
- Intensity slider (subtle to vibrant)
- Animation speed control
- Option to disable on battery power (mobile)

---

## Domain 6: Export and Import Capabilities

### Export Projects to Multiple Formats

**Purpose**: Allow users to extract project data in various formats for documentation, sharing, or archival.

**Export Formats**:

#### 1. Markdown Export

- **Structure**:
  - Project metadata (name, description, creation date)
  - Table of contents linking to sessions
  - Each run formatted as heading with input/output
  - Code blocks for code outputs
- **File**: `project-name.md`

#### 2. PDF Export

- **Styling**: Professional document layout with headers, footers, page numbers
- **Content**: Same as Markdown but formatted for print
- **Library**: Use `puppeteer` to render HTML and convert to PDF
- **File**: `project-name.pdf`

#### 3. Interactive HTML Export

- **Features**: Self-contained HTML file with embedded styles and JavaScript
- **Navigation**: Sidebar for sessions, clickable run history
- **Search**: Client-side search functionality
- **Theming**: Embedded light/dark theme toggle
- **File**: `project-name.html` (single file or ZIP with assets)

#### 4. JSON Export

- **Structure**: Complete data dump in JSON format
- **Schema**:
  ```
  {
    "project": { metadata },
    "sessions": [ array of sessions ],
    "runs": [ array of runs with full data ],
    "tasks": [ array of tasks ],
    "comments": [ array of comments ]
  }
  ```
- **Use Case**: Data migration, backup, programmatic processing
- **File**: `project-name.json`

#### 5. ZIP Archive

- **Contents**: All formats above bundled together
- **Additional**: Uploaded files, images, attachments
- **Structure**:
  ```
  project-name.zip
  ├── project.json
  ├── project.md
  ├── project.pdf
  ├── project.html
  └── attachments/
      ├── file1.pdf
      └── image1.png
  ```
- **File**: `project-name.zip`

**Export Options**:

- **Scope**: Full project, specific session, date range, selected runs
- **Privacy**: Include or exclude comments, collaborator names
- **Formatting**: Custom templates for PDF/HTML export

**Export UI**:

- Export button in project settings or header
- Modal with format selection and options
- Progress indicator for large exports
- Download link or email delivery for very large files

**API Endpoint**:

- `POST /api/projects/:id/export`
- Request body: `{ format: 'pdf', scope: 'all', options: {...} }`
- Response: Download URL or streaming file

---

### Import Files to Initialize Projects

**Purpose**: Quickly bootstrap projects by importing existing documents.

**Supported Import Formats**:

| Format   | Processing                                                             |
| -------- | ---------------------------------------------------------------------- |
| PDF      | Extract text, create initial project description and context           |
| TXT      | Plain text import, use as project description or first run input       |
| Markdown | Parse structure, create project + optionally create runs from sections |
| DOCX     | Extract text and formatting, convert to Markdown                       |
| JSON     | Restore previously exported WADI project                               |

**Import Flow**:

1. User clicks "Import" or "Create from File"
2. Upload file via drag-and-drop or file picker
3. System detects file type and extracts content
4. Display preview with editable fields (project name, description)
5. User confirms, system creates project with imported data
6. Optionally, create first AI run to summarize or analyze imported content

**Text Extraction**:

- **PDF**: Use `pdf-parse` library
- **DOCX**: Use `mammoth` library to convert to Markdown
- **TXT/MD**: Direct file read

**Smart Project Initialization**:

- AI analyzes imported content to suggest project name and description
- Extract keywords and create initial tags
- Identify sections and create tasks or runs from them

**Data Validation**:

- Check file size limits (e.g., max 10MB for Free plan)
- Validate file types to prevent malicious uploads
- Sanitize extracted text to prevent injection attacks

---

### Session Reconstruction from Exported Files

**Purpose**: Restore complete project state from previously exported JSON or ZIP files.

**Reconstruction Process**:

1. User uploads exported JSON or ZIP file
2. System validates file structure and schema version
3. Parse project metadata, sessions, runs, tasks, comments
4. Create new project with imported data (or overwrite existing with confirmation)
5. Regenerate embeddings for vector store if long-term memory enabled
6. Restore collaborator references (if users exist in system)
7. Display success message with link to reconstructed project

**Conflict Resolution**:

- **IDs**: Generate new UUIDs to avoid conflicts, maintain internal references
- **Users**: Map original user IDs to current users, or mark as "External User"
- **Timestamps**: Preserve original timestamps but add import metadata

**Import Modes**:

- **New Project**: Create fresh project from import
- **Merge**: Add imported sessions/runs to existing project
- **Replace**: Overwrite existing project (with backup)

**Version Compatibility**:

- Check export schema version
- Provide migration logic for older export formats
- Warn user if import from newer version (unsupported fields)

**API Endpoint**:

- `POST /api/projects/import`
- Request: Multipart form with file upload
- Response: Created project ID and summary

---

## Domain 7: External Integrations

### GitHub Integration

**Purpose**: Enable AI to analyze GitHub repositories, access issues, pull requests, and code.

**Integration Capabilities**:

| Feature             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| Repository Analysis | AI reads README, analyzes file structure, summarizes purpose |
| Issue Exploration   | Fetch and discuss open issues, suggest solutions             |
| Code Review         | AI reviews pull request diffs, provides feedback             |
| Commit History      | Analyze commit messages and identify patterns                |
| Code Search         | Search for functions, classes, or patterns across codebase   |

**Authentication**:

- **OAuth Integration**: User authorizes WADI to access GitHub via OAuth
- **Personal Access Token**: User provides GitHub PAT with repo permissions
- **Token Storage**: Encrypted in database, associated with user account

**Use Cases**:

- "Analyze the architecture of repository X"
- "Summarize recent issues in repo Y"
- "Review PR #123 and suggest improvements"
- "Find all files using deprecated function Z"

**Implementation**:

- **API Client**: Use Octokit.js for GitHub API interactions
- **Rate Limiting**: Respect GitHub API rate limits (5000 req/hr authenticated)
- **Caching**: Cache repository data to reduce API calls

**Data Model**:

- **Table**: `integrations`
  - integration_id (UUID), user_id (UUID), service (enum: github, gdrive, notion), credentials (encrypted JSON), connected_at (timestamp)

**AI Tool Integration**:

- Add GitHub tool to AI tools catalog
- Function calling to invoke GitHub API queries
- Return formatted data to AI for synthesis

---

### Google Drive Integration

**Purpose**: Allow AI to read documents from user's Google Drive for analysis and context.

**Integration Capabilities**:

- **Document Reading**: Access Google Docs, Sheets, Slides
- **File Search**: Find files by name or content
- **Folder Navigation**: Browse Drive folder structure
- **File Upload**: Save AI-generated content to Drive

**Authentication**:

- OAuth 2.0 via Google Identity
- Request scopes: `drive.readonly` or `drive.file`
- Token refresh handling for long-lived access

**Document Processing**:

- **Google Docs**: Export as Markdown or plain text via Drive API
- **Google Sheets**: Export as CSV, parse tabular data
- **Google Slides**: Export as PDF or images, use OCR for text extraction

**Use Cases**:

- "Summarize my Google Doc titled 'Q4 Report'"
- "Analyze data from my 'Sales Figures' spreadsheet"
- "Create a presentation summary from my slide deck"

**Implementation**:

- **API Client**: Use Google APIs Node.js client
- **File Picker**: Embed Google Picker for file selection UI
- **Caching**: Cache document content with expiration for performance

---

### Notion Integration

**Purpose**: Synchronize notes and knowledge base between WADI and Notion.

**Integration Features**:

- **Import Notes**: Pull Notion pages into WADI as project context or documentation
- **Export Runs**: Send AI run outputs to Notion pages or databases
- **Bidirectional Sync**: Keep WADI projects and Notion pages in sync
- **Database Integration**: Query Notion databases from AI

**Authentication**:

- OAuth via Notion integration
- Request access to specific pages or databases

**Sync Strategy**:

- **Manual Sync**: User triggers import/export
- **Automated Sync**: Periodic background sync (configurable interval)
- **Real-Time Sync**: Webhooks from Notion to WADI (if supported)

**Use Cases**:

- "Import my Notion page 'Product Roadmap' as project context"
- "Export this AI run to my Notion database 'Research Notes'"
- "Sync all changes from my WADI project to Notion workspace"

**Implementation**:

- **API Client**: Use Notion SDK
- **Block Mapping**: Convert Notion blocks to WADI Markdown and vice versa
- **Conflict Resolution**: Last-write-wins or manual merge for conflicts

---

### Slack and Discord Webhooks

**Purpose**: Send notifications and summaries to team communication channels.

**Webhook Features**:

| Event               | Notification Content                                     |
| ------------------- | -------------------------------------------------------- |
| New Run Completed   | Project name, input summary, output preview, link to run |
| Task Completed      | Task title, completer name, project link                 |
| Collaborator Joined | User name, project name                                  |
| Comment Added       | Commenter name, comment preview, run link                |
| Daily Digest        | Summary of day's activity across all projects            |

**Configuration**:

1. User creates webhook URL in Slack or Discord
2. Adds webhook to WADI project settings
3. Selects which events trigger notifications
4. Customizes message format and mentions

**Message Formatting**:

- **Slack**: Use Block Kit for rich messages (buttons, images, formatting)
- **Discord**: Use embeds for structured, colored messages
- **Mentions**: Support @user or @channel mentions

**Rate Limiting**:

- Respect Slack/Discord rate limits (1 message/second typical)
- Batch notifications if many events occur simultaneously
- Provide digest mode to reduce notification volume

**Data Model**:

- **Table**: `webhook_configs`
  - webhook_id (UUID), project_id (UUID), service (slack/discord), url (encrypted), events (array), enabled (boolean)

**Implementation**:

- **HTTP POST**: Send formatted JSON to webhook URL
- **Retry Logic**: Retry failed deliveries with exponential backoff
- **Error Handling**: Disable webhook after repeated failures, notify user

---

### Public REST API

**Purpose**: Provide programmatic access to WADI platform for custom integrations and automation.

**API Design Principles**:

- **RESTful**: Resource-based URLs, HTTP verbs for actions
- **Versioning**: `/api/v1/` prefix for future compatibility
- **Authentication**: API keys (Bearer token) or OAuth
- **Rate Limiting**: Per-key limits based on plan
- **Pagination**: Cursor-based for large collections
- **Filtering**: Query parameters for filtering and sorting
- **Error Handling**: Consistent error response format with codes

**Core API Endpoints** (examples):

| Endpoint                    | Method | Description          |
| --------------------------- | ------ | -------------------- |
| `/api/v1/projects`          | GET    | List all projects    |
| `/api/v1/projects`          | POST   | Create new project   |
| `/api/v1/projects/:id`      | GET    | Get project details  |
| `/api/v1/projects/:id/runs` | GET    | List runs in project |
| `/api/v1/projects/:id/runs` | POST   | Create new AI run    |
| `/api/v1/runs/:id`          | GET    | Get run details      |
| `/api/v1/tasks`             | GET    | List tasks           |
| `/api/v1/tasks/:id`         | PATCH  | Update task status   |
| `/api/v1/search`            | GET    | Global search        |

**Response Format** (JSON):

```
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100,
    "next_cursor": "abc123"
  }
}
```

**Error Format**:

```
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Project not found",
    "details": {}
  }
}
```

**API Documentation**:

- Interactive docs using Swagger/OpenAPI spec
- Hosted at `/api/docs`
- Examples in multiple languages (curl, JavaScript, Python)

---

### Plugin Marketplace (Future)

**Purpose**: Allow third-party developers to create and distribute WADI extensions.

**Plugin Capabilities**:

- **Custom AI Tools**: Add new tools to AI tools catalog
- **UI Components**: Inject custom panels or widgets
- **Data Connectors**: Integrate with external services
- **Workflow Automation**: Trigger actions based on events

**Plugin Architecture**:

- **Sandboxed Execution**: Plugins run in isolated environment
- **Permission System**: Plugins request specific permissions
- **API Access**: Plugins use WADI API with scoped tokens
- **Lifecycle Hooks**: Install, enable, disable, uninstall events

**Marketplace Features**:

- **Discovery**: Browse and search plugins by category
- **Ratings**: User reviews and ratings
- **Installation**: One-click install from marketplace
- **Updates**: Automatic update notifications
- **Monetization**: Support paid plugins with revenue sharing

**Developer Tools**:

- **SDK**: Plugin development kit with templates and utilities
- **CLI**: Command-line tool for plugin scaffolding and publishing
- **Documentation**: Developer guide and API reference
- **Sandbox**: Test environment for plugin development

_Note: This is a complex future feature requiring significant infrastructure._

---

## Domain 8: User Management and Monetization

### Subscription Plans (Free, Pro, Enterprise)

**Purpose**: Establish tiered pricing model to monetize platform and support different user needs.

**Plan Comparison**:

| Feature                   | Free               | Pro            | Enterprise                |
| ------------------------- | ------------------ | -------------- | ------------------------- |
| Projects                  | 3                  | Unlimited      | Unlimited                 |
| AI Runs per Month         | 100                | 5,000          | Unlimited                 |
| AI Models                 | GPT-3.5-turbo only | All models     | All models + fine-tuned   |
| Collaborators per Project | 0 (solo)           | 5              | Unlimited                 |
| Storage                   | 100 MB             | 10 GB          | Custom                    |
| Long-Term Memory          | No                 | Yes            | Yes                       |
| Priority Support          | No                 | Email          | Dedicated account manager |
| Custom Domain             | No                 | No             | Yes                       |
| SSO / SAML                | No                 | No             | Yes                       |
| API Access                | No                 | Yes            | Yes                       |
| Webhooks                  | No                 | Yes            | Yes                       |
| Audit Logs                | 30 days            | 1 year         | Custom retention          |
| Uptime SLA                | Best effort        | 99.5%          | 99.9%                     |
| Price                     | $0                 | $20/user/month | Custom pricing            |

**Plan Enforcement**:

- Database field: `users.subscription_plan` (free, pro, enterprise)
- Middleware checks plan limits before operations
- Soft limits: Warn user approaching limit, allow temporary overage
- Hard limits: Block operations when limit exceeded, prompt upgrade

**Upgrade Flow**:

1. User reaches limit (e.g., 3 projects on Free)
2. Modal displays: "You've reached your project limit. Upgrade to Pro for unlimited projects."
3. User clicks "Upgrade"
4. Redirect to pricing page with plan comparison
5. Select plan and proceed to checkout
6. Payment processed, subscription activated
7. Limits immediately updated

**Downgrade Handling**:

- Allow downgrade at end of billing period
- If user exceeds new plan limits, require data cleanup or retention at current price
- Archive excess projects or mark as read-only

---

### Credit System for Token Usage

**Purpose**: Track and limit AI token consumption with transparent credit system.

**Credit Model**:

- **1 Credit = 1,000 tokens** (both input and output combined)
- Plans include monthly credit allocation
- Option to purchase additional credit packs

**Credit Allocation by Plan**:

| Plan       | Monthly Credits | Approximate Runs          |
| ---------- | --------------- | ------------------------- |
| Free       | 100 credits     | ~100 runs (1K tokens avg) |
| Pro        | 5,000 credits   | ~5,000 runs               |
| Enterprise | Custom          | Custom                    |

**Credit Tracking**:

- **Table**: `credit_transactions`
  - transaction_id (UUID), user_id (UUID), amount (integer), transaction_type (grant/deduct/purchase/refund), description (text), created_at (timestamp)

- **User Balance**: Computed field or cached value: `users.credit_balance`

**Credit Deduction**:

1. AI run completes
2. Calculate total tokens (input + output)
3. Convert to credits (rounded up)
4. Deduct from user's balance
5. Log transaction
6. If balance negative, restrict further runs or allow temporary overage with billing

**Credit Purchase**:

- One-time purchase of credit packs (e.g., 1,000 credits for $10)
- Payment via Stripe
- Credits added to balance immediately
- No expiration for purchased credits
- Monthly plan credits expire at end of billing period

**Credit Notifications**:

- Warning at 80% usage: "You've used 80% of your monthly credits"
- Alert at 100%: "Credit limit reached. Upgrade or purchase more credits."
- Email summary at end of month with usage breakdown

---

### Billing System with Stripe Integration

**Purpose**: Automate subscription billing, invoice generation, and payment processing.

**Stripe Integration Components**:

| Component              | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| Stripe Checkout        | Hosted payment page for subscriptions and one-time purchases       |
| Stripe Customer Portal | Self-service billing management (update card, cancel subscription) |
| Stripe Webhooks        | Real-time notifications for payment events                         |
| Stripe Invoices        | Automatic invoice generation and email delivery                    |
| Stripe Payment Methods | Securely store and charge payment methods                          |

**Subscription Flow**:

1. User selects Pro plan
2. Redirect to Stripe Checkout with plan details
3. User enters payment information
4. Stripe processes payment and creates subscription
5. Webhook notifies WADI backend
6. Backend updates user's plan and credit allocation
7. User redirected back to dashboard with confirmation

**Webhook Handling**:

- **Endpoint**: `POST /api/webhooks/stripe`
- **Events**:
  - `checkout.session.completed`: Activate subscription
  - `invoice.payment_succeeded`: Renew subscription, grant credits
  - `invoice.payment_failed`: Notify user, retry payment
  - `customer.subscription.deleted`: Downgrade to Free plan

**Data Model**:

- **Table**: `subscriptions`
  - subscription_id (UUID), user_id (UUID), stripe_subscription_id (string), plan (enum), status (active/past_due/canceled), current_period_start (timestamp), current_period_end (timestamp), cancel_at_period_end (boolean)

**Invoice Management**:

- Stripe auto-generates invoices
- Users access invoices via Stripe Customer Portal
- Backend provides list of past invoices via API
- Display in billing settings page

**Failed Payment Handling**:

1. Stripe retries failed payment according to retry rules
2. Send email notifications on each retry
3. After final failure, suspend account (soft suspension: read-only mode)
4. User can update payment method to reactivate
5. After 30 days, downgrade to Free plan and archive excess data

---

### Usage Analytics Dashboard

**Purpose**: Provide users with insights into their platform usage, token consumption, and costs.

**Analytics Metrics**:

#### Token Usage

- **Total Tokens**: Cumulative tokens used (input + output)
- **Tokens by Model**: Breakdown by AI model used
- **Tokens by Project**: Which projects consume most tokens
- **Daily/Weekly/Monthly Trends**: Line charts showing usage over time

#### Run Statistics

- **Total Runs**: Count of AI runs created
- **Average Tokens per Run**: Efficiency metric
- **Failed Runs**: Errors or timeouts
- **Peak Usage Times**: Heatmap of when user is most active

#### Cost Estimation

- **Estimated Cost**: Based on OpenAI pricing (if applicable)
- **Credit Consumption Rate**: Projected time until credit depletion
- **Savings**: Show cost savings vs. pay-as-you-go OpenAI API

#### Project Activity

- **Active Projects**: Projects with runs in last 30 days
- **Dormant Projects**: No activity in 90+ days
- **Collaborator Engagement**: Who is most active in shared projects

**Data Aggregation**:

- Background jobs to pre-compute daily/weekly/monthly metrics
- Store aggregated data in `usage_stats` table for fast retrieval
- Cache dashboard data in Redis with 1-hour TTL

**UI Presentation**:

- Dedicated "Usage" or "Analytics" page in user settings
- Interactive charts (Chart.js, Recharts, or D3.js)
- Date range selector (last 7 days, 30 days, 3 months, all time)
- Export analytics as CSV or PDF report

**Alerts and Recommendations**:

- "You're on track to exceed your credit limit by [date]. Consider upgrading."
- "Project X consumes 60% of your tokens. Optimize prompts to reduce usage."
- "You have 5 dormant projects. Archive them to improve organization."

---

### Billing History and Invoice Access

**Purpose**: Transparent access to all billing transactions and invoices.

**Billing History Table**:

| Date       | Description        | Amount | Status | Invoice    |
| ---------- | ------------------ | ------ | ------ | ---------- |
| 2024-01-01 | Pro Plan - Monthly | $20.00 | Paid   | [Download] |
| 2024-01-15 | Credit Pack (1000) | $10.00 | Paid   | [Download] |
| 2024-02-01 | Pro Plan - Monthly | $20.00 | Failed | [Retry]    |

**Features**:

- **Filter**: By date range, transaction type, status
- **Search**: By invoice number or description
- **Download**: PDF invoices from Stripe
- **Export**: All history as CSV for accounting

**Payment Method Management**:

- View current payment method (last 4 digits of card)
- Update payment method (redirect to Stripe Customer Portal)
- Add backup payment method
- Remove payment method (only if no active subscription)

**Data Sources**:

- Stripe API for invoice data
- Local `credit_transactions` table for credit purchases and usage
- Combine for complete financial history

---

### Project Limits by Plan

**Purpose**: Enforce different resource limits based on subscription tier.

**Limit Enforcement Strategies**:

| Limit Type       | Free       | Pro           | Enterprise   |
| ---------------- | ---------- | ------------- | ------------ |
| Project Count    | 3 max      | Unlimited     | Unlimited    |
| Runs per Project | 50 max     | Unlimited     | Unlimited    |
| File Upload Size | 5 MB       | 50 MB         | 500 MB       |
| AI Tools Access  | Basic only | All tools     | All + custom |
| Collaborators    | 0          | 5 per project | Unlimited    |
| API Rate Limit   | 10 req/min | 100 req/min   | 1000 req/min |

**Limit Checking**:

- **Pre-Operation Check**: Before creating project, query current count and plan limit
- **Middleware**: Centralized limit checking function
- **Error Response**: Return clear error with upgrade CTA

**Graceful Degradation**:

- When user downgrades from Pro to Free:
  - If > 3 projects: Mark excess as "archived" (read-only, not counted toward limit)
  - User can choose which 3 projects remain active
- Archived projects can be reactivated by archiving another or upgrading

**Limit Display**:

- Progress bars in UI showing usage (e.g., "2 / 3 projects used")
- Dashboard widget summarizing all limits
- Tooltips explaining each limit

---

## Domain 9: DevOps and Professional Deployment

### Docker Containerization (Full Stack)

**Purpose**: Package frontend, backend, and database into portable, reproducible containers.

**Container Architecture**:

| Service  | Image                  | Purpose                         |
| -------- | ---------------------- | ------------------------------- |
| Frontend | `wadi-frontend:latest` | React app served by Nginx       |
| Backend  | `wadi-backend:latest`  | Node.js/Express API server      |
| Database | `postgres:16`          | PostgreSQL database             |
| Redis    | `redis:7-alpine`       | Caching and real-time pub/sub   |
| Nginx    | `nginx:alpine`         | Reverse proxy and load balancer |

**Docker Compose Configuration**:

- Define multi-container application
- Services: frontend, backend, database, redis, nginx
- Networks: Internal network for backend-database, public network for frontend-nginx
- Volumes: Persistent storage for database, file uploads
- Environment variables: Loaded from `.env` file

**Dockerfile Strategy**:

- **Multi-stage builds**: Separate build and runtime stages for smaller images
- **Layer caching**: Optimize layer order to maximize cache hits
- **Security**: Run as non-root user, minimal base images (alpine)

**Example Frontend Dockerfile Strategy**:

1. Build stage: Install dependencies, build React app
2. Runtime stage: Copy built files to Nginx image
3. Nginx configuration: Serve static files, proxy API requests to backend

**Example Backend Dockerfile Strategy**:

1. Install dependencies
2. Copy source code
3. Compile TypeScript (if not using ts-node in production)
4. Expose port, run server

**Volume Management**:

- Database data: Persist PostgreSQL data directory
- Uploads: Persist user-uploaded files directory
- Logs: Mount log directory for external access

**Networking**:

- Frontend accessible on port 80/443 (via Nginx)
- Backend API accessible via `/api` path (Nginx proxy)
- Database and Redis only accessible within internal network (not exposed externally)

---

### CI/CD Pipeline with GitHub Actions

**Purpose**: Automate testing, building, and deployment on code changes.

**Pipeline Stages**:

#### 1. Continuous Integration (CI)

- **Trigger**: Push to `main` or pull request
- **Steps**:
  1. Checkout code
  2. Set up Node.js environment
  3. Install dependencies (`pnpm install`)
  4. Run linter (`pnpm lint`)
  5. Run type check (`pnpm tsc --noEmit`)
  6. Run unit tests (`pnpm test`)
  7. Build frontend and backend
  8. Upload build artifacts

#### 2. Docker Image Build

- **Trigger**: Push to `main` branch (after CI passes)
- **Steps**:
  1. Build Docker images for frontend and backend
  2. Tag images with commit SHA and `latest`
  3. Push images to container registry (Docker Hub, GitHub Container Registry, or AWS ECR)

#### 3. Continuous Deployment (CD)

- **Trigger**: Manual approval or automatic after successful build
- **Environments**: Staging, Production
- **Steps**:
  1. Pull latest Docker images from registry
  2. Deploy to Kubernetes cluster or Docker host
  3. Run database migrations
  4. Health check endpoints
  5. Send deployment notification (Slack, email)

**Workflow File Structure**:

- `.github/workflows/ci.yml`: Run tests and linting
- `.github/workflows/build-docker.yml`: Build and push Docker images
- `.github/workflows/deploy-staging.yml`: Deploy to staging environment
- `.github/workflows/deploy-production.yml`: Deploy to production (manual trigger)

**Secrets Management**:

- Store sensitive values in GitHub Secrets
- Environment variables: API keys, database credentials, signing keys
- Separate secrets for staging and production

**Deployment Notifications**:

- Post to Slack channel on successful deployment
- Email on deployment failure with logs
- GitHub deployment status updates

---

### Monitoring and Logging

**Purpose**: Track application health, performance, and errors in real-time.

**Monitoring Stack**:

| Component                 | Tool                            | Purpose                                  |
| ------------------------- | ------------------------------- | ---------------------------------------- |
| Application Monitoring    | New Relic, Datadog, or Sentry   | Track errors, performance, user sessions |
| Infrastructure Monitoring | Prometheus + Grafana            | Server metrics (CPU, memory, disk)       |
| Log Aggregation           | Elasticsearch + Kibana, or Loki | Centralize and search logs               |
| Uptime Monitoring         | Pingdom, UptimeRobot            | External endpoint monitoring             |

**Key Metrics**:

- **Performance**: API response times, database query times, frontend load times
- **Errors**: Error rate, error types, stack traces
- **Usage**: Active users, requests per second, AI runs per hour
- **Infrastructure**: CPU usage, memory usage, disk I/O, network throughput

**Logging Strategy**:

- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Context**: Include request ID, user ID, project ID in all logs
- **Sensitive Data**: Redact PII and secrets from logs

**Log Retention**:

- Hot storage: Last 7 days (fast search)
- Warm storage: 8-30 days (slower search)
- Cold storage: 31-365 days (archive, compliance)
- Deletion: After 1 year (configurable)

**Alerting**:

- **Error Rate**: Alert if error rate > 5% over 5 minutes
- **Response Time**: Alert if p95 latency > 2 seconds
- **Downtime**: Alert if health check fails 3 consecutive times
- **Disk Space**: Alert if disk > 80% full
- **Delivery**: PagerDuty, Slack, email, SMS (on-call rotation for production)

**Dashboards**:

- **Application Dashboard**: Request rates, error rates, top endpoints
- **Infrastructure Dashboard**: Server health, resource utilization
- **Business Dashboard**: User signups, active projects, revenue metrics

---

### Automated Database Backups

**Purpose**: Protect against data loss with regular, automated backups.

**Backup Strategy**:

| Backup Type            | Frequency         | Retention | Storage                      |
| ---------------------- | ----------------- | --------- | ---------------------------- |
| Full Backup            | Daily at 2 AM UTC | 30 days   | AWS S3, Google Cloud Storage |
| Incremental Backup     | Every 6 hours     | 7 days    | Same as full                 |
| Transaction Log Backup | Continuous        | 7 days    | Same as full                 |

**Backup Methods**:

- **Supabase Managed**: If using Supabase, leverage built-in automated backups
- **Self-Hosted PostgreSQL**: Use `pg_dump` for logical backups or `pg_basebackup` for physical backups
- **Automation**: Cron job or Kubernetes CronJob to run backup scripts

**Backup Verification**:

- Automated restore tests to staging environment weekly
- Checksum validation after each backup
- Alert on backup failure

**Disaster Recovery Plan**:

- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 6 hours (last incremental backup)
- **Procedure**:
  1. Identify issue (data corruption, accidental deletion, infrastructure failure)
  2. Initiate restore from most recent valid backup
  3. Replay transaction logs if available (for minimal data loss)
  4. Validate data integrity
  5. Switch traffic to restored database
  6. Post-mortem and preventive measures

**Backup Encryption**:

- Encrypt backups at rest using AES-256
- Encrypt backups in transit (HTTPS/TLS)
- Store encryption keys in separate secure vault (AWS KMS, HashiCorp Vault)

---

### Staging and Production Environments

**Purpose**: Separate environments for testing and live operations.

**Environment Isolation**:

| Aspect         | Staging                                      | Production                  |
| -------------- | -------------------------------------------- | --------------------------- |
| Purpose        | Testing, QA, demos                           | Live user traffic           |
| Data           | Anonymized production copy or synthetic data | Real user data              |
| Infrastructure | Smaller instances (cost optimization)        | Full-scale, redundant       |
| Domain         | `staging.wadi.app`                           | `app.wadi.app`              |
| Database       | Separate database instance                   | Production database cluster |
| API Keys       | Test/sandbox keys                            | Live keys                   |

**Deployment Flow**:

1. Code merged to `main` branch
2. CI/CD automatically deploys to staging
3. QA team tests staging environment
4. After approval, manually trigger production deployment
5. Canary or blue-green deployment to minimize downtime

**Configuration Management**:

- Environment-specific `.env` files
- Separate secrets in CI/CD platform
- Feature flags to enable/disable features per environment

**Data Sync**:

- Periodic refresh of staging database from production (anonymized)
- Automated script to sanitize PII before copy
- Never sync production data back from staging

---

### CDN for Static Assets

**Purpose**: Deliver frontend assets (JavaScript, CSS, images) with low latency globally.

**CDN Providers**:

- **Cloudflare**: Free tier available, DDoS protection, caching
- **AWS CloudFront**: Integrated with AWS ecosystem
- **Vercel Edge Network**: If deploying frontend to Vercel
- **Fastly**: Advanced caching and edge compute

**Assets to Serve via CDN**:

- JavaScript bundles (Vite build output)
- CSS stylesheets
- Images, icons, fonts
- Static files (PDFs, downloads)

**CDN Configuration**:

- **Origin**: Frontend server or S3 bucket
- **Cache TTL**: 1 year for versioned assets (with hash in filename), 1 hour for HTML
- **Compression**: Enable Gzip or Brotli compression
- **HTTPS**: Enforce HTTPS, free SSL certificates via CDN

**Deployment Workflow**:

1. Build frontend assets with versioned filenames (e.g., `main.a1b2c3.js`)
2. Upload to S3 or deploy to CDN-integrated host
3. Purge CDN cache for updated files
4. Update HTML to reference new versioned assets

**Performance Benefits**:

- Reduced latency: Assets served from edge locations near users
- Offload traffic: Reduce load on origin servers
- Automatic scaling: CDN handles traffic spikes

---

### Auto-Scaling for API

**Purpose**: Automatically adjust API server capacity based on traffic demand.

**Scaling Strategies**:

| Strategy           | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| Horizontal Scaling | Add more API server instances (containers/VMs)               |
| Vertical Scaling   | Increase CPU/memory of existing instances (limited, manual)  |
| Serverless         | Use AWS Lambda or Google Cloud Run (auto-scales per request) |

**Kubernetes Auto-Scaling**:

- **Horizontal Pod Autoscaler (HPA)**: Scale pods based on CPU, memory, or custom metrics (e.g., request rate)
- **Configuration**:
  - Min replicas: 2 (for redundancy)
  - Max replicas: 20 (cost cap)
  - Target CPU utilization: 70%
  - Target request rate: 1000 req/s per pod

**Load Balancing**:

- Distribute traffic across multiple API instances
- Health checks to remove unhealthy instances from rotation
- Session affinity for WebSocket connections (sticky sessions)

**Database Connection Pooling**:

- Limit connections per API instance to prevent database overload
- Use connection pooling library (e.g., `pg-pool`)
- Monitor connection pool saturation as scaling signal

**Metrics for Scaling Decisions**:

- CPU utilization > 70%: Scale up
- Request queue depth > 10: Scale up
- Response time p95 > 1s: Scale up
- CPU utilization < 30% for 10 minutes: Scale down

**Cost Optimization**:

- Scale down during low-traffic periods (e.g., nights, weekends)
- Use spot/preemptible instances for non-critical workloads
- Set maximum replicas to prevent runaway costs

---

## Domain 10: Documentation and Support Infrastructure

### Architecture Documentation

**Purpose**: Comprehensive technical documentation for developers and stakeholders.

**Documentation Sections**:

#### 1. System Architecture

- High-level architecture diagram (frontend, backend, database, external services)
- Technology stack overview
- Data flow diagrams
- Component interaction diagrams (Mermaid)

#### 2. Database Schema

- Table definitions with field descriptions
- Relationships and foreign keys
- Indexes and performance considerations
- RLS policies and access control
- Migration history

#### 3. API Documentation

- Endpoint reference (covered in API section)
- Authentication and authorization
- Request/response examples
- Error codes and handling
- Rate limiting and quotas

#### 4. Deployment Guide

- Environment setup
- Docker deployment instructions
- Kubernetes manifests and explanations
- CI/CD pipeline configuration
- Monitoring and alerting setup

#### 5. Development Guide

- Local development setup
- Code organization and conventions
- Testing strategy and running tests
- Contribution guidelines
- Branching and release workflow

**Documentation Tools**:

- **Format**: Markdown files in `/docs` directory
- **Hosting**: GitHub Pages, GitBook, or Docusaurus site
- **Diagrams**: Mermaid for version-controlled diagrams
- **Versioning**: Docs versioned alongside code

**Maintenance**:

- Update docs as part of feature development (required in PR checklist)
- Quarterly review for accuracy and completeness
- Community contributions for improvements

---

### API Reference with Interactive Examples

**Purpose**: Developer-friendly API documentation with live testing capability.

**Documentation Platform**:

- **Swagger/OpenAPI**: Industry-standard API specification format
- **UI**: Swagger UI or Redoc for browsing and testing
- **Generation**: Auto-generate from code annotations (e.g., `swagger-jsdoc`)

**Interactive Features**:

- **Try It Out**: Execute API requests directly from documentation
- **Authentication**: Input API key to test authenticated endpoints
- **Examples**: Pre-populated request bodies for common scenarios
- **Response Schemas**: Clear documentation of response structure

**API Reference Sections**:

- **Getting Started**: Obtaining API keys, making first request
- **Authentication**: How to authenticate requests
- **Endpoints**: Organized by resource (Projects, Runs, Tasks, etc.)
- **Webhooks**: Setting up and handling webhook events
- **Rate Limits**: Understanding and handling rate limits
- **Errors**: Common error codes and troubleshooting
- **SDKs**: Links to client libraries (if available)

**Code Examples**:

- Provide examples in multiple languages: cURL, JavaScript, Python, Ruby
- Use syntax highlighting
- Show both request and expected response

**Versioning**:

- Clearly indicate API version (e.g., v1, v2)
- Maintain docs for deprecated versions with migration guides
- Deprecation notices and timelines

---

### User Onboarding Tutorial

**Purpose**: Guide new users through platform features and help them achieve first success quickly.

**Onboarding Flow**:

#### 1. Welcome Screen

- Personalized greeting
- Brief overview of WADI capabilities
- Option to skip tutorial or start interactive tour

#### 2. Create First Project (Step 1)

- Prompt to create project with suggested name and description
- Tooltip explaining project purpose
- "Next" button to proceed

#### 3. Run First AI Query (Step 2)

- Pre-filled example prompt to demonstrate AI capability
- "Run" button highlighted
- Watch response stream in real-time
- Celebration message on completion

#### 4. Explore Features (Step 3)

- Interactive tooltips highlighting key UI elements (sidebar, settings, dashboard)
- Encourage exploring tasks, sessions, and sharing features

#### 5. Invite Collaborator (Optional Step 4)

- If Pro/Enterprise, prompt to invite team member
- Skip option for solo users

#### 6. Completion

- Congratulations message
- Links to documentation, support, and community
- Option to revisit tutorial anytime from help menu

**Onboarding State**:

- Track completion in `user_settings.onboarding_completed` (boolean)
- Trigger on first login after registration
- Allow manual restart from settings

**Interactive Elements**:

- **Tooltips**: Context-sensitive hints pointing to UI elements
- **Progress Indicator**: Show steps completed (e.g., "3 of 5 steps")
- **Skip Option**: Allow advanced users to bypass tutorial
- **Animations**: Smooth transitions and highlights to guide attention

---

### Developer Contribution Guide

**Purpose**: Enable external developers to contribute to WADI codebase.

**Guide Sections**:

#### 1. Code of Conduct

- Expected behavior and community standards
- Reporting violations

#### 2. Getting Started

- Fork repository and clone locally
- Install dependencies and set up environment
- Run development servers
- Run tests to ensure setup is correct

#### 3. Development Workflow

- Create feature branch from `main`
- Make changes following code style guide
- Write tests for new features
- Commit with conventional commit messages (e.g., `feat:`, `fix:`, `docs:`)
- Push branch and create pull request

#### 4. Code Style and Standards

- **Language**: TypeScript for type safety
- **Linting**: ESLint configuration provided
- **Formatting**: Prettier for consistent formatting
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Comments**: JSDoc for functions, inline comments for complex logic

#### 5. Testing Guidelines

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write E2E tests for critical user flows (optional, Playwright/Cypress)
- Achieve minimum 80% code coverage for new code

#### 6. Pull Request Process

- Fill out PR template completely
- Link related issues
- Request review from maintainers
- Address feedback and update PR
- Squash commits before merge (or maintainer will squash)

#### 7. Issue Reporting

- Use issue templates for bugs, feature requests, questions
- Provide reproduction steps for bugs
- Check for existing issues before creating new

**Recognition**:

- Contributors listed in `CONTRIBUTORS.md`
- Highlight top contributors in release notes
- Optional: Swag or credits for significant contributions

---

### Public Knowledge Base / Blog

**Purpose**: Educate users, share updates, and improve SEO.

**Content Types**:

#### 1. Product Updates

- New feature announcements
- Release notes and changelogs
- Roadmap updates

#### 2. Tutorials and How-Tos

- "How to create an AI assistant for your project"
- "Best practices for prompt engineering in WADI"
- "Integrating WADI with your workflow"

#### 3. Use Cases and Case Studies

- Customer success stories
- Industry-specific applications
- Creative use cases

#### 4. Technical Deep Dives

- Architecture explanations
- Performance optimization insights
- AI model comparisons

#### 5. Best Practices

- Prompt engineering tips
- Project organization strategies
- Collaboration workflows

**Platform**:

- **Hosted Blog**: Use platform like Ghost, WordPress, or Medium
- **Static Site**: Gatsby or Next.js blog integrated with main site
- **Documentation Site**: Docusaurus with blog plugin

**Publishing Strategy**:

- Weekly or bi-weekly posts
- Mix of technical and non-technical content
- SEO optimization (keywords, meta descriptions, alt text)
- Social media promotion (Twitter, LinkedIn, Reddit)
- Email newsletter with blog highlights

---

### In-App Feedback System

**Purpose**: Collect user feedback, bug reports, and feature requests directly within the application.

**Feedback Widget**:

- **Access**: Floating button in bottom-right corner or help menu
- **Trigger**: Click to open feedback modal
- **Options**: Bug report, feature request, general feedback

**Feedback Form Fields**:

| Field              | Type                         | Required    |
| ------------------ | ---------------------------- | ----------- |
| Feedback Type      | Dropdown (bug/feature/other) | Yes         |
| Title              | Text input                   | Yes         |
| Description        | Textarea                     | Yes         |
| Reproduction Steps | Textarea (for bugs)          | Conditional |
| Screenshot         | File upload                  | No          |
| Priority           | Dropdown (low/medium/high)   | No          |
| Contact Email      | Text input                   | Yes         |

**Automatic Context Capture**:

- User ID and plan level
- Current page URL
- Browser and OS information
- Recent error logs (if bug report)
- Session recording link (if using tools like LogRocket)

**Submission Handling**:

1. User submits feedback
2. Create ticket in issue tracking system (Linear, Jira, GitHub Issues)
3. Send confirmation email to user
4. Notify product team via Slack
5. Track ticket status and resolution
6. Follow up with user when resolved

**Feedback Analytics**:

- Dashboard showing feedback volume over time
- Most requested features
- Common bug categories
- User satisfaction trends

**Public Roadmap Integration**:

- Feature requests voted by users
- Display planned, in-progress, and completed features
- Allow users to subscribe to updates on specific requests

---

## Implementation Strategy

### Phased Rollout Plan

**Purpose**: Organize massive feature set into manageable, sequential development phases.

**Phase 1: Foundation and Core Enhancements (Months 1-2)**

- WebSocket streaming infrastructure
- Internal AI tools framework (PDF, Image, Code, ZIP)
- Long-term memory (vector store) integration
- Basic project task system
- Improved UI component library foundation
- Docker containerization

**Phase 2: Collaboration and Security (Months 3-4)**

- Project invitation and role-based access
- Real-time collaborative chat
- Run comments
- OAuth integration (Google, GitHub, Microsoft)
- 2FA implementation
- API rate limiting

**Phase 3: Productivity and UX (Months 5-6)**

- Kanban board and intelligent calendar
- Project insights dashboard
- Markdown and prompt editor enhancements
- Dashboard with metrics
- Mobile-responsive design refinement
- Presentation mode

**Phase 4: Integrations and Export (Months 7-8)**

- GitHub, Google Drive, Notion integrations
- Slack/Discord webhooks
- Public REST API and documentation
- Multi-format export system (PDF, MD, HTML, JSON, ZIP)
- Import and session reconstruction

**Phase 5: Monetization and Enterprise (Months 9-10)**

- Stripe billing integration
- Subscription plans and enforcement
- Credit system and usage analytics
- API key system
- Encryption for sensitive runs

**Phase 6: DevOps and Scale (Months 11-12)**

- CI/CD pipeline (GitHub Actions)
- Monitoring and logging infrastructure
- Automated backups and disaster recovery
- CDN integration
- Auto-scaling configuration
- Staging and production environments

**Phase 7: Documentation and Polish (Month 13)**

- Comprehensive architecture documentation
- Interactive API reference
- User onboarding tutorial
- Knowledge base and blog
- In-app feedback system
- Final UX polish and bug fixes

**Phase 8: Advanced Features (Months 14-15)**

- Fine-tuned assistants per project
- Custom user/workspace context
- AI Playground
- AI-driven actions (document creation, code generation, workflow design)
- Project versioning and run comparison
- Global intelligent search
- Shared session editing (Google Docs style)
- Dynamic animated backgrounds

**Phase 9: Future Innovations (Month 16+)**

- Plugin marketplace foundation
- Advanced AI tools expansion
- Enterprise features (SSO, SAML, custom domains)
- White-label options
- Advanced analytics and BI integrations

### Architectural Considerations

**Scalability**:

- Stateless API design for horizontal scaling
- Database read replicas for query performance
- Redis for caching and session management
- Message queue (e.g., Bull, RabbitMQ) for background jobs (email, embeddings, exports)
- WebSocket scaling via Redis Pub/Sub across instances

**Security**:

- Regular security audits and penetration testing
- Dependency scanning for vulnerabilities (Dependabot, Snyk)
- Secrets rotation policies
- OWASP Top 10 mitigation strategies
- GDPR and data privacy compliance

**Performance**:

- Database query optimization (indexes, query analysis)
- Lazy loading and code splitting in frontend
- Image optimization and lazy loading
- API response caching strategies
- Background processing for heavy operations (exports, embeddings)

**Maintainability**:

- Modular codebase with clear separation of concerns
- Comprehensive test coverage (unit, integration, E2E)
- Automated testing in CI/CD
- Code review process
- Documentation kept in sync with code

**Reliability**:

- Health check endpoints
- Graceful degradation when external services unavailable
- Circuit breakers for external API calls
- Retry logic with exponential backoff
- Database transaction management for data consistency

### Technology Stack Additions

To support the expanded feature set, the following technology additions are recommended:

| Category                | Technology                           | Purpose                   |
| ----------------------- | ------------------------------------ | ------------------------- |
| WebSocket               | `ws` library                         | Bidirectional streaming   |
| Vector Database         | Pinecone / Weaviate / pgvector       | Long-term memory          |
| Document Processing     | `pdf-parse`, `mammoth`, `pdfjs-dist` | PDF and DOCX handling     |
| Image Processing        | OpenAI Vision API                    | Image analysis            |
| Code Execution          | Docker sandbox                       | Safe code interpretation  |
| Real-Time               | Redis Pub/Sub                        | Chat and collaboration    |
| Collaborative Editing   | ShareDB / Yjs                        | Shared session editing    |
| Payment Processing      | Stripe SDK                           | Billing and subscriptions |
| Monitoring              | Sentry / Datadog                     | Error tracking and APM    |
| Logging                 | Winston / Pino                       | Structured logging        |
| Queue                   | Bull / BullMQ                        | Background jobs           |
| Email                   | SendGrid / AWS SES                   | Transactional emails      |
| File Storage            | AWS S3 / Cloudinary                  | Uploads and exports       |
| CDN                     | Cloudflare / CloudFront              | Asset delivery            |
| Container Orchestration | Kubernetes / Docker Swarm            | Auto-scaling              |
| CI/CD                   | GitHub Actions                       | Automation                |

### Risk Mitigation

**Technical Risks**:

- **Complexity Overload**: Mitigate by phased rollout, prioritizing core features first
- **Performance Degradation**: Continuous performance testing, profiling, optimization
- **Integration Failures**: Thorough testing of third-party integrations, fallback mechanisms

**Business Risks**:

- **Scope Creep**: Strict adherence to phased plan, change control process
- **User Adoption**: Beta testing with select users, iterative feedback incorporation
- **Market Competition**: Focus on unique differentiators (AI tools, collaboration, UX)

**Operational Risks**:

- **Deployment Issues**: Blue-green deployments, rollback procedures, staging validation
- **Data Loss**: Automated backups, disaster recovery drills, data validation
- **Security Breaches**: Security audits, penetration testing, incident response plan

### Success Metrics

To measure the success of this mega sprint implementation:

**User Engagement**:

- Monthly Active Users (MAU) growth
- Average sessions per user
- AI runs per user per week
- Feature adoption rates (% of users using new features)

**Technical Performance**:

- API response time p95 < 500ms
- Error rate < 0.5%
- Uptime > 99.5%
- Page load time < 2 seconds

**Business Metrics**:

- Conversion rate (Free to Pro)
- Monthly Recurring Revenue (MRR) growth
- Customer Lifetime Value (CLV)
- Net Promoter Score (NPS) > 50

**Development Velocity**:

- Features delivered per sprint
- Time from design to production
- Bug resolution time
- Code review turnaround time

---

## Conclusion

This design document outlines a comprehensive transformation of WADI from a Beta 1 AI platform into an enterprise-grade, full-featured AI workspace. The strategic approach emphasizes:

- **Progressive Enhancement**: Building on existing solid foundation
- **User-Centric Design**: Prioritizing features that deliver immediate user value
- **Technical Excellence**: Ensuring scalability, security, and performance
- **Business Viability**: Establishing monetization and growth infrastructure

The phased implementation strategy allows for iterative development, continuous user feedback, and risk mitigation while maintaining product stability and quality throughout the journey.

**Next Steps**:

1. Stakeholder review and approval of design
2. Detailed technical specification for Phase 1
3. Team resource allocation and sprint planning
4. Development kickoff with Phase 1 features

---

**Design Confidence: Medium**

**Confidence Basis**:

- **Strengths**: Clear existing codebase foundation, well-defined feature requirements, proven technology stack
- **Uncertainties**: Massive scope requiring 15+ months of development, coordination complexity, third-party integration dependencies, resource availability
- **Recommendations**: Begin with Phase 1-2 as proof of concept, validate architecture with smaller feature set, gather user feedback before committing to full roadmap
