import { useState } from "react";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useWorkspaceStore } from "../store/workspaceStore";
import { WorkspaceRole } from "../types/workspace";

export function WorkspaceSettings() {
    const { currentWorkspace, members, inviteMember, removeMember, updateMemberRole } = useWorkspaceStore();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail) {
            await inviteMember(inviteEmail, inviteRole);
            setInviteEmail("");
            alert("Invitación enviada (simulada)");
        }
    };

    if (!currentWorkspace) return null;

    return (
        <PhoneShell>
            <div style={{
                minHeight: "100vh",
                background: theme.colors.background.primary,
                paddingBottom: "80px",
            }}>
                <header style={{
                    padding: theme.spacing.xl,
                    borderBottom: `1px solid ${theme.colors.border.subtle}`,
                    background: theme.colors.background.secondary,
                }}>
                    <h1 style={{
                        margin: `0 0 ${theme.spacing.xs} 0`,
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                    }}>
                        {currentWorkspace.name}
                    </h1>
                    <p style={{
                        margin: 0,
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                    }}>
                        Configuración y Miembros
                    </p>
                </header>

                <div style={{ padding: theme.spacing.xl }}>
                    {/* Invite Section */}
                    <section style={{ marginBottom: theme.spacing["2xl"] }}>
                        <h2 style={{ fontSize: theme.typography.fontSize.lg, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
                            Invitar Miembros
                        </h2>
                        <form onSubmit={handleInvite} style={{ display: "flex", gap: theme.spacing.sm }}>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@ejemplo.com"
                                style={{
                                    flex: 1,
                                    padding: theme.spacing.md,
                                    borderRadius: theme.borderRadius.md,
                                    border: `1px solid ${theme.colors.border.default}`,
                                    background: theme.colors.background.secondary,
                                    color: theme.colors.text.primary,
                                }}
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                                style={{
                                    padding: theme.spacing.md,
                                    borderRadius: theme.borderRadius.md,
                                    border: `1px solid ${theme.colors.border.default}`,
                                    background: theme.colors.background.secondary,
                                    color: theme.colors.text.primary,
                                }}
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Miembro</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <button
                                type="submit"
                                style={{
                                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                                    background: theme.colors.accent.primary,
                                    color: "#FFF",
                                    border: "none",
                                    borderRadius: theme.borderRadius.md,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                Invitar
                            </button>
                        </form>
                    </section>

                    {/* Members List */}
                    <section>
                        <h2 style={{ fontSize: theme.typography.fontSize.lg, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
                            Miembros ({members.length})
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
                            {members.map((member) => (
                                <div
                                    key={member.userId}
                                    style={{
                                        padding: theme.spacing.md,
                                        background: theme.colors.background.secondary,
                                        borderRadius: theme.borderRadius.md,
                                        border: `1px solid ${theme.colors.border.subtle}`,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: "bold", color: theme.colors.text.primary }}>{member.displayName}</div>
                                        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>{member.email}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            background: theme.colors.background.tertiary,
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.typography.fontSize.xs,
                                            color: theme.colors.text.secondary,
                                            textTransform: "capitalize",
                                        }}>
                                            {member.role}
                                        </span>
                                        {member.role !== "owner" && (
                                            <button
                                                onClick={() => removeMember(member.userId)}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    color: "#EF4444",
                                                    cursor: "pointer",
                                                    fontSize: theme.typography.fontSize.sm,
                                                }}
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <BottomNav />
            </div>
        </PhoneShell>
    );
}
