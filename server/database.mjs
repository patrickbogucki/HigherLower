import crypto from "crypto";

const sessions = new Map();

const generateCode = () => {
  const maxAttempts = 10000;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (!sessions.has(code)) {
      return code;
    }
  }
  throw new Error("Unable to generate unique code.");
};

const createSession = ({ code, hostSocketId, hostName }) => ({
  code,
  hostSocketId,
  hostName: hostName ?? "Host",
  locked: false,
  roundIndex: 0,
  timerSeconds: null,
  currentValue: null,
  previousValue: null,
  guessesOpen: false,
  correctAnswer: null,
  players: new Map(),
  createdAt: Date.now(),
  hostDisconnectTimer: null,
});

const createPlayer = ({ name, socketId }) => ({
  id: crypto.randomUUID(),
  name,
  status: "in",
  correctGuesses: 0,
  guess: null,
  socketId,
  lastSeen: new Date().toISOString(),
});

const listPlayers = (session) =>
  Array.from(session.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    status: player.status,
    correctGuesses: player.correctGuesses,
  }));

const sessionSnapshot = (session) => ({
  code: session.code,
  locked: session.locked,
  roundIndex: session.roundIndex,
  timerSeconds: session.timerSeconds,
  currentValue: session.currentValue,
  previousValue: session.previousValue,
  guessesOpen: session.guessesOpen,
  players: listPlayers(session),
});

export {
  createPlayer,
  createSession,
  generateCode,
  listPlayers,
  sessionSnapshot,
  sessions,
};
