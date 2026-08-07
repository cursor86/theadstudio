#!/usr/bin/env python3
"""Upload newly rendered ad videos to YouTube via the Data API v3.

Setup (one-time):
  1. pip install -r requirements.txt
  2. credentials.json (OAuth client, "Desktop app" type) in the repo root.
  3. Run this script - it opens a browser for the OAuth consent screen and
     saves the resulting token to token.json so future runs don't prompt again.

Usage:
  python youtube_upload.py                       # scan remotion/out/, upload new videos as public
  python youtube_upload.py --folder path/to/dir   # scan a different folder
  python youtube_upload.py --privacy unlisted     # private | unlisted | public
  python youtube_upload.py --dry-run              # show what would upload, without uploading
  python youtube_upload.py --force                # re-upload even if already in the manifest

Per-video metadata:
  Drop a sidecar file next to a video to control its title/description/tags
  instead of the auto-generated defaults, e.g. for out/marsei-ceramics.mp4:

    out/marsei-ceramics.meta.json
    {
      "title": "MarSei Ceramics — Handcrafted, Small-Batch Pottery",
      "description": "...",
      "tags": ["ceramics", "handmade", "pottery"],
      "privacyStatus": "unlisted"
    }

  Any field left out of the sidecar falls back to the auto-generated default.
"""

import argparse
import json
import os
import re
import sys
import time

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.environ.get('YOUTUBE_CREDENTIALS_FILE', os.path.join(REPO_ROOT, 'credentials.json'))
TOKEN_FILE = os.environ.get('YOUTUBE_TOKEN_FILE', os.path.join(REPO_ROOT, 'token.json'))
MANIFEST_FILE = os.environ.get('YOUTUBE_UPLOAD_MANIFEST', os.path.join(REPO_ROOT, 'youtube_upload_manifest.json'))
DEFAULT_ASSET_FOLDER = os.path.join(REPO_ROOT, 'remotion', 'out')
VIDEO_EXTENSIONS = ('.mp4', '.mov', '.webm', '.m4v')
DEFAULT_CATEGORY_ID = '22'  # People & Blogs
BRAND_TAGS = ['theadzstudio', 'shortformad', 'socialmediamarketing']

RETRYABLE_STATUS_CODES = {500, 502, 503, 504}
MAX_RETRIES = 6


def get_authenticated_service():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                sys.exit(
                    f"Missing {CREDENTIALS_FILE}. Download the OAuth client "
                    "(Desktop app type) from Google Cloud Console and place it there."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())

    return build('youtube', 'v3', credentials=creds)


def load_manifest():
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE) as f:
            return json.load(f)
    return {}


def save_manifest(manifest):
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)


def humanize_filename(filename):
    stem = os.path.splitext(filename)[0]
    stem = re.sub(r'[-_]+', ' ', stem)
    stem = re.sub(r'\s+', ' ', stem).strip()
    return stem.title()


def default_metadata(filename):
    title = humanize_filename(filename)
    words = re.findall(r'[a-zA-Z]+', title.lower())
    tags = sorted(set(words) | set(BRAND_TAGS))
    description = (
        f"{title}\n\n"
        "Short-form ad video created by theadzstudio - custom video ads for "
        "small businesses, built from your own product photos.\n\n"
        "Want one for your brand? theadzstudio@gmail.com"
    )
    return {
        'title': title[:100],
        'description': description[:5000],
        'tags': tags[:30],
        'categoryId': DEFAULT_CATEGORY_ID,
        'privacyStatus': 'public',
    }


def load_sidecar_metadata(video_path):
    sidecar_path = os.path.splitext(video_path)[0] + '.meta.json'
    if not os.path.exists(sidecar_path):
        return {}
    with open(sidecar_path) as f:
        return json.load(f)


def build_metadata(video_path, cli_privacy):
    filename = os.path.basename(video_path)
    meta = default_metadata(filename)
    meta.update(load_sidecar_metadata(video_path))
    if cli_privacy:
        meta['privacyStatus'] = cli_privacy
    return meta


def find_new_videos(folder, manifest, force):
    if not os.path.isdir(folder):
        sys.exit(f"Asset folder not found: {folder}")
    videos = []
    for name in sorted(os.listdir(folder)):
        if not name.lower().endswith(VIDEO_EXTENSIONS):
            continue
        path = os.path.join(folder, name)
        if not force and name in manifest:
            continue
        videos.append(path)
    return videos


def upload_video(youtube, video_path, metadata):
    body = {
        'snippet': {
            'title': metadata['title'],
            'description': metadata['description'],
            'tags': metadata['tags'],
            'categoryId': metadata['categoryId'],
        },
        'status': {
            'privacyStatus': metadata['privacyStatus'],
            'selfDeclaredMadeForKids': False,
        },
    }
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype='video/mp4')
    request = youtube.videos().insert(part='snippet,status', body=body, media_body=media)

    response = None
    retries = 0
    while response is None:
        try:
            status, response = request.next_chunk()
            if status:
                print(f"    uploading... {int(status.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status in RETRYABLE_STATUS_CODES and retries < MAX_RETRIES:
                retries += 1
                wait = 2 ** retries
                print(f"    upload error ({e.resp.status}), retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise
    return response['id']


def main():
    parser = argparse.ArgumentParser(description='Upload newly rendered ad videos to YouTube.')
    parser.add_argument('--folder', default=DEFAULT_ASSET_FOLDER, help='Folder to scan for video files.')
    parser.add_argument('--privacy', choices=['private', 'unlisted', 'public'], default=None,
                         help='Override privacyStatus for every upload this run.')
    parser.add_argument('--dry-run', action='store_true', help="Show what would upload without uploading.")
    parser.add_argument('--force', action='store_true', help='Re-upload videos already recorded in the manifest.')
    args = parser.parse_args()

    manifest = load_manifest()
    videos = find_new_videos(args.folder, manifest, args.force)

    if not videos:
        print(f"No new videos found in {args.folder}")
        return

    print(f"Found {len(videos)} video(s) to upload from {args.folder}\n")

    youtube = None if args.dry_run else get_authenticated_service()

    for video_path in videos:
        filename = os.path.basename(video_path)
        metadata = build_metadata(video_path, args.privacy)

        print(f"- {filename}")
        print(f"    title: {metadata['title']}")
        print(f"    tags:  {', '.join(metadata['tags'])}")
        print(f"    privacy: {metadata['privacyStatus']}")

        if args.dry_run:
            print("    [dry-run] skipped upload\n")
            continue

        video_id = upload_video(youtube, video_path, metadata)
        print(f"    uploaded: https://youtu.be/{video_id}\n")

        manifest[filename] = {
            'videoId': video_id,
            'uploadedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'title': metadata['title'],
        }
        save_manifest(manifest)


if __name__ == '__main__':
    main()
