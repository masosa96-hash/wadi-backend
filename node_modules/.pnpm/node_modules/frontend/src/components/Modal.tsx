import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";
import { modalVariants, modalBackdropVariants } from "../utils/animations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            onClick={onClose}
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              ...theme.glass.heavy,
              zIndex: 999,
            }}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              ...theme.glass.heavy,
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing['2xl'],
              width: '90%',
              maxWidth: '500px',
              zIndex: 1000,
            }}
          >
            {title && (
              <h2 style={{
                margin: `0 0 ${theme.spacing.xl} 0`,
                fontSize: theme.typography.fontSize.h2,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.primary,
              }}>
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
