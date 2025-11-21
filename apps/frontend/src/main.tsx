import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { useThemeStore } from './store/themeStore';
import { getFlag } from './utils/featureFlags';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import CommandPalette from './components/CommandPalette';
import './index.css';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const { hasCompletedOnboarding } = useOnboardingStore();
  const { setMode } = useThemeStore();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    initialize();
    setMode("auto"); // Initialize theme
  }, [initialize, setMode]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    if (!getFlag("commandPalette")) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </ErrorBoundary>
  );
}

const el = document.getElementById('root')!;
createRoot(el).render(<App />);
