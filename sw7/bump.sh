#!/usr/bin/env bash
# Stamp a version + build time into SW7 and publish it to GitHub Pages.
#
#   ./bump.sh 0.2.0 "what changed"
#
# Keeps three things in lockstep: the VERSION/BUILD constants the app shows,
# the service-worker cache name (a stale cache is the one way a watch can end
# up running yesterday's build), and CHANGELOG.md.
set -euo pipefail
cd "$(dirname "$0")"

VER="${1:?usage: ./bump.sh <version> [message]}"
MSG="${2:-}"
STAMP="$(date '+%Y-%m-%d %H:%M %Z')"

sed -i "s|^const VERSION = '.*';|const VERSION = '${VER}';|" app.js
sed -i "s|^const BUILD   = '.*';|const BUILD   = '${STAMP}';|" app.js
sed -i "s|^const CACHE = '.*';|const CACHE = 'sw7-v${VER}';|" sw.js

node --check app.js
node --check sw.js
python3 -c "import json; json.load(open('manifest.webmanifest'))"

grep -q "^const VERSION = '${VER}';" app.js || { echo "version stamp failed"; exit 1; }
grep -q "^const CACHE = 'sw7-v${VER}';" sw.js || { echo "cache stamp failed"; exit 1; }

# newest entry goes under the header, not above it
{
  head -n 2 CHANGELOG.md
  printf '## %s — %s\n\n%s\n\n' "$VER" "$STAMP" "${MSG:-build}"
  tail -n +3 CHANGELOG.md
} > .cl.tmp
mv .cl.tmp CHANGELOG.md

git -C .. add sw7
git -C .. commit -q -m "sw7: v${VER} — ${MSG:-build ${STAMP}}"
git -C .. push -q

echo "published v${VER} (${STAMP}) → https://nd28.github.io/sw7/"
