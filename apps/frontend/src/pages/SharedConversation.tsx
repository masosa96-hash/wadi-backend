import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { useShareStore } from '../store/shareStore';
import MessageBubble from '../components/MessageBubble';
import PhoneShell from '../components/PhoneShell';

export default function SharedConversation() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { getShareByToken, loading, error } = useShareStore();
    const [conversation, setConversation] = useState<any>(null);

    useEffect(() => {
        if (token) {
            loadSharedConversation();
        }
    }, [token]);

    const loadSharedConversation = async () => {
        try {
            const data = await getShareByToken(token!);
            setConversation(data);
        } catch (err) {
            console.error('Error loading shared conversation:', err);
        }
    };

    if (loading) {
        return (
            <PhoneShell>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: theme.colors.background.primary,
                }}>
                    <div style={{
                        textAlign: 'center',
                        color: theme.colors.text.secondary,
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>
                            ⏳
                        </div>
                        <p>Cargando conversación compartida...</p>
                    </div>
                </div>
            </PhoneShell>
        );
    }

    if (error || !conversation) {
        return (
            <PhoneShell>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: theme.colors.background.primary,
                    padding: theme.spacing.xl,
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '400px',
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: theme.spacing.lg }}>
                            🔒
                        </div>
                        <h2 style={{
                            margin: `0 0 ${theme.spacing.md} 0`,
                            fontSize: theme.typography.fontSize.xl,
                            fontWeight: theme.typography.fontWeight.semibold,
                            color: theme.colors.text.primary,
                        }}>
                            Conversación no disponible
                        </h2>
                        <p style={{
                            margin: `0 0 ${theme.spacing.xl} 0`,
                            fontSize: theme.typography.fontSize.base,
                            color: theme.colors.text.secondary,
                        }}>
                            Este enlace ha expirado o no existe. Verifica que el enlace sea correcto.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                                background: theme.colors.accent.highlight,
                                border: 'none',
                                borderRadius: theme.borderRadius.md,
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: theme.typography.fontSize.base,
                                fontWeight: theme.typography.fontWeight.medium,
                            }}
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </PhoneShell>
        );
    }

    return (
        <PhoneShell>
            <div style={{
                minHeight: '100vh',
                background: theme.colors.background.primary,
            }}>
                {/* Header */}
                <div style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.border.subtle}`,
                    background: theme.colors.background.secondary,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: theme.typography.fontSize.xl,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text.primary,
                            }}>
                                Conversación Compartida
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.text.secondary,
                            }}>
                                🔗 Vista de solo lectura
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                background: theme.colors.accent.highlight,
                                border: 'none',
                                borderRadius: theme.borderRadius.md,
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.medium,
                            }}
                        >
                            Crear Cuenta
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
                    padding: theme.spacing.lg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.md,
                }}>
                    {conversation.messages?.map((message: any) => (
                        <MessageBubble
                            key={message.id}
                            type={message.role === 'user' ? 'user' : 'ai'}
                            content={message.content}
                            timestamp={message.created_at}
                            model={message.role === 'assistant' ? 'WADI Brain' : undefined}
                        />
                    ))}
                </div>

                {/* Footer CTA */}
                <div style={{
                    padding: theme.spacing.xl,
                    background: theme.colors.background.secondary,
                    borderTop: `1px solid ${theme.colors.border.subtle}`,
                    textAlign: 'center',
                }}>
                    <p style={{
                        margin: `0 0 ${theme.spacing.md} 0`,
                        fontSize: theme.typography.fontSize.base,
                        color: theme.colors.text.primary,
                    }}>
                        ¿Te gustó esta conversación?
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                            background: theme.colors.accent.highlight,
                            border: 'none',
                            borderRadius: theme.borderRadius.md,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.base,
                            fontWeight: theme.typography.fontWeight.medium,
                        }}
                    >
                        Crea tu cuenta gratis en WADI
                    </button>
                </div>
            </div>
        </PhoneShell>
    );
}
