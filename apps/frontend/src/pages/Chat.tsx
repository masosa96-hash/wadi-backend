import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { PhoneShell } from "../components/PhoneShell";
import { BottomNav } from "../components/BottomNav";
import { MessageBubble } from "../components/MessageBubble";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Mic, Loader2, ArrowDown, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import WadiOrb from "../components/WadiOrb";

export default function Chat() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const {
    messages,
    sendingMessage,
    loadingMessages,
    error,
    sendMessage,
    currentConversationId,
    loadConversation,
    clearError,
    connect,
    disconnect,
    isConnected
  } = useChatStore();

  const { user } = useAuthStore();

  // Load conversation on mount or ID change
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
    return () => {
      disconnect();
    };
  }, [currentConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
      // Only auto-scroll if user is near bottom or if it's a new message from user/AI
      const isNearBottom = scrollHeight - clientHeight - scrollTop < 100;

      if (isNearBottom || sendingMessage) {
        messagesContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, sendingMessage]);

  // Show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - clientHeight - scrollTop > 100);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendingMessage) return;

    const messageToSend = input;
    setInput("");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Voice input simulation (placeholder)
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening
      setTimeout(() => {
        setIsListening(false);
        setInput("Hola WADI, ¿cómo estás?");
      }, 2000);
    }
  };

  return (
    <PhoneShell>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <WadiOrb size="sm" className="opacity-80" />
            <div>
              <h1 className="font-display font-bold text-lg leading-none">WADI</h1>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                  isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-yellow-500"
                )} />
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  {isConnected ? "ONLINE" : "CONNECTING..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pt-14 pb-32 px-4 space-y-6 scroll-smooth"
      >
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm font-medium">Cargando recuerdos...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
            <WadiOrb size="lg" className="opacity-50 grayscale" />
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl">Todo listo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Soy WADI. Estoy acá para ayudarte a crear, pensar y resolver.
                <br />
                ¿En qué nos enfocamos hoy?
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-2" /> {/* Spacer */}
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                isLast={i === messages.length - 1}
              />
            ))}
            {sendingMessage && !messages[messages.length - 1]?.role.includes("assistant") && (
              <div className="flex justify-start px-1">
                <div className="bg-muted/50 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div className="h-2" /> {/* Spacer */}
          </>
        )}
      </main>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 z-20 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-4 right-4 z-30"
          >
            <div className="bg-destructive/90 backdrop-blur text-destructive-foreground px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm font-medium">
              <span>{error}</span>
              <button onClick={clearError} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/10 pb-safe">
        <form onSubmit={handleSubmit} className="p-3 flex items-end gap-2 max-w-md mx-auto">
          <div className="flex-1 bg-muted/50 hover:bg-muted/80 focus-within:bg-muted transition-colors rounded-[24px] border border-white/5 focus-within:border-primary/20 flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu mensaje..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[44px] py-3 px-4 text-sm placeholder:text-muted-foreground/70"
              rows={1}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={cn(
                "p-2 mr-1 mb-1 rounded-full transition-all duration-300",
                isListening
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || sendingMessage}
            className={cn(
              "p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed",
              sendingMessage && "opacity-80"
            )}
          >
            {sendingMessage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 translate-x-0.5" />
            )}
          </button>
        </form>
        <BottomNav />
      </div>
    </PhoneShell>
  );
}
