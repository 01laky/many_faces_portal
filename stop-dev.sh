#!/bin/bash

# Script to stop Frontend Docker containers
# Usage: ./stop-dev.sh

set -e

cd "$(dirname "$0")"

echo "🛑 Stopping Frontend containers..."

if [ -f "../docker-compose.dev.yml" ]; then
    docker-compose -f ../docker-compose.dev.yml stop fe-demo-dev fe-demo-proxy 2>/dev/null || true
    docker-compose -f ../docker-compose.dev.yml rm -f fe-demo-dev fe-demo-proxy 2>/dev/null || true
fi

# Also try local docker-compose if exists
if [ -f "docker-compose.yml" ]; then
    docker-compose down 2>/dev/null || true
fi

echo "✅ Frontend containers stopped and removed"
