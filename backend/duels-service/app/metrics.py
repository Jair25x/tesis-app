from prometheus_client import Counter, Histogram, Gauge

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
