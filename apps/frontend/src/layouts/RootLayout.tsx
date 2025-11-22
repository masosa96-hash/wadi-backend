import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getFlag } from '../utils/featureFlags';
import ToastContainer from '../components/ToastContainer';
import CommandPalette from '../components/CommandPalette';

export default function RootLayout() {
    const initialize = useAuthStore((state) => state.initialize);
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
        <>
            <Outlet />
            <ToastContainer />
            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
            />
        </>
    );
}
