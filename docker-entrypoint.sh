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

while true; do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    if wait "$SERVER_PID"; then
      EXIT_CODE=0
    else
      EXIT_CODE=$?
    fi
    kill -TERM "$FRONT_PID" 2>/dev/null || true
    wait "$FRONT_PID" || true
    exit "$EXIT_CODE"
  fi
  if ! kill -0 "$FRONT_PID" 2>/dev/null; then
    if wait "$FRONT_PID"; then
      EXIT_CODE=0
    else
      EXIT_CODE=$?
    fi
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" || true
    exit "$EXIT_CODE"
  fi
  sleep 1
done
