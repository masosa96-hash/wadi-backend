# Directory Structure

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [apps/api/package.json](file://apps/api/package.json)
- [apps/frontend/package.json](file://apps/frontend/package.json)
- [apps/api/src/index.ts](file://apps/api/src/index.ts)
- [apps/frontend/src/main.tsx](file://apps/frontend/src/main.tsx)
- [packages/chat-core/index.ts](file://packages/chat-core/index.ts)
- [apps/api/railpack.json](file://apps/api/railpack.json)
- [apps/frontend/vite.config.ts](file://apps/frontend/vite.config.ts)
- [scripts/health-check.js](file://scripts/health-check.js)
- [wadi-cli/bin/wadi.js](file://wadi-cli/bin/wadi.js)
- [apps/api/migrations/001_workspace_enhancements.sql](file://apps/api/migrations/001_workspace_enhancements.sql)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Top-Level Directory Overview](#top-level-directory-overview)
3. [Application Structure](#application-structure)
4. [Shared Code Organization](#shared-code-organization)
5. [Utility Scripts and Tools](#utility-scripts-and-tools)
6. [Command Line Interface](#command-line-interface)
7. [Navigation and Development Workflow](#navigation-and-development-workflow)
8. [Architectural Patterns and Design Principles](#architectural-patterns-and-design-principles)
9. [Conclusion](#conclusion)

## Introduction

The WADI monorepo follows a well-structured organization that separates concerns while maintaining cohesion across the full-stack application. This document provides a comprehensive guide to the directory structure, explaining the purpose of each top-level directory and the internal organization of key components. The structure supports WADI's dual-brain architecture (Kivo + Wadi) and facilitates efficient development workflows for both frontend and backend systems.

**Section sources**

- [README.md](file://README.md#L123-L149)

## Top-Level Directory Overview

The WADI monorepo is organized into several top-level directories that serve distinct purposes in the application ecosystem:

- **apps/**: Contains the main application codebases, including both frontend and backend applications
- **packages/**: Houses shared code packages that can be consumed across multiple applications
- **scripts/**: Includes utility scripts for development, testing, and deployment operations
- **wadi-cli/**: Contains the command line interface tools for WADI operations

This monorepo structure, managed by pnpm workspaces, enables independent development of applications while promoting code reuse through shared packages. The organization follows industry best practices for full-stack JavaScript/TypeScript applications, making it easy for developers to navigate and contribute to different parts of the system.

```mermaid
graph TB
A[Monorepo Root] --> B[apps/]
A --> C[packages/]
A --> D[scripts/]
A --> E[wadi-cli/]
B --> B1[api/]
B --> B2[frontend/]
C --> C1[chat-core/]
D --> D1[health-check.js]
D --> D2[create-admin.js]
D --> D3[toggle-offline.js]
E --> E1[bin/]
E --> E2[wadi-doctor.ps1]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
```

**Diagram sources**

- [README.md](file://README.md#L123-L149)
- [package.json](file://package.json#L4)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L3)

**Section sources**

- [README.md](file://README.md#L123-L149)
- [package.json](file://package.json#L4)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L3)

## Application Structure

### Backend Application (apps/api/)

The backend application, located in `apps/api/`, follows a clean, modular structure based on the Express framework. The source code is organized into several key directories that implement separation of concerns:

- **config/**: Contains configuration files for environment variables, logging, and Supabase integration
- **controllers/**: Implements route handlers that process HTTP requests and responses
- **middleware/**: Provides reusable request processing functions for authentication, error handling, and rate limiting
- **routes/**: Defines API endpoints and maps them to controller functions
- **services/**: Contains business logic and integrations with external systems like OpenAI and Supabase
- **migrations/**: Stores database migration scripts for schema evolution

The backend's entry point is `src/index.ts`, which initializes the Express application, configures middleware, sets up routes, and starts the server. This structure follows the MVC (Model-View-Controller) pattern adapted for API development, making it easy to locate and modify specific functionality.

```mermaid
graph TD
A[API Entry Point] --> B[Configuration]
A --> C[Middleware]
A --> D[Routes]
B --> B1[env.ts]
B --> B2[logger.ts]
B --> B3[supabase.ts]
C --> C1[auth.ts]
C --> C2[errorHandler.ts]
C --> C3[rateLimit.ts]
D --> D1[projects.ts]
D --> D2[runs.ts]
D --> D3[sessions.ts]
D --> D4[workspaces.ts]
D1 --> E[billingController.ts]
D2 --> F[chatController.ts]
D3 --> G[memoryController.ts]
D4 --> H[userController.ts]
E --> I[Services]
F --> I
G --> I
H --> I
I --> I1[openai.ts]
I --> I2[websocket.ts]
I --> I3[brain/kivo.ts]
I --> I4[brain/wadi.ts]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
style F fill:#bbf,stroke:#333
style G fill:#bbf,stroke:#333
style H fill:#bbf,stroke:#333
style I fill:#bbf,stroke:#333
```

**Diagram sources**

- [apps/api/src/index.ts](file://apps/api/src/index.ts#L1-L144)
- [apps/api/package.json](file://apps/api/package.json#L1-L42)

**Section sources**

- [apps/api/src/index.ts](file://apps/api/src/index.ts#L1-L144)
- [apps/api/package.json](file://apps/api/package.json#L1-L42)

### Frontend Application (apps/frontend/)

The frontend application, located in `apps/frontend/`, is built with React and Vite, following modern React patterns and best practices. The source structure is organized to separate concerns and promote reusability:

- **components/**: Contains UI components, including both presentational components and reusable UI elements
- **pages/**: Implements page-level components that represent different views in the application
- **store/**: Manages application state using Zustand, with separate stores for different domains
- **hooks/**: Contains custom React hooks for reusable logic
- **layouts/**: Defines layout components that wrap pages with common UI elements
- **config/**: Stores configuration for API endpoints and Supabase integration
- **utils/**: Includes utility functions for validation, error handling, and other cross-cutting concerns
- **types/**: Defines TypeScript interfaces and types used throughout the application
- **locales/**: Contains internationalization files for multi-language support

The frontend's entry point is `src/main.tsx`, which renders the root App component. The application uses React Router for navigation and follows a component-based architecture that makes it easy to understand the UI hierarchy and data flow.

```mermaid
graph TD
A[Frontend Entry Point] --> B[App Component]
B --> C[Router]
B --> D[State Management]
B --> E[Layouts]
C --> C1[Home.tsx]
C --> C2[Chat.tsx]
C --> C3[Settings.tsx]
C --> C4[Billing.tsx]
D --> D1[authStore.ts]
D --> D2[chatStore.ts]
D --> D3[themeStore.ts]
D --> D4[workspaceStore.ts]
E --> E1[RootLayout.tsx]
E --> E2[AuthLayout.tsx]
B --> F[Components]
F --> F1[UI Components]
F --> F2[Forms]
F --> F3[Modals]
F1 --> F1a[Button.tsx]
F1 --> F1b[Card.tsx]
F1 --> F1c[Input.tsx]
F2 --> F2a[Login.tsx]
F2 --> F2b[Register.tsx]
F3 --> F3a[ShareModal.tsx]
F3 --> F3b[ExportModal.tsx]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
style F fill:#bbf,stroke:#333
```

**Diagram sources**

- [apps/frontend/src/main.tsx](file://apps/frontend/src/main.tsx#L1-L9)
- [apps/frontend/package.json](file://apps/frontend/package.json#L1-L48)

**Section sources**

- [apps/frontend/src/main.tsx](file://apps/frontend/src/main.tsx#L1-L9)
- [apps/frontend/package.json](file://apps/frontend/package.json#L1-L48)

## Shared Code Organization

The `packages/` directory contains shared code that can be reused across multiple applications within the monorepo. Currently, the primary shared package is `chat-core/`, which exports core functionality used by both frontend and backend applications.

The `chat-core/` package follows a clean structure with:

- **index.ts**: The main entry point that re-exports all public APIs
- **kivo.ts**: Implements the Kivo brain functionality
- **wadi.ts**: Implements the Wadi brain functionality
- **types.ts**: Defines shared TypeScript types and interfaces

This shared package implements WADI's dual-brain architecture, where Kivo handles reasoning and Wadi handles execution. By centralizing this core logic in a shared package, both the frontend and backend can leverage consistent AI functionality while maintaining separation of concerns.

```mermaid
classDiagram
class ChatCore {
+index.ts
+kivo.ts
+wadi.ts
+types.ts
}
class Kivo {
+processInput(input) Response
+analyzeContext(context) Analysis
+generateResponse(prompt) string
}
class Wadi {
+executeAction(action) Result
+manageState(state) State
+handleIntegration(service) Response
}
class Types {
+Request
+Response
+Context
+State
+Action
}
ChatCore --> Kivo : "exports"
ChatCore --> Wadi : "exports"
ChatCore --> Types : "exports"
Kivo --> Types : "uses"
Wadi --> Types : "uses"
note right of ChatCore
Shared package used by both
frontend and backend applications
end note
```

**Diagram sources**

- [packages/chat-core/index.ts](file://packages/chat-core/index.ts#L1-L4)
- [apps/api/package.json](file://apps/api/package.json#L17)
- [apps/frontend/package.json](file://apps/frontend/package.json#L20)

**Section sources**

- [packages/chat-core/index.ts](file://packages/chat-core/index.ts#L1-L4)
- [apps/api/package.json](file://apps/api/package.json#L17)
- [apps/frontend/package.json](file://apps/frontend/package.json#L20)

## Utility Scripts and Tools

The `scripts/` directory contains various utility scripts that support development, testing, and deployment workflows. These scripts are designed to automate common tasks and ensure consistency across development environments.

Key scripts include:

- **health-check.js**: Verifies that all required services and configurations are in place
- **create-admin.js**: Creates administrative users in the system
- **quick-test.js**: Runs quick validation tests on core functionality
- **test-chat-endpoint.js**: Tests the chat API endpoint connectivity
- **test-openai.js**: Validates OpenAI API integration
- **test-run-creation.js**: Tests run creation functionality
- **toggle-offline.js**: Toggles offline mode for testing
- **verify-build.js**: Verifies the build process completes successfully

These scripts follow a consistent pattern of using Node.js with appropriate dependencies to perform their tasks, and they are designed to be run from the project root using pnpm scripts defined in the root package.json.

```mermaid
flowchart TD
A[Scripts Directory] --> B[Health Check]
A --> C[User Management]
A --> D[Testing Utilities]
A --> E[Build Verification]
B --> B1[health-check.js]
C --> C1[create-admin.js]
D --> D1[quick-test.js]
D --> D2[test-chat-endpoint.js]
D --> D3[test-openai.js]
D --> D4[test-run-creation.js]
E --> E1[verify-build.js]
B1 --> F[Check Environment]
B1 --> G[Check Services]
B1 --> H[Check Structure]
D1 --> I[Test Core Features]
D2 --> J[Test API Connectivity]
D3 --> K[Test AI Integration]
D4 --> L[Test Data Operations]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
```

**Diagram sources**

- [scripts/health-check.js](file://scripts/health-check.js#L1-L164)
- [package.json](file://package.json#L25-L28)

**Section sources**

- [scripts/health-check.js](file://scripts/health-check.js#L1-L164)
- [package.json](file://package.json#L25-L28)

## Command Line Interface

The `wadi-cli/` directory contains the command line interface tools for WADI operations. This CLI provides a convenient way to perform common administrative and diagnostic tasks without needing to remember complex command sequences.

The CLI is implemented as a Node.js script (`bin/wadi.js`) that uses child process spawning to execute PowerShell scripts. Currently, the primary command is `doctor`, which runs the `wadi-doctor.ps1` script to diagnose and fix common issues in the development environment.

This CLI structure follows Node.js CLI conventions, with the executable script in the bin directory and supporting scripts in the main directory. The use of PowerShell scripts allows for robust system-level operations on Windows environments while maintaining cross-platform compatibility through Node.js.

```mermaid
sequenceDiagram
participant User
participant CLI as wadi.js
participant Script as wadi-doctor.ps1
participant System as Operating System
User->>CLI : wadi doctor
CLI->>CLI : Parse command
CLI->>CLI : Resolve script path
CLI->>Script : Spawn PowerShell process
Script->>System : Execute diagnostic checks
System-->>Script : Return system information
Script-->>CLI : Return results
CLI-->>User : Display diagnostic output
Note over CLI,Script : Uses spawnSync to ensure<br/>synchronous execution and<br/>proper output handling
```

**Diagram sources**

- [wadi-cli/bin/wadi.js](file://wadi-cli/bin/wadi.js#L1-L27)
- [wadi-cli/wadi-doctor.ps1](file://wadi-cli/wadi-doctor.ps1)

**Section sources**

- [wadi-cli/bin/wadi.js](file://wadi-cli/bin/wadi.js#L1-L27)

## Navigation and Development Workflow

Navigating the WADI monorepo follows a logical pattern based on the separation of concerns and the full-stack nature of the application. Developers can quickly locate functionality by understanding the relationship between frontend and backend components.

For example, to understand the chat functionality:

1. Start with the frontend page component (`apps/frontend/src/pages/Chat.tsx`)
2. Examine the associated state store (`apps/frontend/src/store/chatStore.ts`)
3. Trace API calls to the backend route definition (`apps/api/src/routes/chat.ts`)
4. Follow the route to its controller (`apps/api/src/controllers/chatController.ts`)
5. Explore the underlying service logic (`apps/api/src/services/openai.ts`)

This clear separation makes it easy to debug issues, add new features, and understand data flow through the system. The use of consistent naming conventions across frontend and backend components further enhances discoverability.

When adding new features, developers should:

- Place UI components in the appropriate frontend directory (`components/`, `pages/`, etc.)
- Implement state management in the `store/` directory using Zustand
- Create new API endpoints in `apps/api/src/routes/` and `controllers/`
- Implement business logic in `services/` when appropriate
- Add shared functionality to `packages/` if it will be used across applications

```mermaid
flowchart LR
A[Feature Request] --> B{Frontend or Backend?}
B --> |Frontend| C[Create Component]
B --> |Backend| D[Create Route]
C --> E[Add to Pages Directory]
C --> F[Create Store]
C --> G[Connect to API]
D --> H[Define Route]
D --> I[Create Controller]
D --> J[Implement Service]
G --> K[Test Integration]
J --> K
K --> L[Verify Functionality]
L --> M[Commit Changes]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
style F fill:#bbf,stroke:#333
style G fill:#bbf,stroke:#333
style H fill:#bbf,stroke:#333
style I fill:#bbf,stroke:#333
style J fill:#bbf,stroke:#333
style K fill:#bbf,stroke:#333
style L fill:#bbf,stroke:#333
style M fill:#bbf,stroke:#333
```

**Diagram sources**

- [README.md](file://README.md#L90-L101)
- [package.json](file://package.json#L7-L10)

**Section sources**

- [README.md](file://README.md#L90-L101)
- [package.json](file://package.json#L7-L10)

## Architectural Patterns and Design Principles

The WADI monorepo structure embodies several key architectural patterns and design principles that contribute to its maintainability and scalability:

1. **Monorepo Organization**: Using pnpm workspaces to manage multiple packages and applications in a single repository, enabling shared dependencies and consistent tooling.

2. **Separation of Concerns**: Clear division between frontend and backend applications, with well-defined interfaces between them.

3. **Modular Design**: Both frontend and backend applications are organized into modules that encapsulate specific functionality.

4. **Shared Core Logic**: Centralizing core AI functionality in the `chat-core` package to ensure consistency across the application.

5. **Configuration Management**: Proper separation of configuration from code, with environment-specific settings managed through `.env` files.

6. **Database Migrations**: Using SQL migration files to manage database schema evolution in a controlled and versioned manner.

7. **API Design**: RESTful API design with clear endpoint organization and consistent error handling.

8. **State Management**: Using Zustand for frontend state management, providing a simple and scalable solution for application state.

The structure also supports WADI's dual-brain architecture, with the Kivo brain handling reasoning and the Wadi brain handling execution. This architectural pattern is reflected in the code organization, with clear separation between cognitive processing and operational execution components.

```mermaid
graph TD
A[Architectural Principles] --> B[Monorepo]
A --> C[Separation of Concerns]
A --> D[Modular Design]
A --> E[Shared Core]
A --> F[Configuration Management]
A --> G[Database Migrations]
A --> H[API Design]
A --> I[State Management]
B --> B1[pnpm workspaces]
B --> B2[Shared dependencies]
C --> C1[Frontend/Backend split]
C --> C2[Clear interfaces]
D --> D1[Feature modules]
D --> D2[Reusable components]
E --> E1[chat-core package]
E --> E2[Dual-brain architecture]
F --> F1[.env files]
F --> F2[Configuration validation]
G --> G1[SQL migration files]
G --> G2[Schema versioning]
H --> H1[RESTful endpoints]
H --> H2[Consistent error handling]
I --> I1[Zustand stores]
I --> I2[State organization]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
style F fill:#bbf,stroke:#333
style G fill:#bbf,stroke:#333
style H fill:#bbf,stroke:#333
style I fill:#bbf,stroke:#333
```

**Diagram sources**

- [apps/api/migrations/001_workspace_enhancements.sql](file://apps/api/migrations/001_workspace_enhancements.sql#L1-L200)
- [README.md](file://README.md#L26-L35)
- [apps/api/src/index.ts](file://apps/api/src/index.ts#L1-L144)

**Section sources**

- [apps/api/migrations/001_workspace_enhancements.sql](file://apps/api/migrations/001_workspace_enhancements.sql#L1-L200)
- [README.md](file://README.md#L26-L35)
- [apps/api/src/index.ts](file://apps/api/src/index.ts#L1-L144)

## Conclusion

The WADI monorepo structure is thoughtfully designed to support a full-stack AI application with clear separation of concerns, reusable components, and scalable architecture. The organization into `apps/`, `packages/`, `scripts/`, and `wadi-cli/` directories provides a logical framework for development that accommodates both frontend and backend systems while promoting code reuse and maintainability.

The backend application follows a clean Express-based structure with separation between routes, controllers, and services, making it easy to understand and modify API functionality. The frontend application uses a modern React architecture with component-based design and Zustand for state management. Shared core functionality is centralized in the `chat-core` package, ensuring consistency across the application.

This structure supports efficient development workflows, making it easy for developers to navigate the codebase, locate specific functionality, and add new features. The use of standardized patterns and conventions throughout the codebase enhances readability and maintainability, while the monorepo approach enables shared tooling and dependencies.

By following this well-organized structure, WADI maintains a high degree of code quality and developer productivity, providing a solid foundation for ongoing development and enhancement of the AI conversational assistant.

[No sources needed since this section summarizes without analyzing specific files]
