import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";

interface PhoneShellProps {
  children: ReactNode;
  showBackgroundOrbs?: boolean;
}

/**
 * PhoneShell - Web3-style container wrapper
 * Creates a centered phone-like frame with gradient backgrounds and glassmorphism
 */
export default function PhoneShell({ children, showBackgroundOrbs = true }: PhoneShellProps) {
  return (
    <div
      className="wadi-shell-outer"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        // Web3-style gradient background with blur
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 95, 245, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 50%, rgba(123, 140, 255, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(197, 179, 255, 0.08) 0%, transparent 50%),
          ${theme.colors.background.primary}
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.lg,
        fontFamily: theme.typography.fontFamily.primary,
      }}
    >
      {/* Floating background orbs - web3 style (more vivid but still subtle) */}
      {showBackgroundOrbs && (
        <>
          {/* Blue orb - top left */}
          <div
            className="web3-orb web3-orb-1"
            style={{
              position: "absolute",
              top: "8%",
              left: "12%",
              width: "450px",
              height: "450px",
              background: "radial-gradient(circle, rgba(37, 95, 245, 0.15) 0%, rgba(37, 95, 245, 0.08) 40%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(90px)",
              opacity: 0.7,
              pointerEvents: "none",
              animation: "float 20s ease-in-out infinite",
            }}
          />
          
          {/* Purple-blue orb - top right */}
          <div
            className="web3-orb web3-orb-2"
            style={{
              position: "absolute",
              top: "15%",
              right: "8%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(123, 140, 255, 0.12) 0%, rgba(123, 140, 255, 0.06) 40%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(80px)",
              opacity: 0.6,
              pointerEvents: "none",
              animation: "float 25s ease-in-out infinite reverse",
            }}
          />
          
          {/* Lavender orb - bottom center */}
          <div
            className="web3-orb web3-orb-3"
            style={{
              position: "absolute",
              bottom: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "380px",
              height: "380px",
              background: "radial-gradient(circle, rgba(197, 179, 255, 0.18) 0%, rgba(197, 179, 255, 0.1) 40%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(100px)",
              opacity: 0.5,
              pointerEvents: "none",
              animation: "float 30s ease-in-out infinite",
            }}
          />
          
          {/* Additional accent orb - left side */}
          <div
            className="web3-orb web3-orb-4"
            style={{
              position: "absolute",
              top: "50%",
              left: "5%",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(197, 179, 255, 0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(70px)",
              opacity: 0.4,
              pointerEvents: "none",
              animation: "float 22s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* Phone Frame Container */}
      <motion.div
        className="wadi-phone-frame"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1] // Custom easing for smooth entry
        }}
        style={{
          width: "100%",
          maxWidth: theme.layout.mobileMaxWidth,
          background: theme.colors.background.mobile,
          borderRadius: "32px",
          boxShadow: `
            0 20px 60px rgba(15, 23, 42, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset,
            0 0 40px rgba(37, 95, 245, 0.08)
          `,
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Gradient border effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "32px",
            padding: "1px",
            background: "linear-gradient(135deg, rgba(37, 95, 245, 0.2) 0%, rgba(197, 179, 255, 0.15) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          className="wadi-phone-content"
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            maxHeight: "844px", // iPhone-like height
            overflowY: "auto",
            overflowX: "hidden",
            background: theme.colors.background.secondary,
            borderRadius: "32px",
          }}
        >
          {children}
        </div>
      </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-15px);
          }
        }

        /* Mobile responsive - remove frame on mobile */
        @media (max-width: 768px) {
          .wadi-shell-outer {
            padding: 0 !important;
          }
          
          .wadi-phone-frame {
            max-width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          
          .wadi-phone-content {
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
          
          .web3-orb {
            display: none;
          }
        }

        /* Smooth scrolling */
        .wadi-phone-content {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for phone content */
        .wadi-phone-content::-webkit-scrollbar {
          width: 6px;
        }

        .wadi-phone-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .wadi-phone-content::-webkit-scrollbar-thumb {
          background: ${theme.colors.border.accent};
          border-radius: 3px;
        }

        .wadi-phone-content::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.accent.primary};
        }
      `}</style>
    </div>
  );
}
