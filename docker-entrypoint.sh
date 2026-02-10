#!/bin/sh
set -e

PORT=3001 node server/index.mjs &

PORT=3000 HOSTNAME=0.0.0.0 exec node server.js
