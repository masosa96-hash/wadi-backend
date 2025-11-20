import { motion } from "framer-motion";
import { theme } from "../styles/theme";

interface WadiOrbProps {
  size?: "small" | "medium" | "large";
  showPulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * WADI Orb Component - Premium web3 pulsating orb
 * Subtle pulse, glow, and inner shadow for high-end feel
 */
export default function WadiOrb({ 
  size = "medium", 
  showPulse = true,
  className,
  style 
}: WadiOrbProps) {
  
  const sizeMap = {
    small: { width: "44px", height: "44px", fontSize: "18px" },
    medium: { width: "64px", height: "64px", fontSize: "28px" },
    large: { width: "80px", height: "80px", fontSize: "36px" },
  };

  const orbSize = sizeMap[size];

  return (
    <motion.div
      className={className}
      animate={showPulse ? {
        scale: [1, 1.03, 1],
        boxShadow: [
          "0 0 30px rgba(37, 95, 245, 0.2), 0 0 60px rgba(197, 179, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.3)",
          "0 0 40px rgba(37, 95, 245, 0.3), 0 0 80px rgba(197, 179, 255, 0.2), inset 0 0 25px rgba(255, 255, 255, 0.4)",
          "0 0 30px rgba(37, 95, 245, 0.2), 0 0 60px rgba(197, 179, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.3)",
        ],
      } : {}}
      transition={showPulse ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
      style={{
        width: orbSize.width,
        height: orbSize.height,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255, 255, 255, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: orbSize.fontSize,
        fontWeight: theme.typography.fontWeight.bold,
        color: "#FFFFFF",
        position: "relative",
        boxShadow: showPulse 
          ? "0 0 30px rgba(37, 95, 245, 0.2), 0 0 60px rgba(197, 179, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.3)"
          : "0 0 20px rgba(37, 95, 245, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.25)",
        ...style,
      }}
    >
      W
      {/* Inner holographic glow */}
      <div
        style={{
          position: "absolute",
          inset: "8px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
