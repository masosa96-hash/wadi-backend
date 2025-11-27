import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';
import { useShareStore } from '../store/shareStore';

interface ShareModalProps {
  conversationId: string;
  onClose: () => void;
}

export default function ShareModal({ conversationId, onClose }: ShareModalProps) {
  const { createShare, loading } = useShareStore();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(7); // 7 days default
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    try {
      const url = await createShare(conversationId, expiresIn || undefined);
      setShareUrl(url);
    } catch (error) {
      console.error('Error creating share:', error);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: theme.spacing.lg,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            maxWidth: '500px',
            width: '100%',
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <h2 style={{
            margin: `0 0 ${theme.spacing.md} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Compartir Conversación
          </h2>

          {!shareUrl ? (
            <>
              <p style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}>
                Crea un enlace público para compartir esta conversación. Puedes establecer una fecha de expiración opcional.
              </p>

              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.primary,
                }}>
                  Expira en:
                </label>
                <select
                  value={expiresIn || ''}
                  onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.md,
                    background: theme.colors.background.tertiary,
                    border: `1px solid ${theme.colors.border.default}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                  }}
                >
                  <option value="1">1 día</option>
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="">Nunca</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: theme.spacing.md,
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border.default}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.text.secondary,
                    cursor: 'pointer',
                    fontSize: theme.typography.fontSize.base,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateShare}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: theme.spacing.md,
                    background: theme.colors.accent.highlight,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    color: '#FFFFFF',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {loading ? 'Creando...' : 'Crear Enlace'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}>
                ✅ Enlace creado exitosamente. Compártelo con quien quieras:
              </p>

              <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.lg,
              }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: theme.spacing.md,
                    background: theme.colors.background.tertiary,
                    border: `1px solid ${theme.colors.border.default}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                />
                <button
                  onClick={handleCopy}
                  style={{
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    background: copied ? theme.colors.success : theme.colors.accent.highlight,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    minWidth: '80px',
                  }}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.base,
                }}
              >
                Cerrar
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
