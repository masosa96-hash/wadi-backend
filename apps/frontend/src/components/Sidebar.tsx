import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: theme.layout.sidebarWidth,
      background: theme.colors.background.secondary,
      borderRight: `1px solid ${theme.colors.border.subtle}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo/Brand */}
      <div style={{
        padding: theme.spacing.xl,
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.h1,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.accent.primary,
          fontFamily: theme.typography.fontFamily.primary,
        }}>
          WADI
        </h1>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: theme.typography.fontSize.caption,
          color: theme.colors.text.tertiary,
          fontFamily: theme.typography.fontFamily.primary,
        }}>
          AI Assistant
        </p>
      </div>

      {/* Navigation Links */}
      <nav style={{
        flex: 1,
        padding: `${theme.spacing.lg} 0`,
      }}>
        <SidebarLink
          icon="📁"
          label="Projects"
          active={isActive('/projects')}
          onClick={() => navigate('/projects')}
        />
        <SidebarLink
          icon="⚙️"
          label="Settings"
          active={isActive('/settings')}
          onClick={() => {}}
          disabled
        />
      </nav>

      {/* User Section */}
      <div style={{
        padding: theme.spacing.lg,
        borderTop: `1px solid ${theme.colors.border.subtle}`,
      }}>
        <div style={{
          fontSize: theme.typography.fontSize.bodySmall,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.md,
          fontFamily: theme.typography.fontFamily.primary,
          wordBreak: 'break-word',
        }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: theme.colors.background.tertiary,
            border: `1px solid ${theme.colors.border.subtle}`,
            color: theme.colors.text.primary,
            borderRadius: theme.borderRadius.small,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.bodySmall,
            fontWeight: theme.typography.fontWeight.medium,
            fontFamily: theme.typography.fontFamily.primary,
            transition: theme.transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border.accent;
            e.currentTarget.style.background = theme.colors.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border.subtle;
            e.currentTarget.style.background = theme.colors.background.tertiary;
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function SidebarLink({ icon, label, active, onClick, disabled }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
        background: active ? `${theme.colors.accent.primary}15` : 'transparent',
        border: 'none',
        borderLeft: active ? `3px solid ${theme.colors.accent.primary}` : '3px solid transparent',
        color: active ? theme.colors.accent.primary : theme.colors.text.secondary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: theme.typography.fontSize.body,
        fontWeight: active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
        fontFamily: theme.typography.fontFamily.primary,
        textAlign: 'left',
        transition: theme.transitions.fast,
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = `${theme.colors.background.tertiary}`;
          e.currentTarget.style.color = theme.colors.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = theme.colors.text.secondary;
        }
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
