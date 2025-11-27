# Frontend State Management

<cite>
**Referenced Files in This Document**   
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts)
- [authStore.ts](file://apps/frontend/src/store/authStore.ts)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts)
- [toastStore.ts](file://apps/frontend/src/store/toastStore.ts)
- [filesStore.ts](file://apps/frontend/src/store/filesStore.ts)
- [presetsStore.ts](file://apps/frontend/src/store/presetsStore.ts)
- [memoryStore.ts](file://apps/frontend/src/store/memoryStore.ts)
- [favoritesStore.ts](file://apps/frontend/src/store/favoritesStore.ts)
- [Chat.tsx](file://apps/frontend/src/pages/Chat.tsx)
- [RootGuard.tsx](file://apps/frontend/src/components/RootGuard.tsx)
- [router.tsx](file://apps/frontend/src/router.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Atomic Store Architecture](#atomic-store-architecture)
3. [Store Implementation Patterns](#store-implementation-patterns)
4. [Middleware Usage](#middleware-usage)
5. [React Integration via Hooks](#react-integration-via-hooks)
6. [State Normalization and Optimization](#state-normalization-and-optimization)
7. [Async Actions and Error Handling](#async-actions-and-error-handling)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Best Practices](#best-practices)
10. [Store Creation Guidelines](#store-creation-guidelines)

## Introduction
The WADI frontend implements a robust state management system using Zustand as the primary state management library. This architecture follows the atomic store pattern, where each domain (chat, projects, sessions, workspaces, etc.) has its own dedicated store. This approach provides clear separation of concerns, improves maintainability, and enables efficient reactivity across components. The system leverages Zustand's lightweight API to create stores that maintain reactivity through optimized selector patterns and middleware for persistence and debugging. The state management solution is designed to handle complex interactions between different domains while ensuring optimal performance and developer experience.

## Atomic Store Architecture
WADI implements an atomic store architecture where each domain has its own dedicated Zustand store. This approach ensures clear separation of concerns and prevents state bloat in a single global store. Each store manages its specific domain state, actions, and side effects independently while maintaining the ability to interact with other stores when necessary.

The atomic stores in WADI include:
- **chatStore**: Manages chat conversations, messages, and WebSocket connections
- **sessionsStore**: Handles session state, active sessions, and session-related operations
- **projectsStore**: Manages project data, selection, and project-related actions
- **workspacesStore**: Handles workspace management, members, and permissions
- **authStore**: Manages authentication state, user sessions, and guest mode
- **themeStore**: Controls theme preferences and accent colors
- **toastStore**: Manages toast notifications across the application

Each store follows a consistent pattern with well-defined state properties, loading states, error handling, and domain-specific actions. This atomic approach allows for independent development, testing, and optimization of each domain's state management logic.

**Section sources**
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L7-L37)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L32-L53)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts#L29-L47)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts#L49-L77)

## Store Implementation Patterns
The store implementation in WADI follows consistent patterns across all domains, ensuring maintainability and predictability. Each store defines a clear interface for its state, including data properties, loading states, and error handling mechanisms.

### State Structure
Each store follows a standardized structure with the following components:
- **Data properties**: Domain-specific data (e.g., conversations, sessions, projects)
- **Loading states**: Granular loading indicators for different operations
- **Error state**: Structured error handling with operation context
- **Selection state**: Current selection or active item identifiers

For example, the sessions store defines loading states for each operation:
```typescript
export interface SessionLoadingStates {
  fetchSessions: boolean;
  createSession: boolean;
  updateSession: boolean;
  deleteSession: boolean;
  fetchSessionRuns: boolean;
}
```

### Action Implementation
Actions follow a consistent pattern with proper loading state management and error handling. Most async actions follow this pattern:
1. Set loading state to true
2. Clear previous errors
3. Execute async operation
4. Update state with result
5. Reset loading state
6. Handle errors with structured error states

The sessions store demonstrates this pattern in its `createSession` action, which updates the loading state, handles success and error cases, and returns the created session.

**Section sources**
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L32-L53)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts#L15-L27)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts#L31-L40)

## Middleware Usage
WADI leverages Zustand middleware to enhance store functionality, particularly for persistence and debugging. The middleware pattern is consistently applied across stores that require state persistence.

### Persistence Middleware
The `persist` middleware is used in stores that need to maintain state across page reloads. This includes:
- **authStore**: Persists user authentication state, guest ID, and nickname
- **themeStore**: Persists theme preferences and accent color selection
- **onboardingStore**: Persists onboarding completion status
- **workspaceStore**: Persists current workspace and workspace list

The persistence configuration uses the `partialize` option to selectively persist only necessary state properties, reducing storage size and improving performance. For example, the auth store persists only essential properties:
```typescript
partialize: (state) => ({
  user: state.user,
  session: state.session,
  guestId: state.guestId,
  guestNick: state.guestNick,
})
```

### Devtools Integration
While not explicitly shown in the code, Zustand's devtools middleware is likely used during development to enable time-travel debugging and state inspection. This helps developers understand state changes and debug complex state transitions.

**Section sources**
- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L23-L149)
- [themeStore.ts](file://apps/frontend/src/store/themeStore.ts#L20-L29)
- [onboardingStore.ts](file://apps/frontend/src/store/onboardingStore.ts#L10-L27)
- [workspaceStore.ts](file://apps/frontend/src/store/workspaceStore.ts#L46-L125)

## React Integration via Hooks
WADI integrates Zustand stores with React components through custom hooks, enabling seamless state access and reactivity. The integration follows best practices for performance and reusability.

### Store Usage in Components
Components access store state using the store's hook (e.g., `useChatStore`, `useAuthStore`). The Chat component demonstrates this integration by accessing multiple store properties:
```typescript
const { user, guestId, guestNick, setGuestNick } = useAuthStore();
const { messages, sendMessage, sendingMessage } = useChatStore();
```

### Selectors for Performance
To prevent unnecessary re-renders, components use selectors to extract only the needed state properties. This is particularly important for stores with complex state objects. The use of memoized selectors ensures that components only re-render when the specific state they depend on changes.

### Initialization Patterns
Stores that require initialization (like authStore) implement an `initialize` method that sets up the initial state and subscribes to external events. The auth store initializes by:
1. Getting the current session from Supabase
2. Generating a guest ID if needed
3. Setting up an auth state change listener
4. Updating the store state accordingly

This initialization pattern ensures that the store is properly configured when the application starts.

**Section sources**
- [Chat.tsx](file://apps/frontend/src/pages/Chat.tsx#L17-L23)
- [RootGuard.tsx](file://apps/frontend/src/components/RootGuard.tsx#L22)
- [router.tsx](file://apps/frontend/src/router.tsx#L34)
- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L109-L138)

## State Normalization and Optimization
WADI implements several state normalization and optimization techniques to ensure efficient state management and optimal performance.

### State Normalization
The stores follow normalization principles by storing data in flat structures with unique identifiers. For example:
- Conversations are stored in an array with unique IDs
- Sessions are maintained in a list with references to projects
- Workspaces contain member lists with user IDs

This normalization prevents data duplication and makes state updates more predictable.

### Selector Optimization
To avoid unnecessary re-renders, WADI uses several optimization techniques:
- **Memoized selectors**: Extracting only needed state properties
- **Granular loading states**: Specific loading indicators for different operations
- **Optimistic updates**: Immediate UI updates before server confirmation

The chat store implements optimistic updates when sending messages, immediately updating the UI with the user's message before the server response arrives. This creates a more responsive user experience.

### Loading State Management
Each store implements granular loading states for different operations, allowing components to show specific loading indicators. For example, the sessions store has separate loading states for fetching, creating, updating, and deleting sessions, enabling precise UI feedback.

**Section sources**
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L16-L20)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L17-L23)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts#L15-L20)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts#L31-L39)

## Async Actions and Error Handling
WADI implements robust async action patterns with comprehensive error handling across all stores.

### Async Action Patterns
Async actions follow a consistent pattern across stores:
1. Set operation-specific loading state
2. Clear previous errors
3. Execute async operation with proper error handling
4. Update state with results
5. Reset loading state
6. Handle errors with structured error states

The sessions store's `createSession` action demonstrates this pattern, setting the `createSession` loading state, handling success and error cases, and returning the created session.

### Error Handling
Each store implements structured error handling with consistent error state interfaces. The error state typically includes:
- Operation identifier
- Error message
- Timestamp
- Retry capability flag

Stores like sessionsStore, projectsStore, and workspacesStore use a `createErrorState` function to standardize error creation, ensuring consistency across error handling.

### Optimistic Updates
Several stores implement optimistic updates to improve perceived performance. The sessions store uses optimistic updates for session updates, immediately applying the changes to the UI before confirming with the server. If the server operation fails, the store reverts to the previous state.

**Section sources**
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts#L121-L148)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts#L99-L126)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts#L131-L157)
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L140-L288)

## Common Issues and Solutions
WADI addresses several common state management issues with specific solutions implemented in the codebase.

### Stale Closures
To avoid stale closures in async operations, stores use Zustand's `get` function to access the current state within async actions. The chat store's `sendMessage` action uses `get()` to access the current socket and conversation state, ensuring it works with the latest values.

### Race Conditions
The stores handle potential race conditions by properly managing loading states and using cancellation patterns where appropriate. The loading state management ensures that only one operation of each type can be in progress at a time, preventing conflicting state updates.

### Guest Mode State Management
The chat store implements special handling for guest mode, storing conversation history in localStorage and managing guest-specific state. This ensures that guest users have a persistent experience without requiring authentication.

### WebSocket State Synchronization
The chat store manages WebSocket connections and state synchronization carefully, handling connection states, authentication, and message processing. It properly cleans up WebSocket connections when switching conversations or disconnecting.

**Section sources**
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts#L52-L129)
- [authStore.ts](file://apps/frontend/src/store/authStore.ts#L127-L133)
- [Chat.tsx](file://apps/frontend/src/pages/Chat.tsx#L68-L81)

## Best Practices
WADI follows several best practices in its Zustand implementation to ensure maintainability, performance, and developer experience.

### Consistent Store Structure
All stores follow a consistent structure with standardized patterns for:
- State interfaces
- Loading states
- Error handling
- Action implementations
- Persistence configuration

This consistency makes it easier for developers to understand and work with any store in the codebase.

### Proper Error Handling
Stores implement comprehensive error handling with structured error states that include operation context, timestamps, and retry capabilities. This enables better error reporting and user feedback.

### Performance Optimization
The implementation prioritizes performance through:
- Granular loading states
- Optimistic updates
- Memoized selectors
- Proper cleanup of subscriptions and side effects

### Type Safety
The codebase leverages TypeScript extensively, with well-defined interfaces for state, actions, and data structures. This provides excellent type safety and IDE support.

**Section sources**
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts)

## Store Creation Guidelines
When creating new stores in WADI, follow these guidelines to maintain consistency with the existing architecture.

### Define Clear State Interfaces
Create well-typed interfaces for the store state, including:
- Data properties
- Loading states (operation-specific)
- Error state structure
- Selection state

### Implement Standard Actions
Include standard actions for common operations:
- Fetch data
- Create/update/delete items
- Set selection
- Clear errors
- Reset store

### Use Consistent Error Handling
Implement error handling using the established pattern with structured error states and the `createErrorState` function.

### Apply Appropriate Middleware
Use the `persist` middleware for stores that need state persistence, with proper `partialize` configuration to limit stored data.

### Document Store Dependencies
Document any dependencies between stores and ensure proper import ordering to avoid circular dependencies.

### Test Store Logic
Implement comprehensive tests for store actions, particularly async operations and error handling scenarios.

**Section sources**
- [chatStore.ts](file://apps/frontend/src/store/chatStore.ts)
- [sessionsStore.ts](file://apps/frontend/src/store/sessionsStore.ts)
- [projectsStore.ts](file://apps/frontend/src/store/projectsStore.ts)
- [workspacesStore.ts](file://apps/frontend/src/store/workspacesStore.ts)