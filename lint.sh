#!/usr/bin/env bash
# Lint many_faces_portal — matches CI: types + eslint + prettier.
# Usage: ./lint.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Linting many_faces_portal (yarn validate)..."
echo ""

yarn validate

echo ""
echo "✅ many_faces_portal lint passed"
