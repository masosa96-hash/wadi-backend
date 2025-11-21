import { useToastStore, Toast as ToastType } from "../store/toastStore";
import { theme } from "../styles/theme";
import { motion, AnimatePresence } from "framer-motion";

const toastStyles = {
    success: {
        background: "#10B981",
        icon: "✓",
    },
    error: {
        background: "#EF4444",
        icon: "✕",
    },
    info: {
        background: theme.colors.accent.primary,
        icon: "ℹ",
    },
    warning: {
        background: "#F59E0B",
        icon: "⚠",
    },
};

function ToastItem({ toast }: { toast: ToastType }) {
    const { removeToast } = useToastStore();
    const style = toastStyles[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.md,
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                background: style.background,
                color: "#FFFFFF",
                borderRadius: theme.borderRadius.md,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                minWidth: "300px",
                maxWidth: "500px",
            }}
        >
            <div style={{
                fontSize: "20px",
                fontWeight: theme.typography.fontWeight.bold,
            }}>
                {style.icon}
            </div>
            <div style={{
                flex: 1,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
            }}>
                {toast.message}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: theme.spacing.xs,
                    opacity: 0.8,
                }}
            >
                ×
            </button>
        </motion.div>
    );
}

export default function ToastContainer() {
    const { toasts } = useToastStore();

    return (
        <div style={{
            position: "fixed",
            top: theme.spacing.xl,
            right: theme.spacing.xl,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
