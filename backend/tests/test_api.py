"""End-to-end API tests for the ContextDic Pro backend.

Covers health / status probes, authentication enforcement,
translation flow, edge cases, and rate limiting.
"""

import json
import time
from unittest.mock import patch, AsyncMock
from backend.agents.models import TranslationResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

AUTH = {'X-API-Secret': 'test_secret'}


# ---------------------------------------------------------------------------
# Health & status
# ---------------------------------------------------------------------------

def test_health(client):
    """GET /api/health returns 200."""
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'healthy'


def test_status(client):
    """GET /api/status reports key readiness."""
    r = client.get('/api/status')
    assert r.status_code == 200
    d = r.json()
    assert d['backend_running'] is True
    assert 'api_key_configured' in d


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

def test_auth_missing_secret(client):
    """Requests without X-API-Secret → 403."""
    r = client.post('/api/translate', json={
        'text': 'Hello', 'targetLanguage': 'zh',
    })
    assert r.status_code == 403


def test_auth_wrong_secret(client):
    """Requests with wrong X-API-Secret → 403."""
    r = client.post('/api/translate',
                    json={'text': 'Hello', 'targetLanguage': 'zh'},
                    headers={'X-API-Secret': 'wrong'})
    assert r.status_code == 403


def test_body_apikey_ignored(client):
    """An apiKey in the request body is silently ignored."""
    mock_result = TranslationResult(translatedText="你好", confidence=0.92, notes="Test")
    with patch('backend.app.orchestrator.translate', new_callable=AsyncMock) as mock_translate:
        mock_translate.return_value = mock_result
        r = client.post('/api/translate',
                        json={'text': 'Hello', 'targetLanguage': 'zh',
                              'apiKey': 'should_be_ignored'},
                        headers=AUTH)
    assert r.status_code == 200
    assert r.json()['success'] is True


# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------

def test_translate_success(client):
    """Authenticated request returns parsed JSON translation."""
    mock_result = TranslationResult(translatedText="你好", confidence=0.92, notes="Test")
    with patch('backend.app.orchestrator.translate', new_callable=AsyncMock) as mock_translate:
        mock_translate.return_value = mock_result
        r = client.post('/api/translate',
                        json={'text': 'Hello', 'targetLanguage': 'zh',
                              'context': 'Greeting'},
                        headers=AUTH)
    assert r.status_code == 200
    d = r.json()
    assert d['success'] is True
    assert d['translatedText'] == '你好'
    assert d['confidence'] == 0.92


def test_translate_missing_params(client):
    """Missing required params → 422 for Pydantic validation."""
    r = client.post('/api/translate',
                    json={'text': 'Hello'},  # no targetLanguage
                    headers=AUTH)
    assert r.status_code == 422


def test_translate_no_context(client):
    """Translation works without optional context."""
    mock_result = TranslationResult(translatedText="你好", confidence=0.92, notes="Test")
    with patch('backend.app.orchestrator.translate', new_callable=AsyncMock) as mock_translate:
        mock_translate.return_value = mock_result
        r = client.post('/api/translate',
                        json={'text': 'Hello', 'targetLanguage': 'zh'},
                        headers=AUTH)
    assert r.status_code == 200
    assert r.json()['success'] is True


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------

def test_rate_limit(client):
    """Exceeding the rate limit returns 429."""
    from backend.services.rate_limiter import get_counters
    counters = get_counters()
    bucket = int(time.time() // 60)
    counters[('testclient', bucket)] = 100  # already at limit

    r = client.post('/api/translate',
                    json={'text': 'Hello', 'targetLanguage': 'zh'},
                    headers=AUTH)
    assert r.status_code == 429
    if ('testclient', bucket) in counters:
        del counters[('testclient', bucket)]


# ---------------------------------------------------------------------------
# Probes (legacy compat)
# ---------------------------------------------------------------------------

def test_analytics_legacy(client):
    """Old /api/analytics removed; verify health is still reachable."""
    r = client.get('/api/health')
    assert r.status_code == 200
