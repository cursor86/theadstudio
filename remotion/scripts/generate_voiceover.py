#!/usr/bin/env python3
"""Generate a free voiceover MP3 from a script, for the AvatarUGCAd
composition. No paid API key involved - tries the best-sounding option
available and falls back automatically:

  1. gTTS      - free, needs internet (Google Translate's TTS endpoint)
  2. Piper TTS - free, offline neural voice (see download_piper_voice.sh)
  3. espeak-ng - free, offline, always available on Linux, robotic quality

Usage:
    python3 generate_voiceover.py "Script text here" out/voiceover.mp3
    python3 generate_voiceover.py --engine piper "..." out/voiceover.mp3
    python3 generate_voiceover.py --file script.txt out/voiceover.mp3
"""
import argparse
import os
import subprocess
import sys

DEFAULT_PIPER_MODEL = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'piper-voices', 'en_US-amy-medium.onnx'
)


def generate_gtts(text, out_path, lang='en'):
    from gtts import gTTS
    gTTS(text=text, lang=lang).save(out_path)


def generate_piper(text, out_path, model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f'Piper voice model not found: {model_path} (run download_piper_voice.sh first)')
    wav_path = out_path.rsplit('.', 1)[0] + '.wav'
    proc = subprocess.run(
        ['python3', '-m', 'piper', '--model', model_path, '--output_file', wav_path],
        input=text, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f'piper failed: {proc.stderr}')
    subprocess.run(['ffmpeg', '-y', '-i', wav_path, out_path], check=True, capture_output=True)
    os.remove(wav_path)


def generate_espeak(text, out_path, voice='en-us'):
    wav_path = out_path.rsplit('.', 1)[0] + '.wav'
    subprocess.run(['espeak-ng', '-v', voice, '-s', '165', '-w', wav_path, text], check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-y', '-i', wav_path, out_path], check=True, capture_output=True)
    os.remove(wav_path)


ENGINES = {
    'gtts': lambda text, out, model: generate_gtts(text, out),
    'piper': lambda text, out, model: generate_piper(text, out, model),
    'espeak': lambda text, out, model: generate_espeak(text, out),
}
ENGINE_ORDER = ['gtts', 'piper', 'espeak']


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('text', nargs='?', help='Script text (omit if using --file)')
    parser.add_argument('output', help='Output audio path, e.g. out/voiceover.mp3')
    parser.add_argument('--file', help='Read script text from a file instead of the text argument')
    parser.add_argument('--lang', default='en', help='Language code for gTTS (default: en)')
    parser.add_argument('--engine', choices=ENGINE_ORDER, help='Force a specific engine instead of auto-fallback')
    parser.add_argument('--piper-model', default=DEFAULT_PIPER_MODEL, help='Path to a Piper .onnx voice model')
    args = parser.parse_args()

    if args.file:
        with open(args.file) as f:
            text = f.read().strip()
    elif args.text:
        text = args.text
    else:
        parser.error('Provide script text as an argument or via --file')

    engines_to_try = [args.engine] if args.engine else ENGINE_ORDER
    last_error = None
    for engine in engines_to_try:
        try:
            ENGINES[engine](text, args.output, args.piper_model)
            print(f'✅ Voiceover generated via {engine}: {args.output}')
            return
        except Exception as e:
            print(f'⚠️  {engine} unavailable ({e})', file=sys.stderr)
            last_error = e

    print(f'❌ All TTS engines failed. Last error: {last_error}', file=sys.stderr)
    sys.exit(1)


if __name__ == '__main__':
    main()
