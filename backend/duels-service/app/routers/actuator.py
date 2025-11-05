# app/routers/actuator.py
from fastapi import APIRouter
import os

router = APIRouter()

def _health_payload():
    return {"status": "UP", "groups": ["liveness", "readiness"]}

def _info_payload():
    return {
        "app": "duels-service",
        "version": os.getenv("APP_VERSION", "unknown"),
        "env": os.getenv("ENV", os.getenv("SPRING_PROFILES_ACTIVE", "dev")),
    }

@router.get("/health", tags=["actuator"])
def health():
    return _health_payload()

@router.get("/actuator/health", tags=["actuator"])
def actuator_health():
    return _health_payload()

@router.get("/actuator/info", tags=["actuator"])
def actuator_info():
    return _info_payload()
