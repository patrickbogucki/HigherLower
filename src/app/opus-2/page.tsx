"use client";

import { useState, useEffect } from "react";

export default function Opus2() {
  const [mounted, setMounted] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .opus2-body {
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: #0d0d1a;
          overflow-x: hidden;
          position: relative;
        }

        .scanlines {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.08) 2px,
            rgba(0, 0, 0, 0.08) 4px
          );
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(0, 255, 170, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 170, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridScroll 20s linear infinite;
        }

        @keyframes gridScroll {
          0% { transform: perspective(500px) rotateX(30deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(30deg) translateY(60px); }
        }

        .neon-glow-top {
          position: fixed;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(0, 255, 170, 0.12) 0%, transparent 70%);
          z-index: 0;
        }

        .main-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .arcade-card {
          background: linear-gradient(180deg, rgba(20, 20, 40, 0.95) 0%, rgba(13, 13, 26, 0.98) 100%);
          border: 2px solid rgba(0, 255, 170, 0.2);
          border-radius: 24px;
          padding: 52px 44px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          position: relative;
          overflow: hidden;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "scale(1)" : "scale(0.95)"};
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .arcade-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(0, 255, 170, 0.3), transparent 40%, transparent 60%, rgba(255, 0, 128, 0.3));
          z-index: -1;
          opacity: 0.5;
        }

        .arcade-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.03), transparent);
          animation: shimmer 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { transform: translateX(-50%); }
          50% { transform: translateX(50%); }
        }

        .pixel-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0, 255, 170, 0.08);
          border: 1px solid rgba(0, 255, 170, 0.2);
          border-radius: 8px;
          margin-bottom: 28px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #00ffaa;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #00ffaa;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .title-retro {
          font-family: 'Outfit', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: white;
          line-height: 1;
          margin-bottom: 4px;
          text-shadow: 0 0 40px rgba(0, 255, 170, 0.15);
          letter-spacing: -1px;
        }

        .title-accent {
          color: #00ffaa;
          text-shadow: 0 0 30px rgba(0, 255, 170, 0.3);
        }

        .subtitle-retro {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 40px;
          font-weight: 400;
        }

        .score-display {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-bottom: 36px;
        }

        .score-block {
          width: 44px;
          height: 56px;
          background: rgba(0, 255, 170, 0.06);
          border: 1px solid rgba(0, 255, 170, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 18px;
          color: #00ffaa;
          text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
          animation: blockPop 0.5s ease-out forwards;
          opacity: 0;
        }

        .score-block:nth-child(1) { animation-delay: 0.4s; }
        .score-block:nth-child(2) { animation-delay: 0.5s; }
        .score-block:nth-child(3) { animation-delay: 0.6s; }
        .score-block:nth-child(4) { animation-delay: 0.7s; }
        .score-block:nth-child(5) { animation-delay: 0.8s; }
        .score-block:nth-child(6) { animation-delay: 0.9s; }

        @keyframes blockPop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .arrow-display {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 40px;
        }

        .arrow-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .arrow-up-box {
          background: rgba(0, 255, 170, 0.1);
          border: 1px solid rgba(0, 255, 170, 0.25);
          color: #00ffaa;
        }

        .arrow-up-box:hover {
          background: rgba(0, 255, 170, 0.2);
          box-shadow: 0 0 30px rgba(0, 255, 170, 0.2);
          transform: translateY(-3px);
        }

        .arrow-down-box {
          background: rgba(255, 0, 128, 0.1);
          border: 1px solid rgba(255, 0, 128, 0.25);
          color: #ff0080;
        }

        .arrow-down-box:hover {
          background: rgba(255, 0, 128, 0.2);
          box-shadow: 0 0 30px rgba(255, 0, 128, 0.2);
          transform: translateY(-3px);
        }

        .btn-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .btn-neon {
          padding: 18px 32px;
          border-radius: 14px;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          position: relative;
          overflow: hidden;
        }

        .btn-neon-green {
          background: linear-gradient(135deg, #00ffaa, #00cc88);
          color: #0d0d1a;
          box-shadow: 0 4px 20px rgba(0, 255, 170, 0.25);
        }

        .btn-neon-green:hover {
          box-shadow: 0 6px 30px rgba(0, 255, 170, 0.4);
          transform: translateY(-2px);
        }

        .btn-neon-outline {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-neon-outline:hover {
          border-color: rgba(0, 255, 170, 0.4);
          color: #00ffaa;
          background: rgba(0, 255, 170, 0.05);
        }

        .separator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
          color: rgba(255, 255, 255, 0.2);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        .separator::before, .separator::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.15), transparent);
        }

        .join-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .code-input-retro {
          flex: 1;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 170, 0.15);
          background: rgba(0, 255, 170, 0.04);
          color: #00ffaa;
          font-family: 'Press Start 2P', monospace;
          font-size: 14px;
          text-align: center;
          letter-spacing: 6px;
          outline: none;
          transition: all 0.3s ease;
        }

        .code-input-retro::placeholder {
          color: rgba(0, 255, 170, 0.2);
          font-size: 8px;
          letter-spacing: 2px;
          font-family: 'Outfit', sans-serif;
        }

        .code-input-retro:focus {
          border-color: rgba(0, 255, 170, 0.5);
          box-shadow: 0 0 20px rgba(0, 255, 170, 0.1);
        }

        .join-submit {
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 170, 0.3);
          background: rgba(0, 255, 170, 0.1);
          color: #00ffaa;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .join-submit:hover {
          background: rgba(0, 255, 170, 0.2);
        }

        .footer-info {
          display: flex;
          gap: 24px;
          margin-top: 40px;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.6s ease 0.5s;
        }

        .info-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.25);
          font-family: 'Press Start 2P', monospace;
          letter-spacing: 0.5px;
        }

        .info-tag-dot {
          width: 4px;
          height: 4px;
          background: rgba(0, 255, 170, 0.4);
          border-radius: 1px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-blob, .arcade-card::after, .score-block, .badge-dot {
            animation: none;
            opacity: 1;
          }
          .grid-bg { animation: none; }
        }
      `}</style>

      <div className="opus2-body">
        <div className="grid-bg" />
        <div className="neon-glow-top" />
        <div className="scanlines" />

        <div className="main-container">
          <div className="arcade-card">
            <div className="pixel-badge">
              <div className="badge-dot" />
              <span>Ready to Play</span>
            </div>

            <h1 className="title-retro">
              Higher<br />
              <span className="title-accent">Lower</span>
            </h1>
            <p className="subtitle-retro">Guess the number. Beat the odds.</p>

            <div className="arrow-display">
              <div className="arrow-box arrow-up-box" role="img" aria-label="Higher">▲</div>
              <div className="arrow-box arrow-down-box" role="img" aria-label="Lower">▼</div>
            </div>

            <div className="btn-group">
              <button className="btn-neon btn-neon-green">
                ⚡ Create Game
              </button>

              <div className="separator">join game</div>

              <div className="join-row">
                <input
                  type="text"
                  className="code-input-retro"
                  placeholder="Enter Code"
                  maxLength={6}
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                  aria-label="Enter game code"
                />
                <button className="join-submit">Go →</button>
              </div>
            </div>
          </div>

          <div className="footer-info">
            <div className="info-tag">
              <div className="info-tag-dot" />
              <span>Live</span>
            </div>
            <div className="info-tag">
              <div className="info-tag-dot" />
              <span>Multi</span>
            </div>
            <div className="info-tag">
              <div className="info-tag-dot" />
              <span>Free</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
