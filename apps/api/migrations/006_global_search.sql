-- Migration: Global Search and Advanced History (P7)
-- Description: Add full-text search indexes and views for global search across messages, conversations, and workspaces

-- ============================================
-- 1. Add search indexes to messages
-- ============================================

-- Add GIN index for full-text search on message content
CREATE INDEX IF NOT EXISTS idx_messages_content_search 
ON messages USING gin(to_tsvector('spanish', content));

-- Add index for filtering messages by date
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Composite index for workspace-based search
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- ============================================
-- 2. Add search indexes to conversations
-- ============================================

-- Add GIN index for full-text search on conversation titles
CREATE INDEX IF NOT EXISTS idx_conversations_title_search 
ON conversations USING gin(to_tsvector('spanish', COALESCE(title, '')));

-- Composite index for user's conversations by date
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
ON conversations(user_id, updated_at DESC);

-- ============================================
-- 3. Add search indexes to workspaces
-- ============================================

-- Add GIN index for full-text search on workspace names and descriptions
CREATE INDEX IF NOT EXISTS idx_workspaces_name_search 
ON workspaces USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- ============================================
-- 4. Create materialized view for search results
-- ============================================

-- This view aggregates searchable content for better performance
CREATE MATERIALIZED VIEW IF NOT EXISTS search_index AS
SELECT 
  m.id as message_id,
  m.conversation_id,
  m.content,
  m.role,
  m.created_at as message_date,
  c.id as conversation_id_full,
  c.title as conversation_title,
  c.user_id,
  c.workspace_id,
  w.name as workspace_name,
  w.owner_id as workspace_owner,
  -- Create search vector combining all searchable fields
  to_tsvector('spanish', 
    m.content || ' ' || 
    COALESCE(c.title, '') || ' ' || 
    COALESCE(w.name, '') || ' ' || 
    COALESCE(w.description, '')
  ) as search_vector
FROM messages m
LEFT JOIN conversations c ON c.id = m.conversation_id
LEFT JOIN workspaces w ON w.id = c.workspace_id
WHERE m.role = 'user' OR m.role = 'assistant';

-- Index on the materialized view
CREATE INDEX IF NOT EXISTS idx_search_index_vector 
ON search_index USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_search_index_user 
ON search_index(user_id);

CREATE INDEX IF NOT EXISTS idx_search_index_workspace 
ON search_index(workspace_id);

CREATE INDEX IF NOT EXISTS idx_search_index_date 
ON search_index(message_date DESC);

-- ============================================
-- 5. Function to refresh search index
-- ============================================

CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Function for global search
-- ============================================

CREATE OR REPLACE FUNCTION global_search(
  p_user_id UUID,
  p_query TEXT,
  p_workspace_id UUID DEFAULT NULL,
  p_date_filter TEXT DEFAULT NULL, -- 'week', 'month', 'quarter', or NULL
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  conversation_title TEXT,
  workspace_id UUID,
  workspace_name TEXT,
  content TEXT,
  message_date TIMESTAMPTZ,
  relevance REAL,
  snippet TEXT
) AS $$
DECLARE
  v_date_cutoff TIMESTAMPTZ;
BEGIN
  -- Calculate date cutoff based on filter
  CASE p_date_filter
    WHEN 'week' THEN v_date_cutoff := now() - interval '7 days';
    WHEN 'month' THEN v_date_cutoff := now() - interval '30 days';
    WHEN 'quarter' THEN v_date_cutoff := now() - interval '90 days';
    ELSE v_date_cutoff := NULL;
  END CASE;

  RETURN QUERY
  SELECT 
    si.message_id,
    si.conversation_id,
    si.conversation_title,
    si.workspace_id,
    si.workspace_name,
    si.content,
    si.message_date,
    ts_rank(si.search_vector, to_tsquery('spanish', p_query)) as relevance,
    ts_headline(
      'spanish',
      si.content,
      to_tsquery('spanish', p_query),
      'MaxWords=20, MinWords=10, MaxFragments=1'
    ) as snippet
  FROM search_index si
  WHERE 
    si.user_id = p_user_id
    AND si.search_vector @@ to_tsquery('spanish', p_query)
    AND (p_workspace_id IS NULL OR si.workspace_id = p_workspace_id)
    AND (v_date_cutoff IS NULL OR si.message_date >= v_date_cutoff)
  ORDER BY 
    relevance DESC,
    si.message_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Trigger to auto-refresh search index
-- ============================================

-- Create a function to trigger search index refresh
CREATE OR REPLACE FUNCTION trigger_refresh_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue a refresh (in production, use a job queue)
  -- For now, we'll refresh on-demand via API
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on message insert/update
DROP TRIGGER IF EXISTS trg_refresh_search_on_message ON messages;
CREATE TRIGGER trg_refresh_search_on_message
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_search_index();

-- ============================================
-- 8. Helper function to get message context
-- ============================================

-- Returns surrounding messages for context when navigating to a search result
CREATE OR REPLACE FUNCTION get_message_context(
  p_message_id UUID,
  p_context_size INTEGER DEFAULT 5
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  is_target BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH target_message AS (
    SELECT m.conversation_id, m.created_at
    FROM messages m
    WHERE m.id = p_message_id
  ),
  context_messages AS (
    SELECT 
      m.id,
      m.conversation_id,
      m.role,
      m.content,
      m.created_at,
      ROW_NUMBER() OVER (ORDER BY m.created_at) as rn,
      (SELECT COUNT(*) FROM messages m2 
       WHERE m2.conversation_id = m.conversation_id 
       AND m2.created_at <= (SELECT created_at FROM target_message)
      ) as target_rn
    FROM messages m
    WHERE m.conversation_id = (SELECT conversation_id FROM target_message)
  )
  SELECT 
    cm.id,
    cm.conversation_id,
    cm.role,
    cm.content,
    cm.created_at,
    (cm.id = p_message_id) as is_target
  FROM context_messages cm
  WHERE cm.rn BETWEEN (cm.target_rn - p_context_size) AND (cm.target_rn + p_context_size)
  ORDER BY cm.created_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Add comments for documentation
-- ============================================

COMMENT ON MATERIALIZED VIEW search_index IS 'Aggregated search index for fast full-text search across messages, conversations, and workspaces';
COMMENT ON FUNCTION global_search IS 'Main search function supporting filters by workspace and date range';
COMMENT ON FUNCTION get_message_context IS 'Returns surrounding messages for a target message to provide context';
COMMENT ON FUNCTION refresh_search_index IS 'Manually refresh the search index materialized view';

-- ============================================
-- 10. Initial population of search index
-- ============================================

-- Refresh the materialized view to populate initial data
REFRESH MATERIALIZED VIEW search_index;
