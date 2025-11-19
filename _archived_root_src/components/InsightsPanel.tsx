import { useEffect, useState } from "react";

type Profile = {
  id: string;
  wordCounts: Record<string, number>;
  commonPhrases: Record<string, number>;
  shortAvg: number;
  updatedAt: number;
};

type MemoryLog = {
  role: "user" | "bot";
  msg: string;
};

export default function InsightsPanel() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [botStats, setBotStats] = useState<{ [key: string]: number }>({});

  // Cargar perfil y analizar respuestas del bot
  useEffect(() => {
    const raw = localStorage.getItem("wadi-profile");
    if (raw) setProfile(JSON.parse(raw));

    const chatRaw = localStorage.getItem("wadi-memory");
    if (chatRaw) {
      const chat: MemoryLog[] = JSON.parse(chatRaw);
      const botMessages = chat.filter((m) => m.role === "bot").map((m) => m.msg);

      const counts: Record<string, number> = {};
      botMessages.forEach((msg) => {
        const clean = msg.split("—")[0].trim().toLowerCase();
        counts[clean] = (counts[clean] || 0) + 1;
      });
      setBotStats(counts);
    }
  }, []);

  if (!profile) return null;

  const topWords = Object.entries(profile.wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topPhrases = Object.entries(profile.commonPhrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topBot = Object.entries(botStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      {/* Botón HUD */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          background: "none",
          border: "1px solid #00ffc833",
          borderRadius: 6,
          color: "#00ffcc",
          fontSize: 18,
          padding: "4px 8px",
          cursor: "pointer",
          zIndex: 1001,
          textShadow: "0 0 6px #00ffcc66",
          backdropFilter: "blur(4px)",
        }}
      >
        🧠
      </button>

      {/* Fondo semitransparente */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0, 0, 0, 0.4)" : "transparent",
          backdropFilter: open ? "blur(2px)" : "none",
          transition: "0.3s ease-out",
          pointerEvents: open ? "auto" : "none",
          zIndex: 1000,
        }}
      />

      {/* Panel lateral */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-300px",
          width: 300,
          height: "100vh",
          background: "#0a0a10cc",
          borderRight: "1px solid #00ffc822",
          color: "#bfffea",
          transition: "left 0.3s ease-out, backdrop-filter 0.2s ease",
          zIndex: 1002,
          fontFamily: "Inter, sans-serif",
          boxShadow: open ? "4px 0 12px #00ffc822" : "none",
          overflowY: "auto",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #00ffc822",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>Perfil de estilo</div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#00ffcc",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO */}
        <div style={{ padding: "16px 18px" }}>
          {/* Palabras más usadas */}
          <section style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Palabras más usadas
            </div>
            {topWords.map(([word, count]) => (
              <div
                key={word}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 4,
                    background: "#002c22",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, count * 10)}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg,#00ffaa,#00ccff,#0099ff)",
                      boxShadow: "0 0 8px #00ffcc88",
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{word}</div>
              </div>
            ))}
          </section>

          {/* Frases comunes */}
          <section style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Frases comunes
            </div>
            {topPhrases.map(([p]) => (
              <div
                key={p}
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  marginBottom: 4,
                  borderLeft: "2px solid #00ffc833",
                  paddingLeft: 6,
                }}
              >
                {p}
              </div>
            ))}
          </section>

          {/* Respuestas más comunes del bot */}
          <section style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Respuestas más comunes de Wadi
            </div>
            {topBot.map(([msg, count]) => (
              <div
                key={msg}
                style={{
                  fontSize: 12,
                  opacity: 0.85,
                  marginBottom: 6,
                  borderLeft: "2px solid #00ffc833",
                  paddingLeft: 6,
                }}
              >
                “{msg}” <span style={{ opacity: 0.5 }}>({count})</span>
              </div>
            ))}
          </section>

          {/* Stats finales */}
          <section>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Longitud media: {profile.shortAvg || 0} palabras
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
              Última actualización:{" "}
              {new Date(profile.updatedAt).toLocaleTimeString()}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
