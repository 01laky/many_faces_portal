#!/bin/bash

# rebuild-dev.sh - Script to rebuild Frontend Demo Docker image from scratch
#
# This script performs a clean rebuild of the Docker image by:
# 1. Removing old Docker images
# 2. Building a fresh image with --no-cache
#
# NOTE: This script only builds images, it does NOT start containers.
# Use ./start-dev.sh to start containers after rebuilding images.
#
# Usage: ./rebuild-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔨 Rebuilding Frontend Demo Docker image (clean build)..."
echo ""

# Remove old images
echo "🧹 Removing old Docker images..."
docker images | grep -E "many_faces_portal|fe-demo" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true

# Build new image with --no-cache (clean build)
echo "🔨 Building fresh Docker image (no cache)..."
docker-compose build --no-cache fe-demo-dev

echo ""
echo "✅ Rebuild completed!"
echo ""
echo "💡 Note: Containers were not started. Use ./start-dev.sh to start containers."
