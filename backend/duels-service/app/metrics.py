from __future__ import annotations
from prometheus_client import Counter, Histogram, Gauge

# --- TUS MÉTRICAS (se conservan) ---
duels_matches_total = Counter(
    "duels_matches_total", "Matches lifecycle", ["status"]  # created|finished|cancelled
)

duels_ws_connections = Gauge(
    "duels_ws_connections", "Active websocket connections", ["state"]  # open|closed
)

duels_round_duration_seconds = Histogram(
    "duels_round_duration_seconds", "Round duration",
    buckets=(1.0, 2.0, 3.0, 5.0, 10.0, float("inf"))
)

duels_answers_total = Counter(
    "duels_answers_total", "Answers per round", ["correct"]  # "true"/"false"
)

duels_check_latency_seconds = Histogram(
    "duels_check_latency_seconds", "Latency calling curriculum check",
    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, float("inf"))
)

# --- NUEVAS: para disponibilidad/HTTP/creación/sweeper ---
duels_http_errors_total = Counter(
    "duels_http_errors_total",
    "HTTP errors by endpoint and code",
    ["endpoint", "code"],
)

duels_create_total = Counter(
    "duels_create_total",
    "Create match results",
    ["result"],  # ok | validation_error | error
)

duels_create_latency_seconds = Histogram(
    "duels_create_latency_seconds",
    "Latency for creating a match (seconds)",
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5),
)

duels_availability_latency_seconds = Histogram(
    "duels_availability_latency_seconds",
    "Latency when checking availability against curriculum",
    buckets=(0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2),
)

duels_availability_source_total = Counter(
    "duels_availability_source_total",
    "Availability source usage",
    ["source"],  # server | sample
)

duels_waiting_cancel_total = Counter(
    "duels_waiting_cancel_total",
    "Matches cancelled by waiting TTL",
    ["reason"],  # ttl_expired | force
)

duels_waiting_open_gauge = Gauge(
    "duels_waiting_open",
    "Number of WAITING matches currently open (db count sampled by sweeper)",
)
