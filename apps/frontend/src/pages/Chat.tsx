import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";
import { useChatStore } from "../store/chatStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import WadiOrb from "../components/WadiOrb";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [lastMessageToRetry, setLastMessageToRetry] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const {
    messages,
    sendingMessage,
    loadingMessages,
    error,
    sendMessage,
    currentConversationId,
    loadConversation,
    clearError,
  } = useChatStore();

  // Get initial message or template prompt from navigation state
  const initialMessage = location.state?.initialMessage;
  const templatePrompt = location.state?.templatePrompt;
  const conversationIdFromUrl = location.state?.conversationId;
  const highlightMessageId = location.state?.highlightMessageId;

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  // Set template prompt if provided
  useEffect(() => {
    if (templatePrompt) setInputMessage(templatePrompt);
  }, [templatePrompt]);

  // Load conversation if conversationId is provided in URL
  useEffect(() => {
    if (conversationIdFromUrl && conversationIdFromUrl !== currentConversationId) {
      loadConversation(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, currentConversationId, loadConversation]);

  // Scroll to highlighted message after messages load
  useEffect(() => {
    if (highlightMessageId && messages.length > 0 && !loadingMessages) {
      const t = setTimeout(() => {
        const element = document.getElementById(`message-${highlightMessageId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setIsUserScrolling(false);
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [highlightMessageId, messages, loadingMessages]);

  // Auto-scroll to bottom when messages change (only if user is not scrolling)
  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolling]);

  // Detect user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsUserScrolling(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = async (messageToSend?: string) => {
    const message = (messageToSend ?? inputMessage).trim();
    if (!message || sendingMessage) return;

    if (!messageToSend) setInputMessage("");
    setLastMessageToRetry(message);

    try {
      await sendMessage(message);
      setLastMessageToRetry(null);
      setIsUserScrolling(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && !currentConversationId) {
      handleSendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    if (lastMessageToRetry) {
      clearError();
      handleSendMessage(lastMessageToRetry);
    }
  };

  const scrollToBottom = () => {
    setIsUserScrolling(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleVoiceInput = () => {
    if (!voiceSupported) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // ✅ Enter envía / Shift+Enter nueva línea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PhoneShell>
      {/* Header */}
      <header
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          borderBottom: `1px solid ${theme.colors.border.light}`,
          background: theme.colors.background.secondary,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: theme.spacing.xs,
            }}
          >
            ←
          </motion.button>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.h2,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}
            >
              Conversa con WADI
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.bodySmall,
                color: theme.colors.text.secondary,
              }}
            >
              Tu espacio principal de trabajo
            </p>
          </div>

          <WadiOrb size="small" showPulse={true} />
        </div>
      </header>

      {/* Messages Area */}
      <main
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.lg,
          paddingBottom: "120px",
        }}
      >
        {/* Error Message with Retry Button */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${theme.colors.error}`,
                borderRadius: theme.borderRadius.medium,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.lg,
                color: theme.colors.error,
                fontSize: theme.typography.fontSize.bodySmall,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: theme.spacing.md,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      marginBottom: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                    }}
                  >
                    😕 Ups, algo salió mal
                  </div>
                  <div>{error}</div>
                </div>
                <div style={{ display: "flex", gap: theme.spacing.xs }}>
                  {lastMessageToRetry && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetry}
                      style={{
                        background: theme.colors.error,
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: theme.borderRadius.small,
                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                        fontSize: theme.typography.fontSize.bodySmall,
                        fontWeight: theme.typography.fontWeight.semibold,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Reintentar
                    </motion.button>
                  )}
                  <button
                    onClick={clearError}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: theme.colors.error,
                      padding: theme.spacing.xs,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {messages.length === 0 && !sendingMessage && !loadingMessages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: `${theme.spacing["2xl"]} ${theme.spacing.lg}`,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}
            >
              💬
            </motion.div>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.h3,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              ¡Empecemos a conversar!
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
              }}
            >
              Escribime lo que necesités y te ayudo con lo que sea
            </p>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loadingMessages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
              padding: theme.spacing.lg,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: theme.spacing.sm,
                  alignItems: "flex-start",
                  justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
                }}
              >
                {i % 2 === 1 && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(37, 95, 245, 0.2)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                )}
                <div
                  style={{
                    width: i % 2 === 0 ? "60%" : "70%",
                    height: "60px",
                    borderRadius: theme.borderRadius.large,
                    background: "rgba(15, 23, 42, 0.05)",
                    animation: "pulse 1.5s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Messages List */}
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isHighlighted = highlightMessageId === message.id;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: isHighlighted
                      ? "rgba(37, 95, 245, 0.08)"
                      : "transparent",
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  id={`message-${message.id}`}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: theme.spacing.sm,
                    padding: isHighlighted ? theme.spacing.sm : "0",
                    borderRadius: theme.borderRadius.medium,
                    transition: theme.transitions.medium,
                  }}
                >
                  {message.role === "assistant" && (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: theme.gradients.button,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        fontWeight: theme.typography.fontWeight.bold,
                        flexShrink: 0,
                      }}
                    >
                      W
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: "75%",
                      background:
                        message.role === "user"
                          ? theme.gradients.button
                          : "rgba(255, 255, 255, 0.9)",
                      color:
                        message.role === "user"
                          ? "#FFFFFF"
                          : theme.colors.text.primary,
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      borderRadius: theme.borderRadius.large,
                      fontSize: theme.typography.fontSize.body,
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      boxShadow:
                        message.role === "user"
                          ? "0 4px 12px rgba(37, 95, 245, 0.2)"
                          : "0 4px 12px rgba(15, 23, 42, 0.08)",
                      backdropFilter:
                        message.role === "assistant" ? "blur(10px)" : "none",
                      border:
                        message.role === "assistant"
                          ? `1px solid ${theme.colors.border.light}`
                          : "none",
                    }}
                  >
                    {message.content}

                    {message.error && (
                      <div
                        style={{
                          marginTop: theme.spacing.xs,
                          fontSize: theme.typography.fontSize.caption,
                          color: theme.colors.error,
                          opacity: 0.8,
                        }}
                      >
                        ⚠️ Hubo un problema al generar esta respuesta
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sendingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: theme.spacing.sm,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: theme.gradients.button,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: theme.typography.fontWeight.bold,
                  flexShrink: 0,
                }}
              >
                W
              </motion.div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.large,
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  border: `1px solid ${theme.colors.border.light}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  }}
                >
                  <motion.div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [-3, 0, -3] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: theme.colors.accent.primary,
                        }}
                      />
                    ))}
                  </motion.div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.bodySmall,
                      color: theme.colors.text.secondary,
                      fontStyle: "italic",
                    }}
                  >
                    WADI pensando…
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </main>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {isUserScrolling && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: "100px",
              right: "20px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: theme.gradients.button,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "20px",
              boxShadow: "0 4px 16px rgba(37, 95, 245, 0.3)",
              zIndex: 50,
            }}
          >
            ↓
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${theme.colors.border.light}`,
          padding: theme.spacing.lg,
          paddingBottom: 0,
          boxShadow: "0 -4px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: "18px",
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              display: "flex",
              alignItems: "flex-end",
              gap: theme.spacing.md,
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.12)",
              border: `1px solid ${theme.colors.border.light}`,
              marginBottom: theme.spacing.md,
            }}
          >
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribime lo que necesités…"
              disabled={sendingMessage}
              rows={1}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.primary,
                resize: "none",
                maxHeight: "120px",
                padding: theme.spacing.sm,
              }}
            />

            {voiceSupported && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleVoiceInput}
                disabled={sendingMessage || isListening}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: isListening ? theme.colors.error : "transparent",
                  border: "none",
                  cursor: sendingMessage ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isListening ? "#FFFFFF" : theme.colors.accent.primary,
                  fontSize: "20px",
                  transition: theme.transitions.fast,
                  opacity: sendingMessage ? 0.5 : 1,
                }}
              >
                {isListening ? "⏸️" : "🎤"}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(37, 95, 245, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputMessage.trim() || sendingMessage}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: theme.gradients.button,
                border: "none",
                cursor: inputMessage.trim() && !sendingMessage ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "20px",
                transition: theme.transitions.fast,
                boxShadow: "0 0 16px rgba(37, 95, 245, 0.3)",
                opacity: inputMessage.trim() && !sendingMessage ? 1 : 0.5,
              }}
            >
              ✈️
            </motion.button>
          </div>
        </form>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}
