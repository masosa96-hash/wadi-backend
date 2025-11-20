import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Preset {
  id: string;
  user_id: string;
  workspace_id: string | null;
  project_id: string | null;
  name: string;
  description: string | null;
  content: string;
  model: string;
  folder: string | null;
  is_public: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PresetLoadingStates {
  fetchPresets: boolean;
  createPreset: boolean;
  updatePreset: boolean;
  deletePreset: boolean;
  executePreset: boolean;
}

export interface PresetErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface PresetsState {
  // Data
  presets: Preset[];
  selectedPresetId: string | null;
  
  // Loading States
  loadingStates: PresetLoadingStates;
  
  // Error State
  error: PresetErrorState | null;
  
  // Actions
  fetchPresets: (filters?: { workspace_id?: string; project_id?: string; folder?: string }) => Promise<void>;
  createPreset: (preset: {
    name: string;
    description?: string;
    content: string;
    model?: string;
    workspace_id?: string;
    project_id?: string;
    folder?: string;
    is_public?: boolean;
    metadata?: any;
  }) => Promise<Preset>;
  updatePreset: (presetId: string, updates: Partial<Preset>) => Promise<void>;
  deletePreset: (presetId: string) => Promise<void>;
  executePreset: (presetId: string, projectId: string) => Promise<{
    preset_id: string;
    preset_name: string;
    content: string;
    model: string;
    project_id: string;
  }>;
  setSelectedPreset: (presetId: string | null) => void;
  getSelectedPreset: () => Preset | null;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: PresetLoadingStates = {
  fetchPresets: false,
  createPreset: false,
  updatePreset: false,
  deletePreset: false,
  executePreset: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): PresetErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const usePresetsStore = create<PresetsState>((set, get) => ({
  // Initial State
  presets: [],
  selectedPresetId: null,
  loadingStates: initialLoadingStates,
  error: null,

  fetchPresets: async (filters = {}) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchPresets: true },
      error: null,
    }));
    
    try {
      const params = new URLSearchParams();
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.folder) params.append('folder', filters.folder);
      
      const url = params.toString() ? `/api/presets?${params.toString()}` : '/api/presets';
      const response = await api.get<{ ok: boolean; data: Preset[] }>(url);
      
      set((state) => ({
        presets: response.data || [],
        loadingStates: { ...state.loadingStates, fetchPresets: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchPresets', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchPresets: false },
      }));
      throw error;
    }
  },

  createPreset: async (preset) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createPreset: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ ok: boolean; data: Preset }>("/api/presets", preset);
      
      set((state) => ({
        presets: [response.data, ...state.presets],
        loadingStates: { ...state.loadingStates, createPreset: false },
      }));
      
      return response.data;
    } catch (error: any) {
      const errorState = createErrorState('createPreset', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createPreset: false },
      }));
      throw error;
    }
  },

  updatePreset: async (presetId: string, updates: Partial<Preset>) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updatePreset: true },
      error: null,
    }));
    
    try {
      const response = await api.patch<{ ok: boolean; data: Preset }>(`/api/presets/${presetId}`, updates);
      
      set((state) => ({
        presets: state.presets.map(p => p.id === presetId ? response.data : p),
        loadingStates: { ...state.loadingStates, updatePreset: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updatePreset', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updatePreset: false },
      }));
      throw error;
    }
  },

  deletePreset: async (presetId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deletePreset: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/presets/${presetId}`);
      
      set((state) => ({
        presets: state.presets.filter(p => p.id !== presetId),
        selectedPresetId: state.selectedPresetId === presetId ? null : state.selectedPresetId,
        loadingStates: { ...state.loadingStates, deletePreset: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deletePreset', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deletePreset: false },
      }));
      throw error;
    }
  },

  executePreset: async (presetId: string, projectId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, executePreset: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ 
        ok: boolean; 
        data: {
          preset_id: string;
          preset_name: string;
          content: string;
          model: string;
          project_id: string;
        }
      }>(`/api/presets/${presetId}/execute`, { project_id: projectId });
      
      set((state) => ({
        loadingStates: { ...state.loadingStates, executePreset: false },
      }));
      
      return response.data;
    } catch (error: any) {
      const errorState = createErrorState('executePreset', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, executePreset: false },
      }));
      throw error;
    }
  },

  setSelectedPreset: (presetId: string | null) => {
    set({ selectedPresetId: presetId });
  },

  getSelectedPreset: () => {
    const state = get();
    return state.presets.find(p => p.id === state.selectedPresetId) || null;
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      presets: [],
      selectedPresetId: null,
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
