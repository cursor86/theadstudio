#!/usr/bin/env bash
# Downloads a free, offline neural TTS voice (Piper's en_US-amy-medium) for
# generate_voiceover.py's offline fallback. One-time ~63MB download, no API
# key, no account. Source: the sherpa-onnx project's GitHub release mirror
# of the Piper voice (upstream is normally hosted on Hugging Face).
#
# Usage: ./scripts/download_piper_voice.sh   (run from inside remotion/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTION_DIR="$(dirname "$SCRIPT_DIR")"
VOICE_DIR="$REMOTION_DIR/assets/piper-voices"
ARCHIVE_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-amy-medium.tar.bz2"

mkdir -p "$VOICE_DIR"

if [[ -f "$VOICE_DIR/en_US-amy-medium.onnx" ]]; then
	echo "Already downloaded: $VOICE_DIR/en_US-amy-medium.onnx"
	exit 0
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading Piper voice (en_US-amy-medium, ~63MB)..."
curl -sSL -o "$TMP_DIR/voice.tar.bz2" "$ARCHIVE_URL"

echo "Extracting..."
tar -xjf "$TMP_DIR/voice.tar.bz2" -C "$TMP_DIR"

cp "$TMP_DIR"/vits-piper-en_US-amy-medium/en_US-amy-medium.onnx "$VOICE_DIR/"
cp "$TMP_DIR"/vits-piper-en_US-amy-medium/en_US-amy-medium.onnx.json "$VOICE_DIR/"

echo "✅ Voice ready at $VOICE_DIR/en_US-amy-medium.onnx"
