# The Ad Studio

Turns product photos into ready-to-post short-form ad videos (TikTok / Instagram Reels / YouTube Shorts). Upload photos + copy, get a vertical MP4 back: animated intro, product photo montage, feature callouts, background music, and a branded "Shop Now" CTA. Length defaults to 25-30s (follows your music track) but can be set explicitly per job - see "Ad length" below.

## How it works

- `ad_generator.html` - browser UI (upload photos/music, enter title/features/CTA)
- `ad_generator_backend.py` - Flask API that saves uploads and calls the Remotion renderer
- `remotion/` - the actual video composition (React components + `render.mjs` render script)

Three modes:
- **Classic** (`/api/generate-ad`): one photo, AI voiceover via gTTS, OpenCV/FFmpeg pipeline (fully local, no Remotion needed)
- **Montage** (`/api/generate-montage`): multiple photos + your own music track, rendered through Remotion (`MontageAd` composition) - this is the richer, animated format
- **AI Avatar** (`/api/generate-ugc`): a real talking-presenter video via [Creatify](https://creatify.ai)'s avatar API - not a local render, this calls out to Creatify to generate an actual AI avatar speaking your script. See "AI Avatar mode (Creatify)" below for setup. Not to be confused with the `TestimonialAd` Remotion layout (styled as static review cards, no presenter) - this mode is the real thing.

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

### AI Avatar mode (Creatify)

The "AI Avatar" mode in the web UI generates a real talking-presenter video instead of compositing your own photos - it calls [Creatify](https://creatify.ai)'s avatar/lipsync API server-side (`creatify_client.py`). It needs its own API credentials and a paid Creatify plan; the rest of the app works fine without it.

```bash
export CREATIFY_API_ID=your-api-id
export CREATIFY_API_KEY=your-api-key
```

Get these from Creatify's Workspace Settings → API (requires a Pro plan or higher). Without them set, `/api/avatars`, `/api/voices`, and `/api/generate-ugc` return a 503 with a message explaining what's missing - everything else in the app is unaffected.

How it works: `/api/generate-ugc` kicks off a Creatify render and returns a `job_id` immediately (renders take a few minutes); the frontend polls `/api/ugc-status/<job_id>` every 5s, and once Creatify reports `done` the backend downloads the finished video into `outputs/` and serves it through the same `/api/download/<filename>` path the other modes use. Creatify bills per render (a few credits per 30s of video) regardless of whether you download the result, so avoid re-submitting the same script/avatar repeatedly.

Tests for this integration (`tests/test_creatify_client.py`, `tests/test_ugc_endpoints.py`) mock every Creatify HTTP call, so they run without an API key:

```bash
pip install -r requirements-dev.txt
pytest tests/
```

### Batch re-rendering

`remotion/scripts/render-all.sh` renders a whole manifest of jobs in one shot and runs `scripts/check-white-edge.py` (a standalone version of the pixel check used to catch the earlier white-band defect) on every output - no AI involvement needed, so use it directly for repeat/portfolio re-renders instead of asking Claude to drive `render.mjs` one video at a time:

```bash
cd remotion
./scripts/render-all.sh                    # renders every job in scripts/jobs.json (the full portfolio)
./scripts/render-all.sh scripts/foo.json   # or a custom manifest, same format as jobs.json
```

Manifest entries are `{"name", "props", "composition", "output"}`. Add a new entry (e.g. for a new client job) instead of hand-running `render.mjs` per file.

## Sample ads

`demo/` has runnable end-to-end examples covering the main ad categories, each built entirely from generated assets (HTML mockup cards screenshotted with headless Chromium, synthesized background music) - safe to use as portfolio/demo pieces without depending on any real client's photos or licensed music. The exception is `avatar-ugc/`, which by nature needs an actual presenter: it uses two real photos of the same person (rights-cleared for this demo) instead of a generated mockup - swap in your own before reusing it for a real client.

| Category | Example | Layout | Render |
|---|---|---|---|
| Product | Nimbus Audio (fictional earbuds) | Montage (card-based) | `node render.mjs ../demo/props.json out/product.mp4` |
| Product | Nimbus Audio | Ken Burns (photo zoom + caption bar) | `node render.mjs ../demo/props-kenburns.json out/product-kb.mp4 KenBurnsAd` |
| Business promotion | Northbound Coffee Co. (fictional grand opening) | Montage | `node render.mjs ../demo/business-promo/props.json out/promo.mp4` |
| Service | Sparkle Detailing (fictional mobile car detailing) | Montage | `node render.mjs ../demo/service/props.json out/service.mp4` |
| Service | Sparkle Detailing | Grid (2x2 split-screen) | `node render.mjs ../demo/service/props-grid.json out/service-grid.mp4 GridAd` |
| Service | Sparkle Detailing | Demo-tainment (fast hard cuts) | `node render.mjs ../demo/service/props-demotainment.json out/service-demo.mp4 DemoTainmentAd` |
| Product | Nimbus Audio | UGC Testimonial (review cards) | `node render.mjs ../demo/props-testimonial.json out/product-testimonial.mp4 TestimonialAd` |
| Business promotion | Northbound Coffee Co. | Listicle / "Types of" | `node render.mjs ../demo/business-promo/props-listicle.json out/promo-listicle.mp4 ListicleAd` |
| Product | Nimbus Audio | UGC Avatar (real presenter photos + real voiceover, 100% free/local) | `node render.mjs ../demo/avatar-ugc/props.json out/avatar-ugc.mp4 AvatarUGCAd` |

Run each from inside `remotion/`. `demo/props-short.json` is the same Nimbus Audio ad cut to `durationSeconds: 15` - see below.

## Layouts

Seven composition styles, picked via the optional third `render.mjs` argument (defaults to `MontageAd`):

- **MontageAd** - intro card, then one full-screen photo at a time, feature-bullet cards, CTA. The default, most versatile.
- **KenBurnsAd** - continuous slow zoom/pan per photo with a persistent lower-third caption bar instead of full-screen text cards - more documentary/organic feel. Props: `hook`, `captions` (one per image), `images`, `cta`, `link`, `music`, `logoPath`, `durationSeconds`.
- **GridAd** - all photos in a 2x2 grid at once, with one tile "popping" forward per beat synced to a caption - denser, multi-item showcase feel. Props: `title`, `captions` (one per image, up to 4), `images`, `cta`, `link`, `music`, `logoPath`, `durationSeconds`.
- **TestimonialAd** - "UGC testimonial" styled as review/quote cards (star rating, quote, reviewer name) rather than a talking-head video - this pipeline has no real presenter or AI avatar, so it reads like a screenshotted customer review instead of pretending to be filmed. Props: `reviews` (array of `{quote, name, rating}`), `productImage` (optional), `cta`, `link`, `music`, `logoPath`, `durationSeconds`.
- **DemoTainmentAd** - fast, punchy problem-hook opener into quick demo beats with hard cuts and bouncy spring pop-ins, styled more like a meme/hook-driven TikTok than the calmer layouts above. Props: `problem`, `images`, `captions` (one per image), `cta`, `link`, `music`, `logoPath`, `durationSeconds`.
- **ListicleAd** - covers both "listicle" (5 Reasons You Need This) and "types of" (3 Types of Coffee Lovers) formats with one flexible composition: title card, then one full-screen card per item with a label badge (number or persona name) + text + optional photo, then CTA. Props: `title`, `items` (array of `{label, text, image?}`), `cta`, `link`, `music`, `logoPath`, `durationSeconds`.
- **AvatarUGCAd** - a real talking-presenter ad: real photos of an actual presenter (not a rendered/illustrated avatar - use your own photos, or a model/stock photo you have the rights to use), cut between one per caption beat like a real multi-shot UGC video, with synced lower-third captions and a "speaking" bar indicator. Not lip-synced video (this pipeline has no AI avatar renderer, same honesty as `TestimonialAd`), but a real spoken voiceover plays under real photos, generated 100% free/local (see below) - one photo works fine too, it just holds on screen for the whole voiceover instead of cutting. Props: `avatarImages` (array, one photo per caption beat - use 1+), `captions` (one per `avatarImages` entry), `voiceover` (audio file - the presenter's actual voice), `music` (optional, mixed low under the voiceover), `cta`, `link`, `logoPath`, `durationSeconds`. Duration follows the voiceover's own length by default, not a music track.

### Free voiceover generation (no paid API)

`remotion/scripts/generate_voiceover.py` turns a script into an `AvatarUGCAd`-ready MP3 with no API key and no per-render cost, trying engines in quality order and falling back automatically:

1. **gTTS** - free, best default quality, needs internet (uses Google Translate's TTS endpoint)
2. **Piper TTS** - free, offline neural voice, needs a one-time ~63MB model download (`./scripts/download_piper_voice.sh`, pulls a GitHub-hosted mirror of Piper's `en_US-amy-medium` voice - no account, no Hugging Face needed)
3. **espeak-ng** - free, offline, always available (`apt install espeak-ng`), robotic quality - last-resort fallback only

```bash
cd remotion
pip install -r scripts/requirements.txt   # adds piper-tts on top of the root requirements
./scripts/download_piper_voice.sh         # one-time, for the offline fallback
python3 scripts/generate_voiceover.py "Your UGC script here" ../demo/avatar-ugc/assets/voiceover.mp3
```

Pass `--engine piper` (or `gtts`/`espeak`) to force a specific engine instead of auto-fallback - useful on a network that blocks gTTS. This has nothing to do with the paid "AI Avatar" mode in the web UI (`/api/generate-ugc`, backed by Creatify) - that one renders a real lip-synced avatar video and needs a Creatify Pro plan; this composition is the free alternative when a static portrait + real voiceover + captions is enough.

## Ad length

By default the video's length follows the music track's duration, clamped to 25-30s. To set an exact length instead (e.g. a 15s TikTok cut or a 60s YouTube ad), set `durationSeconds` in the props JSON (or the "Ad Length" field in the web UI, sent as the `duration` form field to `/api/generate-montage`). Valid range is 6-120s. The intro/features/CTA cards automatically shrink (down to a readable floor) for durations below the 25s baseline, so a 15s ad doesn't spend all its time on text cards - the extra room in longer-than-baseline ads goes entirely to more photo time.

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
