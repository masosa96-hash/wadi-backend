import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/files/upload
 * Upload a file to storage and save metadata
 */
export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    console.log("[uploadFile] Request from user:", userId);

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // Note: File upload requires multipart/form-data parsing
    // This is a simplified version - in production, use multer or formidable
    const contentType = req.headers["content-type"] || "";
    
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ 
        ok: false, 
        error: "Content-Type must be multipart/form-data" 
      });
      return;
    }

    // TODO: Implement proper multipart form parsing
    // For now, return placeholder response
    res.status(501).json({ 
      ok: false, 
      error: "File upload endpoint requires formidable package - run: npm install formidable" 
    });
    return;

    // The following code will work once formidable is installed:
    /*
    const file = req.file; // Assuming multer middleware
    const conversationId = req.body.conversationId;
    const messageId = req.body.messageId;

    if (!file) {
      res.status(400).json({ ok: false, error: "No file provided" });
      return;
    }

    try {
      // Generate storage path
      const fileExt = path.extname(file.originalname || "");
      const filename = `${crypto.randomUUID()}${fileExt}`;
      const storagePath = `${userId}/${filename}`;

      // Read file content
      const fileBuffer = fs.readFileSync(file.path);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("[uploadFile] Storage upload error:", uploadError);
        res.status(500).json({ ok: false, error: "Failed to upload file to storage" });
        return;
      }

      // Determine file type
      const fileType = detectFileType(file.mimetype);

      // Save metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from("files")
        .insert({
          user_id: userId,
          conversation_id: conversationId || null,
          message_id: messageId || null,
          filename: filename,
          original_filename: file.originalname || "unknown",
          file_type: fileType,
          file_size: file.size,
          mime_type: file.mimetype || "application/octet-stream",
          storage_path: storagePath,
          storage_provider: "supabase",
          storage_bucket: "user-files",
          processing_status: "pending",
        })
        .select()
        .single();

      if (dbError) {
        console.error("[uploadFile] Database error:", dbError);
        // Cleanup uploaded file
        await supabase.storage.from("user-files").remove([storagePath]);
        res.status(500).json({ ok: false, error: "Failed to save file metadata" });
        return;
      }

      // Queue for processing
      await supabase.from("file_processing_queue").insert({
        file_id: fileRecord.id,
        priority: 5,
      });

      // Clean up temp file
      fs.unlinkSync(file.path);

      console.log("[uploadFile] Success - File uploaded:", fileRecord.id);
      res.status(201).json({ ok: true, data: fileRecord });
    } catch (error: any) {
      console.error("[uploadFile] Processing error:", error);
      res.status(500).json({ ok: false, error: "Failed to process file upload" });
    }
    */
  } catch (error) {
    console.error("[uploadFile] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/files/:fileId
 * Get file metadata and processing status
 */
export async function getFile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { fileId } = req.params;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      res.status(404).json({ ok: false, error: "File not found" });
      return;
    }

    res.json({ ok: true, data: file });
  } catch (error) {
    console.error("[getFile] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/files/:fileId/download
 * Download file content
 */
export async function downloadFile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { fileId } = req.params;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // Get file metadata
    const { data: file, error: dbError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (dbError || !file) {
      res.status(404).json({ ok: false, error: "File not found" });
      return;
    }

    // Download from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from(file.storage_bucket)
      .download(file.storage_path);

    if (storageError || !fileData) {
      res.status(500).json({ ok: false, error: "Failed to download file" });
      return;
    }

    // Send file
    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${file.original_filename}"`);
    
    const buffer = Buffer.from(await fileData.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error("[downloadFile] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * DELETE /api/files/:fileId
 * Delete a file
 */
export async function deleteFile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { fileId } = req.params;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // Get file info
    const { data: file, error: dbError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (dbError || !file) {
      res.status(404).json({ ok: false, error: "File not found" });
      return;
    }

    // Delete from storage
    await supabase.storage.from(file.storage_bucket).remove([file.storage_path]);

    // Delete from database (cascade will handle queue entries)
    const { error: deleteError } = await supabase.from("files").delete().eq("id", fileId);

    if (deleteError) {
      res.status(500).json({ ok: false, error: "Failed to delete file" });
      return;
    }

    res.json({ ok: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("[deleteFile] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/files/conversation/:conversationId
 * Get all files for a conversation
 */
export async function getConversationFiles(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch files" });
      return;
    }

    res.json({ ok: true, data: files || [] });
  } catch (error) {
    console.error("[getConversationFiles] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

// ============================================
// Helper Functions
// ============================================

function detectFileType(mimetype?: string): string {
  if (!mimetype) return "other";
  
  if (mimetype === "application/pdf") {
    return "pdf";
  } else if (mimetype.startsWith("image/")) {
    return "image";
  } else if (mimetype === "text/plain") {
    return "text";
  } else if (mimetype.includes("word")) {
    return "docx";
  }
  
  return "other";
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}
