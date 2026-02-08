"use client";

import { useState, useEffect } from "react";

type Stage = "lobby" | "guessing" | "reveal" | "ended";
type PlayerStatus = "in" | "out";
type PlayerGuess = "higher" | "lower" | null;

type Player = {
  id: string;
  name: string;
  status: PlayerStatus;
  correctGuesses: number;
  guess: PlayerGuess;
};

type GameState = {
  code: string;
  stage: Stage;
  round: number;
  currentNumber: number | null;
  nextNumber: number | null;
  timerEnabled: boolean;
  timerEndTime: number | null;
  players: Player[];
  lastAnswer: PlayerGuess;
  lastMessage: string | null;
  winnerId: string | null;
};

type Session = { role: "host" } | { role: "player"; playerId: string };

const GAME_KEY = "higherlower:game";
const SESSION_KEY = "higherlower:session";
const GAME_CODE_LENGTH = 6;
const TIMER_DURATION_MS = 30000;
const JOIN_PANEL_MAX_HEIGHT = 200;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [joinStep, setJoinStep] = useState<"code" | "name">("code");
  const [joinError, setJoinError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [currentNumberInput, setCurrentNumberInput] = useState("");
  const [nextNumberInput, setNextNumberInput] = useState("");
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    // Intentionally setting state on mount for animation purposes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedGame = window.localStorage.getItem(GAME_KEY);
    if (storedGame) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameState(JSON.parse(storedGame));
      } catch {
        window.localStorage.removeItem(GAME_KEY);
      }
    }
    const storedSession = window.localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === GAME_KEY) {
        if (event.newValue) {
          setGameState(JSON.parse(event.newValue));
        } else {
          setGameState(null);
        }
      }
      if (event.key === SESSION_KEY) {
        if (event.newValue) {
          setSession(JSON.parse(event.newValue));
        } else {
          setSession(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (!gameState && session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [gameState, mounted, session]);

  useEffect(() => {
    if (!mounted || !session || session.role !== "player" || !gameState) {
      return;
    }
    const hasPlayer = gameState.players.some((player) => player.id === session.playerId);
    if (!hasPlayer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [gameState, mounted, session]);

  useEffect(() => {
    if (!gameState?.timerEndTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimerRemaining(null);
      return;
    }
    const timerEndTime = gameState.timerEndTime;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setTimerRemaining(remaining);
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [gameState?.timerEndTime]);

  useEffect(() => {
    if (gameState?.stage === "reveal" && gameState.nextNumber !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentNumberInput(String(gameState.nextNumber));
      setNextNumberInput("");
    }
    if (gameState?.stage === "lobby") {
      setCurrentNumberInput("");
      setNextNumberInput("");
    }
  }, [gameState?.nextNumber, gameState?.stage]);

  const persistGame = (next: GameState | null) => {
    setGameState(next);
    if (typeof window === "undefined") {
      return;
    }
    if (next) {
      window.localStorage.setItem(GAME_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(GAME_KEY);
    }
  };

  const persistSession = (next: Session | null) => {
    setSession(next);
    if (typeof window === "undefined") {
      return;
    }
    if (next) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  const resetJoinState = () => {
    setJoinStep("code");
    setJoinError("");
    setPlayerName("");
    setCodeValue("");
  };

  const createPlayerId = () => {
    const cryptoApi = typeof window !== "undefined" ? window.crypto : undefined;
    if (cryptoApi?.randomUUID) {
      return cryptoApi.randomUUID();
    }
    if (cryptoApi?.getRandomValues) {
      const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
        .slice(6, 8)
        .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
    }
    const fallbackRandom = Array.from({ length: 3 })
      .map(() => Math.random().toString(16).slice(2))
      .join("");
    return `${Date.now().toString(16)}-${fallbackRandom}`;
  };

  const handleCreateGame = () => {
    const min = 10 ** (GAME_CODE_LENGTH - 1);
    const max = 10 ** GAME_CODE_LENGTH;
    const code = Math.floor(min + Math.random() * (max - min)).toString();
    const newGame: GameState = {
      code,
      stage: "lobby",
      round: 1,
      currentNumber: null,
      nextNumber: null,
      timerEnabled: false,
      timerEndTime: null,
      players: [],
      lastAnswer: null,
      lastMessage: null,
      winnerId: null,
    };
    persistGame(newGame);
    persistSession({ role: "host" });
    setShowJoin(false);
    resetJoinState();
  };

  const handleJoinCode = () => {
    if (!gameState) {
      setJoinError("No active game found. Ask the host to start one.");
      return;
    }
    if (gameState.stage !== "lobby") {
      setJoinError("That game has already started. Try another code.");
      return;
    }
    if (codeValue.trim() !== gameState.code) {
      setJoinError("That code doesn't exist. Please check and try again.");
      return;
    }
    setJoinError("");
    setJoinStep("name");
  };

  const handleJoinGame = () => {
    if (!gameState) {
      setJoinError("No active game found. Ask the host to start one.");
      return;
    }
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setJoinError("Add a display name before joining.");
      return;
    }
    const newId = createPlayerId();
    const existingPlayer = gameState.players.find((player) => player.name === trimmedName);
    if (existingPlayer) {
      setJoinError("That name is already taken. Choose another.");
      return;
    }
    const newPlayer: Player = {
      id: newId,
      name: trimmedName,
      status: "in",
      correctGuesses: 0,
      guess: null,
    };
    const updatedPlayers = [...gameState.players, newPlayer];
    persistGame({ ...gameState, players: updatedPlayers });
    persistSession({ role: "player", playerId: newId });
    resetJoinState();
  };

  const handleToggleTimer = () => {
    if (!gameState) {
      return;
    }
    persistGame({ ...gameState, timerEnabled: !gameState.timerEnabled });
  };

  const handleOpenGuessing = () => {
    if (!gameState) {
      return;
    }
    const currentValue = Number(currentNumberInput);
    if (!Number.isFinite(currentValue)) {
      return;
    }
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      guess: null,
    }));
    const nextRound = gameState.stage === "reveal" ? gameState.round + 1 : gameState.round;
    persistGame({
      ...gameState,
      stage: "guessing",
      round: nextRound,
      currentNumber: currentValue,
      nextNumber: null,
      timerEndTime: gameState.timerEnabled ? Date.now() + TIMER_DURATION_MS : null,
      players: updatedPlayers,
      lastAnswer: null,
      lastMessage: null,
      winnerId: null,
    });
    setNextNumberInput("");
  };

  const handleResolveRound = (answer: "higher" | "lower") => {
    if (!gameState) {
      return;
    }
    const nextValue = Number(nextNumberInput);
    if (!Number.isFinite(nextValue)) {
      return;
    }
    let updatedPlayers: Player[] = gameState.players.map((player): Player => {
      const guessedCorrectly = player.guess === answer;
      const increment = guessedCorrectly ? 1 : 0;
      if (player.status === "in") {
        if (!player.guess || !guessedCorrectly) {
          return { ...player, status: "out" };
        }
      }
      return {
        ...player,
        correctGuesses: player.correctGuesses + increment,
      };
    });
    const activePlayers = updatedPlayers.filter((player) => player.status === "in");
    let stage: Stage = "reveal";
    let lastMessage = `${answer === "higher" ? "Higher" : "Lower"} was correct.`;
    let winnerId: string | null = null;
    if (activePlayers.length === 0) {
      updatedPlayers = updatedPlayers.map(
        (player): Player => ({ ...player, status: "in", guess: null })
      );
      lastMessage = "Everyone was eliminated. Reviving all players for the next round.";
    }
    if (activePlayers.length === 1) {
      stage = "ended";
      winnerId = activePlayers[0].id;
      lastMessage = `${activePlayers[0].name} wins the game.`;
    }
    persistGame({
      ...gameState,
      stage,
      nextNumber: nextValue,
      timerEndTime: null,
      lastAnswer: answer,
      lastMessage,
      winnerId,
      players: updatedPlayers,
    });
  };

  const handlePlayerGuess = (guess: "higher" | "lower") => {
    if (!gameState || !session || session.role !== "player") {
      return;
    }
    if (gameState.stage !== "guessing") {
      return;
    }
    const updatedPlayers = gameState.players.map((player) => {
      const canSubmitGuess = player.id === session.playerId && !player.guess;
      return canSubmitGuess ? { ...player, guess } : player;
    });
    persistGame({ ...gameState, players: updatedPlayers });
  };

  const handleEndGame = () => {
    persistGame(null);
    persistSession(null);
    resetJoinState();
  };

  const handleLeaveGame = () => {
    if (gameState && session?.role === "player") {
      const updatedPlayers = gameState.players.filter((player) => player.id !== session.playerId);
      persistGame({ ...gameState, players: updatedPlayers });
    }
    persistSession(null);
    resetJoinState();
  };

  const handleCopyCode = async () => {
    if (!gameState) {
      return;
    }
    try {
      await navigator.clipboard.writeText(gameState.code);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("Copy failed");
      window.setTimeout(() => setCopyStatus(""), 1500);
    }
  };

  const hasSession = Boolean(gameState && session);
  const isHost = session?.role === "host";
  const playerRecord =
    session?.role === "player"
      ? gameState?.players.find((player) => player.id === session.playerId)
      : null;
  const submittedCount = gameState
    ? gameState.players.filter((player) => player.guess).length
    : 0;
  const pendingCount = gameState ? gameState.players.length - submittedCount : 0;
  const winnerName = gameState?.winnerId
    ? gameState.players.find((player) => player.id === gameState.winnerId)?.name
    : null;
  const canOpenGuessing =
    Boolean(currentNumberInput.trim()) &&
    gameState !== null &&
    gameState.stage !== "guessing" &&
    gameState.stage !== "ended" &&
    gameState.players.length > 0;
  const canResolve =
    Boolean(nextNumberInput.trim()) && gameState !== null && gameState.stage === "guessing";

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
          max-height: ${showJoin ? `${JOIN_PANEL_MAX_HEIGHT}px` : "0"};
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

        .input-name {
          letter-spacing: 1px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          text-transform: none;
        }

        .join-error {
          margin-top: 12px;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255, 171, 171, 0.8);
        }

        .game-shell {
          width: 100%;
          max-width: 960px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        .game-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(232, 228, 221, 0.35);
          font-weight: 600;
        }

        .screen-title {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          font-weight: 700;
          color: #ffffff;
          margin: 6px 0 8px;
        }

        .screen-subtitle {
          font-size: 14px;
          color: rgba(232, 228, 221, 0.4);
          max-width: 520px;
          line-height: 1.6;
        }

        .game-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .lux-card {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 22px;
          width: 100%;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }

        .lux-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 8px;
        }

        .lux-card-subtitle {
          font-size: 13px;
          color: rgba(232, 228, 221, 0.4);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .code-pill {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          letter-spacing: 6px;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.08);
          padding: 8px 16px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .code-copy {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(232, 228, 221, 0.35);
        }

        .btn-outline {
          padding: 12px 20px;
          border-radius: 8px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: transparent;
          color: #d4af37;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-outline:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.12);
        }

        .btn-ghost {
          padding: 12px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: rgba(232, 228, 221, 0.6);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-ghost:hover {
          color: #ffffff;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(232, 228, 221, 0.35);
        }

        .input-lux {
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          background: rgba(212, 175, 55, 0.05);
          color: #e8e4dd;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .input-lux:focus {
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 18px rgba(212, 175, 55, 0.12);
        }

        .inline-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .status-chip {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .chip-in {
          background: rgba(212, 175, 55, 0.2);
          color: #f4d675;
        }

        .chip-out {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(232, 228, 221, 0.4);
        }

        .leaderboard {
          display: grid;
          gap: 12px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
        }

        .leaderboard-name {
          font-size: 14px;
          font-weight: 600;
          color: #e8e4dd;
        }

        .leaderboard-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(232, 228, 221, 0.4);
        }

        .round-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .round-number {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #d4af37;
        }

        .round-detail {
          font-size: 13px;
          color: rgba(232, 228, 221, 0.4);
        }

        .timer-pill {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .result-banner {
          margin-top: 12px;
          font-size: 13px;
          color: rgba(232, 228, 221, 0.6);
        }

        .toggle-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(232, 228, 221, 0.4);
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
          .screen-title { font-size: 30px; }
          .game-header { align-items: flex-start; }
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
          {!hasSession ? (
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
                <button className="btn-gold" onClick={handleCreateGame}>
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
                    {joinStep === "code" ? (
                      <>
                        <input
                          type="text"
                          className="input-gold"
                          placeholder="Game Code"
                        maxLength={GAME_CODE_LENGTH}
                          value={codeValue}
                          onChange={(e) =>
                          setCodeValue(
                            e.target.value.replace(/[^0-9]/g, "").slice(0, GAME_CODE_LENGTH)
                          )
                          }
                          aria-label="Enter 6-digit game code"
                        />
                        <button className="btn-join-gold" onClick={handleJoinCode}>
                          Enter
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          className="input-gold input-name"
                          placeholder="Display Name"
                          maxLength={18}
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          aria-label="Enter display name"
                        />
                        <button className="btn-join-gold" onClick={handleJoinGame}>
                          Join
                        </button>
                      </>
                    )}
                  </div>
                  {joinError ? <div className="join-error">{joinError}</div> : null}
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
          ) : isHost ? (
            <div className="game-shell">
              <div className="game-header">
                <div>
                  <div className="eyebrow">Host Dashboard</div>
                  <h2 className="screen-title">Command the Round</h2>
                  <p className="screen-subtitle">
                    Share the code, lock in guesses, and reveal the next number to the
                    room.
                  </p>
                </div>
                <div>
                  <div className="code-copy">Game Code</div>
                  <div className="inline-actions">
                    <div className="code-pill">{gameState?.code}</div>
                    <button className="btn-outline" onClick={handleCopyCode}>
                      Copy
                    </button>
                  </div>
                  {copyStatus ? <div className="code-copy">{copyStatus}</div> : null}
                </div>
              </div>

              <div className="game-grid">
                <div className="lux-card">
                  <div className="lux-card-title">Lobby Status</div>
                  <div className="lux-card-subtitle">
                    Players must join before you open guessing.
                  </div>
                  <div className="round-banner">
                    <div>
                      <div className="round-detail">Players Joined</div>
                      <div className="round-number">{gameState?.players.length}</div>
                    </div>
                    <div>
                      <div className="round-detail">Round</div>
                      <div className="round-number">{gameState?.round}</div>
                    </div>
                  </div>
                  <div className="inline-actions">
                    <button
                      className="btn-gold"
                      onClick={handleOpenGuessing}
                      disabled={!canOpenGuessing}
                    >
                      {gameState?.stage === "lobby" ? "Start Round 1" : "Open Guessing"}
                    </button>
                    <button className="btn-outline" onClick={handleEndGame}>
                      End Game
                    </button>
                  </div>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={Boolean(gameState?.timerEnabled)}
                      onChange={handleToggleTimer}
                    />
                    Enable 30s timer
                  </label>
                </div>

                <div className="lux-card">
                  <div className="lux-card-title">Round Control</div>
                  <div className="lux-card-subtitle">
                    Set the numbers and confirm the answer.
                  </div>
                  <div className="round-banner">
                    <div>
                      <div className="round-detail">Current Number</div>
                      <div className="round-number">
                        {gameState?.currentNumber ?? "—"}
                      </div>
                    </div>
                    {gameState?.stage === "guessing" && timerRemaining !== null ? (
                      <div className="timer-pill">{timerRemaining}s remaining</div>
                    ) : null}
                  </div>
                  {gameState?.stage !== "guessing" && gameState?.stage !== "ended" ? (
                    <div className="form-field">
                      <span className="field-label">Current number</span>
                      <input
                        className="input-lux"
                        type="number"
                        value={currentNumberInput}
                        onChange={(e) => setCurrentNumberInput(e.target.value)}
                        placeholder="Enter the current number"
                      />
                    </div>
                  ) : null}
                  {gameState?.stage === "guessing" ? (
                    <>
                      <div className="form-field">
                        <span className="field-label">Next number</span>
                        <input
                          className="input-lux"
                          type="number"
                          value={nextNumberInput}
                          onChange={(e) => setNextNumberInput(e.target.value)}
                          placeholder="Enter the next number"
                        />
                      </div>
                      <div className="inline-actions">
                        <button
                          className="btn-outline"
                          onClick={() => handleResolveRound("higher")}
                          disabled={!canResolve}
                        >
                          Higher
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => handleResolveRound("lower")}
                          disabled={!canResolve}
                        >
                          Lower
                        </button>
                      </div>
                      <div className="result-banner">
                        {submittedCount} submitted • {pendingCount} pending
                      </div>
                    </>
                  ) : (
                    <div className="result-banner">
                      {gameState?.stage === "lobby"
                        ? "Open guessing once everyone has joined."
                        : gameState?.stage === "reveal"
                        ? "Ready to open the next round."
                        : "Game complete. End the session when you are ready."}
                    </div>
                  )}
                  {gameState?.lastMessage ? (
                    <div className="result-banner">{gameState?.lastMessage}</div>
                  ) : null}
                </div>
              </div>

              <div className="lux-card">
                <div className="lux-card-title">Leaderboard</div>
                <div className="lux-card-subtitle">
                  Track who is still in the game and who has submitted guesses.
                </div>
                <div className="leaderboard">
                  {gameState?.players.length ? (
                    gameState.players.map((player) => (
                      <div className="leaderboard-item" key={player.id}>
                        <div className="leaderboard-name">{player.name}</div>
                        <div className="leaderboard-meta">
                          <span>{player.correctGuesses} correct</span>
                          <span
                            className={`status-chip ${
                              player.status === "in" ? "chip-in" : "chip-out"
                            }`}
                          >
                            {player.status === "in" ? "In" : "Out"}
                          </span>
                          {gameState?.stage === "guessing" ? (
                            <span>{player.guess ? "Submitted" : "Pending"}</span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="round-detail">
                      No players yet. Share the code to invite them in.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="game-shell">
              <div className="game-header">
                <div>
                  <div className="eyebrow">Player Mode</div>
                  <h2 className="screen-title">
                    Welcome{playerRecord ? `, ${playerRecord.name}` : ""}
                  </h2>
                  <p className="screen-subtitle">
                    Stay sharp and submit your guess before the host reveals the answer.
                  </p>
                </div>
                <div>
                  <div className="code-copy">Game Code</div>
                  <div className="inline-actions">
                    <div className="code-pill">{gameState?.code}</div>
                    <button className="btn-outline" onClick={handleLeaveGame}>
                      Leave
                    </button>
                  </div>
                </div>
              </div>

              <div className="game-grid">
                <div className="lux-card">
                  <div className="lux-card-title">Round {gameState?.round}</div>
                  <div className="lux-card-subtitle">
                    Keep your eye on the number and the clock.
                  </div>
                  <div className="round-banner">
                    <div>
                      <div className="round-detail">Current Number</div>
                      <div className="round-number">
                        {gameState?.currentNumber ?? "—"}
                      </div>
                    </div>
                    {gameState?.timerEnabled &&
                    gameState?.stage === "guessing" &&
                    timerRemaining !== null ? (
                      <div className="timer-pill">{timerRemaining}s left</div>
                    ) : null}
                  </div>
                  <div className="result-banner">
                    {gameState?.stage === "lobby"
                      ? "Waiting for the host to start the game."
                      : gameState?.stage === "guessing"
                      ? playerRecord?.guess
                        ? "Guess locked in."
                        : "Make your choice now."
                      : gameState?.stage === "reveal"
                      ? `Answer: ${gameState?.lastAnswer ?? "—"}`
                      : winnerName
                      ? `Winner: ${winnerName}`
                      : "Game complete."}
                  </div>
                  {playerRecord ? (
                    <div className="leaderboard-meta">
                      <span>{playerRecord.correctGuesses} correct</span>
                      <span
                        className={`status-chip ${
                          playerRecord.status === "in" ? "chip-in" : "chip-out"
                        }`}
                      >
                        {playerRecord.status === "in" ? "In" : "Out"}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="lux-card">
                  <div className="lux-card-title">Make Your Guess</div>
                  <div className="lux-card-subtitle">
                    Choose higher or lower before the reveal.
                  </div>
                  {gameState?.stage === "guessing" ? (
                    <div className="inline-actions">
                      <button
                        className="btn-gold"
                        onClick={() => handlePlayerGuess("higher")}
                        disabled={!playerRecord || Boolean(playerRecord.guess)}
                      >
                        Higher
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => handlePlayerGuess("lower")}
                        disabled={!playerRecord || Boolean(playerRecord.guess)}
                      >
                        Lower
                      </button>
                    </div>
                  ) : (
                    <div className="result-banner">
                      {gameState?.stage === "lobby"
                        ? "Guesses open when the host starts the round."
                        : gameState?.stage === "reveal"
                        ? "Waiting for the host to open the next round."
                        : "The game is complete."}
                    </div>
                  )}
                  {gameState?.stage === "reveal" && playerRecord ? (
                    <div className="result-banner">
                      {playerRecord.guess
                        ? playerRecord.guess === gameState?.lastAnswer
                          ? "You guessed correctly."
                          : "Your guess was incorrect."
                        : "No guess submitted this round."}
                    </div>
                  ) : null}
                  {gameState?.lastMessage ? (
                    <div className="result-banner">{gameState?.lastMessage}</div>
                  ) : null}
                </div>
              </div>

              <div className="lux-card">
                <div className="lux-card-title">Leaderboard</div>
                <div className="lux-card-subtitle">
                  Track everyone still in the game.
                </div>
                <div className="leaderboard">
                  {gameState?.players.length ? (
                    gameState.players.map((player) => (
                      <div className="leaderboard-item" key={player.id}>
                        <div className="leaderboard-name">{player.name}</div>
                        <div className="leaderboard-meta">
                          <span>{player.correctGuesses} correct</span>
                          <span
                            className={`status-chip ${
                              player.status === "in" ? "chip-in" : "chip-out"
                            }`}
                          >
                            {player.status === "in" ? "In" : "Out"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="round-detail">Waiting for players to join.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bottom-decoration" />
        <div className="corner-mark corner-bl">Est. 2025</div>
        <div className="corner-mark corner-br">v1.0</div>
      </div>
    </>
  );
}
