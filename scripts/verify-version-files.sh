#!/usr/bin/env bash
# Ensure VERSION matches latest CHANGELOG release section.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="$(tr -d '[:space:]' <"$ROOT/VERSION")"
python3 - "$ROOT/CHANGELOG.md" "$version" <<'PY'
import re, sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(encoding="utf-8")
expected = sys.argv[2]
if "## [Unreleased]" not in text: raise SystemExit("missing [Unreleased]")
after = text.split("## [Unreleased]", 1)[1]
m = re.search(r"^## \[(\d+\.\d+\.\d+)\]", after, re.M)
if not m: raise SystemExit("no release section after [Unreleased]")
latest = m.group(1)
if latest != expected: raise SystemExit(f"VERSION {expected} != CHANGELOG {latest}")
print(f"verify-version-files: CHANGELOG ok (VERSION={expected})")
PY

# CLAUDE.md: "Frontends also keep package.json version in sync with their VERSION."
# Nothing enforced that, which is how portal and admin sat at 0.0.0 while VERSION
# climbed past 1.x, and mobile drifted a patch behind. Enforced here so it cannot recur.
python3 - "$ROOT/package.json" "$version" <<'PY'
import json, sys
from pathlib import Path
pkg = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
expected = sys.argv[2]
actual = pkg.get("version")
if actual != expected:
    raise SystemExit(
        f"package.json version {actual!r} != VERSION {expected!r} - "
        "bump both (scripts/bump-version.sh does not touch package.json)"
    )
print(f"verify-version-files: ok (VERSION={expected}, package.json in sync)")
PY
