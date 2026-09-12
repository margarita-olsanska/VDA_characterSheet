#!/bin/sh
# tiny local-server launcher for macOS/Linux - see README.md for why a
# server is needed at all instead of just opening char-sheet.html directly.
# prefers Python (pre-installed on virtually every Mac/Linux system) so
# nothing extra needs to be installed; falls back to Node if that's what's
# available instead.
cd "$(dirname "$0")"

PORT=5500

if command -v python3 >/dev/null 2>&1; then
	SERVE_CMD="python3 -m http.server $PORT"
elif command -v python >/dev/null 2>&1; then
	SERVE_CMD="python -m http.server $PORT"
elif command -v node >/dev/null 2>&1; then
	SERVE_CMD="node server.js"
else
	echo "No local server could be started - install Python 3 (recommended, https://python.org) or Node.js (https://nodejs.org), then run this script again."
	exit 1
fi

$SERVE_CMD &
SERVER_PID=$!

trap "kill $SERVER_PID" EXIT INT TERM

sleep 1

URL="http://localhost:$PORT/char-sheet.html"
if command -v open >/dev/null 2>&1; then
	open "$URL"          # macOS
elif command -v xdg-open >/dev/null 2>&1; then
	xdg-open "$URL"      # Linux
fi

wait $SERVER_PID
