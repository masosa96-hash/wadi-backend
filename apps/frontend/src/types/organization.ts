export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    workspaceId: string;
    color?: string;
    createdAt: Date;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    workspaceId: string;
}

export interface ProjectMetadata {
    folderId?: string;
    tags: string[]; // Tag IDs
    status: "active" | "archived" | "completed";
    priority: "low" | "medium" | "high";
}
