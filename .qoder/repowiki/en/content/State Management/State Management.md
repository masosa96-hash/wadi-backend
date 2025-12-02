# State Management

<cite>
**Referenced Files in This Document**   
- [authStore.ts](file://apps/frontend/src/store/authStore.ts)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts)
- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts)
- [favoritesStore.ts](file://apps/frontend/src/store/favoritesStore.ts)
- [memoryStore.ts](file://apps/frontend/src/store/memoryStore.ts)
- [filesStore.ts](file://apps/frontend/src/store/filesStore.ts)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts)
- [runsStore.ts](file://apps/frontend/src/store/runsStore.ts)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts)
- [settingsStore.ts](file://_archived_root_src/store/settingsStore.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Zustand Store Architecture](#zustand-store-architecture)
3. [Global State Management](#global-state-management)
4. [Local Component State](#local-component-state)
5. [Server State Synchronization](#server-state-synchronization)
6. [Data Persistence Patterns](#data-persistence-patterns)
7. [Optimistic Updates](#optimistic-updates)
8. [Loading States and Error Handling](#loading-states-and-error-handling)
9. [State Management Best Practices](#state-management-best-practices)

## Introduction

The WADI application implements a comprehensive state management system using Zustand stores on the frontend and service layers on the backend. This documentation details the patterns for managing global state, local component state, and server state synchronization across the application. The system is designed to provide a seamless user experience while maintaining data consistency and integrity across different components and user sessions.

## Zustand Store Architecture

The frontend state management in WADI is built on Zustand, a lightweight state management solution for React applications. The architecture follows a modular approach with dedicated stores for different domains of the application.

```mermaid
graph TD
A[Zustand Stores] --> B[authStore]
A --> C[chatStore]
A --> D[workspaceStore]
A --> E[sessionsStore]
A --> F[themeStore]
A --> G[toastStore]
A --> H[favoritesStore]
A --> I[memoryStore]
A --> J[filesStore]
A --> K[tagsStore]
A --> L[presetsStore]
A --> M[runsStore]
B --> N[Authentication State]
C --> O[Chat Conversations]
D --> P[Workspace Management]
E --> Q[Session State]
F --> R[Theme Preferences]
G --> S[Notifications]
H --> T[Favorites]
I --> U[User Memory]
J --> V[File Management]
K --> W[Tagging System]
L --> X[Preset Management]
M --> Y[Run Management]
```

**Diagram sources**

- [authStore.ts](file://apps/frontend/src/store/authStore.ts)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts)
- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts)
- [favoritesStore.ts](file://apps/frontend/src/store/favoritesStore.ts)
- [memoryStore.ts](file://apps/frontend/src/store/memoryStore.ts)
- [filesStore.ts](file://apps/frontend/src/store/filesStore.ts)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts)
- [runsStore.ts](file://apps/frontend/src/store/runsStore.ts)

**Section sources**

- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L1-L151)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L1-L415)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts#L1-L126)

## Global State Management

WADI implements global state management through specialized Zustand stores that maintain application-wide state. These stores are designed to be accessed from any component in the application hierarchy.

### Authentication State

The `authStore` manages user authentication state including session information, user profile, and guest mode functionality. It uses Zustand's persist middleware to maintain state across page reloads.

```mermaid
classDiagram
class AuthState {
+user : User | null
+session : Session | null
+loading : boolean
+guestId : string | null
+guestNick : string | null
+requestPasswordReset(email : string) : Promise~void~
+signIn(email : string, password : string, rememberMe? : boolean) : Promise~void~
+signUp(email : string, password : string, displayName : string) : Promise~void~
+signOut() : Promise~void~
+setGuestNick(nick : string) : void
+initialize() : Promise~void~
}
```

**Diagram sources**

- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L6-L21)

### Theme and UI State

The `themeStore` manages application-wide theme preferences, including accent colors and other visual settings. This store demonstrates the use of Zustand's persist middleware for maintaining user preferences.

```mermaid
classDiagram
class ThemeState {
+accentColor : AccentColor
+setAccentColor(color : AccentColor) : void
}
class AccentColor {
+blue : '#3B82F6'
+green : '#10B981'
+purple : '#8B5CF6'
+orange : '#F59E0B'
+pink : '#EC4899'
+teal : '#14B8A6'
}
```

**Diagram sources**

- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts#L6-L9)

### Workspace and Project State

The `workspaceStore` manages workspace-related state, including current workspace selection, member management, and workspace creation. This store maintains state for workspace operations and provides actions for workspace manipulation.

```mermaid
classDiagram
class WorkspaceState {
+workspaces : Workspace[]
+currentWorkspace : Workspace | null
+members : WorkspaceMember[]
+loading : boolean
+error : string | null
+createWorkspace(name : string) : Promise~void~
+switchWorkspace(workspaceId : string) : void
+inviteMember(email : string, role : WorkspaceRole) : Promise~void~
+removeMember(userId : string) : Promise~void~
+updateMemberRole(userId : string, role : WorkspaceRole) : Promise~void~
+loadWorkspaces() : Promise~void~
}
```

**Diagram sources**

- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts#L5-L19)

**Section sources**

- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts#L1-L126)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts#L1-L31)

## Local Component State

While global state is managed through dedicated stores, WADI also implements local component state for UI-specific functionality and temporary data.

### Toast Notifications

The `toastStore` manages transient UI notifications that provide feedback to users about application events. This store demonstrates a pattern for managing ephemeral state that doesn't require persistence.

```mermaid
classDiagram
class ToastStore {
+toasts : Toast[]
+addToast(type : ToastType, message : string, duration? : number) : void
+removeToast(id : string) : void
+success(message : string, duration? : number) : void
+error(message : string, duration? : number) : void
+info(message : string, duration? : number) : void
+warning(message : string, duration? : number) : void
}
class Toast {
+id : string
+type : ToastType
+message : string
+duration? : number
}
class ToastType {
+success
+error
+info
+warning
}
```

**Diagram sources**

- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts#L12-L20)

### Form and Input State

Components in WADI manage their own local state for form inputs and temporary data that doesn't need to be shared across the application. This approach reduces unnecessary re-renders and keeps the global state focused on shared data.

**Section sources**

- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts#L1-L65)
- [settingsStore.ts](file://_archived_root_src/store/settingsStore.ts)

## Server State Synchronization

WADI implements robust patterns for synchronizing client state with server state, ensuring data consistency across different clients and sessions.

### Chat State Synchronization

The `chatStore` manages the synchronization of chat conversations between the client and server, handling both authenticated users and guest mode interactions.

```mermaid
sequenceDiagram
participant Client
participant ChatStore
participant API
participant Database
Client->>ChatStore : sendMessage("Hello")
ChatStore->>ChatStore : Optimistic update (user message)
alt Authenticated User
ChatStore->>API : POST /api/chat
API->>Database : Save user message
API->>API : Generate AI response
API->>Database : Save assistant message
API-->>ChatStore : Return conversationId, messages
ChatStore->>ChatStore : Update state with response
else Guest Mode
ChatStore->>API : POST /api/chat (with guestId)
API->>API : Generate AI response (no persistence)
API-->>ChatStore : Return response
ChatStore->>ChatStore : Update state with response
ChatStore->>LocalStorage : Save conversation
end
ChatStore-->>Client : Update UI
```

**Diagram sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L7-L37)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L20-L215)

### Real-time Updates with WebSockets

For authenticated users, WADI uses WebSockets to provide real-time updates for chat conversations, reducing latency and improving the user experience.

```mermaid
sequenceDiagram
participant Client
participant ChatStore
participant WebSocket
participant Server
Client->>ChatStore : connect(conversationId)
ChatStore->>WebSocket : Open connection
WebSocket->>Server : Connect
Server-->>WebSocket : Connected
WebSocket-->>ChatStore : onopen
ChatStore->>ChatStore : Set isConnected : true
Client->>ChatStore : sendMessage("Hello")
ChatStore->>WebSocket : Send message
WebSocket->>Server : Forward message
Server->>Server : Process message
Server->>WebSocket : Send "start" event
WebSocket->>ChatStore : onmessage (start)
ChatStore->>ChatStore : Add empty assistant message
Server->>WebSocket : Send "chunk" events
WebSocket->>ChatStore : onmessage (chunk)
ChatStore->>ChatStore : Append content to assistant message
Server->>WebSocket : Send "complete" event
WebSocket->>ChatStore : onmessage (complete)
ChatStore->>ChatStore : Set sendingMessage : false
ChatStore->>ChatStore : Load updated conversations
```

**Diagram sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L53-L129)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L20-L215)

**Section sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L1-L415)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L1-L457)

## Data Persistence Patterns

WADI implements different data persistence strategies based on user authentication status and data sensitivity.

### Persistent State for Authenticated Users

For authenticated users, application state is persisted to the Supabase database, ensuring data is available across devices and sessions.

```mermaid
erDiagram
USER ||--o{ CONVERSATION : has
USER ||--o{ MESSAGE : authored
USER ||--o{ WORKSPACE : owns
USER ||--o{ SESSION : manages
USER ||--o{ RUN : creates
USER ||--o{ PRESET : creates
USER ||--o{ FAVORITE : marks
USER ||--o{ MEMORY : stores
USER ||--o{ FILE : uploads
USER ||--o{ TAG : creates
CONVERSATION ||--o{ MESSAGE : contains
WORKSPACE ||--o{ SESSION : contains
PROJECT ||--o{ SESSION : contains
PROJECT ||--o{ RUN : contains
PROJECT ||--o{ PRESET : contains
SESSION ||--o{ RUN : contains
RUN ||--o{ TAG : tagged_with
PRESET ||--o{ TAG : tagged_with
MESSAGE ||--o{ FAVORITE : has
FILE ||--o{ MESSAGE : attached_to
```

**Diagram sources**

- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L48-L201)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L342-L371)

### Transient State for Guest Users

For guest users, state is stored in the browser's localStorage, providing a temporary persistence mechanism that doesn't require authentication.

```mermaid
flowchart TD
A[Guest User] --> B{Send Message?}
B --> |Yes| C[Store Message in Memory]
C --> D[Send to Server]
D --> E[Receive Response]
E --> F[Store Response in Memory]
F --> G[Update UI]
G --> H[Save to localStorage]
H --> I[Continue Conversation]
I --> B
B --> |No| J[End Session]
J --> K[Data Persists in localStorage]
K --> L[Available on Return]
```

**Diagram sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L163-L209)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L111-L116)

**Section sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L1-L415)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L1-L457)

## Optimistic Updates

WADI implements optimistic updates to improve perceived performance and provide immediate feedback to users.

### Message Sending Optimization

When sending a message, the chat interface immediately updates with the user's message before receiving confirmation from the server.

```mermaid
sequenceDiagram
participant User
participant UI
participant Store
participant API
User->>UI : Type message and send
UI->>Store : Call sendMessage()
Store->>Store : Optimistic update (add user message)
Store->>UI : Update message list
UI->>User : Display message immediately
Store->>API : Send message to server
alt Success
API-->>Store : Return response
Store->>Store : Update with AI response
Store->>UI : Update with AI response
else Failure
Store->>Store : Revert optimistic update
Store->>UI : Show error message
Store->>User : Request resend
end
```

**Diagram sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L148-L161)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L156-L162)

### Session Management Optimization

When updating session state, WADI applies optimistic updates to provide immediate feedback while the server processes the request.

```mermaid
flowchart TD
A[User Action] --> B[Optimistic Update]
B --> C[Immediate UI Feedback]
C --> D[Server Request]
D --> E{Success?}
E --> |Yes| F[Confirm Update]
E --> |No| G[Revert to Previous State]
G --> H[Show Error Message]
F --> I[Final State]
H --> I
```

**Diagram sources**

- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L156-L177)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L137-L154)

**Section sources**

- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L1-L415)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L1-L251)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L1-L291)

## Loading States and Error Handling

WADI implements comprehensive loading states and error handling to provide users with clear feedback about application status.

### Granular Loading States

Stores implement detailed loading states to provide specific feedback about ongoing operations.

```mermaid
classDiagram
class SessionLoadingStates {
+fetchSessions : boolean
+createSession : boolean
+updateSession : boolean
+deleteSession : boolean
+fetchSessionRuns : boolean
}
class TagLoadingStates {
+fetchTags : boolean
+createTag : boolean
+updateTag : boolean
+deleteTag : boolean
+addProjectTag : boolean
+removeProjectTag : boolean
+addRunTag : boolean
+removeRunTag : boolean
}
class PresetLoadingStates {
+fetchPresets : boolean
+createPreset : boolean
+updatePreset : boolean
+deletePreset : boolean
+executePreset : boolean
}
```

**Diagram sources**

- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L17-L23)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L13-L22)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts#L21-L27)

### Structured Error Handling

The application implements structured error handling with retry capabilities and user-friendly error messages.

```mermaid
classDiagram
class SessionErrorState {
+operation : string
+message : string
+timestamp : number
+retryable : boolean
}
class TagErrorState {
+operation : string
+message : string
+timestamp : number
+retryable : boolean
}
class PresetErrorState {
+operation : string
+message : string
+timestamp : number
+retryable : boolean
}
class createErrorState {
+operation : string
+error : ApiError | Error
+retryable : boolean
+return : ErrorState
}
```

**Diagram sources**

- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L25-L30)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L24-L29)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts#L29-L34)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L64-L72)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L67-L75)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts#L83-L91)

**Section sources**

- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L1-L251)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L1-L291)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts#L1-L256)

## State Management Best Practices

WADI follows several best practices for state management to ensure maintainability, performance, and user experience.

### Store Organization Principles

- **Single Responsibility**: Each store manages a specific domain of application state
- **State Colocation**: State is kept close to where it's used, with global state reserved for truly shared data
- **Immutability**: State updates use immutable patterns to prevent unintended side effects
- **Type Safety**: All stores use TypeScript interfaces to ensure type safety

### Performance Considerations

- **Selective Re-renders**: Components subscribe only to the specific state they need
- **Batched Updates**: Related state changes are batched to minimize re-renders
- **Memoization**: Computed values are memoized to avoid unnecessary calculations
- **Cleanup**: Stores implement cleanup methods to prevent memory leaks

### Data Synchronization Strategies

- **Immediate Feedback**: Optimistic updates provide immediate UI feedback
- **Error Recovery**: Failed operations revert to previous state with clear error messages
- **Conflict Resolution**: Server state takes precedence in case of conflicts
- **Offline Support**: Local state persists during network outages and syncs when connection is restored

**Section sources**

- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L1-L151)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L1-L415)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts#L1-L126)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L1-L251)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts#L1-L31)
- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts#L1-L65)
- [favoritesStore.ts](file://apps/frontend/src/store/favoritesStore.ts#L1-L134)
- [memoryStore.ts](file://apps/frontend/src/store/memoryStore.ts#L1-L134)
- [filesStore.ts](file://apps/frontend/src/store/filesStore.ts#L1-L188)
- [tagsStore.ts](file://apps/frontend/src/store/tagsStore.ts#L1-L291)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts#L1-L256)
- [runsStore.ts](file://apps/frontend/src/store/runsStore.ts#L1-L234)
- [chatController.ts](file://apps/api/src/controllers/chatController.ts#L1-L457)
