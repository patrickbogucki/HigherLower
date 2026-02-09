#!/bin/sh
set -e

node server/index.mjs &
SERVER_PID=$!

wait_for_server() {
  node wait-for-server.mjs
}

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONT_PID:-}" ]; then
    kill -TERM "$FRONT_PID" 2>/dev/null || true
  fi
  wait || true
}

trap cleanup INT TERM EXIT

wait_for_server

npm start &
FRONT_PID=$!

if wait -n "$SERVER_PID" "$FRONT_PID"; then
  EXIT_CODE=0
else
  EXIT_CODE=$?
fi

if kill -0 "$SERVER_PID" 2>/dev/null; then
  EXIT_SOURCE="frontend"
else
  EXIT_SOURCE="backend"
fi

if [ "$EXIT_SOURCE" = "frontend" ]; then
  EXIT_LABEL="Frontend"
else
  EXIT_LABEL="Backend"
fi

echo "$EXIT_LABEL process exited with code $EXIT_CODE. Shutting down." >&2

trap - EXIT
cleanup
exit "$EXIT_CODE"
