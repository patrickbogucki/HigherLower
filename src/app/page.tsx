import Link from "next/link";

export default function Home() {
  const designs = [
    {
      id: 1,
      name: "Aurora Glass",
      description: "Ethereal glassmorphism with aurora borealis background, floating particles, and translucent cards",
      colors: ["#667eea", "#764ba2", "#4facfe"],
    },
    {
      id: 2,
      name: "Retro Arcade",
      description: "Neon-lit cyberpunk aesthetic with scan lines, perspective grid, and glowing green accents",
      colors: ["#00ffaa", "#ff0080", "#0d0d1a"],
    },
    {
      id: 3,
      name: "Minimal Zen",
      description: "Japanese-inspired minimalism with warm neutrals, serif typography, and ink brush elements",
      colors: ["#faf8f5", "#c2553a", "#1a1a1a"],
    },
    {
      id: 4,
      name: "Playful Shapes",
      description: "Vibrant and joyful with bold rounded cards, floating emojis, and a purple-green palette",
      colors: ["#7b2ff7", "#06d6a0", "#f0e6ff"],
    },
    {
      id: 5,
      name: "Dark Luxury",
      description: "Refined dark theme with gold accents, elegant serif headings, and premium feel",
      colors: ["#d4af37", "#0c0c0f", "#e8e4dd"],
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafafa",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "60px 24px",
    }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#111",
          marginBottom: 8,
          letterSpacing: -1,
        }}>
          Higher or Lower
        </h1>
        <p style={{
          fontSize: 17,
          color: "#666",
          marginBottom: 48,
          lineHeight: 1.5,
        }}>
          Five unique front-end design concepts — click to preview each
        </p>

        <div style={{
          display: "grid",
          gap: 20,
        }}>
          {designs.map((d) => (
            <Link
              key={d.id}
              href={`/opus-${d.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "28px 32px",
                background: "white",
                borderRadius: 16,
                border: "1px solid #eee",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${d.colors[0]}, ${d.colors[1]})`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 18,
              }}>
                {d.id}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 4,
                }}>
                  {d.name}
                </div>
                <div style={{
                  fontSize: 14,
                  color: "#888",
                  lineHeight: 1.4,
                }}>
                  {d.description}
                </div>
              </div>
              <div style={{
                fontSize: 11,
                color: "#bbb",
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                fontWeight: 600,
                whiteSpace: "nowrap" as const,
              }}>
                /opus-{d.id} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
