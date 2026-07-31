"""Thin REST client for Creatify's avatar/lipsync API (https://creatify.ai).

Used by the UGC ad pipeline to turn a script + an AI avatar into a talking-
presenter video, as an alternative to the photo-montage/Ken-Burns/etc.
layouts rendered locally through Remotion.

Docs: https://docs.creatify.ai/api-reference/lipsyncs/post-apilipsyncs
Requires a Creatify Pro plan (or higher) API key.
"""
import os
import time
import requests

API_BASE_URL = os.environ.get('CREATIFY_API_BASE_URL', 'https://api.creatify.ai/api').rstrip('/')
DEFAULT_TIMEOUT = 30


class CreatifyError(Exception):
    pass


class CreatifyNotConfigured(CreatifyError):
    """Raised when CREATIFY_API_ID / CREATIFY_API_KEY aren't set."""


def _headers():
    api_id = os.environ.get('CREATIFY_API_ID')
    api_key = os.environ.get('CREATIFY_API_KEY')
    if not api_id or not api_key:
        raise CreatifyNotConfigured(
            'Set CREATIFY_API_ID and CREATIFY_API_KEY to use the UGC avatar pipeline.'
        )
    return {'X-API-ID': api_id, 'X-API-KEY': api_key}


def _request(method, path, **kwargs):
    url = f'{API_BASE_URL}{path}'
    resp = requests.request(method, url, headers=_headers(), timeout=DEFAULT_TIMEOUT, **kwargs)
    if not resp.ok:
        raise CreatifyError(f'Creatify API {method} {path} failed ({resp.status_code}): {resp.text}')
    return resp.json()


def list_avatars():
    """GET /api/personas/ - the workspace's available AI avatars."""
    return _request('GET', '/personas/')


def list_voices():
    """GET /api/voices/ - available TTS voices/accents."""
    return _request('GET', '/voices/')


def create_lipsync(text, creator, aspect_ratio='9x16', name=None, accent=None,
                    no_caption=None, no_music=None, green_screen=None, webhook_url=None):
    """POST /api/lipsyncs/ - kick off an avatar video render.

    `creator` is an avatar id from list_avatars(); `accent` is an optional
    voice id from list_voices(). Returns the task dict, including `id` and
    `status` (one of: pending, in_queue, running, done, failed).
    """
    payload = {'text': text, 'creator': creator, 'aspect_ratio': aspect_ratio}
    if name is not None:
        payload['name'] = name
    if accent is not None:
        payload['accent'] = accent
    if no_caption is not None:
        payload['no_caption'] = no_caption
    if no_music is not None:
        payload['no_music'] = no_music
    if green_screen is not None:
        payload['green_screen'] = green_screen
    if webhook_url is not None:
        payload['webhook_url'] = webhook_url
    return _request('POST', '/lipsyncs/', json=payload)


def get_lipsync(lipsync_id):
    """GET /api/lipsyncs/{id}/ - poll a render's status/output."""
    return _request('GET', f'/lipsyncs/{lipsync_id}/')


TERMINAL_STATUSES = {'done', 'failed'}


def wait_for_lipsync(lipsync_id, timeout=600, poll_interval=5):
    """Block until a lipsync task reaches a terminal status, or raise on timeout."""
    deadline = time.time() + timeout
    while True:
        task = get_lipsync(lipsync_id)
        if task.get('status') in TERMINAL_STATUSES:
            return task
        if time.time() >= deadline:
            raise CreatifyError(f'Timed out waiting for lipsync {lipsync_id} (last status: {task.get("status")})')
        time.sleep(poll_interval)
