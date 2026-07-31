"""Tests for the /api/avatars, /api/voices, /api/generate-ugc and
/api/ugc-status Flask routes. All Creatify calls are mocked."""
import os
import sys
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import ad_generator_backend as backend
from creatify_client import CreatifyError, CreatifyNotConfigured


@pytest.fixture
def client():
    backend.app.testing = True
    return backend.app.test_client()


@pytest.fixture(autouse=True)
def clear_download_cache():
    backend._ugc_downloaded.clear()
    yield
    backend._ugc_downloaded.clear()


def test_get_avatars_not_configured(client):
    with patch.object(backend.creatify_client, 'list_avatars', side_effect=CreatifyNotConfigured('missing keys')):
        resp = client.get('/api/avatars')
    assert resp.status_code == 503
    assert 'missing keys' in resp.get_json()['error']


def test_get_avatars_success(client):
    with patch.object(backend.creatify_client, 'list_avatars', return_value=[{'id': 'a1', 'name': 'Alex'}]):
        resp = client.get('/api/avatars')
    assert resp.status_code == 200
    assert resp.get_json() == [{'id': 'a1', 'name': 'Alex'}]


def test_get_avatars_upstream_error(client):
    with patch.object(backend.creatify_client, 'list_avatars', side_effect=CreatifyError('boom')):
        resp = client.get('/api/avatars')
    assert resp.status_code == 502


def test_get_voices_success(client):
    with patch.object(backend.creatify_client, 'list_voices', return_value=[{'name': 'Voice'}]):
        resp = client.get('/api/voices')
    assert resp.status_code == 200
    assert resp.get_json() == [{'name': 'Voice'}]


def test_generate_ugc_requires_script(client):
    resp = client.post('/api/generate-ugc', data={'avatar_id': 'a1'})
    assert resp.status_code == 400
    assert 'script' in resp.get_json()['error'].lower()


def test_generate_ugc_requires_avatar(client):
    resp = client.post('/api/generate-ugc', data={'script': 'hi there'})
    assert resp.status_code == 400
    assert 'avatar_id' in resp.get_json()['error']


def test_generate_ugc_success(client):
    with patch.object(backend.creatify_client, 'create_lipsync', return_value={'id': 'job1', 'status': 'pending'}) as m:
        resp = client.post('/api/generate-ugc', data={
            'script': 'hi there', 'avatar_id': 'a1', 'voice_id': 'v1', 'aspect_ratio': '1:1', 'name': 'my ad',
        })
    assert resp.status_code == 200
    body = resp.get_json()
    assert body == {'success': True, 'job_id': 'job1', 'status': 'pending'}
    args, kwargs = m.call_args
    assert args[0] == 'hi there'
    assert args[1] == 'a1'
    assert kwargs['aspect_ratio'] == '1x1'
    assert kwargs['accent'] == 'v1'
    assert kwargs['name'] == 'my ad'


def test_generate_ugc_defaults_aspect_ratio_to_9x16(client):
    with patch.object(backend.creatify_client, 'create_lipsync', return_value={'id': 'job1', 'status': 'pending'}) as m:
        client.post('/api/generate-ugc', data={'script': 'hi', 'avatar_id': 'a1'})
    _, kwargs = m.call_args
    assert kwargs['aspect_ratio'] == '9x16'


def test_generate_ugc_not_configured(client):
    with patch.object(backend.creatify_client, 'create_lipsync', side_effect=CreatifyNotConfigured('missing keys')):
        resp = client.post('/api/generate-ugc', data={'script': 'hi', 'avatar_id': 'a1'})
    assert resp.status_code == 503


def test_ugc_status_running(client):
    with patch.object(backend.creatify_client, 'get_lipsync', return_value={'id': 'job1', 'status': 'running'}):
        resp = client.get('/api/ugc-status/job1')
    assert resp.status_code == 200
    assert resp.get_json() == {'job_id': 'job1', 'status': 'running'}


def test_ugc_status_failed(client):
    with patch.object(backend.creatify_client, 'get_lipsync', return_value={'status': 'failed', 'failed_reason': 'render error'}):
        resp = client.get('/api/ugc-status/job1')
    assert resp.status_code == 200
    body = resp.get_json()
    assert body['status'] == 'failed'
    assert body['error'] == 'render error'


def test_ugc_status_done_downloads_and_caches(client, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    os.makedirs('outputs', exist_ok=True)

    fake_video_resp = MagicMock()
    fake_video_resp.content = b'fake-mp4-bytes'
    fake_video_resp.raise_for_status = MagicMock()

    with patch.object(backend.creatify_client, 'get_lipsync',
                       return_value={'status': 'done', 'output': 'https://cdn.example/vid.mp4'}) as get_mock, \
         patch.object(backend.requests, 'get', return_value=fake_video_resp) as req_get:
        resp1 = client.get('/api/ugc-status/job1')
        resp2 = client.get('/api/ugc-status/job1')

    assert resp1.status_code == 200
    body1 = resp1.get_json()
    assert body1['status'] == 'done'
    assert body1['video_url'] == '/api/download/ugc_job1.mp4'
    assert os.path.exists('outputs/ugc_job1.mp4')

    # Second poll should reuse the cached download instead of hitting Creatify's file again.
    body2 = resp2.get_json()
    assert body2['video_url'] == '/api/download/ugc_job1.mp4'
    assert req_get.call_count == 1
    assert get_mock.call_count == 2


def test_ugc_status_done_without_output_url(client):
    with patch.object(backend.creatify_client, 'get_lipsync', return_value={'status': 'done'}):
        resp = client.get('/api/ugc-status/job1')
    assert resp.status_code == 502
    assert 'output' in resp.get_json()['error'].lower()
