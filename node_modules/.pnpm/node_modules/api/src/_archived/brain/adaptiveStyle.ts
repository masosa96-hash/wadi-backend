export function stylizeReply(text: string): string {
  const variants = [
    (t: string) => `→ ${t.charAt(0).toUpperCase()}${t.slice(1)}.`,
    (t: string) => `${t} 🔹`,
    (t: string) => `✅ ${t}`,
    (t: string) => `${t} — todo bajo control.`,
    (t: string) => `🧠 ${t}`,
  ];

  const random = Math.floor(Math.random() * variants.length);
  return variants[random](text.trim());
}
