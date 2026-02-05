"""Tests for request/response logging middleware and DB status in logs."""
import logging
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_logging_middleware_logs_request_and_response(caplog):
    """Middleware logs request_entry (method, path) and response_outcome (status, outcome)."""
    caplog.set_level(logging.INFO, logger="app.middleware.logging")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    log_text = caplog.text
    assert "request_entry" in log_text
    assert "response_outcome" in log_text
    assert "method=GET" in log_text
    assert "path=/health" in log_text
    assert "status=200" in log_text
    assert "outcome=success" in log_text
