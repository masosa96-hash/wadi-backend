import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { theme } from "../styles/theme";
import { 
  exportAsMarkdown, 
  exportAsJSON, 
  exportAsPDF, 
  exportAsHTML,
  type ExportOptions 
} from "../utils/export";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportOptions: ExportOptions;
}

type ExportFormat = 'markdown' | 'json' | 'pdf' | 'html';

export default function ExportModal({ isOpen, onClose, exportOptions }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (selectedFormat) {
        case 'markdown':
          await exportAsMarkdown(exportOptions);
          break;
        case 'json':
          await exportAsJSON(exportOptions);
          break;
        case 'pdf':
          await exportAsPDF(exportOptions);
          break;
        case 'html':
          await exportAsHTML(exportOptions);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions: { value: ExportFormat; label: string; description: string }[] = [
    {
      value: 'markdown',
      label: 'Markdown (.md)',
      description: 'Best for documentation and version control',
    },
    {
      value: 'json',
      label: 'JSON (.json)',
      description: 'Best for data processing and archiving',
    },
    {
      value: 'pdf',
      label: 'PDF (.pdf)',
      description: 'Best for sharing and printing',
    },
    {
      value: 'html',
      label: 'HTML (.html)',
      description: 'Best for web viewing and styling',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Conversation">
      <div>
        <p style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily.primary,
        }}>
          Choose a format to export your conversation
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}>
          {formatOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: theme.spacing.md,
                border: selectedFormat === option.value
                  ? `2px solid ${theme.colors.accent.primary}`
                  : `1px solid ${theme.colors.border.subtle}`,
                borderRadius: theme.borderRadius.medium,
                background: selectedFormat === option.value
                  ? 'rgba(0, 217, 163, 0.05)'
                  : 'transparent',
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                if (selectedFormat !== option.value) {
                  e.currentTarget.style.borderColor = theme.colors.border.accent;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFormat !== option.value) {
                  e.currentTarget.style.borderColor = theme.colors.border.subtle;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <input
                type="radio"
                name="exportFormat"
                value={option.value}
                checked={selectedFormat === option.value}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                style={{
                  marginTop: '2px',
                  marginRight: theme.spacing.md,
                  cursor: 'pointer',
                  accentColor: theme.colors.accent.primary,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: theme.typography.fontSize.body,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: '4px',
                  fontFamily: theme.typography.fontFamily.primary,
                }}>
                  {option.label}
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.bodySmall,
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.primary,
                }}>
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
        
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end',
        }}>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
