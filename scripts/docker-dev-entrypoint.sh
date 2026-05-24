#!/bin/sh
# Dev container entrypoint: reconcile named node_modules volume with lockfile.
# Host bind-mount can refresh .yarn/install-state.gz after `yarn install` on the
# host while the Docker volume still lacks new packages (e.g. dompurify).
set -eu
export CYPRESS_INSTALL_BINARY=0

install_deps() {
  rm -f .yarn/install-state.gz
  yarn install --immutable
}

install_deps

# Guard: stale install-state from the host bind-mount can skip linking into the
# named node_modules volume even after `yarn install`.
if [ ! -f node_modules/dompurify/package.json ]; then
  echo "docker-dev-entrypoint: dompurify missing after install; retrying" >&2
  install_deps
fi

if [ ! -f node_modules/dompurify/package.json ]; then
  echo "docker-dev-entrypoint: dompurify still missing; check yarn.lock / volume" >&2
  exit 1
fi

exec yarn dev --host 0.0.0.0 --port "${VITE_PORT:-8081}"
