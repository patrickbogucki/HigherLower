"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

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

type Session =
  | { role: "host"; code?: string }
  | { role: "player"; playerId: string; code?: string };

type LobbySnapshot = {
  code: string;
  locked: boolean;
  roundIndex: number;
  timerSeconds: number | null;
  currentValue: number | null;
  previousValue: number | null;
  guessesOpen: boolean;
  players: Array<{
    id: string;
    name: string;
    status: PlayerStatus;
    correctGuesses: number;
  }>;
};

type RoundStartedPayload = {
  roundIndex: number;
  currentValue: number;
  timerSeconds: number | null;
};

type RoundResolvedPayload = {
  roundIndex: number;
  correctAnswer: "higher" | "lower";
  nextValue: number;
  results: Array<{
    playerId: string;
    guessed: PlayerGuess;
    correct: boolean;
    status: PlayerStatus;
  }>;
  revived: boolean;
  leaderboard: LobbySnapshot["players"];
};

type GuessSubmittedPayload = {
  playerId: string;
  guess: "higher" | "lower";
};

type PlayerJoinSnapshot = LobbySnapshot & { playerId: string };

type SocketAckResponse<T = void> = T extends void
  ? { ok: true; data?: void } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string };

const GAME_KEY = "higherlower:game";
const SESSION_KEY = "higherlower:session";
const GAME_CODE_LENGTH = 6;
const TIMER_DURATION_MS = 30000;
const TIMER_DURATION_SECONDS = TIMER_DURATION_MS / 1000;
const JOIN_PANEL_MAX_HEIGHT = 200;
const DEV_SOCKET_PORT = 3001;
const SOCKET_PORT = Number(process.env.NEXT_PUBLIC_SOCKET_PORT) || null;
const DEBUG_SOCKETS = process.env.NEXT_PUBLIC_DEBUG_SOCKETS === "1";
const buildSocketUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).toString();
    } catch {
      // Fall back to window-based URL below.
    }
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname, origin } = window.location;
    if (SOCKET_PORT) {
      return `${protocol}//${hostname}:${SOCKET_PORT}`;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return `${protocol}//${hostname}:${DEV_SOCKET_PORT}`;
    }
    return origin;
  }
  return `http://localhost:${DEV_SOCKET_PORT}`;
};

const buildPlayersFromSnapshot = (
  snapshotPlayers: LobbySnapshot["players"],
  existingPlayers: Player[] | null,
  guessOverrides?: Map<string, PlayerGuess>
) => {
  const guessMap = new Map(
    existingPlayers?.map((player) => [player.id, player.guess]) ?? []
  );
  return snapshotPlayers.map((player) => ({
    ...player,
    guess: guessOverrides?.get(player.id) ?? guessMap.get(player.id) ?? null,
  }));
};

const mapSnapshotToGame = (
  snapshot: LobbySnapshot,
  previousGameState: GameState | null
): GameState => {
  let stage: Stage = "reveal";
  if (snapshot.roundIndex === 0) {
    stage = "lobby";
  } else if (snapshot.guessesOpen) {
    stage = "guessing";
  }
  const round = snapshot.roundIndex > 0 ? snapshot.roundIndex : 1;
  const timerEndTime =
    snapshot.guessesOpen && snapshot.timerSeconds
      ? Date.now() + snapshot.timerSeconds * 1000
      : null;
  const currentNumber =
    stage === "lobby"
      ? null
      : stage === "reveal"
      ? snapshot.previousValue ?? previousGameState?.currentNumber ?? null
      : snapshot.currentValue;
  const nextNumber =
    stage === "reveal" ? snapshot.currentValue ?? previousGameState?.nextNumber ?? null : null;
  const players = buildPlayersFromSnapshot(snapshot.players, previousGameState?.players ?? null);
  const winnerId =
    previousGameState?.stage === "ended" ? previousGameState.winnerId : null;
  return {
    code: snapshot.code,
    stage: winnerId ? "ended" : stage,
    round,
    currentNumber,
    nextNumber,
    timerEnabled: previousGameState?.timerEnabled ?? Boolean(snapshot.timerSeconds),
    timerEndTime,
    players,
    lastAnswer: previousGameState?.lastAnswer ?? null,
    lastMessage: previousGameState?.lastMessage ?? null,
    winnerId,
  };
};

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
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastReconnectRef = useRef<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const joinNavigationRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

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
    let parsedGame: GameState | null = null;
    if (storedGame) {
      try {
        parsedGame = JSON.parse(storedGame) as GameState;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameState(parsedGame);
      } catch {
        window.localStorage.removeItem(GAME_KEY);
      }
    }
    const storedSession = window.localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as Session;
        if (!parsedSession.code && parsedGame?.code) {
          parsedSession.code = parsedGame.code;
        }
        setSession(parsedSession);
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
    setStorageReady(true);
  }, []);

  const sessionRole = session?.role;

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    const isPlayer = sessionRole === "player";
    if (pathname === "/player") {
      if (!isPlayer && !joinNavigationRef.current) {
        router.replace("/");
      }
      return;
    }
    if (pathname === "/" && isPlayer) {
      if (!joinNavigationRef.current) {
        router.replace("/player");
      }
      return;
    }
    if (joinNavigationRef.current && !isPlayer) {
      joinNavigationRef.current = false;
    }
  }, [pathname, router, sessionRole, storageReady]);

  useEffect(() => {
    if (sessionRole === "player" && joinNavigationRef.current) {
      joinNavigationRef.current = false;
    }
  }, [sessionRole]);

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


  const persistGame = useCallback(
    (next: GameState | null | ((prev: GameState | null) => GameState | null)) => {
      setGameState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (typeof window !== "undefined") {
          if (resolved) {
            window.localStorage.setItem(GAME_KEY, JSON.stringify(resolved));
          } else {
            window.localStorage.removeItem(GAME_KEY);
          }
        }
        return resolved;
      });
    },
    []
  );

  const persistSession = useCallback(
    (next: Session | null | ((prev: Session | null) => Session | null)) => {
      setSession((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (typeof window !== "undefined") {
          if (resolved) {
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(resolved));
          } else {
            window.localStorage.removeItem(SESSION_KEY);
          }
        }
        return resolved;
      });
    },
    []
  );

  const resetJoinState = useCallback(() => {
    setJoinStep("code");
    setJoinError("");
    setPlayerName("");
    setCodeValue("");
  }, []);

  const setHostMessage = useCallback(
    (message: string) => {
      persistGame((prev) => (prev ? { ...prev, lastMessage: message } : prev));
    },
    [persistGame]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const socket = io(buildSocketUrl(), {
      transports: ["websocket"],
      autoConnect: false,
    });
    socketRef.current = socket;

    if (DEBUG_SOCKETS) {
      console.info("[socket] connecting to", buildSocketUrl());
    }

    const handleConnect = () => setSocketReady(true);
    const handleDisconnect = () => setSocketReady(false);
    const handleConnectError = (
      error?: Error & { description?: string; context?: unknown }
    ) => {
      if (DEBUG_SOCKETS) {
        console.error("[socket] connect_error", {
          message: error?.message,
          description: error?.description,
          context: error?.context,
        });
      }
      setJoinError("Unable to reach the game server.");
      setHostMessage("Unable to reach the game server.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("lobby:updated", (snapshot: LobbySnapshot) => {
      persistGame((prev) => mapSnapshotToGame(snapshot, prev));
    });
    socket.on("round:started", (payload: RoundStartedPayload) => {
      persistGame((prev) => {
        if (!prev) {
          return prev;
        }
        const updatedPlayers = prev.players.map((player) => ({ ...player, guess: null }));
        return {
          ...prev,
          stage: "guessing",
          round: payload.roundIndex,
          currentNumber: payload.currentValue,
          nextNumber: null,
          timerEnabled: Boolean(payload.timerSeconds),
          timerEndTime: payload.timerSeconds
            ? Date.now() + payload.timerSeconds * 1000
            : null,
          players: updatedPlayers,
          lastAnswer: null,
          lastMessage: null,
          winnerId: null,
        };
      });
    });
    socket.on("guess:submitted", (payload: GuessSubmittedPayload) => {
      persistGame((prev) => {
        if (!prev) {
          return prev;
        }
        const updatedPlayers = prev.players.map((player) =>
          player.id === payload.playerId ? { ...player, guess: payload.guess } : player
        );
        return { ...prev, players: updatedPlayers };
      });
    });
    socket.on("round:resolved", (payload: RoundResolvedPayload) => {
      persistGame((prev) => {
        if (!prev) {
          return prev;
        }
        const guessMap = new Map(
          payload.results.map((result) => [result.playerId, result.guessed])
        );
        const updatedPlayers = buildPlayersFromSnapshot(
          payload.leaderboard,
          prev.players,
          guessMap
        );
        const activePlayers = updatedPlayers.filter((player) => player.status === "in");
        const hasWinner = activePlayers.length === 1;
        const stage: Stage = hasWinner ? "ended" : "reveal";
        const lastMessage = payload.revived
          ? "All players were eliminated. Reviving all players for the next round."
          : `${payload.correctAnswer === "higher" ? "Higher" : "Lower"} was correct.`;
        return {
          ...prev,
          stage,
          round: payload.roundIndex,
          nextNumber: payload.nextValue,
          timerEndTime: null,
          lastAnswer: payload.correctAnswer,
          lastMessage: hasWinner ? `${activePlayers[0].name} wins the game.` : lastMessage,
          winnerId: hasWinner ? activePlayers[0].id : null,
          players: updatedPlayers,
        };
      });
    });
    socket.on("game:ended", () => {
      persistGame(null);
      persistSession(null);
      resetJoinState();
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [persistGame, persistSession, resetJoinState, setHostMessage]);

  useEffect(() => {
    if (!socketReady) {
      return;
    }
    if (!session) {
      lastReconnectRef.current = null;
      return;
    }
    const socket = socketRef.current;
    const code = session.code ?? gameState?.code;
    if (!socket || !code) {
      return;
    }
    const sessionKey = session.role === "player" ? session.playerId : "host";
    const reconnectKey = `${session.role}:${code}:${sessionKey}`;
    if (lastReconnectRef.current === reconnectKey) {
      return;
    }
    lastReconnectRef.current = reconnectKey;
    if (session.role === "host") {
      socket.emit(
        "host:reconnect",
        { code },
        (response: SocketAckResponse<LobbySnapshot>) => {
          if (!response.ok) {
            setHostMessage(response.error);
            return;
          }
          persistGame((prev) => mapSnapshotToGame(response.data, prev));
        }
      );
      return;
    }
    socket.emit(
      "player:reconnect",
      { code, playerId: session.playerId },
      (response: SocketAckResponse<PlayerJoinSnapshot>) => {
        if (!response.ok) {
          setJoinError(response.error);
          return;
        }
        persistGame((prev) => mapSnapshotToGame(response.data, prev));
      }
    );
  }, [gameState?.code, persistGame, setHostMessage, session, socketReady]);

  useEffect(() => {
    if (!session || session.role !== "player") {
      return;
    }
    const socket = socketRef.current;
    const code = session.code ?? gameState?.code;
    if (!socket || !code) {
      return;
    }
    const heartbeat = () => {
      if (socket.connected) {
        socket.emit("player:heartbeat", { code, playerId: session.playerId });
      }
    };
    heartbeat();
    const interval = window.setInterval(heartbeat, 15000);
    return () => window.clearInterval(interval);
  }, [gameState?.code, session]);

  const handleCreateGame = () => {
    const socket = socketRef.current;
    if (!socket) {
      setJoinError("Connecting to the game server. Try again in a moment.");
      return;
    }
    socket.emit("lobby:create", {}, (response: SocketAckResponse<{ code: string }>) => {
      if (!response.ok) {
        setJoinError(response.error);
        return;
      }
      const newGame: GameState = {
        code: response.data.code,
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
      persistSession({ role: "host", code: response.data.code });
      setShowJoin(false);
      resetJoinState();
    });
  };

  const handleJoinCode = () => {
    const trimmedCode = codeValue.trim();
    if (trimmedCode.length !== GAME_CODE_LENGTH) {
      setJoinError("Enter the 6-digit game code.");
      return;
    }
    setJoinError("");
    setJoinStep("name");
  };

  const handleJoinGame = () => {
    const socket = socketRef.current;
    if (!socket) {
      setJoinError("Connecting to the game server. Try again in a moment.");
      return;
    }
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setJoinError("Add a display name before joining.");
      return;
    }
    const trimmedCode = codeValue.trim();
    if (trimmedCode.length !== GAME_CODE_LENGTH) {
      setJoinError("Enter the 6-digit game code.");
      return;
    }
    socket.emit(
      "player:join",
      { code: trimmedCode, playerName: trimmedName },
      (response: SocketAckResponse<PlayerJoinSnapshot>) => {
        if (!response.ok) {
          setJoinError(response.error);
          return;
        }
        persistGame((prev) => mapSnapshotToGame(response.data, prev));
        persistSession({
          role: "player",
          playerId: response.data.playerId,
          code: trimmedCode,
        });
        resetJoinState();
        joinNavigationRef.current = true;
        router.push("/player");
      }
    );
  };

  const handleToggleTimer = () => {
    persistGame((prev) => (prev ? { ...prev, timerEnabled: !prev.timerEnabled } : prev));
  };

  const handleOpenGuessing = () => {
    if (!gameState) {
      return;
    }
    if (gameState.players.length === 0) {
      setHostMessage("At least one player must join before starting the round.");
      return;
    }
    const currentValue = Number(currentNumberInput);
    if (!Number.isFinite(currentValue)) {
      setHostMessage("Enter a valid current number before opening guesses.");
      return;
    }
    const socket = socketRef.current;
    if (!socket) {
      setHostMessage("Connecting to the game server. Try again.");
      return;
    }
    const timerSeconds = gameState.timerEnabled ? TIMER_DURATION_SECONDS : undefined;
    const roundPayload = { code: gameState.code, currentValue, timerSeconds };
    const handleRoundStart = (response: SocketAckResponse<void>) => {
      if (!response.ok) {
        setHostMessage(response.error);
        return;
      }
      persistGame((prev) => {
        if (!prev) {
          return prev;
        }
        const nextRound = prev.stage === "lobby" ? prev.round : prev.round + 1;
        const updatedPlayers = prev.players.map((player) => ({ ...player, guess: null }));
        return {
          ...prev,
          stage: "guessing",
          round: nextRound,
          currentNumber: currentValue,
          nextNumber: null,
          timerEnabled: Boolean(timerSeconds),
          timerEndTime: timerSeconds ? Date.now() + timerSeconds * 1000 : null,
          players: updatedPlayers,
          lastAnswer: null,
          lastMessage: null,
          winnerId: null,
        };
      });
    };
    const startRound = () => {
      if (gameState.stage === "lobby") {
        socket.emit("game:start", roundPayload, handleRoundStart);
      } else {
        socket.emit("round:start", roundPayload, handleRoundStart);
      }
    };
    const ensureHost = () => {
      if (session?.role !== "host") {
        startRound();
        return;
      }
      socket.emit(
        "host:reconnect",
        { code: gameState.code },
        (response: SocketAckResponse<LobbySnapshot>) => {
          if (!response.ok) {
            setHostMessage(response.error);
            return;
          }
          startRound();
        }
      );
    };
    if (!socket.connected) {
      setHostMessage("Reconnecting to the game server...");
      socket.once("connect", ensureHost);
      socket.connect();
      return;
    }
    ensureHost();
    setNextNumberInput("");
  };

  const handleResolveRound = (answer: "higher" | "lower") => {
    if (!gameState) {
      return;
    }
    const nextValue = Number(nextNumberInput);
    if (!Number.isFinite(nextValue)) {
      setHostMessage("Enter the next number before confirming the answer.");
      return;
    }
    const socket = socketRef.current;
    if (!socket) {
      setHostMessage("Connecting to the game server. Try again.");
      return;
    }
    socket.emit(
      "round:resolve",
      { code: gameState.code, nextValue, correctAnswer: answer },
      (response: SocketAckResponse<void>) => {
        if (!response.ok) {
          setHostMessage(response.error);
        }
      }
    );
  };

  const handlePlayerGuess = (guess: "higher" | "lower") => {
    if (!gameState || !session || session.role !== "player") {
      return;
    }
    if (gameState.stage !== "guessing") {
      return;
    }
    const socket = socketRef.current;
    if (!socket) {
      setJoinError("Connecting to the game server. Try again.");
      return;
    }
    const code = session.code;
    if (!code) {
      setJoinError("Unable to submit your guess. Please rejoin the game.");
      return;
    }
    socket.emit(
      "guess:submit",
      { code, playerId: session.playerId, guess },
      (response: SocketAckResponse<void>) => {
        if (!response.ok) {
          setJoinError(response.error);
          return;
        }
        persistGame((prev) => {
          if (!prev) {
            return prev;
          }
          const updatedPlayers = prev.players.map((player) => {
            const canSubmitGuess = player.id === session.playerId && !player.guess;
            return canSubmitGuess ? { ...player, guess } : player;
          });
          return { ...prev, players: updatedPlayers };
        });
      }
    );
  };

  const handleEndGame = () => {
    const socket = socketRef.current;
    const code = gameState?.code ?? session?.code;
    if (socket && code) {
      const endGame = () => {
        socket.emit(
          "game:end",
          { code, reason: "host-ended" },
          (response: SocketAckResponse<void>) => {
            if (!response.ok) {
              setHostMessage(response.error);
              return;
            }
            persistGame(null);
            persistSession(null);
            resetJoinState();
          }
        );
      };
      const ensureHost = () => {
        if (session?.role !== "host") {
          endGame();
          return;
        }
        socket.emit(
          "host:reconnect",
          { code },
          (response: SocketAckResponse<LobbySnapshot>) => {
            if (!response.ok) {
              setHostMessage(response.error);
              return;
            }
            endGame();
          }
        );
      };
      if (!socket.connected) {
        setHostMessage("Reconnecting to the game server...");
        socket.once("connect", ensureHost);
        socket.connect();
        return;
      }
      ensureHost();
      return;
    }
    setHostMessage("Unable to end the game because the session code is missing.");
    persistGame(null);
    persistSession(null);
    resetJoinState();
  };

  const handleLeaveGame = () => {
    persistSession(null);
    persistGame(null);
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
  const effectivePlayerGuess = playerRecord?.guess ?? null;
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
  const canSubmitPlayerGuess = Boolean(
    gameState &&
      session?.role === "player" &&
      gameState.stage === "guessing" &&
      !effectivePlayerGuess
  );

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
          display: none;
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
          font-size: 26px;
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
          line-height: 1.05;
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
          display: inline-block;
          padding-right: 12px;
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
          max-width: 420px;
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

        .player-guess-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .player-guess-actions > button {
          flex: 1 1 0;
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
          .nav-links { display: flex; gap: 16px; }
          .nav-link { font-size: 10px; letter-spacing: 1.5px; }
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
            <Link className="nav-link" href="/how-to-play">
              How to Play
            </Link>
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
                        ? gameState?.players.length
                          ? currentNumberInput.trim()
                            ? "Ready to start round 1."
                            : "Enter the current number to start round 1."
                          : "Waiting for players to join."
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
                            <span>
                              {player.guess
                                ? player.guess === "higher"
                                  ? "Higher"
                                  : "Lower"
                                : "Pending"}
                            </span>
                          ) : gameState?.stage === "reveal" ||
                            gameState?.stage === "ended" ? (
                            <span>
                              {player.guess
                                ? player.guess === "higher"
                                  ? "Higher"
                                  : "Lower"
                                : "No guess"}
                              {player.guess && gameState?.lastAnswer
                                ? player.guess === gameState.lastAnswer
                                  ? " (Correct)"
                                  : " (Wrong)"
                                : ""}
                            </span>
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
                    {gameState !== null &&
                      gameState.timerEnabled &&
                      gameState.stage === "guessing" &&
                      timerRemaining !== null ? (
                        <div className="timer-pill">{timerRemaining}s left</div>
                      ) : null}
                  </div>
                  <div className="result-banner">
                    {gameState?.stage === "lobby"
                      ? "Waiting for the host to start the game."
                      : gameState?.stage === "guessing"
                      ? effectivePlayerGuess
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
                    <div className="inline-actions player-guess-actions">
                      <button
                        className="btn-gold"
                        onClick={() => handlePlayerGuess("higher")}
                        disabled={!canSubmitPlayerGuess}
                      >
                        Higher
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => handlePlayerGuess("lower")}
                        disabled={!canSubmitPlayerGuess}
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
                  {gameState?.stage === "reveal" ? (
                    <div className="result-banner">
                      {effectivePlayerGuess
                        ? effectivePlayerGuess === gameState?.lastAnswer
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
