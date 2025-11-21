import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { theme } from "../styles/theme";

export default function Chat() {
  const { user } = useAuthStore();
  const {
    messages,
    currentConversationId,
    sendMessage,
    loadConversation,
    sendingMessage,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        }}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Chat WADI
          </h1>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: theme.spacing.lg,
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
              color: theme.colors.text.secondary,
            }}>
              Escribe un mensaje para empezar
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: theme.spacing.md,
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "70%",
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
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
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
                cursor: sendingMessage ? "not-allowed" : "pointer",
                opacity: sendingMessage || !inputMessage.trim() ? 0.5 : 1,
              }}
            >
              {sendingMessage ? "..." : "Enviar"}
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}
