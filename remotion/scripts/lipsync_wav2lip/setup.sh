#!/usr/bin/env bash
# One-time setup for the optional free lip-sync pipeline (Wav2Lip). See
# README.md in this directory first - in particular the license section,
# Wav2Lip is personal/research/non-commercial use only.
#
# Clones Wav2Lip, downloads its GAN checkpoint + a YuNet face-detector model
# (both from GitHub-hosted mirrors, no account needed), patches audio.py for
# modern librosa, and drops in inference_yunet.py (this directory's
# replacement for inference.py that avoids Wav2Lip's original S3FD face
# detector, whose weights are hosted on a separate, less reliably-reachable
# host).
#
# Usage: ./setup.sh [target_dir]   (default target_dir: ./Wav2Lip)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$SCRIPT_DIR/Wav2Lip}"

if [[ ! -d "$TARGET_DIR" ]]; then
	echo "Cloning Wav2Lip into $TARGET_DIR..."
	git clone --depth 1 https://github.com/Rudrabha/Wav2Lip.git "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR/checkpoints" "$TARGET_DIR/temp" "$TARGET_DIR/results"

if [[ ! -f "$TARGET_DIR/checkpoints/wav2lip_gan.pth" ]]; then
	echo "Downloading Wav2Lip GAN checkpoint (~416MB)..."
	curl -sSL -o "$TARGET_DIR/checkpoints/wav2lip_gan.pth" \
		"https://github.com/anothermartz/Easy-Wav2Lip/releases/download/Prerequesits/Wav2Lip_GAN.pth"
fi

if [[ ! -f "$TARGET_DIR/face_detection_yunet.onnx" ]]; then
	echo "Downloading YuNet face detector (~230KB)..."
	curl -sSL -o "$TARGET_DIR/face_detection_yunet.onnx" \
		"https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
fi

# Patch audio.py for modern librosa (0.10+ requires sr/n_fft as keyword args,
# and librosa.core.load moved to the top-level librosa.load).
python3 - "$TARGET_DIR/audio.py" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f:
    src = f.read()
src = src.replace(
    "return librosa.filters.mel(hp.sample_rate, hp.n_fft, n_mels=hp.num_mels,",
    "return librosa.filters.mel(sr=hp.sample_rate, n_fft=hp.n_fft, n_mels=hp.num_mels,",
)
src = src.replace("return librosa.core.load(path, sr=sr)[0]", "return librosa.load(path, sr=sr)[0]")
with open(path, "w") as f:
    f.write(src)
print(f"Patched {path} for modern librosa")
PYEOF

cp "$SCRIPT_DIR/inference_yunet.py" "$TARGET_DIR/inference_yunet.py"

echo ""
echo "✅ Setup complete: $TARGET_DIR"
echo "   pip install -r requirements.txt (in this directory) to get the Python deps, then see README.md to render a beat."
