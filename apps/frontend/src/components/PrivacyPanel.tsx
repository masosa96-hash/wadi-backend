import { useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useProjectsStore } from '../store/projectsStore';
import { supabase } from '../config/supabase';
return;
        }

setDeleting(true);
try {
    // Call backend to delete all user data
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/delete-account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${session?.access_token}`,
        },
    });

    if (!response.ok) throw new Error('Failed to delete account');

    // Sign out and redirect
    await signOut();
    window.location.href = '/';
} catch (error) {
    console.error('Error deleting account:', error);
    alert('❌ Error al eliminar cuenta. Por favor contacta a soporte.');
} finally {
    setDeleting(false);
}
    };

return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
    }}>
        {/* Export Data Section */}
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border.subtle}`,
        }}>
            <h3 style={{
                margin: `0 0 ${theme.spacing.sm} 0`,
                fontSize: theme.typography.fontSize.lg,
                borderRadius: theme.borderRadius.md,
                color: '#FFFFFF',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                opacity: exporting ? 0.6 : 1,
            }}
            >
                {exporting ? '⏳ Exportando...' : '📥 Exportar Datos'}
            </button>
        </div>

        {/* Delete Account Section */}
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            border: `2px solid ${theme.colors.error}`,
        }}>
            <h3 style={{
                margin: `0 0 ${theme.spacing.sm} 0`,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.error,
            }}>
                ⚠️ Zona de Peligro
            </h3>
            <p style={{
                margin: `0 0 ${theme.spacing.md} 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                lineHeight: 1.6,
            }}>
                Eliminar tu cuenta es <strong>permanente e irreversible</strong>. Se eliminarán:
            </p>
            <ul style={{
                margin: `0 0 ${theme.spacing.md} ${theme.spacing.lg}`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                lineHeight: 1.8,
            }}>
                <li>Todas tus conversaciones</li>
                <li>Todos tus proyectos y archivos</li>
                <li>Tu perfil y configuración</li>
                <li>Enlaces compartidos</li>
            </ul>

            {!showDeleteConfirm ? (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                        background: 'transparent',
                        border: `1px solid ${theme.colors.error}`,
                        borderRadius: theme.borderRadius.md,
                        color: theme.colors.error,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: theme.typography.fontWeight.medium,
                    }}
                >
                    Eliminar Mi Cuenta
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        marginTop: theme.spacing.md,
                        padding: theme.spacing.md,
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: theme.borderRadius.md,
                    }}
                >
                    <p style={{
                        margin: `0 0 ${theme.spacing.md} 0`,
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.primary,
                        fontWeight: theme.typography.fontWeight.medium,
                    }}>
                        Para confirmar, escribe <code style={{
                            background: theme.colors.background.tertiary,
                            padding: '2px 6px',
                            borderRadius: '4px',
                        }}>ELIMINAR</code> en el campo de abajo:
                    </p>
                    <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Escribe ELIMINAR"
                        style={{
                            width: '100%',
                            padding: theme.spacing.md,
                            marginBottom: theme.spacing.md,
                            background: theme.colors.background.tertiary,
                            border: `1px solid ${theme.colors.border.default}`,
                            borderRadius: theme.borderRadius.md,
                            color: theme.colors.text.primary,
                            fontSize: theme.typography.fontSize.base,
                        }}
                    />
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                        <button
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirmText('');
                            }}
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
                            onClick={handleDeleteAccount}
                            disabled={deleting || deleteConfirmText !== 'ELIMINAR'}
                            style={{
                    </div>
                </motion.div>
            )}
        </div>

        {/* Privacy Info */}
        <div style={{
            padding: theme.spacing.md,
            background: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
            borderLeft: `4px solid ${theme.colors.accent.highlight}`,
        }}>
            <p style={{
                margin: 0,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                lineHeight: 1.6,
            }}>
                💡 <strong>Tu privacidad es importante.</strong> Tus datos están protegidos con encriptación end-to-end y nunca se comparten con terceros sin tu consentimiento explícito.
            </p>
        </div>
    </div>
);
}
