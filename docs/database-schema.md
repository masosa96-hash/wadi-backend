# WADI Database Schema Documentation

This document describes the Supabase database schema for WADI Beta 1.

## Tables Overview

The database consists of three main tables:

1. **profiles** - User profile information
2. **projects** - User projects
3. **runs** - AI execution runs within projects

## Table Definitions

### 1. profiles

Stores user profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `user_id` (UUID, Primary Key): References auth.users.id
- `display_name` (TEXT): User's display name
- `created_at` (TIMESTAMP): Profile creation timestamp

**Indexes:**

- Primary key on `user_id` (automatic)

**Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### 2. projects

Stores user projects for organizing AI runs.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` (UUID, Primary Key): Unique project identifier
- `user_id` (UUID, Foreign Key): References profiles.user_id
- `name` (TEXT): Project name (max 100 characters)
- `description` (TEXT): Project description (max 500 characters, nullable)
- `created_at` (TIMESTAMP): Project creation timestamp

**Indexes:**

```sql
-- Index for efficient user project queries
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Index for sorting by creation date
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

**Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can read their own projects
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 3. runs

Stores AI execution runs with input/output history.

```sql
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  input TEXT NOT NULL CHECK (char_length(input) <= 5000),
  output TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` (UUID, Primary Key): Unique run identifier
- `project_id` (UUID, Foreign Key): References projects.id
- `user_id` (UUID, Foreign Key): References profiles.user_id
- `input` (TEXT): User input text (max 5000 characters)
- `output` (TEXT): AI-generated output
- `model` (TEXT): OpenAI model used (default: gpt-3.5-turbo)
- `created_at` (TIMESTAMP): Run creation timestamp

**Indexes:**

```sql
-- Index for efficient project run queries
CREATE INDEX idx_runs_project_id ON runs(project_id);

-- Composite index for user + chronological sorting
CREATE INDEX idx_runs_user_created ON runs(user_id, created_at DESC);

-- Index for chronological queries
CREATE INDEX idx_runs_created_at ON runs(created_at DESC);
```

**Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- Users can read runs from their own projects
CREATE POLICY "Users can read own runs"
  ON runs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert runs for their own projects
CREATE POLICY "Users can insert own runs"
  ON runs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete their own runs
CREATE POLICY "Users can delete own runs"
  ON runs FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (user_id FK)
    ↓
projects (user_id FK)
    ↓
runs (project_id FK, user_id FK)
```

**Cascade Deletion:**

- Deleting a user deletes their profile (CASCADE)
- Deleting a profile deletes all projects (CASCADE)
- Deleting a project deletes all runs (CASCADE)

---

## Setup Instructions

### 1. Create Tables in Supabase

Execute the SQL scripts above in your Supabase SQL Editor in the following order:

1. profiles table
2. projects table
3. runs table

### 2. Enable Row Level Security

After creating tables, enable RLS and create policies as shown above.

### 3. Verify Setup

Run the following query to verify all tables are created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'projects', 'runs');
```

### 4. Test RLS Policies

Create a test user via Supabase Auth and verify they can only access their own data.

---

## Data Validation Constraints

### profiles

- `display_name`: Required, no max length enforced (consider adding if needed)

### projects

- `name`: Required, max 100 characters
- `description`: Optional, max 500 characters

### runs

- `input`: Required, max 5000 characters
- `output`: Required, no max length (AI-generated)
- `model`: Required, defaults to 'gpt-3.5-turbo'

---

## Performance Considerations

1. **Indexes** are created on frequently queried columns:
   - Foreign keys (user_id, project_id)
   - Timestamp columns for sorting (created_at)

2. **Composite indexes** optimize common query patterns:
   - `idx_runs_user_created` for user-specific chronological queries

3. **RLS Policies** are optimized to use indexes efficiently (auth.uid() comparisons)

---

## Migration Notes

When migrating from the current file-based system:

- User data in `apps/api/data/users.json` → profiles table
- Conversation history in `memory.json` → runs table (requires project assignment)
- Brain modules (memory.ts, adaptiveStyle.ts) → Not migrated (out of scope)

---

## Future Considerations (Beta 2+)

Potential schema enhancements for future releases:

- Add `updated_at` columns with triggers
- Add `deleted_at` for soft deletes
- Add project tags or categories
- Add run favorites or bookmarks
- Add collaborative project sharing (user permissions)
- Add run metadata (tokens used, duration, cost)
