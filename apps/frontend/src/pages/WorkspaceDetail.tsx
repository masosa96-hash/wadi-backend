import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspacesStore } from "../store/workspacesStore";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";

export const WorkspaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    workspaces,
    currentWorkspaceMembers,
    fetchWorkspaces,
    fetchMembers,
    inviteMember,
    updateMember,
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    loadingStates,
    error
  } = useWorkspacesStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "member">("member");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const workspace = workspaces.find(w => w.id === id);

  // Handle "default" workspace - mock workspace for initial chat
  const isDefaultWorkspace = id === "default";
  const defaultWorkspaceData = {
    id: "default",
    name: "Conversa con WADI",
    description: "Tu espacio para conversar con WADI",
    user_role: "owner" as const,
  };

  // Determine current workspace early for use in handlers
  const currentWorkspace = isDefaultWorkspace ? defaultWorkspaceData : workspace;

  useEffect(() => {
    // Skip fetching for default workspace
    if (workspaces.length === 0 && !isDefaultWorkspace) {
      fetchWorkspaces();
    }
  }, [workspaces.length, isDefaultWorkspace, fetchWorkspaces]);

  useEffect(() => {
    // Skip fetching members for default workspace
    if (id && !isDefaultWorkspace) {
      fetchMembers(id);
    }
  }, [id, isDefaultWorkspace, fetchMembers]);

  useEffect(() => {
    if (currentWorkspace) {
      setEditName(currentWorkspace.name);
      setEditDescription(currentWorkspace.description || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, isDefaultWorkspace, currentWorkspace]);

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    if (confirm(`Are you sure you want to delete "${currentWorkspace.name}"? This action cannot be undone.`)) {
      try {
        await deleteWorkspace(id!);
        navigate("/workspaces");
      } catch (err) {
        console.error("Failed to delete workspace:", err);
      }
    }
  };

  // Check after defining currentWorkspace
  if (!id) {
    return <div style={{ padding: "24px" }}>Invalid workspace ID</div>;
  }

  if (!workspace && !isDefaultWorkspace) {
    return (
      <div style={{ padding: "24px" }}>
        {loadingStates.fetchWorkspaces ? "Loading..." : "Workspace not found"}
      </div>
    );
  }

  // After early returns, currentWorkspace should be guaranteed to exist
  if (!currentWorkspace) {
    return <div style={{ padding: "24px" }}>Loading workspace...</div>;
  }

  const canManage = ["owner", "admin"].includes(currentWorkspace.user_role);
  const isOwner = currentWorkspace.user_role === "owner";

  const handleInvite = async () => {
    try {
      await inviteMember(id, inviteEmail, inviteRole);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (err) {
      console.error("Failed to invite member:", err);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: "owner" | "admin" | "member") => {
    try {
      await updateMember(id, memberId, newRole);
    } catch (err) {
      console.error("Failed to update member:", err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember(id, memberId);
      } catch (err) {
        console.error("Failed to remove member:", err);
      }
    }
  };

  const handleUpdateWorkspace = async () => {
    try {
      await updateWorkspace(id, {
        name: editName,
        description: editDescription
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update workspace:", err);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "600" }}>{currentWorkspace.name}</h1>
          <div style={{ display: "flex", gap: "8px" }}>
            {canManage && !isDefaultWorkspace && (
              <Button onClick={() => setShowEditModal(true)}>Edit</Button>
            )}
            {isOwner && !isDefaultWorkspace && (
              <Button onClick={handleDeleteWorkspace} style={{ backgroundColor: "#dc3545" }}>
                Delete
              </Button>
            )}
          </div>
        </div>
        {currentWorkspace.description && (
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{currentWorkspace.description}</p>
        )}
        <div style={{ marginTop: "8px", fontSize: "13px", color: "#999" }}>
          Your role: <strong>{currentWorkspace.user_role}</strong>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "6px",
          marginBottom: "16px",
          color: "#c00"
        }}>
          {error.message}
        </div>
      )}

      {/* Members Section - Hide for default workspace */}
      {!isDefaultWorkspace && currentWorkspace && (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Members</h2>
            {canManage && (
              <Button onClick={() => setShowInviteModal(true)}>Invite Member</Button>
            )}
          </div>

          {loadingStates.fetchMembers ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>Loading members...</div>
          ) : currentWorkspaceMembers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>No members found</div>
          ) : (
            <div>
              {currentWorkspaceMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>
                      {member.profiles?.email || member.user_id}
                    </div>
                    {member.profiles?.name && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        {member.profiles.name}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {canManage ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                        disabled={loadingStates.updateMember}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "13px"
                        }}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    ) : (
                      <span style={{
                        padding: "4px 12px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {member.role}
                      </span>
                    )}
                    {canManage && (
                      <Button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loadingStates.removeMember}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          backgroundColor: "#dc3545"
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Default workspace chat placeholder */}
      {isDefaultWorkspace && (
        <Card style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
            Bienvenido a tu espacio de conversación
          </h3>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Acá vas a poder chatear con WADI. Esta funcionalidad se está armando.
          </p>
        </Card>
      )}
      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Member">
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(value: string) => setInviteEmail(value)}
              placeholder="user@example.com"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => setShowInviteModal(false)} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || loadingStates.inviteMember}
            >
              {loadingStates.inviteMember ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Workspace">
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Workspace Name
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(value: string) => setEditName(value)}
              placeholder="My Workspace"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
              placeholder="Workspace description"
              rows={4}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => setShowEditModal(false)} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateWorkspace}
              disabled={!editName || loadingStates.updateWorkspace}
            >
              {loadingStates.updateWorkspace ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkspaceDetail;
