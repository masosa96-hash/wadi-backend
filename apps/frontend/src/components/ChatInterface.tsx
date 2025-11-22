import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';
// import { useTranslation } from "react-i18next";
import Button from './Button';
import Input from './Input';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
}

interface ChatInterfaceProps {
    currentUser: { id: string; name: string };
}

export default function ChatInterface({ currentUser }: ChatInterfaceProps) {
    // const { t } = useTranslation('auth'); // Unused for now
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [partner, setPartner] = useState<{ id: string; name: string } | null>(null);

    // Simulate "Mirror Effect" matching
    const startMatching = () => {
        setIsSearching(true);
        // Mock delay for finding a partner
        setTimeout(() => {
            setIsSearching(false);
            setPartner({ id: 'mock-partner', name: 'Usuario WADI' });
            setMessages([
                {
                    id: 'sys-1',
                    senderId: 'system',
                    text: 'Conexión establecida. WADI sugiere hablar sobre: "Tus metas para el próximo mes".',
                    timestamp: Date.now(),
                    isSystem: true
                }
            ]);
        }, 2000);
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            text: inputText,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Mock reply
        if (partner) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    senderId: partner.id,
                    text: '¡Qué interesante! Cuéntame más.',
                    timestamp: Date.now(),
                }]);
            }, 1500);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            overflow: 'hidden',
            border: `1px solid ${theme.colors.border.subtle}`,
        }}>
            {/* Header */}
            <div style={{
                padding: theme.spacing.md,
                borderBottom: `1px solid ${theme.colors.border.subtle}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: theme.colors.background.tertiary,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: partner ? theme.colors.success : theme.colors.text.tertiary,
                    }} />
                    <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
                        {partner ? (isAnonymous ? 'Anónimo' : partner.name) : 'Esperando conexión...'}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <button
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        style={{
                            background: 'none',
                            border: `1px solid ${isAnonymous ? theme.colors.accent.primary : theme.colors.border.subtle}`,
                            color: isAnonymous ? theme.colors.accent.primary : theme.colors.text.secondary,
                            padding: '4px 8px',
                            borderRadius: theme.borderRadius.sm,
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.xs,
                        }}
                    >
                        🕵️ {isAnonymous ? 'Anónimo ON' : 'Anónimo OFF'}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                padding: theme.spacing.lg,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.md,
            }}>
                {!partner && !isSearching && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: theme.colors.text.secondary,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🪞</div>
                        <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Efecto Espejo</h3>
                        <p style={{ maxWidth: '300px', marginBottom: theme.spacing.xl }}>
                            Conecta con otros usuarios para reflexionar juntos. WADI guiará la conversación.
                        </p>
                        <Button onClick={startMatching}>
                            Buscar compañero
                        </Button>
                    </div>
                )}

                {isSearching && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: theme.colors.text.secondary,
                    }}>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            Buscando resonancia...
                        </motion.div>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                alignSelf: msg.isSystem ? 'center' : (msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'),
                                maxWidth: msg.isSystem ? '80%' : '70%',
                                marginBottom: theme.spacing.xs,
                            }}
                        >
                            {msg.isSystem ? (
                                <div style={{
                                    background: `${theme.colors.accent.highlight}20`,
                                    color: theme.colors.accent.highlight,
                                    padding: '8px 16px',
                                    borderRadius: theme.borderRadius.full,
                                    fontSize: theme.typography.fontSize.xs,
                                    textAlign: 'center',
                                    border: `1px solid ${theme.colors.accent.highlight}40`,
                                }}>
                                    ✨ {msg.text}
                                </div>
                            ) : (
                                <div style={{
                                    background: msg.senderId === currentUser.id ? theme.colors.text.primary : theme.colors.background.tertiary,
                                    color: msg.senderId === currentUser.id ? theme.colors.background.primary : theme.colors.text.primary,
                                    padding: '12px 16px',
                                    borderRadius: theme.borderRadius.lg,
                                    borderBottomRightRadius: msg.senderId === currentUser.id ? 0 : theme.borderRadius.lg,
                                    borderBottomLeftRadius: msg.senderId !== currentUser.id ? 0 : theme.borderRadius.lg,
                                }}>
                                    {msg.text}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            {partner && (
                <form onSubmit={sendMessage} style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.tertiary,
                    borderTop: `1px solid ${theme.colors.border.subtle}`,
                    display: 'flex',
                    gap: theme.spacing.md,
                }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            value={inputText}
                            onChange={setInputText}
                            placeholder="Escribe un mensaje..."
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <Button type="submit" disabled={!inputText.trim()}>
                        Enviar
                    </Button>
                </form>
            )}
        </div>
    );
}
