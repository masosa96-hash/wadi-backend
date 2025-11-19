import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  default_mode?: string;
}

export interface ProjectLoadingStates {
  fetchProjects: boolean;
  createProject: boolean;
  updateProject: boolean;
  deleteProject: boolean;
}

export interface ProjectErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface ProjectsState {
  // Data
  projects: Project[];
  selectedProjectId: string | null;
  
  // Loading States
  loadingStates: ProjectLoadingStates;
  
  // Error State
  error: ProjectErrorState | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setSelectedProject: (projectId: string | null) => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: ProjectLoadingStates = {
  fetchProjects: false,
  createProject: false,
  updateProject: false,
  deleteProject: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): ProjectErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  // Initial State
  projects: [],
  selectedProjectId: null,
  loadingStates: initialLoadingStates,
  error: null,

  fetchProjects: async () => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchProjects: true },
      error: null,
    }));
    
    try {
      const data = await api.get<{ projects: Project[] }>("/api/projects");
      set((state) => ({
        projects: data.projects,
        loadingStates: { ...state.loadingStates, fetchProjects: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchProjects', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchProjects: false },
      }));
      throw error;
    }
  },

  createProject: async (name: string, description?: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createProject: true },
      error: null,
    }));
    
    try {
      const data = await api.post<{ project: Project }>("/api/projects", {
        name,
        description,
      });
      
      set((state) => ({
        projects: [data.project, ...state.projects],
        loadingStates: { ...state.loadingStates, createProject: false },
      }));
      
      return data.project;
    } catch (error: any) {
      const errorState = createErrorState('createProject', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createProject: false },
      }));
      throw error;
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateProject: true },
      error: null,
    }));
    
    try {
      const data = await api.patch<{ project: Project }>(`/api/projects/${projectId}`, updates);
      
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? data.project : p),
        loadingStates: { ...state.loadingStates, updateProject: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updateProject', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updateProject: false },
      }));
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deleteProject: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/projects/${projectId}`);
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        loadingStates: { ...state.loadingStates, deleteProject: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deleteProject', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deleteProject: false },
      }));
      throw error;
    }
  },

  setSelectedProject: (projectId: string | null) => {
    set({ selectedProjectId: projectId });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      projects: [],
      selectedProjectId: null,
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
