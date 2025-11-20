import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({ 
  onFileSelected, 
  disabled = false,
  maxSizeMB = 100,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".txt", ".docx"]
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Máximo: ${maxSizeMB} MB`);
      return;
    }

    // Validate file type
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.some(type => fileExt === type.toLowerCase())) {
      setError(`Tipo de archivo no permitido. Permitidos: ${acceptedTypes.join(", ")}`);
      return;
    }

    onFileSelected(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: isDragging 
            ? "rgba(37, 95, 245, 0.2)" 
            : "transparent",
          border: `1.5px solid ${isDragging ? theme.colors.accent.primary : theme.colors.border.light}`,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          transition: theme.transitions.fast,
          opacity: disabled ? 0.5 : 1,
        }}
        title="Adjuntar archivo"
      >
        📎
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              bottom: "60px",
              left: theme.spacing.md,
              right: theme.spacing.md,
              background: "rgba(239, 68, 68, 0.95)",
              color: "#FFFFFF",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.medium,
              fontSize: theme.typography.fontSize.bodySmall,
              zIndex: 100,
            }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                position: "absolute",
                top: "4px",
                right: "8px",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
