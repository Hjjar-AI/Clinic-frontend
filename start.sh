#!/usr/bin/env sh
set -eu
exec "$(dirname -- "$0")/../backend/start.sh" "$@"
