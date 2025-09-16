# app/observability/metrics.py
from __future__ import annotations
import time
from contextlib import contextmanager
from prometheus_client import Counter, Histogram, Gauge

# Métricas HTTP generales
http_requests_total = Counter(
    "http_requests_total",
    "Total de requests HTTP",
    ["method", "path", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "Duración de requests HTTP en segundos",
    ["method", "path", "status"],
    # Buckets por defecto; puedes ajustar si lo necesitas.
)

# Métricas de dominio
advisor_reco_latency_seconds = Histogram(
    "advisor_reco_latency_seconds", "Latencia de generación de recomendaciones", []
)
advisor_chat_latency_seconds = Histogram(
    "advisor_chat_latency_seconds", "Latencia de respuestas de chat", []
)

advisor_rag_hits_total = Counter(
    "advisor_rag_hits_total", "Consultas RAG con hit (docs relevantes encontrados)", []
)
advisor_rag_misses_total = Counter(
    "advisor_rag_misses_total", "Consultas RAG sin hit", []
)

# "Info" de versión de modelo usando Gauge etiquetado:
advisor_model_version_info = Gauge(
    "advisor_model_version_info",
    "Versión de modelo en servicio; se fija a 1 para la versión activa",
    ["version"],
)

def set_model_version(version: str) -> None:
    advisor_model_version_info.labels(version=version).set(1.0)


@contextmanager
def observe_latency(histogram: Histogram):
    """Context manager para medir y registrar latencias con un Histogram."""
    start = time.perf_counter()
    try:
        yield
    finally:
        histogram.observe(time.perf_counter() - start)
