# app/ml/model_registry.py
from __future__ import annotations
import json, os, glob
from typing import Dict, Any, Tuple, Optional
from pathlib import Path
from joblib import dump, load

MODEL_DIR = Path(os.getenv("ML_MODEL_DIR", "/app/app/ml/models")).resolve()
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# fallback heurístico (por si no hay modelo)
def _heuristic_classify_level(features: Dict[str, Any]) -> Tuple[int, Dict[str, float]]:
    acc = features.get("global", {}).get("accuracy") or 0.0
    med_acc = features.get("by_difficulty", {}).get("MEDIUM", {}).get("accuracy") or 0.0
    hard_acc = features.get("by_difficulty", {}).get("HARD", {}).get("accuracy") or 0.0
    if acc >= 0.8 and med_acc >= 0.7:
        level = 3
    elif acc >= 0.5:
        level = 2
    else:
        level = 1
    if level == 3:
        probs = {"1": 0.05, "2": 0.20, "3": 0.75}
    elif level == 2:
        probs = {"1": 0.20, "2": 0.60, "3": 0.20}
    else:
        probs = {"1": 0.70, "2": 0.25, "3": 0.05}
    return level, probs

def _vec_from_features(features: Dict[str, Any]) -> list[float]:
    g = features.get("global", {})
    by = features.get("by_difficulty", {})
    sig = features.get("signals", {})
    return [
        float(g.get("accuracy") or 0.0),
        float(g.get("avg_score") or 0.0),
        float(by.get("EASY", {}).get("accuracy") or 0.0),
        float(by.get("MEDIUM", {}).get("accuracy") or 0.0),
        float(by.get("HARD", {}).get("accuracy") or 0.0),
        float(sig.get("avg_time_sec") or 0.0),
        float(sig.get("avg_hints_used") or 0.0),
    ]

def list_models() -> list[dict]:
    out = []
    for pkl in sorted(MODEL_DIR.glob("rf-*.joblib")):
        version = pkl.stem  # rf-YYYYMMDDHHMM
        metrics_path = MODEL_DIR / f"{version}.metrics.json"
        metrics = {}
        if metrics_path.exists():
            try:
                metrics = json.loads(metrics_path.read_text("utf-8"))
            except Exception:
                metrics = {}
        out.append({"version": version, "path": str(pkl), "metrics": metrics})
    return out

def latest_version() -> Optional[str]:
    models = list_models()
    return models[-1]["version"] if models else None

def save_model(model, version: str, metrics: Dict[str, Any]):
    pkl = MODEL_DIR / f"{version}.joblib"
    dump(model, pkl)
    (MODEL_DIR / f"{version}.metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2), "utf-8")
    # puntero current
    (MODEL_DIR / "current.txt").write_text(version, "utf-8")

def load_version(version: Optional[str] = None):
    if not version:
        # intenta current, luego latest
        cur = (MODEL_DIR / "current.txt")
        if cur.exists():
            version = cur.read_text("utf-8").strip()
        else:
            version = latest_version()
    if not version:
        return None, None
    pkl = MODEL_DIR / f"{version}.joblib"
    if not pkl.exists():
        return None, None
    model = load(pkl)
    return version, model

def classify_level(features: Dict[str, Any]) -> Tuple[int, Dict[str, float], str]:
    version, model = load_version()
    if not model:
        level, probs = _heuristic_classify_level(features)
        return level, probs, "heuristic-v1"
    vec = _vec_from_features(features)
    import numpy as np
    X = np.array([vec], dtype=float)
    pred = int(model.predict(X)[0])
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        # asume clases [1,2,3]
        probs = {str(cls): float(p) for cls, p in zip(model.classes_, proba)}
        for k in ("1", "2", "3"):
            probs.setdefault(k, 0.0)
    else:
        probs = {"1": 0.0, "2": 1.0 if pred == 2 else 0.0, "3": 1.0 if pred == 3 else 0.0}
    return pred, probs, str(version)
