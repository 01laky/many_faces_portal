#!/bin/sh
# Dev container entrypoint: reconcile named node_modules volume with lockfile.
# Host bind-mount can refresh .yarn/install-state.gz after `yarn install` on the
# host while the Docker volume still lacks new packages (e.g. dompurify).
set -eu
export CYPRESS_INSTALL_BINARY=0
rm -f .yarn/install-state.gz
yarn install --immutable
exec yarn dev --host 0.0.0.0 --port "${VITE_PORT:-8081}"
