# Suggested Tools and Architecture

## Recommended Tools

### Product Design
- **Figma** for UI mockups, component inventory, and interaction prototypes.
- **FigJam** for mapping the multiplayer flow and round lifecycle.

### Frontend
- **React + TypeScript** for a structured UI with typed state.
- **Vite** for fast local development and builds.
- **Tailwind CSS** for consistent spacing, typography, and component styling.
- **Framer Motion** for round transitions, reveal animations, and status feedback.
- **Lucide** (or Heroicons) for a cohesive icon set.

### Backend & Realtime
- **Node.js + Express** for the game API and session management.
- **Socket.IO** (or WebSocket API) for live lobby updates, guesses, and round reveals.
- **Zod** for request and event payload validation.

### Data & State
- **Redis** for in-memory game session state and quick reconnection lookup (low-latency + TTL cleanup for short-lived games).
- **PostgreSQL** (optional) for analytics, historical games, and audit logs.

### Quality & DevOps
- **Vitest** for unit tests and utility validation.
- **Playwright** for end-to-end tests of host/player flows.
- **ESLint + Prettier** for linting and formatting.
- **GitHub Actions** for CI checks (lint, test, build).

### Hosting
- **Vercel** for the frontend.
- **Render / Fly.io** for the Node.js server.
- **Upstash Redis** for hosted Redis.

## Suggested Architecture

### High-Level Overview
- **Client-server model** with separate host and player UIs.
- **Realtime event bus** (Socket.IO) for all game events.
- **Central game session store** (Redis) keyed by 6-digit code.

### Core Services
1. **Lobby Service**
   - Creates game codes and accepts join requests.
   - Locks the lobby when the host starts the game.
2. **Round Engine**
   - Tracks current round, timers, and guess submissions.
   - Resolves correct answers and eliminates players.
3. **Leaderboard Service**
   - Maintains player status (in/out) and correct guess counts.
   - Publishes updates to all connected clients.
4. **Reconnect Handler**
   - Restores players or hosts to the correct round state.
   - Applies elimination logic if a player misses a reveal.

### Event Flow (Realtime)
- `lobby:created` → broadcast game code.
- `player:joined` → update lobby roster.
- `round:started` → send timer + current round number.
- `guess:submitted` → update host dashboard.
- `round:resolved` → reveal correct answer and results.
- `game:ended` → release code and show final screen.

### State Model (Redis)
- **Game session**: code, host socket, round index, timer settings.
- **Players**: name, status, guess, score, last-seen timestamp.
- **Round data**: current value, previous value, correct answer.

### Resilience
- Use heartbeats to detect disconnects.
- Allow reconnect within a grace window.
- Snapshots pushed on reconnect to avoid stale client state.
