import crypto from "crypto";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { z } from "zod";

const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const SESSION_TTL_MS = 30 * 60 * 1000;

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN },
});

const sessions = new Map();

const lobbyCreateSchema = z.object({
  hostName: z.string().min(1).max(40).optional(),
});
const joinSchema = z.object({
  code: z.string().length(6),
  playerName: z.string().min(1).max(40),
});
const lockSchema = z.object({
  code: z.string().length(6),
});
const roundStartSchema = z.object({
  code: z.string().length(6),
  currentValue: z.number(),
  timerSeconds: z.number().int().positive().max(300).optional(),
});
const guessSchema = z.object({
  code: z.string().length(6),
  playerId: z.string().min(1),
  guess: z.enum(["higher", "lower"]),
});
const roundResolveSchema = z.object({
  code: z.string().length(6),
  nextValue: z.number(),
  correctAnswer: z.enum(["higher", "lower"]),
});
const reconnectSchema = z.object({
  code: z.string().length(6),
  playerId: z.string().min(1).optional(),
});
const gameEndSchema = z.object({
  code: z.string().length(6),
  reason: z.string().min(1).optional(),
});

const errorSummary = (error) =>
  error.issues.map((issue) => issue.message).join(", ");

const sendAck = (ack, payload) => {
  if (typeof ack === "function") {
    ack(payload);
  }
};

const parsePayload = (schema, payload, ack) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    sendAck(ack, { ok: false, error: errorSummary(result.error) });
    return null;
  }
  return result.data;
};

const generateCode = () => {
  let code = "";
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (sessions.has(code));
  return code;
};

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

const emitLobbyUpdate = (session) => {
  io.to(session.code).emit("lobby:updated", sessionSnapshot(session));
};

const lockLobby = (session) => {
  session.locked = true;
  io.to(session.code).emit("lobby:locked", { code: session.code });
  emitLobbyUpdate(session);
};

const clearHostTimeout = (session) => {
  if (session.hostDisconnectTimer) {
    clearTimeout(session.hostDisconnectTimer);
    session.hostDisconnectTimer = null;
  }
};

io.on("connection", (socket) => {
  socket.on("lobby:create", (payload, ack) => {
    const data = parsePayload(lobbyCreateSchema, payload, ack);
    if (!data) {
      return;
    }
    const code = generateCode();
    const session = {
      code,
      hostSocketId: socket.id,
      hostName: data.hostName ?? "Host",
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
    };
    sessions.set(code, session);
    socket.join(code);
    sendAck(ack, { ok: true, data: { code } });
    socket.emit("lobby:created", { code });
  });

  socket.on("player:join", (payload, ack) => {
    const data = parsePayload(joinSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session) {
      sendAck(ack, { ok: false, error: "Game code not found." });
      return;
    }
    if (session.locked) {
      sendAck(ack, { ok: false, error: "Lobby is locked." });
      return;
    }
    const playerId = crypto.randomUUID();
    const player = {
      id: playerId,
      name: data.playerName,
      status: "in",
      correctGuesses: 0,
      guess: null,
      socketId: socket.id,
      lastSeen: new Date().toISOString(),
    };
    session.players.set(playerId, player);
    socket.join(session.code);
    sendAck(ack, { ok: true, data: { playerId, ...sessionSnapshot(session) } });
    io.to(session.code).emit("player:joined", {
      player: { id: player.id, name: player.name },
    });
    emitLobbyUpdate(session);
  });

  socket.on("lobby:lock", (payload, ack) => {
    const data = parsePayload(lockSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || session.hostSocketId !== socket.id) {
      sendAck(ack, { ok: false, error: "Not authorized." });
      return;
    }
    lockLobby(session);
    sendAck(ack, { ok: true });
  });

  socket.on("game:start", (payload, ack) => {
    const data = parsePayload(lockSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || session.hostSocketId !== socket.id) {
      sendAck(ack, { ok: false, error: "Not authorized." });
      return;
    }
    lockLobby(session);
    io.to(session.code).emit("game:started", { code: session.code });
    sendAck(ack, { ok: true });
  });

  socket.on("round:start", (payload, ack) => {
    const data = parsePayload(roundStartSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || session.hostSocketId !== socket.id) {
      sendAck(ack, { ok: false, error: "Not authorized." });
      return;
    }
    session.roundIndex += 1;
    session.previousValue = session.currentValue;
    session.currentValue = data.currentValue;
    session.timerSeconds = data.timerSeconds ?? null;
    session.guessesOpen = true;
    session.correctAnswer = null;
    session.players.forEach((player) => {
      player.guess = null;
    });
    io.to(session.code).emit("round:started", {
      roundIndex: session.roundIndex,
      currentValue: session.currentValue,
      timerSeconds: session.timerSeconds,
    });
    emitLobbyUpdate(session);
    sendAck(ack, { ok: true });
  });

  socket.on("guess:submit", (payload, ack) => {
    const data = parsePayload(guessSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || !session.guessesOpen) {
      sendAck(ack, { ok: false, error: "Guesses are closed." });
      return;
    }
    const player = session.players.get(data.playerId);
    if (!player) {
      sendAck(ack, { ok: false, error: "Player not found." });
      return;
    }
    player.guess = data.guess;
    player.lastSeen = new Date().toISOString();
    sendAck(ack, { ok: true });
    if (session.hostSocketId) {
      io.to(session.hostSocketId).emit("guess:submitted", {
        playerId: player.id,
        guess: player.guess,
      });
    }
  });

  socket.on("round:resolve", (payload, ack) => {
    const data = parsePayload(roundResolveSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || session.hostSocketId !== socket.id) {
      sendAck(ack, { ok: false, error: "Not authorized." });
      return;
    }
    session.guessesOpen = false;
    session.correctAnswer = data.correctAnswer;
    const results = [];
    let remainingIn = 0;
    session.players.forEach((player) => {
      const guessed = player.guess;
      const correct = guessed === data.correctAnswer;
      if (guessed == null) {
        player.status = "out";
      } else if (player.status === "in" && !correct) {
        player.status = "out";
      }
      if (correct) {
        player.correctGuesses += 1;
      }
      if (player.status === "in") {
        remainingIn += 1;
      }
      results.push({
        playerId: player.id,
        guessed,
        correct,
        status: player.status,
      });
      player.guess = null;
    });
    let revived = false;
    if (session.players.size > 0 && remainingIn === 0) {
      revived = true;
      session.players.forEach((player) => {
        player.status = "in";
      });
    }
    session.previousValue = session.currentValue;
    session.currentValue = data.nextValue;
    io.to(session.code).emit("round:resolved", {
      roundIndex: session.roundIndex,
      correctAnswer: session.correctAnswer,
      nextValue: session.currentValue,
      results,
      revived,
      leaderboard: listPlayers(session),
    });
    emitLobbyUpdate(session);
    sendAck(ack, { ok: true });
  });

  socket.on("player:reconnect", (payload, ack) => {
    const data = parsePayload(reconnectSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || !data.playerId) {
      sendAck(ack, { ok: false, error: "Player not found." });
      return;
    }
    const player = session.players.get(data.playerId);
    if (!player) {
      sendAck(ack, { ok: false, error: "Player not found." });
      return;
    }
    player.socketId = socket.id;
    player.lastSeen = new Date().toISOString();
    socket.join(session.code);
    sendAck(ack, { ok: true, data: { playerId: player.id, ...sessionSnapshot(session) } });
    io.to(session.code).emit("player:reconnected", { playerId: player.id });
  });

  socket.on("host:reconnect", (payload, ack) => {
    const data = parsePayload(reconnectSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session) {
      sendAck(ack, { ok: false, error: "Game code not found." });
      return;
    }
    session.hostSocketId = socket.id;
    clearHostTimeout(session);
    socket.join(session.code);
    sendAck(ack, { ok: true, data: sessionSnapshot(session) });
  });

  socket.on("player:heartbeat", (payload) => {
    const data = parsePayload(reconnectSchema, payload);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || !data.playerId) {
      return;
    }
    const player = session.players.get(data.playerId);
    if (player) {
      player.lastSeen = new Date().toISOString();
    }
  });

  socket.on("game:end", (payload, ack) => {
    const data = parsePayload(gameEndSchema, payload, ack);
    if (!data) {
      return;
    }
    const session = sessions.get(data.code);
    if (!session || session.hostSocketId !== socket.id) {
      sendAck(ack, { ok: false, error: "Not authorized." });
      return;
    }
    sessions.delete(session.code);
    io.to(session.code).emit("game:ended", {
      reason: data.reason ?? "host-ended",
    });
    io.in(session.code).socketsLeave(session.code);
    sendAck(ack, { ok: true });
  });

  socket.on("disconnect", () => {
    sessions.forEach((session) => {
      if (session.hostSocketId === socket.id) {
        session.hostSocketId = null;
        clearHostTimeout(session);
        session.hostDisconnectTimer = setTimeout(() => {
          sessions.delete(session.code);
          io.to(session.code).emit("game:ended", { reason: "host-timeout" });
          io.in(session.code).socketsLeave(session.code);
        }, SESSION_TTL_MS);
      }
      session.players.forEach((player) => {
        if (player.socketId === socket.id) {
          player.socketId = null;
          player.lastSeen = new Date().toISOString();
        }
      });
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
