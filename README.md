# The Ad Studio

Turns product photos into ready-to-post short-form ad videos (TikTok / Instagram Reels / YouTube Shorts). Upload photos + copy, get a 25-30 second vertical MP4 back: animated intro, product photo montage, feature callouts, background music, and a branded "Shop Now" CTA.

## How it works

- `ad_generator.html` - browser UI (upload photos/music, enter title/features/CTA)
- `ad_generator_backend.py` - Flask API that saves uploads and calls the Remotion renderer
- `remotion/` - the actual video composition (React components + `render.mjs` render script)

Two modes:
- **Classic** (`/api/generate-ad`): one photo, AI voiceover via gTTS, OpenCV/FFmpeg pipeline (fully local, no Remotion needed)
- **Montage** (`/api/generate-montage`): multiple photos + your own music track, rendered through Remotion (`MontageAd` composition) - this is the richer, animated format

## Setup

```bash
# Python deps
pip install -r requirements.txt

# Remotion deps
cd remotion && npm install && cd ..

# ffmpeg must be installed and on PATH
ffmpeg -version
```

Run locally:

```bash
python ad_generator_backend.py
# open http://localhost:5000/ad_generator.html
```

Or render directly from the CLI without the web UI (edit `remotion/props/example.json` first):

```bash
cd remotion && node render.mjs props/example.json out/ad.mp4
```

## Branding

Before using this for a real product/customer, add your own:
- `assets/logo.png` - shown on the CTA screen (optional; `CtaEnd` skips it if absent)
- Your own background music track, uploaded per-render (montage mode requires one)
- Update `link`/`cta` defaults in `ad_generator.html` and `remotion/src/Root.tsx` if you want a different placeholder than `yourstore.com`

`assets/` is intentionally empty in this repo - don't commit anyone's private brand assets or sourced product photos here.

## Deploying

`render.yaml` + `Procfile` are set up for Render.com (installs ffmpeg + Node + Chromium, runs the Flask app with gunicorn). Adjust `REMOTION_BROWSER_EXECUTABLE` if deploying elsewhere.

## Important: Remotion's license

This project renders video using [Remotion](https://www.remotion.dev/), which has its own license separate from this repository. Remotion is free for individuals, but **companies with 3+ employees (or anyone reselling/operating this as a product/service for others) need a paid Remotion license** - see [remotion.dev/license](https://www.remotion.dev/license) before using this commercially.
