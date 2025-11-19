import { useState } from "react";

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:4000";

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: "local" }),
      });

      if (!res.ok) throw new Error("Error de conexión");

      const data = await res.json();
      const botMsg = { role: "assistant", content: data.answer || "[sin respuesta]" };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "[Error] No se pudo conectar con el servidor." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#0d0f14",
        color: "#eaeaea",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>Wadi</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "700px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#1a1f29" : "#161a20",
              color: msg.role === "user" ? "#77ffd3" : "#ffa94d",
              padding: "10px 14px",
              borderRadius: "12px",
              maxWidth: "70%",
              boxShadow: "0 0 10px #0004",
            }}
          >
            {msg.content}
          </div>
        ))}

        <form onSubmit={sendMessage} style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí algo..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "#14171d",
              color: "#fff",
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#00c897",
              border: "none",
              color: "#000",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
