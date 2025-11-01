from __future__ import annotations
import asyncio
from datetime import datetime, timedelta, timezone
import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import DUELS_WAITING_TTL_MIN, DUELS_WAITING_SWEEP_INTERVAL_SEC
from ..metrics import duels_waiting_cancel_total, duels_waiting_open_gauge
from ..models import Match

log = logging.getLogger("duels.waiting_cleanup")

async def _cancel_expired(db: Session, *, now: datetime) -> int:
    ttl_delta = timedelta(minutes=int(DUELS_WAITING_TTL_MIN))
    threshold = now - ttl_delta

    rows = list(
        db.scalars(
            select(Match).where(
                Match.status == "WAITING",
                Match.created_at <= threshold
            )
        )
    )
    count = 0
    for m in rows:
        try:
            # Si no manejas CANCELLED todavía, cerramos como FINISHED sin winner
            m.status = "FINISHED"
            m.finished_at = now
            count += 1
        except Exception:
            log.exception("Error marcando FINISHED match_id=%s", getattr(m, "id", "?"))

    if count:
        try:
            db.commit()
        except Exception:
            db.rollback()
            log.exception("Commit falló al cancelar WAITING")
            count = 0
    return count

async def waiting_sweeper(db_factory, stop_event: asyncio.Event):
    log.info(
        "Starting waiting_sweeper ttl_min=%s interval=%ss",
        DUELS_WAITING_TTL_MIN, DUELS_WAITING_SWEEP_INTERVAL_SEC
    )
    while not stop_event.is_set():
        try:
            db = db_factory()
            try:
                now = datetime.now(timezone.utc)

                # Gauge de abiertos
                try:
                    total_open = db.query(Match).filter(Match.status == "WAITING").count()
                    duels_waiting_open_gauge.set(float(total_open))
                except Exception:
                    pass

                cancelled = await _cancel_expired(db, now=now)
                if cancelled:
                    duels_waiting_cancel_total.labels(reason="ttl_expired").inc(cancelled)
                    log.info("Waiting cleanup: %s matches cancelados por TTL", cancelled)

            finally:
                db.close()
        except Exception:
            log.exception("waiting_sweeper loop error")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=DUELS_WAITING_SWEEP_INTERVAL_SEC)
        except asyncio.TimeoutError:
            pass

    log.info("waiting_sweeper stopped")
