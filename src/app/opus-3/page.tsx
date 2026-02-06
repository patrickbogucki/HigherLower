"use client";

import { useState, useEffect } from "react";

export default function Opus3() {
  const [mounted, setMounted] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .opus3-body {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #faf8f5;
          overflow-x: hidden;
          position: relative;
        }

        .zen-texture {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .ink-circle {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.04);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
        }

        .ink-circle:nth-child(2) {
          width: 600px; height: 600px;
          border-color: rgba(0, 0, 0, 0.025);
        }

        .ink-circle:nth-child(3) {
          width: 700px; height: 700px;
          border-color: rgba(0, 0, 0, 0.015);
        }

        .zen-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .zen-content {
          max-width: 560px;
          width: 100%;
          text-align: center;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(20px)"};
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zen-symbol {
          font-size: 48px;
          margin-bottom: 24px;
          opacity: 0.6;
          letter-spacing: 8px;
        }

        .brushstroke-line {
          width: 80px;
          height: 3px;
          background: #1a1a1a;
          margin: 0 auto 32px;
          border-radius: 2px;
          opacity: 0.15;
        }

        .zen-title {
          font-family: 'Noto Serif JP', serif;
          font-size: 52px;
          font-weight: 900;
          color: #1a1a1a;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .zen-title-accent {
          color: #c2553a;
          position: relative;
        }

        .zen-subtitle {
          font-size: 16px;
          color: #8a8578;
          font-weight: 400;
          margin-bottom: 56px;
          line-height: 1.6;
          max-width: 340px;
          margin-left: auto;
          margin-right: auto;
        }

        .zen-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 380px;
          margin: 0 auto 48px;
        }

        .btn-zen-primary {
          padding: 20px 36px;
          border-radius: 12px;
          border: none;
          background: #1a1a1a;
          color: #faf8f5;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s ease;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }

        .btn-zen-primary::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #c2553a;
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .btn-zen-primary:hover {
          background: #2a2a2a;
          transform: translateY(-1px);
        }

        .btn-zen-primary:hover::after {
          transform: scaleX(1);
        }

        .zen-divider {
          display: flex;
          align-items: center;
          gap: 20px;
          color: #c4bfb4;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-weight: 500;
        }

        .zen-divider::before, .zen-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8e4dd;
        }

        .join-area {
          display: flex;
          gap: 10px;
        }

        .zen-input {
          flex: 1;
          padding: 18px 20px;
          border-radius: 12px;
          border: 1.5px solid #e8e4dd;
          background: white;
          color: #1a1a1a;
          font-family: 'Noto Serif JP', serif;
          font-size: 18px;
          font-weight: 500;
          text-align: center;
          letter-spacing: 8px;
          outline: none;
          transition: all 0.3s ease;
        }

        .zen-input::placeholder {
          color: #d0cac0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
        }

        .zen-input:focus {
          border-color: #c2553a;
          box-shadow: 0 0 0 3px rgba(194, 85, 58, 0.08);
        }

        .zen-join-btn {
          padding: 18px 24px;
          border-radius: 12px;
          border: 1.5px solid #e8e4dd;
          background: white;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .zen-join-btn:hover {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          max-width: 420px;
          margin: 0 auto;
          background: #e8e4dd;
          border-radius: 16px;
          overflow: hidden;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.8s ease 0.4s;
        }

        .feature-cell {
          background: #faf8f5;
          padding: 28px 16px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: default;
        }

        .feature-cell:hover {
          background: #f5f1ec;
        }

        .feature-kanji {
          font-family: 'Noto Serif JP', serif;
          font-size: 24px;
          color: #c2553a;
          margin-bottom: 8px;
          opacity: 0.7;
        }

        .feature-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #8a8578;
          font-weight: 500;
        }

        .bottom-mark {
          margin-top: 48px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c4bfb4;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 1s ease 0.6s;
        }

        .mark-line {
          width: 20px;
          height: 1px;
          background: #d0cac0;
        }

        @media (prefers-reduced-motion: reduce) {
          .zen-content, .features-grid, .bottom-mark {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <div className="opus3-body">
        <div className="zen-texture" />
        <div className="ink-circle" />
        <div className="ink-circle" />
        <div className="ink-circle" />

        <div className="zen-container">
          <div className="zen-content">
            <div className="zen-symbol">上 下</div>
            <div className="brushstroke-line" />

            <h1 className="zen-title">
              Higher<br />
              <span className="zen-title-accent">Lower</span>
            </h1>
            <p className="zen-subtitle">
              A game of intuition and patience. Predict the next number. Outlast everyone.
            </p>

            <div className="zen-actions">
              <button className="btn-zen-primary">
                Begin a New Game
              </button>

              <div className="zen-divider">join</div>

              <div className="join-area">
                <input
                  type="text"
                  className="zen-input"
                  placeholder="Game code"
                  maxLength={6}
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                  aria-label="Enter 6-digit game code"
                />
                <button className="zen-join-btn">Enter</button>
              </div>
            </div>

            <div className="features-grid">
              <div
                className="feature-cell"
                onMouseEnter={() => setHoveredFeature(0)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-kanji">即</div>
                <div className="feature-label">Real-time</div>
              </div>
              <div
                className="feature-cell"
                onMouseEnter={() => setHoveredFeature(1)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-kanji">衆</div>
                <div className="feature-label">Multiplayer</div>
              </div>
              <div
                className="feature-cell"
                onMouseEnter={() => setHoveredFeature(2)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-kanji">勝</div>
                <div className="feature-label">Compete</div>
              </div>
            </div>

            <div className="bottom-mark">
              <div className="mark-line" />
              <span>Higher Lower Game</span>
              <div className="mark-line" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
