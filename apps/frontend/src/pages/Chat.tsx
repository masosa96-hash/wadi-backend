import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import GuestNicknameModal from "../components/GuestNicknameModal";
import ConnectionIndicator from "../components/ConnectionIndicator";
import { theme } from "../styles/theme";
import ChatInterface from "../components/ChatInterface";
import MessageBubble from "../components/MessageBubble";
import ShareModal from "../components/ShareModal";
// import { useTranslation } from "react-i18next";

type ChatMode = 'ai' | 'mirror';

export default function Chat() {
  const { user, guestId, guestNick, setGuestNick } = useAuthStore();
  // const { t } = useTranslation('auth'); // Unused for now
  const {
    messages,
    sendMessage,
    sendingMessage,
  } = useChatStore();

  const [mode, setMode] = useState<ChatMode>('ai');
  const [inputMessage, setInputMessage] = useState("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const MAX_MESSAGE_LENGTH = 2000;
  // const [showActions, setShowActions] = useState(false); // Unused for now
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simple markdown formatter for messages
  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.+?)\*/g, '<em>$1</em>') // *italic*
      .replace(/`(.+?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>') // `code`
      .replace(/\n/g, '<br/>'); // line breaks
  };

  // Copy message to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast here
      console.log('Mensaje copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mode]);

  // Check if guest needs to set nickname
  useEffect(() => {
    if (!user && !guestNick && import.meta.env.VITE_GUEST_MODE === 'true') {
      setShowNicknameModal(true);
    }
  }, [user, guestNick]);

  // Load guest history from localStorage
  useEffect(() => {
    if (!user && guestId && import.meta.env.VITE_GUEST_MODE === 'true') {
      const stored = localStorage.getItem(`wadi_conv_${guestId}`);
      if (stored) {
        try {
          const history = JSON.parse(stored);
          useChatStore.setState({ messages: history });
        } catch (e) {
          console.error("Error loading guest history:", e);
        }
      }
    }
  }, [user, guestId]);

  const handleNicknameSubmit = (nickname: string) => {
    setGuestNick(nickname);
    setShowNicknameModal(false);
  };

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
    // Ctrl+K para limpiar el chat (dev feature)
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      if (confirm("¿Limpiar toda la conversación?")) {
        useChatStore.setState({ messages: [] });
        if (guestId) {
          localStorage.removeItem(`wadi_conv_${guestId}`);
        }
      }
    }
  };

  return (
    <PhoneShell>
      {showNicknameModal && <GuestNicknameModal onSubmit={handleNicknameSubmit} />}
      {showShareModal && (
        <ShareModal
          conversationId="current" // TODO: Use actual conversation ID
          onClose={() => setShowShareModal(false)}
        />
      )}
      <ConnectionIndicator />

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

          {/* Share Button */}
          {messages.length > 0 && (
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                background: 'transparent',
                border: `1px solid ${theme.colors.border.default}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.text.secondary,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
              title="Compartir conversación"
            >
              🔗 Compartir
            </button>
          )}
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
                      <MessageBubble
                        key={message.id}
                        type={message.role === "user" ? "user" : "ai"}
                        content={message.content}
                        timestamp={message.created_at}
                        model={message.role === "assistant" ? "WADI Brain" : undefined}
                      />
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
                <div style={{ display: "flex", gap: theme.spacing.sm, flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: theme.spacing.sm }}>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                          setInputMessage(e.target.value);
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
                      disabled={sendingMessage}
                      rows={1}
                      style={{
                        flex: 1,
                        padding: theme.spacing.md,
                        border: `1px solid ${theme.colors.border.default}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.base,
                        outline: "none",
                        background: theme.colors.background.tertiary,
                        color: theme.colors.text.primary,
                        resize: "vertical",
                        minHeight: "44px",
                        maxHeight: "120px",
                        fontFamily: theme.typography.fontFamily.primary,
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sendingMessage || !inputMessage.trim()}
                      style={{
                        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                        background: sendingMessage || !inputMessage.trim()
                          ? theme.colors.border.default
                          : theme.colors.accent.highlight, // Blue for action button
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: theme.typography.fontWeight.medium,
                        cursor: sendingMessage || !inputMessage.trim() ? "not-allowed" : "pointer",
                        transition: theme.transitions.default,
                        minWidth: "80px",
                        height: "44px",
                      }}
                    >
                      {sendingMessage ? "..." : "➤"}
                    </button>
                  </div>

                  {/* Character counter */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: theme.typography.fontSize.xs,
                    color: inputMessage.length > MAX_MESSAGE_LENGTH * 0.9
                      ? theme.colors.error
                      : theme.colors.text.tertiary,
                  }}>
                    <span>
                      {inputMessage.length > 0 && (
                        <>{inputMessage.length} / {MAX_MESSAGE_LENGTH} caracteres</>
                      )}
                    </span>
                    <span style={{ color: theme.colors.text.tertiary }}>
                      Tip: Ctrl+K para limpiar chat
                    </span>
                  </div>
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
