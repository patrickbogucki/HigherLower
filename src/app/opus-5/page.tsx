"use client";

import { useState, useEffect } from "react";

export default function Opus5() {
  const [mounted, setMounted] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .opus5-body {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #0c0c0f;
          overflow-x: hidden;
          position: relative;
          color: #e8e4dd;
        }

        .gold-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.015;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .gold-gradient {
          position: fixed;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 1000px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(212, 175, 55, 0.06) 0%, transparent 60%);
          z-index: 0;
        }

        .vertical-lines {
          position: fixed;
          inset: 0;
          z-index: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 10%;
          pointer-events: none;
        }

        .v-line {
          width: 1px;
          height: 100%;
          background: rgba(212, 175, 55, 0.03);
        }

        .main-container-5 {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.8s ease 0.3s;
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .nav-links {
          display: flex;
          gap: 32px;
        }

        .nav-link {
          font-size: 12px;
          color: rgba(232, 228, 221, 0.35);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .nav-link:hover {
          color: #d4af37;
        }

        .hero-content {
          text-align: center;
          max-width: 640px;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(30px)"};
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .crown-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 50%;
          margin-bottom: 32px;
          font-size: 24px;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 72px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 8px;
          color: white;
        }

        .hero-title-line2 {
          background: linear-gradient(135deg, #d4af37 0%, #f4d675 50%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }

        .hero-subtitle {
          font-size: 16px;
          color: rgba(232, 228, 221, 0.4);
          font-weight: 400;
          margin-bottom: 56px;
          line-height: 1.6;
          letter-spacing: 0.5px;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 64px;
        }

        .btn-gold {
          padding: 20px 56px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #d4af37, #c9a430);
          color: #0c0c0f;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-gold::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .btn-gold:hover {
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .btn-gold:hover::before {
          transform: translateX(100%);
        }

        .join-toggle {
          background: none;
          border: none;
          color: rgba(232, 228, 221, 0.35);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 8px 16px;
        }

        .join-toggle:hover {
          color: #d4af37;
        }

        .join-panel {
          max-height: ${showJoin ? "120px" : "0"};
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          max-width: 360px;
        }

        .join-inner {
          display: flex;
          gap: 10px;
          padding-top: 8px;
        }

        .input-gold {
          flex: 1;
          padding: 16px 20px;
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 8px;
          background: rgba(212, 175, 55, 0.04);
          color: #d4af37;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 8px;
          outline: none;
          transition: all 0.3s ease;
        }

        .input-gold::placeholder {
          color: rgba(212, 175, 55, 0.2);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .input-gold:focus {
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.08);
        }

        .btn-join-gold {
          padding: 16px 24px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          background: transparent;
          color: #d4af37;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-join-gold:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .stats-bar {
          display: flex;
          gap: 1px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          overflow: hidden;
          max-width: 520px;
          width: 100%;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.8s ease 0.5s;
        }

        .stat-item {
          flex: 1;
          padding: 28px 24px;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          transition: background 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(232, 228, 221, 0.25);
          font-weight: 500;
        }

        .bottom-decoration {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 50%, transparent 100%);
        }

        .corner-mark {
          position: fixed;
          font-size: 10px;
          color: rgba(232, 228, 221, 0.15);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 400;
        }

        .corner-bl {
          bottom: 24px;
          left: 48px;
        }

        .corner-br {
          bottom: 24px;
          right: 48px;
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 48px; }
          .top-nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .corner-bl, .corner-br { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-content, .stats-bar, .top-nav {
            opacity: 1; transform: none; transition: none;
          }
          .btn-gold::before { transition: none; }
        }
      `}</style>

      <div className="opus5-body">
        <div className="gold-noise" />
        <div className="gold-gradient" />
        <div className="vertical-lines">
          <div className="v-line" />
          <div className="v-line" />
          <div className="v-line" />
          <div className="v-line" />
          <div className="v-line" />
        </div>

        <nav className="top-nav">
          <div className="nav-logo">H / L</div>
          <div className="nav-links">
            <span className="nav-link">How to Play</span>
            <span className="nav-link">About</span>
          </div>
        </nav>

        <div className="main-container-5">
          <div className="hero-content">
            <div className="crown-icon">♛</div>

            <h1 className="hero-title">
              Higher<br />
              <span className="hero-title-line2">or Lower</span>
            </h1>
            <p className="hero-subtitle">
              The refined art of prediction. Outlast your rivals<br />
              in the ultimate game of intuition.
            </p>

            <div className="hero-actions">
              <button className="btn-gold">
                Create a Private Game
              </button>

              <button
                className="join-toggle"
                onClick={() => setShowJoin(!showJoin)}
              >
                {showJoin ? "— Close —" : "— Join Existing Game —"}
              </button>

              <div className="join-panel">
                <div className="join-inner">
                  <input
                    type="text"
                    className="input-gold"
                    placeholder="Game Code"
                    maxLength={6}
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                    aria-label="Enter 6-digit game code"
                  />
                  <button className="btn-join-gold">Enter</button>
                </div>
              </div>
            </div>

            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-value">∞</div>
                <div className="stat-label">Players</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">2</div>
                <div className="stat-label">Choices</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1</div>
                <div className="stat-label">Winner</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-decoration" />
        <div className="corner-mark corner-bl">Est. 2025</div>
        <div className="corner-mark corner-br">v1.0</div>
      </div>
    </>
  );
}
