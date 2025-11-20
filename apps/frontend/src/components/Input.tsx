import { theme } from "../styles/theme";

interface InputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  label?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  label,
  autoFocus = false,
  style,
}: InputProps) {
  return (
    <div style={{ marginBottom: theme.spacing.lg, ...style }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: theme.spacing.sm,
          fontSize: theme.typography.fontSize.body,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.primary,
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          borderRadius: theme.borderRadius.small,
          border: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.tertiary,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily.primary,
          transition: theme.transitions.fast,
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.accent.primary;
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.subtle;
        }}
      />
    </div>
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  label?: string;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  rows = 3,
  label,
}: TextareaProps) {
  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: theme.spacing.sm,
          fontSize: theme.typography.fontSize.body,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.primary,
        }}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        style={{
          width: '100%',
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          borderRadius: theme.borderRadius.small,
          border: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.tertiary,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily.primary,
          transition: theme.transitions.fast,
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.accent.primary;
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.subtle;
        }}
      />
    </div>
  );
}
