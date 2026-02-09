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

handle_exit() {
  EXIT_SOURCE="$1"
  EXIT_CODE="$2"

  if [ "$EXIT_SOURCE" = "frontend" ]; then
    EXIT_LABEL="Frontend"
  else
    EXIT_LABEL="Backend"
  fi

  echo "$EXIT_LABEL process exited with code $EXIT_CODE. Shutting down." >&2
  cleanup
  trap - EXIT
  exit "$EXIT_CODE"
}

if wait -n; then
  EXIT_CODE=0
else
  EXIT_CODE=$?
fi

if kill -0 "$SERVER_PID" 2>/dev/null; then
  EXIT_SOURCE="frontend"
elif kill -0 "$FRONT_PID" 2>/dev/null; then
  EXIT_SOURCE="backend"
else
  EXIT_SOURCE="backend"
fi

handle_exit "$EXIT_SOURCE" "$EXIT_CODE"
