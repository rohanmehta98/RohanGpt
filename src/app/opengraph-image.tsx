import { ImageResponse } from "next/og";

// Static metadata for the generated share image.
export const alt = "RohanGPT — AI Engineer Portfolio for Rohan Mehta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded Open Graph image, rendered at build time. Kept self-contained
// (no external fonts/assets) so it always generates reliably.
export default function OpengraphImage() {
  const chips = ["RAG", "MCP", "LangGraph", "Multi-Agent", "Gemini"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(1000px 700px at 12% -20%, rgba(16,163,127,0.28), transparent), radial-gradient(900px 600px at 110% 10%, rgba(34,211,238,0.20), transparent)",
          color: "#ededed",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "#10a37f",
              color: "#ffffff",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
            RohanGPT
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: 8,
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(16,163,127,0.5)",
              color: "#34d399",
              fontSize: 22,
            }}
          >
            AI Engineer Portfolio
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 82, fontWeight: 800, letterSpacing: -2 }}>
            Rohan Mehta
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#34d399" }}>
            AI Engineer · Production LLM Systems
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#9a9aa2", maxWidth: 920, lineHeight: 1.4 }}>
            Chat with an AI that answers questions about my work — grounded in my real
            résumé, LinkedIn &amp; live GitHub.
          </div>
        </div>

        {/* Bottom: tech chips + url */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 12,
                  backgroundColor: "rgba(16,163,127,0.12)",
                  border: "1px solid rgba(16,163,127,0.35)",
                  color: "#5eead4",
                  fontSize: 24,
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#9a9aa2" }}>rohangpt.vercel.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
