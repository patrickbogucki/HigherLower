import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <>
      <style>{`
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


        .main-container-5 {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0 24px 80px;
          margin-top: 10px;
        }

        .hero-content {
          text-align: center;
          max-width: 720px;
        }

        .hero-kicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: rgba(232, 228, 221, 0.45);
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 16px;
          color: white;
        }

        .hero-title-line2 {
          background: linear-gradient(135deg, #d4af37 0%, #f4d675 50%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          display: inline-block;
          padding-right: 12px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(232, 228, 221, 0.5);
          font-weight: 400;
          margin-bottom: 32px;
          line-height: 1.7;
          letter-spacing: 0.3px;
        }

        .steps-panel {
          display: grid;
          gap: 12px;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .step-item {
          margin: 0;
          font-size: 15px;
          color: rgba(232, 228, 221, 0.7);
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .btn-gold {
          padding: 16px 40px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #d4af37, #c9a430);
          color: #0c0c0f;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.4s ease;
          text-decoration: none;
        }

        .btn-gold:hover {
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 44px; }
        }
      `}</style>

      <div className="opus5-body">
        <div className="gold-noise" />
        <div className="gold-gradient" />

        <nav className="top-nav">
          <Link className="nav-logo" href="/">
            H / L
          </Link>
          <Link className="nav-link" href="/">
            Back to Game
          </Link>
        </nav>

        <div className="main-container-5">
          <section className="hero-content">
            <p className="hero-kicker">How to Play</p>
            <h1 className="hero-title">
              Predict the next<br />
              <span className="hero-title-line2">number.</span>
            </h1>
            <p className="hero-subtitle">
              One player hosts and sets the current number. Everyone else guesses
              Higher or Lower before the timer runs out. When the host reveals the
              next number, correct guesses stay in. Last player standing wins.
            </p>
            <div className="steps-panel">
              <p className="step-item">1. Host creates a game and shares the code.</p>
              <p className="step-item">2. Players join and enter a display name.</p>
              <p className="step-item">3. Guess Higher or Lower before time runs out.</p>
              <p className="step-item">4. Correct guesses survive to the next round.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
