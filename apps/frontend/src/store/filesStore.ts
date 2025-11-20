import { create } from "zustand";
import { api } from "../config/api";

export interface FileMetadata {
  id: string;
  user_id: string;
  conversation_id: string | null;
  message_id: string | null;
  filename: string;
  original_filename: string;
  file_type: "pdf" | "image" | "text" | "docx" | "other";
  file_size: number;
  mime_type: string;
  storage_path: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  extracted_text?: string;
  summary?: string;
  key_points?: string[];
  created_at: string;
  updated_at: string;
}

interface FilesState {
  // Data
  files: FileMetadata[];
  uploadingFiles: Map<string, { file: File; progress: number }>;
  
  // Loading states
  loadingFiles: boolean;
  uploadingFile: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  uploadFile: (file: File, conversationId?: string, messageId?: string) => Promise<FileMetadata>;
  fetchFiles: (conversationId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  clearError: () => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  // Initial State
  files: [],
  uploadingFiles: new Map(),
  loadingFiles: false,
  uploadingFile: false,
  error: null,

  uploadFile: async (file: File, conversationId?: string, messageId?: string) => {
    set({ uploadingFile: true, error: null });
    
    // Generate temporary ID for tracking
    const tempId = `temp-${Date.now()}`;
    const uploadingFiles = new Map(get().uploadingFiles);
    uploadingFiles.set(tempId, { file, progress: 0 });
    set({ uploadingFiles });

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (conversationId) formData.append("conversationId", conversationId);
      if (messageId) formData.append("messageId", messageId);

      // Note: This endpoint requires formidable to be installed on backend
      // Upload progress tracking would need axios or similar library
      const response = await api.post<{ ok: boolean; data: FileMetadata }>(
        "/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Remove from uploading
      const finalUploadingFiles = new Map(get().uploadingFiles);
      finalUploadingFiles.delete(tempId);
      set({ uploadingFiles: finalUploadingFiles });

      // Add to files list
      set((state) => ({
        files: [response.data, ...state.files],
        uploadingFile: false,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error uploading file";
      
      // Remove from uploading
      const uploadingFiles = new Map(get().uploadingFiles);
      uploadingFiles.delete(tempId);
      
      set({
        uploadingFiles,
        uploadingFile: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  fetchFiles: async (conversationId: string) => {
    set({ loadingFiles: true, error: null });
    
    try {
      const response = await api.get<{ ok: boolean; data: FileMetadata[] }>(
        `/api/files/conversation/${conversationId}`
      );
      
      set({
        files: response.data || [],
        loadingFiles: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error fetching files";
      set({
        error: errorMessage,
        loadingFiles: false,
      });
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    try {
      await api.delete(`/api/files/${fileId}`);
      
      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error deleting file";
      set({ error: errorMessage });
      throw error;
    }
  },

  downloadFile: async (fileId: string) => {
    try {
      // Download file using native fetch to handle blob response
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${fileId}/download`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error downloading file");
      }

      // Get filename from headers
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "download";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.message || "Error downloading file";
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
