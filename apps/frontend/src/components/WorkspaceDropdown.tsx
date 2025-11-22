import React, { useEffect, useState } from "react";
import { useWorkspacesStore } from "../store/workspacesStore";
import type { Workspace } from "../store/workspacesStore";

interface WorkspaceDropdownProps {
  onWorkspaceSelect?: (workspace: Workspace | null) => void;
}

export const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({ onWorkspaceSelect }) => {
  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspace,
    fetchWorkspaces,
    loadingStates
  } = useWorkspacesStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (workspaces.length === 0 && !loadingStates.fetchWorkspaces) {
      fetchWorkspaces();
    }
  }, [workspaces.length, loadingStates.fetchWorkspaces, fetchWorkspaces]);

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  const handleSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace.id);
    setIsOpen(false);
    onWorkspaceSelect?.(workspace);
  };

  const handleClear = () => {
    setSelectedWorkspace(null);
    setIsOpen(false);
    onWorkspaceSelect?.(null);
  };

  return (
    <div className="workspace-dropdown" style={{ position: "relative", minWidth: "200px" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px"
        }}
      >
        <span>{selectedWorkspace ? selectedWorkspace.name : "Select Workspace"}</span>
        <span style={{ fontSize: "12px" }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto"
          }}
        >
          {loadingStates.fetchWorkspaces ? (
            <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
              Loading...
            </div>
          ) : workspaces.length === 0 ? (
            <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
              No workspaces available
            </div>
          ) : (
            <>
              {selectedWorkspaceId && (
                <button
                  onClick={handleClear}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    color: "#666"
                  }}
                >
                  Clear selection
                </button>
              )}
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSelect(workspace)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    backgroundColor: workspace.id === selectedWorkspaceId ? "#f0f0ff" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (workspace.id !== selectedWorkspaceId) {
                      e.currentTarget.style.backgroundColor = "#f9f9f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (workspace.id !== selectedWorkspaceId) {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }
                  }}
                >
                  <div style={{ fontWeight: "500" }}>{workspace.name}</div>
                  {workspace.description && (
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                      {workspace.description}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                    Role: {workspace.user_role}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
