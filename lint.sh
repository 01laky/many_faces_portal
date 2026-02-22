#!/bin/bash

# Lint fe_demo (ESLint + Prettier check)
# Usage: ./lint.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Linting fe_demo..."
echo ""

yarn lint
yarn format:check

echo ""
echo "✅ fe_demo lint passed"
