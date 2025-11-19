# WADI - Complete Implementation Guide for Remaining Phases

## Overview

This guide provides **step-by-step instructions** to complete Phases 3-6 of the WADI Autonomous Sprint Plan. Each phase includes code examples, file locations, and implementation patterns consistent with the completed Phase 1 & 2 work.

---

## Phase 3: Design & User Experience

### Task 3.1: Framer Motion Integration (PENDING)

**Estimated Time:** 2-3 hours

#### Step 1: Install Framer Motion
```bash
cd "e:\WADI intento mil"
pnpm add framer-motion
```

#### Step 2: Create Animation Variants File
**File:** `apps/frontend/src/utils/animations.ts`
```typescript
import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const slideIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};
```

#### Step 3: Update MessageBubble with Animation
**File:** `apps/frontend/src/components/MessageBubble.tsx`
```typescript
import { motion } from "framer-motion";
import { slideIn } from "../utils/animations";

// Wrap the main div with motion.div
return (
  <motion.div
    variants={slideIn}
    initial="initial"
    animate="animate"
    style={{...}}
  >
    {/* existing content */}
  </motion.div>
);
```

#### Step 4: Update Modal with Animation
**File:** `apps/frontend/src/components/Modal.tsx`
```typescript
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants, fadeIn } from "../utils/animations";

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        style={backdropStyle}
        onClick={onClose}
      />
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={modalStyle}
      >
        {/* existing content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### Step 5: Add Accessibility Support
```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const variants = prefersReducedMotion ? {} : slideIn;
```

---

### Task 3.2: Glass UI Design System (PENDING)

**Estimated Time:** 2-3 hours

#### Step 1: Update Theme with Glass Styles
**File:** `apps/frontend/src/styles/theme.ts`
```typescript
export const theme = {
  // ... existing theme
  
  glass: {
    subtle: {
      background: 'rgba(26, 31, 43, 0.5)',
      backdropFilter: 'blur(8px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
    medium: {
      background: 'rgba(26, 31, 43, 0.7)',
      backdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    strong: {
      background: 'rgba(26, 31, 43, 0.85)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
    accent: {
      background: 'rgba(0, 217, 163, 0.3)',
      backdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(0, 217, 163, 0.4)',
      boxShadow: '0 0 20px rgba(0, 217, 163, 0.15)',
    }
  },
  
  zIndex: {
    base: 0,
    cards: 1,
    sidebar: 10,
    dropdowns: 20,
    modals: 30,
    toasts: 40,
  }
} as const;
```

#### Step 2: Update Card Component
**File:** `apps/frontend/src/components/Card.tsx`
```typescript
// Add glass effect to card style
const cardStyle: CSSProperties = {
  ...theme.glass.medium,
  borderRadius: theme.borderRadius.large,
  padding: theme.spacing.xl,
  transition: theme.transitions.medium,
  willChange: 'transform',
};

// Enhance hover effect
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-4px)';
  e.currentTarget.style.boxShadow = theme.glass.medium.boxShadow + ', ' + theme.shadows.glow;
}}
```

#### Step 3: Update Modal with Glass Effect
**File:** `apps/frontend/src/components/Modal.tsx`
```typescript
const modalStyle: CSSProperties = {
  ...theme.glass.strong,
  // ... rest of existing styles
};

const backdropStyle: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  // ... rest
};
```

---

### Task 3.3: MessageBubble V2 Enhancement (PENDING)

**Estimated Time:** 2-3 hours

Already partially complete. Additional enhancements:

#### Add Syntax Highlighting
```bash
pnpm add react-syntax-highlighter @types/react-syntax-highlighter
```

**Update MessageBubble:**
```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Detect code blocks
const renderContent = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
  // Parse and render with syntax highlighting
};
```

---

## Phase 4: Advanced Capabilities

### Task 4.1: Export System (PENDING)

**Estimated Time:** 3-4 hours

#### Step 1: Install Dependencies
```bash
pnpm add jspdf html2canvas file-saver
pnpm add -D @types/file-saver
```

#### Step 2: Create Export Utilities
**File:** `apps/frontend/src/utils/export.ts`
```typescript
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import type { Run } from '../store/runsStore';

export async function exportToMarkdown(run: Run, projectName: string): Promise<void> {
  const markdown = `# ${run.custom_name || 'Run Export'}

**Date:** ${new Date(run.created_at).toISOString()}
**Project:** ${projectName}
**Model:** ${run.model}

---

## User Input

${run.input}

## AI Response

${run.output}

---

*Exported from WADI*
`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${run.custom_name || 'run'}-${run.id.substring(0, 8)}.md`);
}

export async function exportToPDF(run: Run, projectName: string): Promise<void> {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text(run.custom_name || 'Run Export', 20, 20);
  
  // Add metadata
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(run.created_at).toLocaleString()}`, 20, 30);
  doc.text(`Project: ${projectName}`, 20, 35);
  doc.text(`Model: ${run.model}`, 20, 40);
  
  // Add content
  doc.setFontSize(12);
  doc.text('User Input:', 20, 50);
  doc.setFontSize(10);
  const splitInput = doc.splitTextToSize(run.input, 170);
  doc.text(splitInput, 20, 55);
  
  const inputHeight = splitInput.length * 5;
  doc.setFontSize(12);
  doc.text('AI Response:', 20, 60 + inputHeight);
  doc.setFontSize(10);
  const splitOutput = doc.splitTextToSize(run.output, 170);
  doc.text(splitOutput, 20, 65 + inputHeight);
  
  doc.save(`${run.custom_name || 'run'}-${run.id.substring(0, 8)}.pdf`);
}

export function exportToJSON(run: Run, projectName: string, sessionName?: string): void {
  const exportData = {
    export_version: '1.0',
    exported_at: new Date().toISOString(),
    run: {
      id: run.id,
      custom_name: run.custom_name,
      input: run.input,
      output: run.output,
      model: run.model,
      created_at: run.created_at,
      project: {
        name: projectName
      },
      session: sessionName ? { name: sessionName } : null,
    }
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  saveAs(blob, `run-${run.id.substring(0, 8)}.json`);
}
```

#### Step 3: Add Export Buttons to MessageBubble
Update MessageBubble to include export options in the actions menu.

---

### Task 4.2: Share Link System (PENDING)

**Estimated Time:** 3-4 hours

#### Step 1: Create Database Schema
**File:** `docs/database-schema-sharing.sql`
```sql
CREATE TABLE IF NOT EXISTS share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT one_resource CHECK ((run_id IS NOT NULL)::integer + (session_id IS NOT NULL)::integer = 1)
);

CREATE INDEX idx_share_tokens_token ON share_tokens(token);
CREATE INDEX idx_share_tokens_run_id ON share_tokens(run_id);
CREATE INDEX idx_share_tokens_session_id ON share_tokens(session_id);

ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view with valid token"
  ON share_tokens FOR SELECT
  USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Users can create shares for own content"
  ON share_tokens FOR INSERT
  WITH CHECK (auth.uid() = created_by);
```

#### Step 2: Backend Controller
**File:** `apps/api/src/controllers/shareController.ts`
```typescript
import crypto from 'crypto';

export async function createShareLink(req: Request, res: Response): Promise<void> {
  const userId = req.user_id;
  const { run_id, session_id, expires_in, max_views } = req.body;
  
  // Generate secure token
  const token = crypto.randomBytes(16).toString('hex');
  
  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (expires_in || 24));
  
  const { data, error } = await supabase
    .from('share_tokens')
    .insert({
      token,
      run_id: run_id || null,
      session_id: session_id || null,
      created_by: userId,
      expires_at: expiresAt.toISOString(),
      max_views: max_views || null,
    })
    .select()
    .single();
  
  if (error) {
    res.status(500).json({ error: 'Failed to create share link' });
    return;
  }
  
  const shareUrl = `${process.env.FRONTEND_URL}/share/${token}`;
  res.status(201).json({ token, url: shareUrl });
}

export async function getSharedContent(req: Request, res: Response): Promise<void> {
  const { token } = req.params;
  
  // Verify token and increment view count
  // Return run or session data
  // Check expiration and max_views
}
```

---

## Phase 5: AI Intelligence Layer

### Task 5.1: Real-Time AI Streaming (PENDING)

**Estimated Time:** 4-6 hours

#### Step 1: Update OpenAI Service for Streaming
**File:** `apps/api/src/services/openai.ts`
```typescript
export async function generateCompletionStream(
  input: string,
  model: string,
  onChunk: (text: string) => void
): Promise<string> {
  const stream = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: input }],
    stream: true,
  });
  
  let fullResponse = '';
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }
  
  return fullResponse;
}
```

#### Step 2: Create SSE Endpoint
**File:** `apps/api/src/controllers/runsController.ts`
```typescript
export async function streamRun(req: Request, res: Response): Promise<void> {
  const { input } = req.body;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    await generateCompletionStream(input, 'gpt-3.5-turbo', (chunk) => {
      res.write(`event: token\n`);
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    });
    
    res.write(`event: done\n`);
    res.write(`data: ${JSON.stringify({ complete: true })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
}
```

#### Step 3: Frontend Streaming Handler
**File:** `apps/frontend/src/utils/streaming.ts`
```typescript
export function createStreamingConnection(
  projectId: string,
  input: string,
  onToken: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  const eventSource = new EventSource(
    `${API_URL}/api/projects/${projectId}/runs/stream`
  );
  
  eventSource.addEventListener('token', (e) => {
    const data = JSON.parse(e.data);
    onToken(data.content);
  });
  
  eventSource.addEventListener('done', () => {
    eventSource.close();
    onComplete();
  });
  
  eventSource.addEventListener('error', (e) => {
    eventSource.close();
    onError('Stream error');
  });
  
  return () => eventSource.close();
}
```

---

### Task 5.2-5.4: Memory, Commands, Modes (PENDING)

**Combined Estimated Time:** 10-15 hours

These features require substantial implementation. Refer to the design document (`.qoder/quests/sprint-plan-automation.md`) for complete specifications.

**Key Implementation Files Needed:**
- `apps/api/src/services/memory.ts`
- `apps/api/src/services/commands.ts`
- `apps/api/src/services/modes.ts`
- Database schema for memory table
- Frontend command parser
- Mode selector component

---

## Phase 6: QA & Testing (PENDING)

**Estimated Time:** 4-6 hours

### Checklist

#### End-to-End Testing
- [ ] User registration and login
- [ ] Project creation
- [ ] Session creation (auto and manual)
- [ ] Run creation
- [ ] Run renaming
- [ ] Session renaming
- [ ] Tag creation and assignment
- [ ] Export functionality
- [ ] Share link generation and access
- [ ] Streaming AI responses
- [ ] Memory persistence
- [ ] Command execution
- [ ] Mode switching

#### Console Error Elimination
- [ ] No React warnings in console
- [ ] No network errors
- [ ] No uncaught promise rejections
- [ ] No memory leaks
- [ ] No infinite loops

#### UI Consistency
- [ ] All buttons use Button component
- [ ] All inputs use Input component
- [ ] All colors from theme
- [ ] All spacing from theme
- [ ] All animations consistent
- [ ] Responsive on mobile/tablet/desktop

#### Performance Benchmarks
- [ ] Initial load < 2s
- [ ] Time to interactive < 3s
- [ ] Run creation < 1s (excluding AI)
- [ ] Animations at 60 FPS

---

## Development Workflow

### Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement following established patterns
3. Test locally
4. Create pull request

### Testing
```bash
# Frontend
cd apps/frontend
pnpm run build  # Check for TypeScript errors

# Backend
cd apps/api
pnpm run build  # Check for TypeScript errors
```

### Deployment
1. Push to main branch
2. Deploy backend to your hosting service
3. Deploy frontend to Vercel/Netlify
4. Run migrations on production database

---

## Estimated Total Time to Complete

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 3 | 3 tasks | 6-9 hours |
| Phase 4 | 2 tasks | 6-8 hours |
| Phase 5 | 4 tasks | 10-15 hours |
| Phase 6 | 1 task | 4-6 hours |
| **Total** | **10 tasks** | **26-38 hours** |

**Recommended Approach:** Complete one phase at a time, testing thoroughly before moving to the next.

---

## Support Resources

- **Design Document:** `.qoder/quests/sprint-plan-automation.md` (complete specifications)
- **Completed Code:** Phases 1-2 (reference implementations)
- **Database Schemas:** `docs/` directory
- **Status Documents:** `IMPLEMENTATION_COMPLETE.md`, `FINAL_IMPLEMENTATION_STATUS.md`

---

Good luck with the remaining implementation! The foundation is solid and the patterns are established. 🚀
