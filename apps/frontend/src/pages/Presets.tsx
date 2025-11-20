import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePresetsStore } from "../store/presetsStore";
import { useProjectsStore } from "../store/projectsStore";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";

export const Presets: React.FC = () => {
  const navigate = useNavigate();
  const {
    presets,
    fetchPresets,
    createPreset,
    updatePreset,
    deletePreset,
    executePreset,
    loadingStates,
    error
  } = usePresetsStore();

  const { projects, fetchProjects } = useProjectsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    model: "gpt-3.5-turbo",
    folder: "",
  });

  useEffect(() => {
    fetchPresets();
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      await createPreset({
        name: formData.name,
        description: formData.description || undefined,
        content: formData.content,
        model: formData.model,
        folder: formData.folder || undefined,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create preset:", err);
    }
  };

  const handleEdit = async () => {
    if (!selectedPreset) return;
    try {
      await updatePreset(selectedPreset.id, {
        name: formData.name,
        description: formData.description || null,
        content: formData.content,
        model: formData.model,
        folder: formData.folder || null,
      });
      setShowEditModal(false);
      setSelectedPreset(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update preset:", err);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      try {
        await deletePreset(presetId);
      } catch (err) {
        console.error("Failed to delete preset:", err);
      }
    }
  };

  const handleExecute = async () => {
    if (!selectedPreset || !selectedProject) return;
    try {
      const result = await executePreset(selectedPreset.id, selectedProject);
      // Navigate to project detail and trigger run with preset content
      navigate(`/projects/${selectedProject}`, {
        state: {
          presetContent: result.content,
          presetModel: result.model,
          presetName: result.preset_name
        }
      });
      setShowExecuteModal(false);
      setSelectedPreset(null);
      setSelectedProject("");
    } catch (err) {
      console.error("Failed to execute preset:", err);
    }
  };

  const openEditModal = (preset: any) => {
    setSelectedPreset(preset);
    setFormData({
      name: preset.name,
      description: preset.description || "",
      content: preset.content,
      model: preset.model,
      folder: preset.folder || "",
    });
    setShowEditModal(true);
  };

  const openExecuteModal = (preset: any) => {
    setSelectedPreset(preset);
    setShowExecuteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      content: "",
      model: "gpt-3.5-turbo",
      folder: "",
    });
  };

  // Group presets by folder
  const presetsByFolder = presets.reduce((acc, preset) => {
    const folder = preset.folder || "Uncategorized";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(preset);
    return acc;
  }, {} as Record<string, typeof presets>);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "600" }}>Prompt Presets</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Preset</Button>
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

      {/* Presets Grid by Folder */}
      {loadingStates.fetchPresets ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#666" }}>Loading presets...</div>
      ) : presets.length === 0 ? (
        <Card style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "16px" }}>
            No presets yet. Create your first preset to get started!
          </p>
          <Button onClick={() => setShowCreateModal(true)}>Create Preset</Button>
        </Card>
      ) : (
        Object.entries(presetsByFolder).map(([folder, folderPresets]) => (
          <div key={folder} style={{ marginBottom: "32px" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600", color: "#333" }}>
              {folder}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {folderPresets.map((preset) => (
                <Card key={preset.id} style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>{preset.name}</h3>
                    {preset.description && (
                      <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
                        {preset.description}
                      </p>
                    )}
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#f5f5f5", 
                      borderRadius: "4px", 
                      fontSize: "13px",
                      fontFamily: "monospace",
                      marginBottom: "12px",
                      maxHeight: "100px",
                      overflow: "auto"
                    }}>
                      {preset.content.substring(0, 200)}{preset.content.length > 200 ? "..." : ""}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "16px" }}>
                      Model: <strong>{preset.model}</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button 
                      onClick={() => openExecuteModal(preset)} 
                      style={{ flex: 1, fontSize: "13px", padding: "8px 12px" }}
                    >
                      Execute
                    </Button>
                    <Button 
                      onClick={() => openEditModal(preset)} 
                      style={{ flex: 1, fontSize: "13px", padding: "8px 12px", backgroundColor: "#6c757d" }}
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(preset.id)} 
                      style={{ fontSize: "13px", padding: "8px 12px", backgroundColor: "#dc3545" }}
                      disabled={loadingStates.deletePreset}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Create Preset Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Preset">
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(value: string) => setFormData({ ...formData, name: value })}
              placeholder="My Preset"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Description
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(value: string) => setFormData({ ...formData, description: value })}
              placeholder="What does this preset do?"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your prompt content..."
              rows={8}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "monospace",
                resize: "vertical"
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Model
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
            </select>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Folder (Optional)
            </label>
            <Input
              type="text"
              value={formData.folder}
              onChange={(value: string) => setFormData({ ...formData, folder: value })}
              placeholder="e.g., Marketing, Development"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => { setShowCreateModal(false); resetForm(); }} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.content || loadingStates.createPreset}
            >
              {loadingStates.createPreset ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Preset Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPreset(null); resetForm(); }} title="Edit Preset">
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(value: string) => setFormData({ ...formData, name: value })}
              placeholder="My Preset"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Description
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(value: string) => setFormData({ ...formData, description: value })}
              placeholder="What does this preset do?"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your prompt content..."
              rows={8}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "monospace",
                resize: "vertical"
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Model
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
            </select>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Folder (Optional)
            </label>
            <Input
              type="text"
              value={formData.folder}
              onChange={(value: string) => setFormData({ ...formData, folder: value })}
              placeholder="e.g., Marketing, Development"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => { setShowEditModal(false); setSelectedPreset(null); resetForm(); }} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name || !formData.content || loadingStates.updatePreset}
            >
              {loadingStates.updatePreset ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Execute Preset Modal */}
      <Modal isOpen={showExecuteModal} onClose={() => { setShowExecuteModal(false); setSelectedPreset(null); setSelectedProject(""); }} title="Execute Preset">
        <div style={{ padding: "16px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666" }}>
            Select a project to execute this preset in:
          </p>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Project *
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => { setShowExecuteModal(false); setSelectedPreset(null); setSelectedProject(""); }} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={!selectedProject || loadingStates.executePreset}
            >
              {loadingStates.executePreset ? "Executing..." : "Execute"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
