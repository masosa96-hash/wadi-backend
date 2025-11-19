import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { theme } from "../styles/theme";
import { api } from "../config/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId?: string;
  sessionId?: string;
}

export default function ShareModal({ isOpen, onClose, runId, sessionId }: ShareModalProps) {
  const [expiresInDays, setExpiresInDays] = useState("");
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    
    try {
      const response = await api.post<{ data: { token: string } }>("/api/shares", {
        run_id: runId || null,
        session_id: sessionId || null,
        expires_in_days: expiresInDays ? parseInt(expiresInDays) : null,
        password: password || null,
        max_views: maxViews ? parseInt(maxViews) : null,
      });

      const token = (response as any).data.token;
      const url = `${window.location.origin}/share/${token}`;
      setShareLink(url);
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Failed to create share link. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("Link copied to clipboard!");
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setExpiresInDays("");
    setPassword("");
    setMaxViews("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share">
      {!shareLink ? (
        <div>
          <p style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily.primary,
          }}>
            Configure share link settings
          </p>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <Input
              type="number"
              value={expiresInDays}
              onChange={setExpiresInDays}
              label="Expires in (days)"
              placeholder="Leave empty for no expiration"
            />
          </div>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              label="Password (optional)"
              placeholder="Leave empty for public access"
            />
          </div>

          <div style={{ marginBottom: theme.spacing.xl }}>
            <Input
              type="number"
              value={maxViews}
              onChange={setMaxViews}
              label="Max views (optional)"
              placeholder="Leave empty for unlimited views"
            />
          </div>

          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'flex-end',
          }}>
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Link'}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{
            margin: `0 0 ${theme.spacing.md} 0`,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily.primary,
          }}>
            Share link created successfully!
          </p>

          <div style={{
            padding: theme.spacing.md,
            background: theme.colors.background.tertiary,
            border: `1px solid ${theme.colors.border.accent}`,
            borderRadius: theme.borderRadius.medium,
            marginBottom: theme.spacing.lg,
            fontFamily: theme.typography.fontFamily.mono,
            fontSize: theme.typography.fontSize.bodySmall,
            color: theme.colors.accent.primary,
            wordBreak: 'break-all',
          }}>
            {shareLink}
          </div>

          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'flex-end',
          }}>
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
            >
              Close
            </Button>
            <Button 
              type="button" 
              onClick={handleCopyLink}
            >
              Copy Link
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
