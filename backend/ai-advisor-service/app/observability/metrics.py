# app/observability/metrics.py
from __future__ import annotations
import time
from contextlib import contextmanager
from prometheus_client import Counter, Histogram, Gauge

# ---------------- HTTP ----------------
http_requests_total = Counter(
    "http_requests_total",
    "Total de requests HTTP",
    ["method", "path", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "Duración de requests HTTP en segundos",
    ["method", "path", "status"],
)

# ---------------- Dominio: Advisor ----------------
advisor_reco_latency_seconds = Histogram(
    "advisor_reco_latency_seconds",
    "Latencia de generación de recomendaciones",
    []
)

advisor_chat_latency_seconds = Histogram(
    "advisor_chat_latency_seconds",
    "Latencia de respuestas de chat",
    []
)

advisor_rag_hits_total = Counter(
    "advisor_rag_hits_total",
    "Consultas RAG con hit (docs relevantes encontrados)",
    []
)
advisor_rag_misses_total = Counter(
    "advisor_rag_misses_total",
    "Consultas RAG sin hit",
    []
)

advisor_progress_batch_seconds = Histogram(
    "advisor_progress_batch_seconds",
    "Latency of batch stats call to progress-service",
    buckets=(0.05, 0.1, 0.2, 0.5, 1, 2, 5),
)

advisor_reason_enrich_total = Counter(
    "advisor_reason_enrich_total",
    "Resultado del enriquecimiento de 'reason' con stats de Progress",
    ["result"]  # result in {hit, miss, error}
)

advisor_reco_events_total = Counter(
    "advisor_reco_events_total",
    "Eventos de interacción con recomendaciones",
    ["event"]  # OPEN|DISMISS|HOVER|IMPRESSION
)

advisor_reco_click_total = Counter(
    "advisor_reco_click_total",
    "Clicks (OPEN) en recomendaciones",
    ["difficulty", "source"]  # e.g. difficulty=EASY|MEDIUM|HARD|UNK, source=AI_RECO
)

# ✅ Métricas nuevas
advisor_reco_cache_total = Counter(
    "advisor_reco_cache_total",
    "Resultados de caché de recomendaciones",
    ["result"]  # hit|miss|error
)

advisor_reco_invalidate_total = Counter(
    "advisor_reco_invalidate_total",
    "Invalidaciones de caché de recomendaciones",
    ["source"]  # e.g. progress, diagnostic, manual
)

advisor_reco_recent_skips_total = Counter(
    "advisor_reco_recent_skips_total",
    "Veces que se saltó un exercise por estar en recientes",
    []
)

advisor_model_version_info = Gauge(
    "advisor_model_version_info",
    "Versión de modelo en servicio; se fija a 1 para la versión activa",
    ["version"],
)

def set_model_version(version: str) -> None:
    advisor_model_version_info.labels(version=version).set(1.0)

@contextmanager
def observe_latency(histogram: Histogram):
    start = time.perf_counter()
    try:
        yield
    finally:
        histogram.observe(time.perf_counter() - start)
