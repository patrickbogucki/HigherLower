# Tools and Architecture

This document reflects the actual codebase and deployment setup.

## Tools Used

### Frontend
- **Next.js** for the React application, routing, and production builds.
- **React** for the host and player interfaces.
- **TypeScript** for typed state, socket payloads, and safer UI logic.
- **Tailwind CSS + PostCSS** for utility styling and build-time CSS processing.

### Backend and Realtime
- **Node.js** for the runtime that hosts the backend server.
- **Express** for the HTTP server and health endpoint.
- **Socket.IO** for realtime lobby updates, guesses, and round events.
- **Zod** for server-side payload validation and error messaging.

### Tooling and Quality
- **ESLint** for linting and consistent code standards.
- **Docker** (Dockerfile and docker-compose) for containerized local setup and deployment parity.

### Hosting
- **Vercel** for the frontend hosting and builds.
- **Render** for the backend hosting (Express + Socket.IO server).

## Codebase Architecture Summary

The project is a client-server realtime game. The frontend is a Next.js app that renders host and player experiences, manages local session state, and connects to the backend over Socket.IO. The backend is an Express server with a Socket.IO gateway that owns game sessions in memory, validates all events with Zod, and broadcasts lobby and round updates to connected clients. Game state is stored in process memory (no external database or cache), so sessions reset when the server restarts. Round flow is driven by server events: lobby creation, player joins, round start, guesses, round resolve, and game end. The frontend reacts to these snapshots and updates UI state accordingly.
