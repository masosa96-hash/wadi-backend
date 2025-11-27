import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import Input from "../components/Input";
import ThemeCustomizer from "../components/ThemeCustomizer";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSave = () => {
    // TODO: Implement profile update
    alert("Perfil actualizado (funcionalidad pendiente)");
  };

  return (
    <PhoneShell>
      <div style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingBottom: "80px",
      }}>
        {/* Header */}
        <header style={{
          padding: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.secondary,
        }}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}>
            Configuración
          </h1>
        </header>

        {/* Profile Section */}
        <section style={{ padding: theme.spacing.xl }}>
          <h2 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Perfil
          </h2>

          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.xl,
          }}>
            <Input
              label="Nombre"
              value={name}
              onChange={setName}
              placeholder="Tu nombre"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              disabled
            />
            <Button onClick={handleSave} fullWidth>
              Guardar Cambios
            </Button>
          </div>
        </section>

        {/* Theme Customization Section */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
          <h2 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Personalización
          </h2>

          <ThemeCustomizer />
        </section>

        {/* Preferences Section */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
          <h2 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Preferencias
          </h2>

          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.xl,
          }}>
            <SettingItem
              label="Notificaciones"
              description="Recibir notificaciones de nuevas conversaciones"
              value={true}
            />
            <SettingItem
              label="Modo Oscuro"
              description="Usar tema oscuro (próximamente)"
              value={false}
            />
            <SettingItem
              label="Idioma"
              description="Español"
              value={true}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
          <h2 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Zona de Peligro
          </h2>

          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.xl,
          }}>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              fullWidth
              style={{
                color: "#DC2626",
                borderColor: "#DC2626",
              }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </section>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}

function SettingItem({ label, description, value }: { label: string; description: string; value: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.md} 0`,
      borderBottom: `1px solid ${theme.colors.border.subtle}`,
    }}>
      <div>
        <div style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          {description}
        </div>
      </div>
      <div style={{
        width: "48px",
        height: "24px",
        borderRadius: "12px",
        background: value ? theme.colors.accent.primary : theme.colors.border.subtle,
        position: "relative",
        cursor: "pointer",
        transition: `all ${theme.transitions.default}`,
      }}>
        <div style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#FFFFFF",
          position: "absolute",
          top: "2px",
          left: value ? "26px" : "2px",
          transition: `all ${theme.transitions.default}`,
        }} />
      </div>
    </div>
  );
}
