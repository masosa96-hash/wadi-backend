import { create } from "zustand";
import { api } from "../config/api";

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: "preference" | "fact" | "style" | "context" | "skill" | "goal";
  category: string | null;
  key: string;
  value: string;
  metadata: Record<string, any>;
  source: "explicit" | "inferred" | "feedback" | "system";
  confidence: number;
  times_referenced: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MemoryState {
  // Data
  memories: UserMemory[];
  memoryContext: {
    raw: UserMemory[];
    formatted: string;
    by_category: Record<string, UserMemory[]>;
  } | null;
  
  // Loading states
  loadingMemories: boolean;
  savingMemory: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  fetchMemories: () => Promise<void>;
  fetchMemoryContext: () => Promise<void>;
  saveMemory: (memory: Partial<UserMemory>) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  clearError: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  // Initial State
  memories: [],
  memoryContext: null,
  loadingMemories: false,
  savingMemory: false,
  error: null,

  fetchMemories: async () => {
    set({ loadingMemories: true, error: null });
    
    try {
      const response = await api.get<{ ok: boolean; data: UserMemory[] }>("/api/memory");
      
      set({
        memories: response.data || [],
        loadingMemories: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error fetching memories";
      set({
        error: errorMessage,
        loadingMemories: false,
      });
      throw error;
    }
  },

  fetchMemoryContext: async () => {
    try {
      const response = await api.get<{ 
        ok: boolean; 
        data: {
          raw: UserMemory[];
          formatted: string;
          by_category: Record<string, UserMemory[]>;
        }
      }>("/api/memory/context");
      
      set({
        memoryContext: response.data,
      });
    } catch (error: any) {
      console.error("Error fetching memory context:", error);
      // Don't set error state for context fetch, as it's not critical
    }
  },

  saveMemory: async (memory: Partial<UserMemory>) => {
    set({ savingMemory: true, error: null });
    
    try {
      await api.post<{ ok: boolean; data: UserMemory }>("/api/memory", memory);
      
      // Refetch memories to get updated list
      const response = await api.get<{ ok: boolean; data: UserMemory[] }>("/api/memory");
      
      set({
        memories: response.data || [],
        savingMemory: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error saving memory";
      set({
        error: errorMessage,
        savingMemory: false,
      });
      throw error;
    }
  },

  deleteMemory: async (memoryId: string) => {
    try {
      await api.delete(`/api/memory/${memoryId}`);
      
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== memoryId),
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error deleting memory";
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
