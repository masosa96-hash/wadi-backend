
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ChatInterface from "../components/ChatInterface"; // Mirror Mode Component

// --- Icons (Lucide-style inline SVGs) ---
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  History: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Paperclip: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  Share: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  ToggleLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="8" cy="12" r="3" />
    </svg>
  ),
  ToggleRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" className="fill-cyan-500/20 stroke-cyan-500" />
      <circle cx="16" cy="12" r="3" className="fill-cyan-400" />
    </svg>
  )
};

// --- Components ---

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 rounded-xl transition-all duration-200 group w-full md:w-auto md:justify-start justify-center
      ${active 
        ? 'text-cyan-400 bg-[#1A1A1D]' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1D]/50'
      }`}
  >
    <Icon />
    <span className={`text-[10px] md:text-sm font-medium ${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
      {label}
    </span>
  </button>
);

const MessageBubble = ({ message, isTyping }: { message: any, isTyping?: boolean }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        <div className={`
          relative px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed
          ${isUser 
            ? 'bg-[#1A1A1D] text-[#E4E4E7] rounded-tr-sm border border-white/5 shadow-lg shadow-black/20' 
            : 'bg-gradient-to-br from-[#1A1A1D] to-[#161618] text-[#E4E4E7] rounded-tl-sm border border-white/5 shadow-lg shadow-black/20'
          }
        `}>
          {/* Subtle Y2K Highlight */}
          {!isUser && (
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}

          {isTyping ? (
            <div className="flex gap-1.5 py-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Message Actions / Meta */}
        {!isTyping && (
          <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[10px] text-gray-600 font-mono">
              {new Date(message.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-1 hover:bg-white/5 rounded text-gray-600 hover:text-gray-400 transition-colors" 
                  title="Copy"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Icons.Copy />
                </button>
                <button className="p-1 hover:bg-white/5 rounded text-gray-600 hover:text-gray-400 transition-colors" title="Regenerate">
                  <Icons.Refresh />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function Chat() {
  const { user } = useAuthStore();
  const { messages, sendMessage, sendingMessage } = useChatStore();
  
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [isMirrorMode, setIsMirrorMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage, isMirrorMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendingMessage) return;

    const messageToSend = input;
    setInput('');
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0D0D0F] text-[#E4E4E7] font-sans overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="
        fixed bottom-0 left-0 w-full h-16 bg-[#0D0D0F]/90 backdrop-blur-xl border-t border-white/5 z-30
        md:relative md:w-64 md:h-full md:border-t-0 md:border-r md:flex md:flex-col md:justify-between md:p-4
      ">
        <div className="hidden md:block">
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-[#1A1A1D] rounded-lg border border-white/5 shadow-inner">
              <Icons.Logo />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">WADI</h1>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Del caos al plan</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <NavItem icon={Icons.Home} label="Inicio" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={Icons.Chat} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavItem icon={Icons.History} label="Historial" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          </div>
        </div>

        {/* Mobile Navigation Items (Horizontal) */}
        <div className="flex justify-around items-center h-full md:hidden px-2">
           <NavItem icon={Icons.Home} label="Inicio" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
           <NavItem icon={Icons.Chat} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
           <NavItem icon={Icons.History} label="Historial" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
           <NavItem icon={Icons.User} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>

        {/* Profile (Desktop) */}
        <div className="hidden md:block mt-auto">
          <div className="h-px w-full bg-white/5 mb-4" />
          <NavItem icon={Icons.User} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#0D0D0F]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 md:hidden">
            <Icons.Logo />
            <span className="font-bold text-sm tracking-wide">Chat WADI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="font-medium text-sm text-gray-300">Chat WADI</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">BETA</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-gray-500 font-medium hidden sm:block">Mirror Mode</span>
              <button 
                onClick={() => setIsMirrorMode(!isMirrorMode)}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                title="Toggle Mirror Mode"
              >
                {isMirrorMode ? <Icons.ToggleRight /> : <Icons.ToggleLeft />}
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1D] hover:bg-[#222225] border border-white/5 transition-all text-xs font-medium text-gray-300">
              <Icons.Share />
              <span className="hidden sm:block">Share</span>
            </button>
          </div>
        </header>

        {/* Content Area (Chat or Mirror) */}
        <div className="flex-1 overflow-hidden relative">
          {isMirrorMode ? (
            <div className="h-full p-4 md:p-6">
               <ChatInterface currentUser={{ id: user?.id || 'guest', name: user?.user_metadata?.full_name || 'Usuario' }} />
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="h-full overflow-y-auto p-4 md:p-6 pb-24 scrollbar-thin scrollbar-thumb-[#1A1A1D] scrollbar-track-transparent">
                <div className="max-w-3xl mx-auto">
                  <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-50">
                          <div className="p-4 bg-[#1A1A1D] rounded-2xl mb-4">
                            <Icons.Logo />
                          </div>
                          <h2 className="text-xl font-bold text-white mb-2">Hola, soy WADI</h2>
                          <p className="text-sm text-gray-400">¿En qué caos vamos a poner orden hoy?</p>
                       </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                      ))
                    )}
                    
                    {sendingMessage && (
                      <MessageBubble 
                        message={{ role: 'assistant', content: '' }} 
                        isTyping={true} 
                      />
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>

              {/* Input Area */}
              <div className="absolute bottom-16 md:bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F] to-transparent z-20">
                <div className="max-w-3xl mx-auto">
                  <div className="relative group">
                    {/* Input Container */}
                    <div className="
                      relative flex items-end gap-2 p-2
                      bg-[#1A1A1D]/80 backdrop-blur-xl 
                      rounded-2xl border border-white/5 
                      focus-within:border-cyan-500/30 focus-within:ring-1 focus-within:ring-cyan-500/20
                      transition-all duration-300 shadow-xl shadow-black/20
                    ">
                      
                      {/* Attach Button */}
                      <button className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors self-end mb-0.5">
                        <Icons.Paperclip />
                      </button>

                      {/* Textarea */}
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje a WADI..."
                        rows={1}
                        className="
                          flex-1 bg-transparent border-none text-[#E4E4E7] placeholder-gray-600 
                          px-2 py-3.5 focus:outline-none focus:ring-0 
                          text-sm md:text-base resize-none max-h-[200px]
                        "
                        style={{ minHeight: '48px' }}
                      />

                      {/* Send Button */}
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || sendingMessage}
                        className={`
                          p-2.5 rounded-xl transition-all duration-200 self-end mb-0.5
                          ${input.trim() && !sendingMessage
                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                          }
                        `}
                      >
                        <Icons.Send />
                      </button>
                    </div>
                    
                    <div className="text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-[10px] text-gray-600 font-mono">
                        WADI puede cometer errores. Verifica la información importante.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
}
