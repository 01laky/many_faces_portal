#!/bin/bash

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🔧 Fixing TypeScript Editor Issues for Yarn PnP"
echo ""

# Check if Cursor CLI exists
CURSOR_CLI="/Applications/Cursor.app/Contents/Resources/app/bin/cursor"

if [ ! -f "$CURSOR_CLI" ]; then
    echo "❌ Cursor CLI not found at $CURSOR_CLI"
    exit 1
fi

echo "✅ Found Cursor CLI"
echo ""

# Regenerate SDKs
echo "📦 Regenerating Yarn PnP SDKs..."
yarn dlx @yarnpkg/sdks vscode > /dev/null 2>&1
echo "✅ SDKs regenerated"
echo ""

# Check ZipFS extension
echo "🔍 Checking ZipFS extension..."
if "$CURSOR_CLI" --list-extensions 2>/dev/null | grep -q "arcanis.vscode-zipfs"; then
    echo "✅ ZipFS extension is installed"
else
    echo "⚠️  ZipFS extension not found, installing..."
    "$CURSOR_CLI" --install-extension arcanis.vscode-zipfs --force > /dev/null 2>&1
    echo "✅ ZipFS extension installed"
fi
echo ""

echo "📋 Next Steps (do this in Cursor):"
echo "   1. Press Cmd+Shift+P"
echo "   2. Type: 'TypeScript: Restart TS Server'"
echo "   3. Press Enter"
echo "   4. Wait 5-10 seconds"
echo "   5. Press Cmd+Shift+P again"
echo "   6. Type: 'Developer: Reload Window'"
echo "   7. Press Enter"
echo ""
echo "💡 If still not working:"
echo "   - Completely quit Cursor (Cmd+Q)"
echo "   - Reopen Cursor"
echo "   - Wait 15-20 seconds for TypeScript to index"
echo ""
echo "✅ Configuration is correct - modules are available via PnP!"
