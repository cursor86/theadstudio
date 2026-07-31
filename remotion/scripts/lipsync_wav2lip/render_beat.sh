#!/usr/bin/env bash
# Renders one lip-synced AvatarUGCAd beat: a photo + a line of text becomes
# a muted video clip with real audio-driven mouth movement, ready to drop
# into a beat's "video" field (its "voiceover" line goes through the
# ordinary voiceover pipeline separately - see the main README).
#
# Usage: ./render_beat.sh <photo.jpg> "<line of text>" <output.mp4> [wav2lip_dir]
#   wav2lip_dir defaults to ./Wav2Lip (what setup.sh creates by default)

set -euo pipefail

PHOTO="$1"
TEXT="$2"
OUTPUT="$3"
WAV2LIP_DIR="${4:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/Wav2Lip}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTION_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

if [[ ! -f "$WAV2LIP_DIR/inference_yunet.py" ]]; then
	echo "Wav2Lip not set up yet. Run ./setup.sh first." >&2
	exit 1
fi

TMP_AUDIO="$(mktemp --suffix .mp3)"
trap 'rm -f "$TMP_AUDIO"' EXIT

echo "Generating voiceover line..."
python3 "$REMOTION_DIR/scripts/generate_voiceover.py" "$TEXT" "$TMP_AUDIO"

echo "Running Wav2Lip (this can take ~10-20s per second of audio on CPU)..."
RAW_OUTPUT="$WAV2LIP_DIR/results/$(basename "$OUTPUT" .mp4)_raw.mp4"
(cd "$WAV2LIP_DIR" && python3 inference_yunet.py \
	--checkpoint_path checkpoints/wav2lip_gan.pth \
	--face "$PHOTO" \
	--audio "$TMP_AUDIO" \
	--outfile "$RAW_OUTPUT" \
	--yunet_model face_detection_yunet.onnx)

echo "Muting (the shared voiceover track carries the audio - see main README)..."
ffmpeg -y -i "$RAW_OUTPUT" -an -c:v libx264 -crf 18 -pix_fmt yuv420p "$OUTPUT"

echo "✅ $OUTPUT"
echo "   Its exact duration is this line's own voiceover length - use that as the beat's durationSeconds,"
echo "   and make sure the same line (in order) is included when you build the combined voiceover.mp3."
