# app/core/telemetry.py
"""
Telemetría opcional (OpenTelemetry / trazas distribuidas).
Actualmente no se inicializa nada. Mantén este módulo como punto
de entrada común si agregas tracing en el futuro.
"""

from typing import Optional

def init_tracing(service_name: str, endpoint: Optional[str] = None) -> None:
    """
    Inicializa tracing si tienes un collector. No-op por defecto.
    """
    return
