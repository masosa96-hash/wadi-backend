import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Run {
  id: string;
  project_id: string;
  user_id: string;
  input: string;
  output: string;
  model: string;
  created_at: string;
  custom_name?: string;
  session_id?: string;
}

export interface LoadingStates {
  fetchRuns: boolean;
  createRun: boolean;
  updateRun: boolean;
  deleteRun: boolean;
  renameRun: boolean;
  tagRun: boolean;
}

export interface ErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface RunsState {
  // Data
  runs: Run[];
  currentProjectId: string | null;
  selectedRunId: string | null;
  
  // Loading States
  loadingStates: LoadingStates;
  
  // Error State
  error: ErrorState | null;
  
  // Actions
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string, model?: string) => Promise<Run>;
  updateRun: (runId: string, updates: Partial<Run>) => Promise<void>;
  renameRun: (runId: string, name: string) => Promise<void>;
  deleteRun: (runId: string) => Promise<void>;
  clearRuns: () => void;
  clearError: () => void;
  setSelectedRun: (runId: string | null) => void;
  resetStore: () => void;
}

const initialLoadingStates: LoadingStates = {
  fetchRuns: false,
  createRun: false,
  updateRun: false,
  deleteRun: false,
  renameRun: false,
  tagRun: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): ErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useRunsStore = create<RunsState>((set, get) => ({
  // Initial State
  runs: [],
  currentProjectId: null,
  selectedRunId: null,
  loadingStates: initialLoadingStates,
  error: null,

  fetchRuns: async (projectId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchRuns: true },
      error: null,
      currentProjectId: projectId,
    }));
    
    try {
      const response = await api.get<{ ok: boolean; data: Run[] }>(`/api/projects/${projectId}/runs`);
      set((state) => ({
        runs: response.data || [],
        loadingStates: { ...state.loadingStates, fetchRuns: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchRuns', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchRuns: false },
        runs: [],
      }));
      throw error;
    }
  },

  createRun: async (projectId: string, input: string, model?: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createRun: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ ok: boolean; data: Run }>(`/api/projects/${projectId}/runs`, {
        input,
        model,
      });
      
      set((state) => ({
        runs: [response.data, ...state.runs],
        loadingStates: { ...state.loadingStates, createRun: false },
      }));
      
      return response.data;
    } catch (error: any) {
      const errorState = createErrorState('createRun', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createRun: false },
      }));
      throw error;
    }
  },

  updateRun: async (runId: string, updates: Partial<Run>) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateRun: true },
      error: null,
    }));
    
    try {
      const data = await api.patch<{ run: Run }>(`/api/runs/${runId}`, updates);
      
      set((state) => ({
        runs: state.runs.map(run => run.id === runId ? data.run : run),
        loadingStates: { ...state.loadingStates, updateRun: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updateRun', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updateRun: false },
      }));
      throw error;
    }
  },

  renameRun: async (runId: string, name: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, renameRun: true },
      error: null,
    }));
    
    // Optimistic update
    const previousRuns = get().runs;
    set((state) => ({
      runs: state.runs.map(run => 
        run.id === runId ? { ...run, custom_name: name } : run
      ),
    }));
    
    try {
      await api.patch(`/api/runs/${runId}`, { custom_name: name });
      set((state) => ({
        loadingStates: { ...state.loadingStates, renameRun: false },
      }));
    } catch (error: any) {
      // Revert on failure
      set((state) => ({
        runs: previousRuns,
        error: createErrorState('renameRun', error, true),
        loadingStates: { ...state.loadingStates, renameRun: false },
      }));
      throw error;
    }
  },

  deleteRun: async (runId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deleteRun: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/runs/${runId}`);
      
      set((state) => ({
        runs: state.runs.filter(run => run.id !== runId),
        loadingStates: { ...state.loadingStates, deleteRun: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deleteRun', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deleteRun: false },
      }));
      throw error;
    }
  },

  clearRuns: () => {
    set({ runs: [], currentProjectId: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  setSelectedRun: (runId: string | null) => {
    set({ selectedRunId: runId });
  },

  resetStore: () => {
    set({
      runs: [],
      currentProjectId: null,
      selectedRunId: null,
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
