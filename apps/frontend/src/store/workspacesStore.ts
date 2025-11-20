import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  user_role: "owner" | "admin" | "member";
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  is_auto_created?: boolean;
  detected_topic?: string | null;
  message_count?: number;
  last_message_at?: string | null;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  profiles?: {
    email: string;
    name: string | null;
  };
}

export interface WorkspaceLoadingStates {
  fetchWorkspaces: boolean;
  createWorkspace: boolean;
  updateWorkspace: boolean;
  deleteWorkspace: boolean;
  fetchMembers: boolean;
  inviteMember: boolean;
  updateMember: boolean;
  removeMember: boolean;
}

export interface WorkspaceErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface WorkspacesState {
  // Data
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  currentWorkspaceMembers: WorkspaceMember[];
  
  // Loading States
  loadingStates: WorkspaceLoadingStates;
  
  // Error State
  error: WorkspaceErrorState | null;
  
  // Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  setSelectedWorkspace: (workspaceId: string | null) => void;
  
  // Member Actions
  fetchMembers: (workspaceId: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role?: "owner" | "admin" | "member") => Promise<void>;
  updateMember: (workspaceId: string, memberId: string, role: "owner" | "admin" | "member") => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  
  // Helpers
  getSelectedWorkspace: () => Workspace | null;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: WorkspaceLoadingStates = {
  fetchWorkspaces: false,
  createWorkspace: false,
  updateWorkspace: false,
  deleteWorkspace: false,
  fetchMembers: false,
  inviteMember: false,
  updateMember: false,
  removeMember: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): WorkspaceErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useWorkspacesStore = create<WorkspacesState>((set, get) => ({
  // Initial State
  workspaces: [],
  selectedWorkspaceId: null,
  currentWorkspaceMembers: [],
  loadingStates: initialLoadingStates,
  error: null,

  fetchWorkspaces: async () => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchWorkspaces: true },
      error: null,
    }));
    
    try {
      const response = await api.get<{ ok: boolean; data: Workspace[] }>("/api/workspaces");
      set((state) => ({
        workspaces: response.data || [],
        loadingStates: { ...state.loadingStates, fetchWorkspaces: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchWorkspaces', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchWorkspaces: false },
      }));
      throw error;
    }
  },

  createWorkspace: async (name: string, description?: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createWorkspace: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ ok: boolean; data: Workspace }>("/api/workspaces", {
        name,
        description,
      });
      
      set((state) => ({
        workspaces: [response.data, ...state.workspaces],
        loadingStates: { ...state.loadingStates, createWorkspace: false },
      }));
      
      return response.data;
    } catch (error: any) {
      const errorState = createErrorState('createWorkspace', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createWorkspace: false },
      }));
      throw error;
    }
  },

  updateWorkspace: async (workspaceId: string, updates: { name?: string; description?: string }) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateWorkspace: true },
      error: null,
    }));
    
    try {
      const response = await api.patch<{ ok: boolean; data: Workspace }>(`/api/workspaces/${workspaceId}`, updates);
      
      set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? response.data : w),
        loadingStates: { ...state.loadingStates, updateWorkspace: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updateWorkspace', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updateWorkspace: false },
      }));
      throw error;
    }
  },

  deleteWorkspace: async (workspaceId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deleteWorkspace: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/workspaces/${workspaceId}`);
      
      set((state) => ({
        workspaces: state.workspaces.filter(w => w.id !== workspaceId),
        selectedWorkspaceId: state.selectedWorkspaceId === workspaceId ? null : state.selectedWorkspaceId,
        loadingStates: { ...state.loadingStates, deleteWorkspace: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deleteWorkspace', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deleteWorkspace: false },
      }));
      throw error;
    }
  },

  setSelectedWorkspace: (workspaceId: string | null) => {
    set({ selectedWorkspaceId: workspaceId, currentWorkspaceMembers: [] });
  },

  fetchMembers: async (workspaceId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchMembers: true },
      error: null,
    }));
    
    try {
      const response = await api.get<{ ok: boolean; data: WorkspaceMember[] }>(`/api/workspaces/${workspaceId}/members`);
      set((state) => ({
        currentWorkspaceMembers: response.data || [],
        loadingStates: { ...state.loadingStates, fetchMembers: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchMembers', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchMembers: false },
      }));
      throw error;
    }
  },

  inviteMember: async (workspaceId: string, email: string, role: "owner" | "admin" | "member" = "member") => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, inviteMember: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ ok: boolean; data: WorkspaceMember }>(`/api/workspaces/${workspaceId}/invite`, {
        email,
        role,
      });
      
      set((state) => ({
        currentWorkspaceMembers: [...state.currentWorkspaceMembers, response.data],
        loadingStates: { ...state.loadingStates, inviteMember: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('inviteMember', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, inviteMember: false },
      }));
      throw error;
    }
  },

  updateMember: async (workspaceId: string, memberId: string, role: "owner" | "admin" | "member") => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateMember: true },
      error: null,
    }));
    
    try {
      const response = await api.patch<{ ok: boolean; data: WorkspaceMember }>(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        role,
      });
      
      set((state) => ({
        currentWorkspaceMembers: state.currentWorkspaceMembers.map(m => m.id === memberId ? response.data : m),
        loadingStates: { ...state.loadingStates, updateMember: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updateMember', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updateMember: false },
      }));
      throw error;
    }
  },

  removeMember: async (workspaceId: string, memberId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, removeMember: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
      
      set((state) => ({
        currentWorkspaceMembers: state.currentWorkspaceMembers.filter(m => m.id !== memberId),
        loadingStates: { ...state.loadingStates, removeMember: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('removeMember', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, removeMember: false },
      }));
      throw error;
    }
  },

  getSelectedWorkspace: () => {
    const state = get();
    return state.workspaces.find(w => w.id === state.selectedWorkspaceId) || null;
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      workspaces: [],
      selectedWorkspaceId: null,
      currentWorkspaceMembers: [],
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
