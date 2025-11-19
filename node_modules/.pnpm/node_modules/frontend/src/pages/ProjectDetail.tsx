import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";
import { useSessionsStore } from "../store/sessionsStore";
import { theme } from "../styles/theme";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import MessageBubble from "../components/MessageBubble";
import SessionHeader from "../components/SessionHeader";
import Modal from "../components/Modal";
import Input from "../components/Input";
import RenameRunModal from "../components/RenameRunModal";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { runs, loadingStates, error, fetchRuns, createRun, clearRuns, clearError, renameRun } = useRunsStore();
  const { 
    sessions, 
    activeSessionId, 
    loadingStates: sessionLoadingStates,
    fetchSessions, 
    createSession, 
    updateSession,
    deleteSession,
    clearSessions,
  } = useSessionsStore();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collapsedSessions, setCollapsedSessions] = useState<Set<string>>(new Set());
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showRenameSessionModal, setShowRenameSessionModal] = useState(false);
  const [showRenameRunModal, setShowRenameRunModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDesc, setNewSessionDesc] = useState("");

  useEffect(() => {
    if (id) {
      fetchRuns(id);
      fetchSessions(id);
    }
    return () => {
      clearRuns();
      clearSessions();
    };
  }, [id, fetchRuns, fetchSessions, clearRuns, clearSessions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !input.trim()) return;

    setSubmitting(true);
    clearError();
    
    try {
      // Create session if none exists
      let sessionId = activeSessionId;
      if (!sessionId && sessions.length === 0) {
        const newSession = await createSession(id);
        sessionId = newSession.id;
      }
      
      await createRun(id, input);
      setInput("");
      
      // Refresh sessions to update run count
      await fetchSessions(id);
    } catch (err) {
      console.error("Create run error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      await createSession(id, newSessionName || undefined, newSessionDesc || undefined);
      setShowNewSessionModal(false);
      setNewSessionName("");
      setNewSessionDesc("");
      await fetchSessions(id);
    } catch (err) {
      console.error("Create session error:", err);
    }
  };

  const handleRenameSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) return;
    
    try {
      await updateSession(selectedSessionId, { name: newSessionName || null });
      setShowRenameSessionModal(false);
      setSelectedSessionId(null);
      setNewSessionName("");
      if (id) await fetchSessions(id);
    } catch (err) {
      console.error("Rename session error:", err);
    }
  };

  const toggleSessionCollapse = (sessionId: string) => {
    setCollapsedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const openRenameModal = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionId(sessionId);
      setNewSessionName(session.name || "");
      setShowRenameSessionModal(true);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      if (id) {
        await fetchSessions(id);
        await fetchRuns(id);
      }
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  const openRenameRunModal = (runId: string) => {
    setSelectedRunId(runId);
    setShowRenameRunModal(true);
  };

  const handleRenameRun = async (name: string) => {
    if (!selectedRunId) return;
    
    try {
      await renameRun(selectedRunId, name);
      setShowRenameRunModal(false);
      setSelectedRunId(null);
    } catch (err) {
      console.error("Rename run error:", err);
      throw err;
    }
  };

  // Group runs by session
  const runsBySession = runs.reduce((acc, run) => {
    const key = run.session_id || 'no-session';
    if (!acc[key]) acc[key] = [];
    acc[key].push(run);
    return acc;
  }, {} as Record<string, typeof runs>);

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: theme.layout.sidebarWidth,
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        minHeight: "100vh",
        fontFamily: theme.typography.fontFamily.primary,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          padding: theme.spacing.xl,
          background: theme.colors.background.secondary,
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Button
              variant="ghost"
              onClick={() => navigate("/projects")}
              style={{ marginBottom: theme.spacing.md }}
            >
              ← Back to Projects
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{
                margin: 0,
                fontSize: theme.typography.fontSize.h1,
                fontWeight: theme.typography.fontWeight.semibold,
              }}>
                Project Runs
              </h1>
              <Button onClick={() => setShowNewSessionModal(true)}>
                + New Session
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: theme.spacing.xl,
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {loadingStates.fetchRuns && runs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: theme.spacing['3xl'],
                color: theme.colors.text.secondary,
              }}>
                Loading runs...
              </div>
            ) : sessions.length === 0 && runs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: theme.spacing['3xl'],
                color: theme.colors.text.secondary,
              }}>
                <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>
                  💬
                </div>
                <p style={{
                  fontSize: theme.typography.fontSize.bodyLarge,
                  margin: 0,
                }}>
                  No runs yet. Start a conversation with AI below!
                </p>
              </div>
            ) : (
              <div>
                {/* Sessions with runs */}
                {sessions.map((session) => {
                  const sessionRuns = runsBySession[session.id] || [];
                  const isCollapsed = collapsedSessions.has(session.id);
                  
                  return (
                    <div key={session.id} style={{ marginBottom: theme.spacing.xl }}>
                      <SessionHeader
                        session={session}
                        isActive={session.is_active}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleSessionCollapse(session.id)}
                        onRename={openRenameModal}
                        onDelete={handleDeleteSession}
                      />
                      
                      {!isCollapsed && sessionRuns.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                          {sessionRuns.map((run) => (
                            <div key={run.id}>
                              <MessageBubble
                                type="user"
                                content={run.input}
                                timestamp={run.created_at}
                                customName={run.custom_name || undefined}
                                onRename={() => openRenameRunModal(run.id)}
                              />
                              <MessageBubble
                                type="ai"
                                content={run.output}
                                timestamp={run.created_at}
                                model={run.model}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Runs without session */}
                {runsBySession['no-session'] && runsBySession['no-session'].length > 0 && (
                  <div style={{ marginTop: theme.spacing.xl }}>
                    <h3 style={{
                      fontSize: theme.typography.fontSize.h3,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.lg,
                    }}>
                      Unsorted Runs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                      {runsBySession['no-session'].map((run) => (
                        <div key={run.id}>
                          <MessageBubble
                            type="user"
                            content={run.input}
                            timestamp={run.created_at}
                            customName={run.custom_name || undefined}
                            onRename={() => openRenameRunModal(run.id)}
                          />
                          <MessageBubble
                            type="ai"
                            content={run.output}
                            timestamp={run.created_at}
                            model={run.model}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Box at Bottom */}
        <div style={{
          borderTop: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.secondary,
          padding: theme.spacing.xl,
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: `${theme.colors.error}15`,
                  border: `1px solid ${theme.colors.error}40`,
                  borderLeft: `4px solid ${theme.colors.error}`,
                  borderRadius: theme.borderRadius.small,
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  marginBottom: theme.spacing.lg,
                  color: theme.colors.error,
                  fontSize: theme.typography.fontSize.bodySmall,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                  <span>⚠️</span>
                  <span>{error.message}</span>
                </div>
                <button
                  onClick={clearError}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.error,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: 0,
                    marginLeft: theme.spacing.lg,
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'flex',
                gap: theme.spacing.md,
                alignItems: 'flex-end',
              }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    maxLength={5000}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      borderRadius: theme.borderRadius.medium,
                      border: `1px solid ${theme.colors.border.subtle}`,
                      background: theme.colors.background.tertiary,
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.body,
                      fontFamily: theme.typography.fontFamily.primary,
                      resize: 'vertical',
                      minHeight: '48px',
                      maxHeight: '120px',
                      transition: theme.transitions.fast,
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.accent.primary;
                      e.currentTarget.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.subtle;
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: theme.spacing.sm,
                    fontSize: theme.typography.fontSize.caption,
                    color: theme.colors.text.tertiary,
                  }}>
                    <span>{input.length} / 5000 characters</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !input.trim()}
                  style={{
                    height: '48px',
                    minWidth: '100px',
                  }}
                >
                  {submitting || loadingStates.createRun ? "Generating..." : "Send"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* New Session Modal */}
      <Modal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Create New Session"
      >
        <form onSubmit={handleNewSession}>
          <Input
            type="text"
            value={newSessionName}
            onChange={setNewSessionName}
            label="Session Name (optional)"
            placeholder="e.g., User Authentication Feature"
            maxLength={100}
          />
          <Input
            type="text"
            value={newSessionDesc}
            onChange={setNewSessionDesc}
            label="Description (optional)"
            placeholder="Brief description of this session"
            maxLength={200}
          />
          <div style={{
            display: "flex",
            gap: theme.spacing.md,
            justifyContent: "flex-end",
            marginTop: theme.spacing.lg,
          }}>
            <Button
              type="button"
              onClick={() => setShowNewSessionModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sessionLoadingStates.createSession}>
              {sessionLoadingStates.createSession ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Session Modal */}
      <Modal
        isOpen={showRenameSessionModal}
        onClose={() => setShowRenameSessionModal(false)}
        title="Rename Session"
      >
        <form onSubmit={handleRenameSession}>
          <Input
            type="text"
            value={newSessionName}
            onChange={setNewSessionName}
            label="Session Name"
            placeholder="Enter session name"
            maxLength={100}
            autoFocus
          />
          <div style={{
            display: "flex",
            gap: theme.spacing.md,
            justifyContent: "flex-end",
            marginTop: theme.spacing.lg,
          }}>
            <Button
              type="button"
              onClick={() => setShowRenameSessionModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sessionLoadingStates.updateSession}>
              {sessionLoadingStates.updateSession ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Run Modal */}
      <RenameRunModal
        isOpen={showRenameRunModal}
        onClose={() => {
          setShowRenameRunModal(false);
          setSelectedRunId(null);
        }}
        onRename={handleRenameRun}
        currentName={selectedRunId ? runs.find(r => r.id === selectedRunId)?.custom_name || "" : ""}
        isLoading={loadingStates.renameRun}
      />
    </>
  );
}
