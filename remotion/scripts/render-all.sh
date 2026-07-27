#!/usr/bin/env bash
# Batch-renders every job in a manifest (default: scripts/jobs.json) and runs
# the white-edge pixel check on each output. Runs entirely outside Claude -
# use this directly for re-renders and repeat client jobs instead of asking
# Claude to drive render.mjs one video at a time.
#
# Usage:
#   ./scripts/render-all.sh                  # render every job in jobs.json
#   ./scripts/render-all.sh scripts/foo.json # render a different manifest
#
# Manifest format (array of objects), run from inside remotion/:
#   [{"name": "...", "props": "path/to/props.json", "composition": "MontageAd", "output": "out/foo.mp4"}]

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTION_DIR="$(dirname "$SCRIPT_DIR")"
cd "$REMOTION_DIR"

MANIFEST="${1:-scripts/jobs.json}"
if [[ ! -f "$MANIFEST" ]]; then
	echo "Manifest not found: $MANIFEST" >&2
	exit 1
fi

job_count=$(jq 'length' "$MANIFEST")
failures=()

for ((i = 0; i < job_count; i++)); do
	name=$(jq -r ".[$i].name" "$MANIFEST")
	props=$(jq -r ".[$i].props" "$MANIFEST")
	composition=$(jq -r ".[$i].composition" "$MANIFEST")
	output=$(jq -r ".[$i].output" "$MANIFEST")

	echo "=== [$((i + 1))/$job_count] $name ($composition) ==="

	if ! node render.mjs "$props" "$output" "$composition"; then
		echo "RENDER FAILED: $name"
		failures+=("$name (render)")
		continue
	fi

	if ! python3 scripts/check-white-edge.py "$output"; then
		failures+=("$name (white-edge check)")
	fi
	echo
done

echo "=================================="
if [[ ${#failures[@]} -eq 0 ]]; then
	echo "All $job_count jobs rendered and passed the white-edge check."
	exit 0
else
	echo "${#failures[@]} of $job_count jobs failed:"
	printf '  - %s\n' "${failures[@]}"
	exit 1
fi
