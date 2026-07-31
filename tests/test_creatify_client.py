"""Unit tests for creatify_client.py. All HTTP calls are mocked - no real
Creatify API traffic, no API key required to run these."""
import os
import sys
import time
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import creatify_client as cc


@pytest.fixture(autouse=True)
def creds(monkeypatch):
    monkeypatch.setenv('CREATIFY_API_ID', 'test-id')
    monkeypatch.setenv('CREATIFY_API_KEY', 'test-key')


def _mock_response(json_body, ok=True, status_code=200, text=''):
    resp = MagicMock()
    resp.ok = ok
    resp.status_code = status_code
    resp.text = text
    resp.json.return_value = json_body
    return resp


def test_missing_credentials_raises(monkeypatch):
    monkeypatch.delenv('CREATIFY_API_ID', raising=False)
    monkeypatch.delenv('CREATIFY_API_KEY', raising=False)
    with pytest.raises(cc.CreatifyNotConfigured):
        cc.list_avatars()


def test_list_avatars_hits_correct_endpoint():
    with patch('creatify_client.requests.request', return_value=_mock_response([{'id': 'a1'}])) as m:
        result = cc.list_avatars()
    assert result == [{'id': 'a1'}]
    args, kwargs = m.call_args
    assert args[0] == 'GET'
    assert args[1] == f'{cc.API_BASE_URL}/personas/'
    assert kwargs['headers'] == {'X-API-ID': 'test-id', 'X-API-KEY': 'test-key'}


def test_list_voices_hits_correct_endpoint():
    with patch('creatify_client.requests.request', return_value=_mock_response([{'name': 'Voice'}])) as m:
        result = cc.list_voices()
    assert result == [{'name': 'Voice'}]
    args, _ = m.call_args
    assert args[1] == f'{cc.API_BASE_URL}/voices/'


def test_create_lipsync_sends_expected_payload():
    with patch('creatify_client.requests.request', return_value=_mock_response({'id': 'job1', 'status': 'pending'})) as m:
        result = cc.create_lipsync('hello world', 'avatar-1', aspect_ratio='9x16', accent='voice-1', name='my ad')
    assert result == {'id': 'job1', 'status': 'pending'}
    args, kwargs = m.call_args
    assert args[0] == 'POST'
    assert args[1] == f'{cc.API_BASE_URL}/lipsyncs/'
    assert kwargs['json'] == {
        'text': 'hello world',
        'creator': 'avatar-1',
        'aspect_ratio': '9x16',
        'name': 'my ad',
        'accent': 'voice-1',
    }


def test_create_lipsync_omits_unset_optional_fields():
    with patch('creatify_client.requests.request', return_value=_mock_response({'id': 'job1'})) as m:
        cc.create_lipsync('hello', 'avatar-1')
    _, kwargs = m.call_args
    assert kwargs['json'] == {'text': 'hello', 'creator': 'avatar-1', 'aspect_ratio': '9x16'}


def test_get_lipsync():
    with patch('creatify_client.requests.request', return_value=_mock_response({'id': 'job1', 'status': 'running'})) as m:
        result = cc.get_lipsync('job1')
    assert result['status'] == 'running'
    args, _ = m.call_args
    assert args[1] == f'{cc.API_BASE_URL}/lipsyncs/job1/'


def test_request_raises_creatify_error_on_bad_status():
    with patch('creatify_client.requests.request', return_value=_mock_response(None, ok=False, status_code=400, text='bad request')):
        with pytest.raises(cc.CreatifyError, match='400'):
            cc.list_avatars()


def test_wait_for_lipsync_polls_until_done():
    responses = [
        _mock_response({'id': 'job1', 'status': 'pending'}),
        _mock_response({'id': 'job1', 'status': 'running'}),
        _mock_response({'id': 'job1', 'status': 'done', 'output': 'https://cdn.example/vid.mp4'}),
    ]
    with patch('creatify_client.requests.request', side_effect=responses), \
         patch('creatify_client.time.sleep') as sleep_mock:
        result = cc.wait_for_lipsync('job1', timeout=60, poll_interval=1)
    assert result['status'] == 'done'
    assert result['output'] == 'https://cdn.example/vid.mp4'
    assert sleep_mock.call_count == 2


def test_wait_for_lipsync_stops_on_failed():
    with patch('creatify_client.requests.request', return_value=_mock_response({'id': 'job1', 'status': 'failed', 'failed_reason': 'oops'})):
        result = cc.wait_for_lipsync('job1', timeout=60, poll_interval=1)
    assert result['status'] == 'failed'


def test_wait_for_lipsync_times_out():
    now = [0]

    def fake_time():
        now[0] += 100
        return now[0]

    with patch('creatify_client.requests.request', return_value=_mock_response({'id': 'job1', 'status': 'running'})), \
         patch('creatify_client.time.sleep'), \
         patch('creatify_client.time.time', side_effect=fake_time):
        with pytest.raises(cc.CreatifyError, match='Timed out'):
            cc.wait_for_lipsync('job1', timeout=10, poll_interval=1)
