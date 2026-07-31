# Free lip-sync for AvatarUGCAd (Wav2Lip)

Optional, heavier addition to the free `AvatarUGCAd` pipeline: turns a
presenter photo + a line of text into a video clip with real, audio-driven
mouth movement, using [Wav2Lip](https://github.com/Rudrabha/Wav2Lip). No API
key, no per-render cost - but read the license section below before using it
for anything beyond a personal demo.

## License - read this first

**Wav2Lip is licensed for personal/research/non-commercial use only.** Using
it to generate lip-synced video for an actual client's ad, or any other
commercial purpose, is not covered by that license - the authors ask you to
contact them (rudrabha@synclabs.so / prajwal@synclabs.so) or use their paid
hosted product at [synclabs.so](https://synclabs.so) for that. `demo/avatar-ugc/assets/avatar-real-1-lipsync.mp4`
and `avatar-real-2-lipsync.mp4` in this repo were generated with this
pipeline and carry the same restriction - they're fine as a portfolio/demo
piece, not as-is for a paying client's campaign.

For actual commercial ad production with real lip-sync, use the paid
Creatify "AI Avatar" mode already built into this app's web UI
(`/api/generate-ugc`) instead - it's licensed for that.

## Why this exists instead of just using inference.py

Wav2Lip's own `inference.py` uses an S3FD face detector whose weights are
hosted on `adrianbulat.com`, which isn't reachable from every network. This
directory's `inference_yunet.py` is a drop-in replacement that uses OpenCV's
YuNet face detector instead (weights mirrored on GitHub via `opencv_zoo`) -
otherwise identical to the original.

## Setup

```bash
cd remotion/scripts/lipsync_wav2lip
pip install -r requirements.txt
./setup.sh   # clones Wav2Lip, downloads the GAN checkpoint (~416MB) + YuNet model (~230KB), patches audio.py for modern librosa
```

## Rendering one beat

```bash
./render_beat.sh /path/to/presenter-photo.jpg "The line this beat speaks" out/beat1.mp4
```

This generates the line's voiceover (via `generate_voiceover.py`), runs
Wav2Lip, and mutes the result (audio comes from the combined `voiceover.mp3`
track in the main composition, not from each beat's own clip - see below).
CPU-only inference takes roughly 10-20s per second of audio, plus a fixed
~10-15s of model-load overhead per run.

## Wiring it into AvatarUGCAd

`AvatarUGCAd`'s `beats[]` schema accepts an optional `video` field alongside
`image` - when present, it's used instead of the static photo, muted, with
the same breathing-zoom treatment. To keep one beat's visuals and audio in
sync:

1. For each beat that should be lip-synced, `render_beat.sh` its photo + its
   exact spoken line. Note the line's own audio duration (printed by
   `generate_voiceover.py`, or run `ffprobe` on the beat's line).
2. Set that beat's `durationSeconds` to that exact value, and its `video` to
   the rendered clip.
3. Build the combined `voiceover.mp3` from the *same* lines in the *same*
   order (concatenate with `ffmpeg -f concat`) - since each beat's on-screen
   duration now matches its own line's audio length exactly, the combined
   narration track stays in sync automatically. `demo/avatar-ugc/props.json`
   is a working example of this end to end.
4. Beats without a lip-synced `video` (e.g. `kind: "feature"` product
   cutaways) just need `durationSeconds` set to their own line's length too,
   so the whole timeline still adds up.
