"""Test fixtures for backend tests."""

import os
import pytest

# Ensure test-specific env vars are set BEFORE importing the app
os.environ.setdefault('GEMINI_API_KEY', 'test_key')
os.environ.setdefault('RATE_LIMIT_PER_MINUTE', '100')
os.environ.setdefault('REQUEST_TIMEOUT_SECONDS', '5')
os.environ.setdefault('API_SECRET', 'test_secret')


@pytest.fixture(scope='session')
def app():
    """Create and return the Flask test application."""
    from backend.app import app as flask_app
    return flask_app


@pytest.fixture()
def client(app):
    """Create a test client for the app."""
    return app.test_client()
