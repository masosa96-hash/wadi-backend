import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface Session {
  id: string;
  project_id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  run_count: number;
  is_active: boolean;
}

export interface SessionLoadingStates {
  fetchSessions: boolean;
  createSession: boolean;
  updateSession: boolean;
  deleteSession: boolean;
  fetchSessionRuns: boolean;
}

export interface SessionErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface SessionsState {
  // Data
  sessions: Session[];
  activeSessionId: string | null;
  currentProjectId: string | null;
  
  // Loading States
  loadingStates: SessionLoadingStates;
  
  // Error State
  error: SessionErrorState | null;
  
  // Actions
  fetchSessions: (projectId: string) => Promise<void>;
  getSession: (sessionId: string) => Promise<Session>;
  createSession: (projectId: string, name?: string, description?: string) => Promise<Session>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setActiveSession: (sessionId: string) => Promise<void>;
  clearSessions: () => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: SessionLoadingStates = {
  fetchSessions: false,
  createSession: false,
  updateSession: false,
  deleteSession: false,
  fetchSessionRuns: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): SessionErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  // Initial State
  sessions: [],
  activeSessionId: null,
  currentProjectId: null,
  loadingStates: initialLoadingStates,
  error: null,

  fetchSessions: async (projectId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchSessions: true },
      error: null,
      currentProjectId: projectId,
    }));
    
    try {
      const data = await api.get<{ sessions: Session[] }>(`/api/projects/${projectId}/sessions`);
      
      // Find active session
      const activeSession = data.sessions.find(s => s.is_active);
      
      set((state) => ({
        sessions: data.sessions,
        activeSessionId: activeSession?.id || null,
        loadingStates: { ...state.loadingStates, fetchSessions: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchSessions', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchSessions: false },
      }));
      throw error;
    }
  },

  getSession: async (sessionId: string) => {
    try {
      const data = await api.get<{ session: Session }>(`/api/sessions/${sessionId}`);
      return data.session;
    } catch (error: any) {
      const errorState = createErrorState('getSession', error, true);
      set({ error: errorState });
      throw error;
    }
  },

  createSession: async (projectId: string, name?: string, description?: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createSession: true },
      error: null,
    }));
    
    try {
      const data = await api.post<{ session: Session }>(`/api/projects/${projectId}/sessions`, {
        name,
        description,
      });
      
      set((state) => ({
        sessions: [data.session, ...state.sessions.map(s => ({ ...s, is_active: false }))],
        activeSessionId: data.session.id,
        loadingStates: { ...state.loadingStates, createSession: false },
      }));
      
      return data.session;
    } catch (error: any) {
      const errorState = createErrorState('createSession', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, createSession: false },
      }));
      throw error;
    }
  },

  updateSession: async (sessionId: string, updates: Partial<Session>) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateSession: true },
      error: null,
    }));
    
    // Optimistic update
    const previousSessions = get().sessions;
    set((state) => ({
      sessions: state.sessions.map(s => 
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }));
    
    try {
      const data = await api.patch<{ session: Session }>(`/api/sessions/${sessionId}`, updates);
      
      set((state) => ({
        sessions: state.sessions.map(s => s.id === sessionId ? data.session : s),
        loadingStates: { ...state.loadingStates, updateSession: false },
      }));
    } catch (error: any) {
      // Revert on failure
      set((state) => ({
        sessions: previousSessions,
        error: createErrorState('updateSession', error, true),
        loadingStates: { ...state.loadingStates, updateSession: false },
      }));
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, deleteSession: true },
      error: null,
    }));
    
    try {
      await api.delete(`/api/sessions/${sessionId}`);
      
      set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        loadingStates: { ...state.loadingStates, deleteSession: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('deleteSession', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, deleteSession: false },
      }));
      throw error;
    }
  },

  setActiveSession: async (sessionId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updateSession: true },
      error: null,
    }));
    
    try {
      await api.patch(`/api/sessions/${sessionId}`, { is_active: true });
      
      set((state) => ({
        sessions: state.sessions.map(s => ({
          ...s,
          is_active: s.id === sessionId,
        })),
        activeSessionId: sessionId,
        loadingStates: { ...state.loadingStates, updateSession: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('setActiveSession', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updateSession: false },
      }));
      throw error;
    }
  },

  clearSessions: () => {
    set({ sessions: [], activeSessionId: null, currentProjectId: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      sessions: [],
      activeSessionId: null,
      currentProjectId: null,
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
