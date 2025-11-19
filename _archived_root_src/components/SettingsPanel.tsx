import { useSettingsStore } from "../store/settingsStore";

export default function SettingsPanel() {
  const { open, togglePanel, sendOnEnter, toggleSendMode, language, setLanguage } = useSettingsStore();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-280px",
        width: 280,
        height: "100vh",
        background: "#0d0d12",
        borderLeft: "1px solid #1c1c25",
        color: "#eee",
        padding: "16px 20px",
        transition: "right 0.25s ease-out",
        zIndex: 1000,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 600, letterSpacing: "0.5px" }}>⚙ Configuración</div>
        <button onClick={togglePanel} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Idioma</div>
          <div style={{ marginTop: 6 }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "es" | "en")}
              style={{
                width: "100%",
                padding: 6,
                background: "#1a1a22",
                color: "#fff",
                borderRadius: 6,
                border: "1px solid #2a2a34",
                outline: "none",
              }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Modo de envío</div>
          <button
            onClick={toggleSendMode}
            style={{
              marginTop: 6,
              width: "100%",
              background: sendOnEnter ? "#00a884" : "#2b2b2b",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "8px 0",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {sendOnEnter ? "Enter = Enviar" : "Ctrl + Enter = Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
