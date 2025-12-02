
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Inline SVGs for portability) ---
const Icons = {
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="#06B6D4" className="animate-pulse" />
      <path d="M2 23L16 30L30 23V9L16 16L2 9V23Z" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 30V16" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="4" fill="#EC4899" fillOpacity="0.5" className="animate-ping" />
    </svg>
  ),
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  History: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
    </svg>
  )
};

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05, x: 5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50" />
    )}
    <Icon />
    <span className="font-medium tracking-wide">{label}</span>
    {active && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />}
  </motion.button>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] relative group ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          relative px-6 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300
          ${isUser 
            ? 'bg-gradient-to-br from-fuchsia-600/80 to-purple-800/80 border-fuchsia-500/30 text-white rounded-tr-sm shadow-[0_0_20px_rgba(192,38,211,0.2)]' 
            : 'bg-zinc-900/80 border-cyan-500/20 text-gray-100 rounded-tl-sm shadow-[0_0_20px_rgba(6,182,212,0.1)]'
          }
        `}>
          {/* Y2K Scanline effect overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none rounded-2xl" />
          
          {/* Glow effect for AI */}
          {!isUser && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500 -z-10" />
          )}

          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </p>
        </div>
        
        <span className="text-[10px] text-gray-500 mt-1 px-1 font-mono uppercase tracking-wider opacity-70">
          {isUser ? 'YOU' : 'WADI_AI'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

export default function WadiChatInterface() {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola. Soy WADI. Tu sistema de organización inteligente.\n¿En qué caos vamos a poner orden hoy?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entendido. Procesando solicitud... \nAnalizando patrones... \n\nAquí tienes un plan preliminar.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-gray-100 font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <nav className="w-20 lg:w-64 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-between p-4 z-20 relative">
        <div>
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Icons.Logo />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                WADI
              </h1>
              <p className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase glow-text">
                Del caos al plan
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <SidebarItem 
              icon={Icons.Home} 
              label="Inicio" 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
            />
            <SidebarItem 
              icon={Icons.Chat} 
              label="Chat" 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
            />
            <SidebarItem 
              icon={Icons.History} 
              label="Historial" 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
            />
          </div>
        </div>

        {/* Profile */}
        <div className="mt-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          <SidebarItem 
            icon={Icons.User} 
            label="Perfil" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">Sistema Online</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-cyan-400">
               <Icons.Sparkles />
             </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 pb-8">
          <div className="max-w-4xl mx-auto relative">
            <form 
              onSubmit={handleSend}
              className="relative group"
            >
              {/* Animated Border Gradient */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
              
              <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-500 px-6 py-4 focus:outline-none focus:ring-0 text-base md:text-lg font-light"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="mr-2 p-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icons.Send />
                </button>
              </div>
            </form>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-600 font-mono">WADI v1.0 • AI Powered Assistant</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
