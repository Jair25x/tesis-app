# app/utils/time.py
from datetime import datetime, timezone
from typing import Optional

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def parse_iso8601(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None
