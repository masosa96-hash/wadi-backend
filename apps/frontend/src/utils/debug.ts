/**
 * WADI Debug Utilities
 * Herramientas de debugging para desarrollo
 */

import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

// Exponer stores globalmente para debugging
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).wadiDebug = {
    // Get current state
    getAuth: () => useAuthStore.getState(),
    getChat: () => useChatStore.getState(),
    
    // Clear all data
    clearAll: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ All storage cleared');
      window.location.reload();
    },
    
    // Clear chat only
    clearChat: () => {
      const { guestId } = useAuthStore.getState();
      if (guestId) {
        localStorage.removeItem(`wadi_conv_${guestId}`);
      }
      useChatStore.setState({ messages: [] });
      console.log('✅ Chat cleared');
    },
    
    // View all localStorage
    viewStorage: () => {
      const storage: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            storage[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            storage[key] = localStorage.getItem(key);
          }
        }
      }
      console.table(storage);
      return storage;
    },
    
    // Test API connection
    testAPI: async () => {
      try {
        const response = await fetch('http://localhost:4000/health');
        const data = await response.json();
        console.log('✅ API Health:', data);
        return data;
      } catch (error) {
        console.error('❌ API Error:', error);
        return null;
      }
    },
    
    // Send test message
    testMessage: async (message = 'Test message') => {
      const { sendMessage } = useChatStore.getState();
      console.log('📤 Sending test message:', message);
      await sendMessage(message);
    },
    
    // Toggle offline mode
    toggleOffline: () => {
      const current = navigator.onLine;
      console.log(`🌐 Current online status: ${current}`);
      console.log('💡 To simulate offline, open DevTools → Network → Set to "Offline"');
    },
    
    // View current user
    whoami: () => {
      const { user, guestId, guestNick } = useAuthStore.getState();
      if (user) {
        console.log('👤 Authenticated User:', user);
      } else {
        console.log('👻 Guest User:', { guestId, guestNick });
      }
      return { user, guestId, guestNick };
    },
    
    // Performance metrics
    perf: () => {
      const { messages } = useChatStore.getState();
      const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
      const avgChars = messages.length > 0 ? totalChars / messages.length : 0;
      
      const metrics = {
        totalMessages: messages.length,
        totalCharacters: totalChars,
        averageMessageLength: Math.round(avgChars),
        storageUsed: new Blob([JSON.stringify(messages)]).size,
      };
      
      console.table(metrics);
      return metrics;
    },
    
    // Help
    help: () => {
      console.log(`
🔧 WADI Debug Utilities

Available commands:
  wadiDebug.getAuth()        - Get auth state
  wadiDebug.getChat()        - Get chat state
  wadiDebug.clearAll()       - Clear all storage & reload
  wadiDebug.clearChat()      - Clear chat messages only
  wadiDebug.viewStorage()    - View all localStorage
  wadiDebug.testAPI()        - Test API connection
  wadiDebug.testMessage(msg) - Send test message
  wadiDebug.toggleOffline()  - Instructions for offline mode
  wadiDebug.whoami()         - Current user info
  wadiDebug.perf()           - Performance metrics
  wadiDebug.help()           - Show this help

Keyboard shortcuts:
  Ctrl+K - Clear chat
  Enter - Send message
  Shift+Enter - New line
      `);
    },
  };
  
  // Auto-show help on load
  console.log('🔧 WADI Debug mode enabled. Type wadiDebug.help() for commands');
}

export {};
