import { create } from "zustand";

export interface AgentLog {
    id: string;
    timestamp: number;
    type: "prompt" | "response" | "action" | "error";
    content: any;
    metadata?: any;
}

interface DebugStore {
    logs: AgentLog[];
    maxLogs: number;

    addLog: (type: AgentLog["type"], content: any, metadata?: any) => void;
    clearLogs: () => void;
    getLogsByType: (type: AgentLog["type"]) => AgentLog[];
}

export const useDebugStore = create<DebugStore>((set, get) => ({
    logs: [],
    maxLogs: 100,

    addLog: (type, content, metadata) => {
        const log: AgentLog = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            type,
            content,
            metadata,
        };

        set((state) => ({
            logs: [...state.logs.slice(-state.maxLogs + 1), log],
        }));
    },

    clearLogs: () => {
        set({ logs: [] });
    },

    getLogsByType: (type) => {
        return get().logs.filter((log) => log.type === type);
    },
}));

// Helper to log agent activity
export function logAgentPrompt(prompt: string, metadata?: any) {
    useDebugStore.getState().addLog("prompt", prompt, metadata);
}

export function logAgentResponse(response: any, metadata?: any) {
    useDebugStore.getState().addLog("response", response, metadata);
}

export function logAgentAction(action: any, metadata?: any) {
    useDebugStore.getState().addLog("action", action, metadata);
}

export function logAgentError(error: any, metadata?: any) {
    useDebugStore.getState().addLog("error", error, metadata);
}
