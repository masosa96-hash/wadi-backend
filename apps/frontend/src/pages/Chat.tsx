import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { theme } from "../styles/theme";
import ChatInterface from "../components/ChatInterface";
// import { useTranslation } from "react-i18next";

type ChatMode = 'ai' | 'mirror';

export default function Chat() {
  const { user } = useAuthStore();
  // const { t } = useTranslation('auth'); // Unused for now
  const {
    messages,
    sendMessage,
    sendingMessage,
  } = useChatStore();

  const [mode, setMode] = useState<ChatMode>('ai');
  const [inputMessage, setInputMessage] = useState("");
  // const [showActions, setShowActions] = useState(false); // Unused for now
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mode]);

  const handleSend = async () => {
    if (!inputMessage.trim() || sendingMessage) return;

    const message = inputMessage;
    setInputMessage("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PhoneShell>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: theme.colors.background.primary,
      }}>
        {/* Header */}
        <div style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.secondary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}>
              Chat WADI
            </h1>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
            }}>
              {mode === 'ai' ? 'AI Assistant' : 'Efecto Espejo'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
            padding: '2px',
            border: `1px solid ${theme.colors.border.subtle}`,
          }}>
            <button
              onClick={() => setMode('ai')}
              style={{
                padding: '4px 12px',
                background: mode === 'ai' ? theme.colors.accent.primary : 'transparent',
                color: mode === 'ai' ? '#FFFFFF' : theme.colors.text.secondary,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              AI
            </button>
            <button
              onClick={() => setMode('mirror')}
              style={{
                padding: '4px 12px',
                background: mode === 'mirror' ? theme.colors.accent.primary : 'transparent',
                color: mode === 'mirror' ? '#FFFFFF' : theme.colors.text.secondary,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              Espejo
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {mode === 'mirror' ? (
            <div style={{ flex: 1, padding: theme.spacing.md }}>
              <ChatInterface currentUser={{ id: user?.id || 'guest', name: user?.user_metadata?.full_name || 'Usuario' }} />
            </div>
          ) : (
            <>
              {/* AI Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: theme.spacing.lg,
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: theme.spacing['2xl'],
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>
                      🤖
                    </div>
                    <h3 style={{
                      margin: `0 0 ${theme.spacing.sm} 0`,
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                    }}>
                      Hola, soy WADI
                    </h3>
                    <p style={{
                      margin: 0,
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.base,
                    }}>
                      Tu asistente AI. ¿En qué puedo ayudarte hoy?
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          display: "flex",
                          justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        <div style={{
                          maxWidth: "75%",
                          padding: theme.spacing.md,
                          borderRadius: theme.borderRadius.md,
                          background: message.role === "user"
                            ? theme.colors.accent.primary
                            : theme.colors.background.secondary,
                          color: message.role === "user"
                            ? "#FFFFFF"
                            : theme.colors.text.primary,
                          border: message.role === "assistant"
                            ? `1px solid ${theme.colors.border.subtle}`
                            : "none",
                        }}>
                          <div style={{
                            fontSize: theme.typography.fontSize.base,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}>
                            {message.content}
                          </div>
                          <div style={{
                            marginTop: theme.spacing.xs,
                            fontSize: theme.typography.fontSize.xs,
                            opacity: 0.6,
                          }}>
                            {new Date(message.created_at).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {sendingMessage && (
                      <div style={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}>
                        <div style={{
                          padding: theme.spacing.md,
                          borderRadius: theme.borderRadius.md,
                          background: theme.colors.background.secondary,
                          border: `1px solid ${theme.colors.border.subtle}`,
                        }}>
                          <div style={{ display: "flex", gap: theme.spacing.xs }}>
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Chat Input */}
              <div style={{
                padding: theme.spacing.lg,
                borderTop: `1px solid ${theme.colors.border.subtle}`,
                background: theme.colors.background.secondary,
              }}>
                <div style={{ display: "flex", gap: theme.spacing.sm }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    disabled={sendingMessage}
                    style={{
                      flex: 1,
                      padding: theme.spacing.md,
                      border: `1px solid ${theme.colors.border.default}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: theme.typography.fontSize.base,
                      outline: "none",
                      background: theme.colors.background.tertiary,
                      color: theme.colors.text.primary,
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sendingMessage || !inputMessage.trim()}
                    style={{
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      background: theme.colors.accent.primary,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      cursor: sendingMessage || !inputMessage.trim() ? "not-allowed" : "pointer",
                      opacity: sendingMessage || !inputMessage.trim() ? 0.5 : 1,
                    }}
                  >
                    {sendingMessage ? "..." : "Enviar"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${theme.colors.text.secondary};
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </PhoneShell>
  );
}
