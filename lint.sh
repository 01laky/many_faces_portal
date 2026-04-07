#!/usr/bin/env bash
# Lint fe_demo — matches CI: types + eslint + prettier.
# Usage: ./lint.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Linting fe_demo (yarn validate)..."
echo ""

yarn validate

echo ""
echo "✅ fe_demo lint passed"
