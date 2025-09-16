# app/ml/trainer.py
from __future__ import annotations
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from joblib import dump

from app.ml.features import build_diagnostic_features
from app.ml.model_registry import save_model

def _label_from_accuracy(acc: float) -> int:
    # Umbrales simples: <0.5 → 1, 0.5..0.8 → 2, >0.8 → 3
    if acc is None:
        return 1
    if acc >= 0.8:
        return 3
    if acc >= 0.5:
        return 2
    return 1

def _vec_from_features(f: Dict[str, Any]) -> List[float]:
    g = f.get("global", {})
    by = f.get("by_difficulty", {})
    s = f.get("signals", {})
    return [
        float(g.get("accuracy") or 0.0),
        float(g.get("avg_score") or 0.0),
        float(by.get("EASY", {}).get("accuracy") or 0.0),
        float(by.get("MEDIUM", {}).get("accuracy") or 0.0),
        float(by.get("HARD", {}).get("accuracy") or 0.0),
        float(s.get("avg_time_sec") or 0.0),
        float(s.get("avg_hints_used") or 0.0),
    ]

def fetch_student_ids(db: Session, min_attempts: int = 5) -> List[str]:
    q = text("""
        SELECT payload->>'studentId' AS sid
        FROM advisor_events
        GROUP BY sid
        HAVING COUNT(*) >= :min_attempts
    """)
    return [r[0] for r in db.execute(q, {"min_attempts": min_attempts}).all() if r[0]]

def train_rf_level_classifier(db: Session, *, min_attempts: int = 5, n_estimators: int = 200, random_state: int = 42) -> Dict[str, Any]:
    sids = fetch_student_ids(db, min_attempts=min_attempts)
    X, y = [], []
    for sid in sids:
        feats = build_diagnostic_features(db, student_id=sid, window_start=None, window_end=None)
        acc = feats.get("global", {}).get("accuracy")
        label = _label_from_accuracy(acc)
        X.append(_vec_from_features(feats))
        y.append(label)

    if not X:
        return {"trained": False, "reason": "no_data"}

    X = np.array(X, dtype=float)
    y = np.array(y, dtype=int)

    # split simple hold-out 80/20
    np.random.seed(random_state)
    idx = np.arange(len(X))
    np.random.shuffle(idx)
    cut = int(len(idx) * 0.8)
    tr, te = idx[:cut], idx[cut:]
    Xtr, ytr = X[tr], y[tr]
    Xte, yte = X[te], y[te] if len(te) else (Xtr, ytr)

    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=None,
        random_state=random_state,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )
    model.fit(Xtr, ytr)

    ypred = model.predict(Xte)
    acc = float(accuracy_score(yte, ypred))

    # versión rf-YYYYMMDDHHMM
    version = datetime.now(timezone.utc).strftime("rf-%Y%m%d%H%M")
    metrics = {
        "acc_holdout": acc,
        "n_samples": int(len(X)),
        "n_features": int(X.shape[1]),
        "min_attempts": min_attempts,
        "random_state": random_state,
        "n_estimators": n_estimators,
        "classes_": [int(c) for c in getattr(model, "classes_", [])],
        "feature_importances_": [float(v) for v in getattr(model, "feature_importances_", [])],
    }
    save_model(model, version=version, metrics=metrics)
    return {"trained": True, "version": version, "metrics": metrics}
