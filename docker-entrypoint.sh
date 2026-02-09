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
  trap - EXIT
  cleanup
  exit "$EXIT_CODE"
}

while true; do
  SERVER_ALIVE=true
  FRONT_ALIVE=true

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    SERVER_ALIVE=false
  fi

  if ! kill -0 "$FRONT_PID" 2>/dev/null; then
    FRONT_ALIVE=false
  fi

  if [ "$SERVER_ALIVE" = false ]; then
    if wait "$SERVER_PID"; then
      EXIT_CODE=0
    else
      EXIT_CODE=$?
    fi
    handle_exit "backend" "$EXIT_CODE"
  fi

  if [ "$FRONT_ALIVE" = false ]; then
    if wait "$FRONT_PID"; then
      EXIT_CODE=0
    else
      EXIT_CODE=$?
    fi
    handle_exit "frontend" "$EXIT_CODE"
  fi

  sleep 1
done
