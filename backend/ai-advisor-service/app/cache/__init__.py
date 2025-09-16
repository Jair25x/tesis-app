# app/cache/__init__.py
from .redis_cache import get_redis, redis_available

__all__ = ["get_redis", "redis_available"]
