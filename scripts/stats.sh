#!/bin/bash
# Visionion downloads dashboard.
# Prints DMG download counts per app from GitHub Releases (no tracking — these
# counts live on GitHub's side and contain no user data).
#
# Usage: ./scripts/stats.sh
set -euo pipefail

# Use the stored GitHub credential (works without gh CLI).
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
AUTH=()
[ -n "${TOKEN:-}" ] && AUTH=(-H "Authorization: token $TOKEN")

REPOS=("voxly-site" "xly-site")

printf "\n  Visionion — DMG downloads (%s)\n" "$(date '+%Y-%m-%d %H:%M')"
printf "  ------------------------------------------\n"
total=0
for repo in "${REPOS[@]}"; do
  json=$(curl -s "${AUTH[@]}" "https://api.github.com/repos/visionion/$repo/releases")
  line=$(printf '%s' "$json" | python3 -c '
import sys, json
data = json.load(sys.stdin)
n = 0
asset = "-"
for r in data:
    for a in r.get("assets", []):
        n += a.get("download_count", 0)
        asset = a.get("name", asset)
print(f"{asset}\t{n}")
' 2>/dev/null || echo "-	0")
  name=$(echo "$line" | cut -f1)
  count=$(echo "$line" | cut -f2)
  printf "  %-14s %8s downloads\n" "$name" "$count"
  total=$((total + count))
done
printf "  ------------------------------------------\n"
printf "  %-14s %8s downloads\n\n" "TOTAL" "$total"
echo "  Web traffic (visits, button clicks): Cloudflare dashboard"
echo "  -> https://dash.cloudflare.com  (Analytics -> Web Analytics)"
echo ""
