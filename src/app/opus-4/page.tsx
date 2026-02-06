"use client";

import { useState, useEffect } from "react";

export default function Opus4() {
  const [mounted, setMounted] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .opus4-body {
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          background: #f0e6ff;
          overflow-x: hidden;
          position: relative;
        }

        .bg-shapes {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
        }

        .bg-shape:nth-child(1) {
          width: 300px; height: 300px;
          background: #ffd166;
          top: -80px; right: -60px;
          opacity: 0.25;
        }

        .bg-shape:nth-child(2) {
          width: 200px; height: 200px;
          background: #06d6a0;
          bottom: 10%; left: -40px;
          opacity: 0.2;
        }

        .bg-shape:nth-child(3) {
          width: 250px; height: 250px;
          background: #ef476f;
          top: 40%; right: -80px;
          opacity: 0.15;
        }

        .bg-shape:nth-child(4) {
          width: 180px; height: 180px;
          background: #118ab2;
          bottom: -40px; left: 30%;
          opacity: 0.18;
        }

        .bg-grid-iso {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(30deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333),
            linear-gradient(150deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333),
            linear-gradient(30deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333),
            linear-gradient(150deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333),
            linear-gradient(60deg, #777 25%, transparent 25.5%, transparent 75%, #777 75%, #777),
            linear-gradient(60deg, #777 25%, transparent 25.5%, transparent 75%, #777 75%, #777);
          background-size: 80px 140px;
          background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
        }

        .main-container-4 {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 48px;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(-20px)"};
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fun-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: white;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          color: #7b2ff7;
          box-shadow: 0 2px 12px rgba(123, 47, 247, 0.1);
          margin-bottom: 24px;
        }

        .fun-badge-emoji {
          font-size: 16px;
        }

        .title-playful {
          font-family: 'Fredoka', sans-serif;
          font-size: 56px;
          font-weight: 700;
          color: #2d1b69;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .title-playful-line2 {
          background: linear-gradient(135deg, #7b2ff7, #c471ed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle-playful {
          font-size: 17px;
          color: #8b7ba8;
          font-weight: 500;
          line-height: 1.5;
        }

        .cards-row {
          display: flex;
          gap: 20px;
          max-width: 700px;
          width: 100%;
          margin-bottom: 36px;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(30px)"};
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }

        .action-card {
          flex: 1;
          background: white;
          border-radius: 24px;
          padding: 36px 28px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 2px solid transparent;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 24px 24px 0 0;
          transition: height 0.3s ease;
        }

        .card-host::before {
          background: linear-gradient(90deg, #7b2ff7, #c471ed);
        }

        .card-join::before {
          background: linear-gradient(90deg, #06d6a0, #0ec589);
        }

        .action-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .action-card:hover::before {
          height: 6px;
        }

        .card-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 36px;
          transition: transform 0.3s ease;
        }

        .action-card:hover .card-icon-wrapper {
          transform: scale(1.1) rotate(-3deg);
        }

        .icon-host {
          background: linear-gradient(135deg, #f0e6ff, #e4d4ff);
        }

        .icon-join {
          background: linear-gradient(135deg, #d4fae9, #b8f5d8);
        }

        .card-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #2d1b69;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 14px;
          color: #8b7ba8;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .card-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-purple {
          background: linear-gradient(135deg, #7b2ff7, #9b59f7);
          color: white;
          box-shadow: 0 4px 16px rgba(123, 47, 247, 0.25);
        }

        .btn-purple:hover {
          box-shadow: 0 6px 24px rgba(123, 47, 247, 0.35);
        }

        .btn-green {
          background: linear-gradient(135deg, #06d6a0, #0ec589);
          color: white;
          box-shadow: 0 4px 16px rgba(6, 214, 160, 0.25);
        }

        .btn-green:hover {
          box-shadow: 0 6px 24px rgba(6, 214, 160, 0.35);
        }

        .code-section {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .code-input-fun {
          flex: 1;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #e8e0f0;
          background: #faf7ff;
          color: #2d1b69;
          font-family: 'Fredoka', sans-serif;
          font-size: 20px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 8px;
          outline: none;
          transition: all 0.3s ease;
        }

        .code-input-fun::placeholder {
          color: #c8bade;
          font-size: 13px;
          letter-spacing: 2px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
        }

        .code-input-fun:focus {
          border-color: #06d6a0;
          box-shadow: 0 0 0 4px rgba(6, 214, 160, 0.1);
        }

        .how-it-works {
          display: flex;
          align-items: center;
          gap: 32px;
          background: white;
          border-radius: 20px;
          padding: 24px 36px;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.7s ease 0.5s;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #f0e6ff;
          color: #7b2ff7;
          font-family: 'Fredoka', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 13px;
          color: #6b5b8a;
          font-weight: 600;
          line-height: 1.3;
        }

        .step-arrow {
          color: #d4c8e8;
          font-size: 18px;
          flex-shrink: 0;
        }

        .floating-emojis {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .floating-emoji {
          position: absolute;
          font-size: 24px;
          opacity: 0.15;
          animation: floatEmoji 8s ease-in-out infinite;
        }

        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        @media (max-width: 640px) {
          .cards-row { flex-direction: column; }
          .how-it-works { flex-direction: column; gap: 16px; }
          .step-arrow { transform: rotate(90deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-emoji { animation: none; }
          .hero-section, .cards-row, .how-it-works {
            opacity: 1; transform: none; transition: none;
          }
        }
      `}</style>

      <div className="opus4-body">
        <div className="bg-shapes">
          <div className="bg-shape" />
          <div className="bg-shape" />
          <div className="bg-shape" />
          <div className="bg-shape" />
        </div>
        <div className="bg-grid-iso" />

        <div className="floating-emojis">
          {["🎯", "🏆", "⚡", "🎮", "✨", "🔥"].map((emoji, i) => (
            <div
              key={i}
              className="floating-emoji"
              style={{
                left: `${15 + i * 14}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 1.2}s`,
                fontSize: `${20 + (i % 3) * 8}px`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div className="main-container-4">
          <div className="hero-section">
            <div className="fun-badge">
              <span className="fun-badge-emoji">🎲</span>
              Multiplayer Guessing Game
            </div>
            <h1 className="title-playful">
              Higher or<br />
              <span className="title-playful-line2">Lower?</span>
            </h1>
            <p className="subtitle-playful">
              Listen. Guess. Survive. Be the last one standing!
            </p>
          </div>

          <div className="cards-row">
            <div
              className="action-card card-host"
              onMouseEnter={() => setActiveCard("host")}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="card-icon-wrapper icon-host">🎙️</div>
              <div className="card-title">Host a Game</div>
              <div className="card-desc">
                Create a room and share the code with your friends
              </div>
              <button className="card-btn btn-purple">
                Create Room
                <span>→</span>
              </button>
            </div>

            <div
              className="action-card card-join"
              onMouseEnter={() => setActiveCard("join")}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="card-icon-wrapper icon-join">🎮</div>
              <div className="card-title">Join a Game</div>
              <div className="card-desc">
                Enter the 6-digit code to jump into the action
              </div>
              <div className="code-section">
                <input
                  type="text"
                  className="code-input-fun"
                  placeholder="CODE"
                  maxLength={6}
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                  aria-label="Enter 6-digit game code"
                />
              </div>
              <button className="card-btn btn-green" style={{ marginTop: 16 }}>
                Join Game
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="how-it-works">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">Host announces<br />a number</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">Guess higher<br />or lower</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">Last one standing<br />wins!</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
