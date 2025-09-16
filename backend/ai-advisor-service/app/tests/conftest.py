# app/tests/conftest.py
from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def student_headers():
    # Bypass JWT usando el modo "interno" del gateway: headers X-Internal-Call + roles
    return {
        "X-Internal-Call": "gateway",
        "X-Auth-Roles": "ROLE_STUDENT",
        "x-user-id": str(uuid.uuid4()),
    }


@pytest.fixture
def internal_headers():
    return {
        "X-Internal-Call": "gateway",
        "X-Auth-Roles": "ROLE_INTERNAL",
        "x-user-id": str(uuid.uuid4()),
    }
