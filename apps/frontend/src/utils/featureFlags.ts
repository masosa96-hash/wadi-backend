// Feature flags configuration

export interface FeatureFlags {
    agentActions: boolean;
    workspaceAI: boolean;
    debugPanel: boolean;
    darkMode: boolean;
    commandPalette: boolean;
    conversationHistory: boolean;
    adminPanel: boolean;
}

const isDev = import.meta.env.DEV;

export const defaultFlags: FeatureFlags = {
    agentActions: true,
    workspaceAI: true,
    debugPanel: isDev, // Only in dev by default
    darkMode: true,
    commandPalette: true,
    conversationHistory: true,
    adminPanel: isDev, // Only in dev by default
};

// Get flag value with fallback to default
export function getFlag(flag: keyof FeatureFlags): boolean {
    const storedFlags = localStorage.getItem("wadi-feature-flags");
    if (!storedFlags) return defaultFlags[flag];

    try {
        const flags = JSON.parse(storedFlags) as Partial<FeatureFlags>;
        return flags[flag] ?? defaultFlags[flag];
    } catch {
        return defaultFlags[flag];
    }
}

// Set flag value
export function setFlag(flag: keyof FeatureFlags, value: boolean): void {
    const storedFlags = localStorage.getItem("wadi-feature-flags");
    let flags: Partial<FeatureFlags> = {};

    if (storedFlags) {
        try {
            flags = JSON.parse(storedFlags);
        } catch {
            // Invalid JSON, reset
        }
    }

    flags[flag] = value;
    localStorage.setItem("wadi-feature-flags", JSON.stringify(flags));
}

// Get all flags
export function getAllFlags(): FeatureFlags {
    const storedFlags = localStorage.getItem("wadi-feature-flags");
    if (!storedFlags) return defaultFlags;

    try {
        const flags = JSON.parse(storedFlags) as Partial<FeatureFlags>;
        return { ...defaultFlags, ...flags };
    } catch {
        return defaultFlags;
    }
}

// Reset all flags to defaults
export function resetFlags(): void {
    localStorage.removeItem("wadi-feature-flags");
}
