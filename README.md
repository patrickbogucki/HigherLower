# HigherLower
Higher or Lower game that can be hosted and played by multiple people live.

## Backend
- Run `npm run server` to start the Express + Socket.IO backend on port 3001.
- `GET /health` returns a simple status payload for uptime checks.

## Docker
Build the container:
```
docker build -t higherlower .
```

Run the app (frontend on port 3000, backend on port 3001):
```
docker run --rm -p 3000:3000 -p 3001:3001 higherlower
```

To lock CORS to a specific frontend origin, pass `CORS_ORIGIN`:
```
docker run --rm -p 3000:3000 -p 3001:3001 -e CORS_ORIGIN=http://localhost:3000 higherlower
```
