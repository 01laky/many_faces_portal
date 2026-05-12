#!/bin/bash

# Script to start Be Demo Frontend in Docker container for development
# Runs code validation (TypeScript + ESLint) before starting

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🔍 Checking dependencies..."
echo ""

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    yarn install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies!"
        exit 1
    fi
    echo "✅ Dependencies installed!"
    echo ""
else
    echo "✅ node_modules found"
    echo ""
fi

echo "🔍 Running code validation, tests and formatting before starting..."
echo ""

# Format code first
echo "🎨 Formatting code with Prettier..."
if yarn format; then
    echo "✅ Code formatted!"
else
    echo "⚠️  Code formatting had issues, continuing..."
fi

echo ""

# Run tests
echo "🧪 Running unit tests..."
echo ""
TEST_OUTPUT=$(yarn test --run 2>&1)
TEST_EXIT_CODE=$?

# Extract test summary from Vitest output
TEST_FILES=$(echo "$TEST_OUTPUT" | grep -oE "Test Files +[0-9]+" | grep -oE "[0-9]+" || echo "0")
TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "Tests +[0-9]+ passed" | grep -oE "[0-9]+" | head -1 || echo "0")
PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" | head -1 || echo "$TOTAL_TESTS")
FAILED_TESTS=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" | head -1 || echo "0")
DURATION=$(echo "$TEST_OUTPUT" | grep -oE "Duration: [0-9.]+ [sm]" | sed 's/Duration: //' || echo "")

# Display test results summary
echo "═══════════════════════════════════════════════════════════"
echo "                    TEST RESULTS SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo "  Test files:  $TEST_FILES"
echo "  Total tests: $TOTAL_TESTS"
echo "  ✅ Passed:    $PASSED_TESTS"
echo "  ❌ Failed:    $FAILED_TESTS"
if [ -n "$DURATION" ]; then
    echo "  ⏱️  Duration:  $DURATION"
fi
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed successfully!"
    echo ""
else
    echo "❌ Tests failed! Stopping startup."
    echo ""
    echo "Full test output:"
    echo "$TEST_OUTPUT"
    exit 1
fi

# Run TypeScript type checking
echo "📝 Running TypeScript type checking..."
if yarn type-check; then
    echo "✅ TypeScript type checking passed!"
else
    echo "❌ TypeScript type checking failed!"
    exit 1
fi

echo ""

# Run ESLint
echo "🔍 Running ESLint..."
if yarn lint; then
    echo "✅ ESLint passed!"
else
    echo "❌ ESLint found issues!"
    echo ""
    echo "💡 Tip: Run 'yarn lint:fix' to automatically fix some issues"
    exit 1
fi

echo ""
echo "✅ All code validation and tests passed!"
echo ""
echo "🚀 Starting Be Demo Frontend in Docker container..."

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build fe-demo-dev

echo "▶️  Starting containers..."
docker-compose up -d fe-demo-dev

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 5

# Check if application is running
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Application started successfully!"
    echo ""
    echo "📍 Frontend URL: http://localhost:8081"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs -f fe-demo-dev"
    echo "   - Stop: docker-compose down"
    echo "   - Restart: docker-compose restart fe-demo-dev"
else
    echo "⚠️  Application is still starting. Try again in a moment."
    echo "📋 View logs: docker-compose logs -f fe-demo-dev"
fi
