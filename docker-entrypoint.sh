#!/bin/sh
set -e

node server/index.mjs &
SERVER_PID=$!

wait_for_server() {
  node -e 'const http=require("http");const maxAttempts=30;let attempts=0;const ping=()=>{const req=http.get("http://127.0.0.1:3001/health",res=>{res.resume();process.exit(0);});req.on("error",()=>{attempts+=1;if(attempts>=maxAttempts){process.exit(1);}setTimeout(ping,500);});};ping();'
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
