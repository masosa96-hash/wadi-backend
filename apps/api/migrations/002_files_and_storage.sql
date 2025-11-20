-- Migration: Files and Storage System (P6)
-- Description: Support for file uploads, processing, and attachment to messages

-- ============================================
-- 1. Create files table
-- ============================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- File information
  filename TEXT NOT NULL, -- Sanitized filename for storage
  original_filename TEXT NOT NULL, -- Original name from user
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'text', 'docx', 'other')),
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type TEXT NOT NULL,
  
  -- Storage
  storage_path TEXT NOT NULL, -- Path in storage bucket
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 's3')),
  storage_bucket TEXT DEFAULT 'user-files',
  
  -- Processing
  extracted_text TEXT, -- Extracted text content
  summary TEXT, -- AI-generated summary
  key_points JSONB, -- Array of key points extracted
  metadata JSONB DEFAULT '{}', -- Additional metadata (page count, dimensions, etc.)
  
  processing_status TEXT DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_conversation ON files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_files_message ON files(message_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(processing_status);
CREATE INDEX IF NOT EXISTS idx_files_created ON files(created_at DESC);

-- Full-text search on extracted text
CREATE INDEX IF NOT EXISTS idx_files_text_search ON files USING gin(to_tsvector('spanish', COALESCE(extracted_text, '')));

COMMENT ON TABLE files IS 'Stores metadata and processing results for user-uploaded files';
COMMENT ON COLUMN files.extracted_text IS 'Full text content extracted from file (PDFs, images with OCR, etc.)';
COMMENT ON COLUMN files.summary IS 'AI-generated summary of file content';

-- ============================================
-- 2. Create file_processing_queue table
-- ============================================

CREATE TABLE IF NOT EXISTS file_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  
  priority INTEGER DEFAULT 5, -- 1-10, higher = more priority
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure file is queued only once
  UNIQUE(file_id)
);

CREATE INDEX IF NOT EXISTS idx_file_queue_priority ON file_processing_queue(priority DESC, created_at ASC);

-- ============================================
-- 3. Update messages table to reference files
-- ============================================

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attachment_count INTEGER DEFAULT 0;

-- ============================================
-- 4. Create function to get files for conversation context
-- ============================================

CREATE OR REPLACE FUNCTION get_conversation_file_context(p_conversation_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_context TEXT;
BEGIN
  SELECT string_agg(
    format(
      E'Archivo: %s\nResumen: %s\nPuntos clave: %s\n',
      original_filename,
      COALESCE(summary, 'No disponible'),
      COALESCE((key_points)::text, 'No disponible')
    ),
    E'\n---\n'
  ) INTO v_context
  FROM files
  WHERE conversation_id = p_conversation_id
    AND processing_status = 'completed'
    AND extracted_text IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 5; -- Last 5 files for context
  
  RETURN COALESCE(v_context, '');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create function to update message attachment count
-- ============================================

CREATE OR REPLACE FUNCTION update_message_attachment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.message_id IS NOT NULL THEN
    UPDATE messages SET
      has_attachments = true,
      attachment_count = (
        SELECT COUNT(*) FROM files WHERE message_id = NEW.message_id
      )
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' AND OLD.message_id IS NOT NULL THEN
    UPDATE messages SET
      attachment_count = (
        SELECT COUNT(*) FROM files WHERE message_id = OLD.message_id
      ),
      has_attachments = (
        SELECT COUNT(*) > 0 FROM files WHERE message_id = OLD.message_id
      )
    WHERE id = OLD.message_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_message_attachments ON files;
CREATE TRIGGER trg_update_message_attachments
  AFTER INSERT OR DELETE ON files
  FOR EACH ROW
  WHEN (NEW.message_id IS NOT NULL OR OLD.message_id IS NOT NULL)
  EXECUTE FUNCTION update_message_attachment_count();

-- ============================================
-- 6. Create storage bucket policies (to be run in Supabase Dashboard)
-- ============================================

-- Note: These need to be run in Supabase SQL Editor with proper authentication

/*
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', false);

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);
*/
