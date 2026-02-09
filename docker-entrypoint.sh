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

kill -TERM "$SERVER_PID" "$FRONT_PID" 2>/dev/null || true
wait "$SERVER_PID" "$FRONT_PID" 2>/dev/null || true
exit "$EXIT_CODE"
