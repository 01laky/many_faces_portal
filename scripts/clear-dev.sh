#!/bin/bash

# Script to completely remove Frontend Docker containers and volumes
# Usage: ./clear-dev.sh

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "🧹 Clearing Frontend containers and volumes..."

# Stop and remove containers from root docker-compose
docker-compose -f docker-compose.dev.yml stop fe-demo-dev fe-demo-proxy 2>/dev/null || true
docker-compose -f docker-compose.dev.yml rm -f fe-demo-dev fe-demo-proxy 2>/dev/null || true

# Remove container by name if it still exists
docker rm -f fe-demo-dev fe-demo-proxy 2>/dev/null || true

# Remove volumes
docker volume rm fe-demo-node-modules 2>/dev/null || true
docker volume rm fe-demo-yarn-cache 2>/dev/null || true

# Also try local docker-compose if exists
if [ -f "docker-compose.yml" ]; then
    docker-compose down -v 2>/dev/null || true
fi

echo "✅ Frontend containers and volumes cleared"
