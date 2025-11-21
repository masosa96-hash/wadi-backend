import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Workspace, WorkspaceMember, WorkspaceRole } from "../types/workspace";

interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    members: WorkspaceMember[];
    loading: boolean;
    error: string | null;

    // Actions
    createWorkspace: (name: string) => Promise<void>;
    switchWorkspace: (workspaceId: string) => void;
    inviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
    removeMember: (userId: string) => Promise<void>;
    updateMemberRole: (userId: string, role: WorkspaceRole) => Promise<void>;
    loadWorkspaces: () => Promise<void>;
}

// Mock data for development
const MOCK_WORKSPACES: Workspace[] = [
    {
        id: "ws_default",
        name: "Mi Workspace Personal",
        slug: "personal",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
            {
                userId: "user_1",
                email: "me@example.com",
                displayName: "Yo",
                role: "owner",
                joinedAt: new Date(),
            }
        ],
        settings: {
            allowGuestInvites: true,
            defaultRole: "member",
        }
    }
];

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            workspaces: MOCK_WORKSPACES,
            currentWorkspace: MOCK_WORKSPACES[0],
            members: MOCK_WORKSPACES[0].members,
            loading: false,
            error: null,

            loadWorkspaces: async () => {
                set({ loading: true });
                try {
                    // TODO: Replace with real API call
                    // const res = await api.get('/workspaces');
                    // set({ workspaces: res.data });
                    set({ loading: false });
                } catch (error) {
                    set({ error: "Failed to load workspaces", loading: false });
                }
            },

            createWorkspace: async (name: string) => {
                set({ loading: true });
                try {
                    const newWorkspace: Workspace = {
                        id: `ws_${Date.now()}`,
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, "-"),
                        ownerId: "current_user", // Replace with auth user
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        members: [],
                        settings: { allowGuestInvites: true, defaultRole: "member" }
                    };

                    set(state => ({
                        workspaces: [...state.workspaces, newWorkspace],
                        currentWorkspace: newWorkspace,
                        loading: false
                    }));
                } catch (error) {
                    set({ error: "Failed to create workspace", loading: false });
                }
            },

            switchWorkspace: (workspaceId: string) => {
                const workspace = get().workspaces.find(w => w.id === workspaceId);
                if (workspace) {
                    set({ currentWorkspace: workspace, members: workspace.members });
                }
            },

            inviteMember: async (email: string, role: WorkspaceRole) => {
                // Mock implementation
                console.log(`Inviting ${email} as ${role}`);
            },

            removeMember: async (userId: string) => {
                set(state => ({
                    members: state.members.filter(m => m.userId !== userId)
                }));
            },

            updateMemberRole: async (userId: string, role: WorkspaceRole) => {
                set(state => ({
                    members: state.members.map(m =>
                        m.userId === userId ? { ...m, role } : m
                    )
                }));
            },
        }),
        {
            name: "wadi-workspace-storage",
            partialize: (state) => ({
                currentWorkspace: state.currentWorkspace,
                workspaces: state.workspaces,
            }),
        }
    )
);
