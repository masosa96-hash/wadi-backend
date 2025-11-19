import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TagLoadingStates {
  fetchTags: boolean;
  createTag: boolean;
  updateTag: boolean;
  deleteTag: boolean;
  addProjectTag: boolean;
  removeProjectTag: boolean;
  addRunTag: boolean;
  removeRunTag: boolean;
}

export interface TagErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface TagsState {
  // Data
  tags: Tag[];
  selectedTags: string[];
  
  // Loading States
  loadingStates: TagLoadingStates;
  
  // Error State
  error: TagErrorState | null;
  
  // Actions
  fetchTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  addProjectTag: (projectId: string, tagId: string) => Promise<void>;
  removeProjectTag: (projectId: string, tagId: string) => Promise<void>;
  addRunTag: (runId: string, tagId: string) => Promise<void>;
  removeRunTag: (runId: string, tagId: string) => Promise<void>;
  setSelectedTags: (tagIds: string[]) => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: TagLoadingStates = {
  fetchTags: false,
  createTag: false,
  updateTag: false,
  deleteTag: false,
  addProjectTag: false,
  removeProjectTag: false,
  addRunTag: false,
  removeRunTag: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): TagErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useTagsStore = create<TagsState>((set, get) => ({
  // Initial State
  tags: [],
  selectedTags: [],
  loadingStates: initialLoadingStates,
  error: null,

  fetchTags: async () => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchTags: true },
      error: null,
    }));
    
    try {
      const data = await api.get<{ tags: Tag[] }>("/api/tags");
      set((state) => ({
        tags: data.tags,
        loadingStates: { ...state.loadingStates, fetchTags: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchTags', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchTags: false },
      }));
      throw error;
    }
  },

  createTag: async (name: string, color: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createTag: true },
      error: null,
    }));
    
    try {
      const data = await api.post<{ tag: Tag }>("/api/tags", { name, color });
      
      set((state) => ({
        tags: [...state.tags, data.tag].sort((a, b) => a.name.localeCompare(b.name)),
        loadingStates: { ...state.loadingStates, createTag: false },
      }));
      
      return data.tag;
    } catch (error: any) {
      const errorState = createErrorState('createTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createTag: false },
      }));
      throw error;
    }
  },

  updateTag: async (tagId: string, updates: Partial<Tag>) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateTag: true },
      error: null,
    }));
    
    // Optimistic update
    const previousTags = get().tags;
    set((state) => ({
      tags: state.tags.map(t => 
        t.id === tagId ? { ...t, ...updates } : t
      ).sort((a, b) => a.name.localeCompare(b.name)),
    }));
    
    try {
      const data = await api.patch<{ tag: Tag }>(`/api/tags/${tagId}`, updates);
      
      set((state) => ({
        tags: state.tags.map(t => t.id === tagId ? data.tag : t).sort((a, b) => a.name.localeCompare(b.name)),
        loadingStates: { ...state.loadingStates, updateTag: false },
      }));
    } catch (error: any) {
      // Revert on failure
      set((state) => ({
        tags: previousTags,
        error: createErrorState('updateTag', error, true),
        loadingStates: { ...state.loadingStates, updateTag: false },
      }));
      throw error;
    }
  },

  deleteTag: async (tagId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deleteTag: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/tags/${tagId}`);
      
      set((state) => ({
        tags: state.tags.filter(t => t.id !== tagId),
        loadingStates: { ...state.loadingStates, deleteTag: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deleteTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deleteTag: false },
      }));
      throw error;
    }
  },

  addProjectTag: async (projectId: string, tagId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, addProjectTag: true },
      error: null,
    }));
    
    try {
      await api.post(`/api/projects/${projectId}/tags`, { tag_id: tagId });
      
      set((state) => ({
        loadingStates: { ...state.loadingStates, addProjectTag: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('addProjectTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, addProjectTag: false },
      }));
      throw error;
    }
  },

  removeProjectTag: async (projectId: string, tagId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, removeProjectTag: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/projects/${projectId}/tags/${tagId}`);
      
      set((state) => ({
        loadingStates: { ...state.loadingStates, removeProjectTag: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('removeProjectTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, removeProjectTag: false },
      }));
      throw error;
    }
  },

  addRunTag: async (runId: string, tagId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, addRunTag: true },
      error: null,
    }));
    
    try {
      await api.post(`/api/runs/${runId}/tags`, { tag_id: tagId });
      
      set((state) => ({
        loadingStates: { ...state.loadingStates, addRunTag: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('addRunTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, addRunTag: false },
      }));
      throw error;
    }
  },

  removeRunTag: async (runId: string, tagId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, removeRunTag: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/runs/${runId}/tags/${tagId}`);
      
      set((state) => ({
        loadingStates: { ...state.loadingStates, removeRunTag: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('removeRunTag', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, removeRunTag: false },
      }));
      throw error;
    }
  },

  setSelectedTags: (tagIds: string[]) => {
    set({ selectedTags: tagIds });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      tags: [],
      selectedTags: [],
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
