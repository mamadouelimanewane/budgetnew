from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import Payment, User
from app.rbac import require_role


router = APIRouter(tags=["ai"])

MODELS_DIR = Path(__file__).resolve().parents[2] / "models-store"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


class ForecastTrainIn(BaseModel):
    """
    Baseline: prévision mensuelle des paiements (dépenses) via régression sur index temporel.
    """

    months_back: int = Field(default=24, ge=3, le=120)


class ForecastOut(BaseModel):
    series: list[dict]
    next_months: list[dict]


@router.post("/forecast/train")
def train_forecast(
    payload: ForecastTrainIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst")),
) -> dict:
    try:
        import pandas as pd
        from joblib import dump
        from sklearn.linear_model import Ridge
    except Exception:
        raise HTTPException(status_code=400, detail="ML dependencies missing. Start backend with: .\\dev.ps1 -WithML")

    payments = db.scalars(select(Payment).order_by(Payment.created_at.asc())).all()
    if not payments:
        raise HTTPException(status_code=400, detail="No payments to train on")

    df = pd.DataFrame(
        [{"ts": p.created_at, "amount_xof": p.amount_xof} for p in payments if p.created_at is not None]
    )
    df["month"] = pd.to_datetime(df["ts"]).dt.to_period("M").dt.to_timestamp()
    monthly = df.groupby("month", as_index=False)["amount_xof"].sum().sort_values("month")
    if len(monthly) < 1:
        raise HTTPException(status_code=400, detail="Not enough points")

    # Keep last N months
    monthly = monthly.tail(payload.months_back)
    monthly = monthly.reset_index(drop=True)
    monthly["t"] = range(len(monthly))

    X = monthly[["t"]].values
    y = monthly["amount_xof"].values
    model = Ridge(alpha=1.0)
    model.fit(X, y)

    artifact = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "months_back": payload.months_back,
        "n_points": int(len(monthly)),
        "model": model,
        "last_month": str(monthly["month"].iloc[-1].date()),
    }
    dump(artifact, MODELS_DIR / "forecast-payments.joblib")

    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="train",
        entity="AI.Forecast",
        entity_id="forecast-payments",
        details={"months_back": payload.months_back, "n_points": int(len(monthly))},
    )
    return {"ok": True, "n_points": int(len(monthly))}


class ForecastQueryIn(BaseModel):
    next_months: int = Field(default=6, ge=1, le=36)


@router.post("/forecast/query", response_model=ForecastOut)
def forecast_query(
    payload: ForecastQueryIn,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "viewer")),
) -> ForecastOut:
    try:
        import pandas as pd
        from joblib import load
    except Exception:
        raise HTTPException(status_code=400, detail="ML dependencies missing. Start backend with: .\\dev.ps1 -WithML")

    model_path = MODELS_DIR / "forecast-payments.joblib"
    if not model_path.exists():
        raise HTTPException(status_code=400, detail="Model not trained. Call POST /ai/forecast/train first.")
    artifact = load(model_path)
    model = artifact["model"]

    payments = db.scalars(select(Payment).order_by(Payment.created_at.asc())).all()
    df = pd.DataFrame([{"ts": p.created_at, "amount_xof": p.amount_xof} for p in payments if p.created_at is not None])
    df["month"] = pd.to_datetime(df["ts"]).dt.to_period("M").dt.to_timestamp()
    monthly = df.groupby("month", as_index=False)["amount_xof"].sum().sort_values("month").reset_index(drop=True)
    monthly["t"] = range(len(monthly))

    last_t = int(monthly["t"].iloc[-1])
    next_idx = list(range(last_t + 1, last_t + 1 + payload.next_months))
    yhat = model.predict([[t] for t in next_idx]).tolist()

    last_month = monthly["month"].iloc[-1]
    next_months = []
    for i, t in enumerate(next_idx):
        m = (last_month + pd.offsets.MonthBegin(i + 1)).to_pydatetime()
        next_months.append({"month": m.date().isoformat(), "pred_amount_xof": int(max(0, round(yhat[i])))})

    series = [
        {"month": m.to_pydatetime().date().isoformat(), "amount_xof": int(a)}
        for m, a in zip(monthly["month"], monthly["amount_xof"])
    ]
    return ForecastOut(series=series, next_months=next_months)


class AnomalyTrainIn(BaseModel):
    contamination: float = Field(default=0.05, ge=0.001, le=0.3)


@router.post("/anomaly/train")
def train_anomaly(
    payload: AnomalyTrainIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst")),
) -> dict:
    try:
        import numpy as np
        from joblib import dump
        from sklearn.ensemble import IsolationForest
    except Exception:
        raise HTTPException(status_code=400, detail="ML dependencies missing. Start backend with: .\\dev.ps1 -WithML")

    rows = db.scalars(select(Payment).order_by(Payment.created_at.asc())).all()
    if len(rows) < 10:
        raise HTTPException(status_code=400, detail="Not enough payments to train anomaly model (need >= 10)")

    def features(p: Payment) -> list[float]:
        ts = p.created_at or datetime.now(timezone.utc)
        return [
            float(p.amount_xof),
            float(ts.hour),
            float(ts.weekday()),
        ]

    X = np.array([features(p) for p in rows], dtype=float)
    model = IsolationForest(n_estimators=200, contamination=payload.contamination, random_state=42)
    model.fit(X)
    dump({"trained_at": datetime.now(timezone.utc).isoformat(), "model": model}, MODELS_DIR / "anomaly-payments.joblib")

    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="train",
        entity="AI.Anomaly",
        entity_id="anomaly-payments",
        details={"n_points": len(rows), "contamination": payload.contamination},
    )
    return {"ok": True, "n_points": len(rows)}


class PaymentRiskOut(BaseModel):
    payment_id: int
    score: float
    is_anomaly: bool


@router.get("/anomaly/score/payments", response_model=list[PaymentRiskOut])
def score_payments(
    limit: int = 200,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "viewer")),
) -> list[PaymentRiskOut]:
    try:
        import numpy as np
        from joblib import load
    except Exception:
        raise HTTPException(status_code=400, detail="ML dependencies missing. Start backend with: .\\dev.ps1 -WithML")

    model_path = MODELS_DIR / "anomaly-payments.joblib"
    if not model_path.exists():
        raise HTTPException(status_code=400, detail="Model not trained. Call POST /ai/anomaly/train first.")
    model = load(model_path)["model"]

    limit = max(1, min(limit, 2000))
    rows = db.scalars(select(Payment).order_by(Payment.id.desc()).limit(limit)).all()

    def features(p: Payment) -> list[float]:
        ts = p.created_at or datetime.now(timezone.utc)
        return [float(p.amount_xof), float(ts.hour), float(ts.weekday())]

    X = np.array([features(p) for p in rows], dtype=float)
    # IsolationForest: decision_function higher is more normal; we invert to risk score
    normality = model.decision_function(X).tolist()
    preds = model.predict(X).tolist()  # -1 anomaly, 1 normal
    out = []
    for p, n, pr in zip(rows, normality, preds):
        score = float(max(0.0, -n))
        out.append(PaymentRiskOut(payment_id=p.id, score=score, is_anomaly=(pr == -1)))
    return out

