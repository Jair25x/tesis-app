# app/tests/test_health.py
from __future__ import annotations

def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_metrics_available(client):
    r = client.get("/metrics")
    assert r.status_code == 200
    assert "http_requests_total" in r.text
