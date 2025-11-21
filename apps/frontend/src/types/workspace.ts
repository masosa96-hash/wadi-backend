export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMember {
    userId: string;
    email: string;
    displayName: string;
    role: WorkspaceRole;
    joinedAt: Date;
    avatarUrl?: string;
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    members: WorkspaceMember[];
    createdAt: Date;
    updatedAt: Date;
    settings: {
        allowGuestInvites: boolean;
        defaultRole: WorkspaceRole;
        branding?: {
            logoUrl?: string;
            primaryColor?: string;
        };
    };
}

export interface WorkspaceInvite {
    id: string;
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
    createdAt: Date;
    expiresAt: Date;
    status: "pending" | "accepted" | "expired";
}
