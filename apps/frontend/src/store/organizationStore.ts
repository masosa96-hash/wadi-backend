import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Folder, Tag } from "../types/organization";

interface OrganizationState {
    folders: Folder[];
    tags: Tag[];
    loading: boolean;

    // Actions
    createFolder: (name: string, parentId?: string | null) => void;
    deleteFolder: (id: string) => void;
    createTag: (name: string, color: string) => void;
    deleteTag: (id: string) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
    persist(
        (set, get) => ({
            folders: [],
            tags: [],
            loading: false,

            createFolder: (name, parentId = null) => {
                const newFolder: Folder = {
                    id: `folder_${Date.now()}`,
                    name,
                    parentId,
                    workspaceId: "current_ws", // Should come from context
                    createdAt: new Date(),
                };
                set((state) => ({ folders: [...state.folders, newFolder] }));
            },

            deleteFolder: (id) => {
                set((state) => ({
                    folders: state.folders.filter((f) => f.id !== id),
                }));
            },

            createTag: (name, color) => {
                const newTag: Tag = {
                    id: `tag_${Date.now()}`,
                    name,
                    color,
                    workspaceId: "current_ws",
                };
                set((state) => ({ tags: [...state.tags, newTag] }));
            },

            deleteTag: (id) => {
                set((state) => ({
                    tags: state.tags.filter((t) => t.id !== id),
                }));
            },
        }),
        {
            name: "wadi-organization-storage",
        }
    )
);
