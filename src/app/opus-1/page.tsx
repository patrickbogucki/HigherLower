"use client";

import { useState, useEffect } from "react";

export default function Opus1() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .opus1-body {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #0a0a1a;
          overflow-x: hidden;
          position: relative;
        }

        .aurora-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          animation: float 12s ease-in-out infinite;
          opacity: 0.5;
        }

        .aurora-blob:nth-child(1) {
          width: 600px; height: 600px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: -20%; left: -10%;
          animation-delay: 0s;
        }

        .aurora-blob:nth-child(2) {
          width: 500px; height: 500px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          top: 30%; right: -15%;
          animation-delay: -4s;
        }

        .aurora-blob:nth-child(3) {
          width: 450px; height: 450px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          bottom: -10%; left: 20%;
          animation-delay: -8s;
        }

        .aurora-blob:nth-child(4) {
          width: 350px; height: 350px;
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          top: 50%; left: 50%;
          animation-delay: -2s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(30px, 40px) scale(1.02); }
        }

        .glass-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 32px;
          padding: 56px 48px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(30px)"};
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logo-area {
          margin-bottom: 12px;
        }

        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4));
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 8px;
        }

        .logo-arrows {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .arrow-up, .arrow-down {
          font-size: 22px;
          line-height: 1;
          color: white;
        }

        .arrow-up { transform: translateY(3px); }
        .arrow-down { transform: translateY(-3px); }

        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          margin-bottom: 44px;
          letter-spacing: 0.3px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-bottom: 36px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border-radius: 16px;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          letter-spacing: 0.2px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.2px;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          margin: 4px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
        }

        .join-section {
          width: 100%;
        }

        .join-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .code-input {
          flex: 1;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 6px;
          text-align: center;
          outline: none;
          transition: all 0.3s ease;
        }

        .code-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 3px;
          font-size: 14px;
        }

        .code-input:focus {
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.15);
        }

        .join-btn {
          padding: 16px 28px;
          border-radius: 14px;
          border: none;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .join-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .features {
          display: flex;
          gap: 32px;
          margin-top: 48px;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(20px)"};
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.35);
          font-size: 13px;
          font-weight: 400;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(102, 126, 234, 0.5);
        }

        .particles {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: sparkle 4s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="opus1-body">
        <div className="aurora-bg">
          <div className="aurora-blob" />
          <div className="aurora-blob" />
          <div className="aurora-blob" />
          <div className="aurora-blob" />
        </div>

        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="glass-container">
          <div className="glass-card">
            <div className="logo-area">
              <div className="logo-icon">
                <div className="logo-arrows">
                  <span className="arrow-up">▲</span>
                  <span className="arrow-down">▼</span>
                </div>
              </div>
            </div>

            <h1 className="title">Higher or Lower</h1>
            <p className="subtitle">The ultimate number guessing showdown</p>

            <div className="actions">
              <button
                className="btn-primary"
                onMouseEnter={() => setHovered("host")}
                onMouseLeave={() => setHovered(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start New Game
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or join</span>
                <div className="divider-line" />
              </div>

              <div className="join-section">
                <div className="join-row">
                  <input
                    type="text"
                    className="code-input"
                    placeholder="Game code"
                    maxLength={6}
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                    aria-label="Enter 6-digit game code"
                  />
                  <button className="join-btn">Join →</button>
                </div>
              </div>
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-dot" />
              <span>Real-time</span>
            </div>
            <div className="feature">
              <div className="feature-dot" />
              <span>Multiplayer</span>
            </div>
            <div className="feature">
              <div className="feature-dot" />
              <span>Live Leaderboard</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
