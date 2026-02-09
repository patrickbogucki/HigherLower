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
  WAIT_FAILED=false
  if [ -n "$SERVER_PID" ]; then
    if ! wait "$SERVER_PID"; then
      WAIT_FAILED=true
    fi
  fi
  if [ -n "${FRONT_PID:-}" ]; then
    if ! wait "$FRONT_PID"; then
      WAIT_FAILED=true
    fi
  fi
  if [ "$WAIT_FAILED" = true ]; then
    echo "Cleanup warning: one or more processes did not terminate cleanly." >&2
  fi
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
  elif [ "$EXIT_SOURCE" = "both" ]; then
    EXIT_LABEL="Both processes"
  else
    EXIT_LABEL="Backend"
  fi

  echo "$EXIT_LABEL process exited with code $EXIT_CODE. Shutting down." >&2
  cleanup
  trap - EXIT
  exit "$EXIT_CODE"
}

while true; do
  SERVER_DEAD=false
  FRONT_DEAD=false

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    SERVER_DEAD=true
  fi

  if ! kill -0 "$FRONT_PID" 2>/dev/null; then
    FRONT_DEAD=true
  fi

  if [ "$SERVER_DEAD" = true ] && [ "$FRONT_DEAD" = true ]; then
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      if wait "$SERVER_PID"; then
        BACKEND_EXIT=0
      else
        BACKEND_EXIT=$?
      fi
    else
      BACKEND_EXIT=0
    fi
    if ! kill -0 "$FRONT_PID" 2>/dev/null; then
      if wait "$FRONT_PID"; then
        FRONTEND_EXIT=0
      else
        FRONTEND_EXIT=$?
      fi
    else
      FRONTEND_EXIT=0
    fi
    EXIT_CODE=$BACKEND_EXIT
    if [ "$EXIT_CODE" -eq 0 ]; then
      EXIT_CODE=$FRONTEND_EXIT
    fi
    handle_exit "both" "$EXIT_CODE"
  fi

  if [ "$SERVER_DEAD" = true ]; then
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      if wait "$SERVER_PID"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
      handle_exit "backend" "$EXIT_CODE"
    fi
  fi

  if [ "$FRONT_DEAD" = true ]; then
    if ! kill -0 "$FRONT_PID" 2>/dev/null; then
      if wait "$FRONT_PID"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
      handle_exit "frontend" "$EXIT_CODE"
    fi
  fi

  sleep 1
done
