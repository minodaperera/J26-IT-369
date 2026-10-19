"""Visa approval-probability model: synthetic data generator, training, prediction and weak-point analysis.

    python -m src.training.train_guidance_visa_risk                      # trains on generated synthetic data
    python -m src.training.train_guidance_visa_risk --data my_data.csv   # trains on REAL data (see docs/modules for the columns)

The synthetic generator encodes common-sense visa-officer logic (financial capacity, ties to home country,
travel history, prior refusals, strength of the trip plan). It exists so the pipeline runs end to end.
Replace it with real, anonymised application outcomes before making any accuracy claims in the thesis.
"""
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .features import BOOLEAN, CATEGORICAL, EMPLOYMENT, NUMERIC, to_frame

from .paths import VISA_RISK_METRICS as METRICS_PATH
from .paths import VISA_RISK_MODEL as MODEL_PATH
from .paths import VISA_RISK_SYNTHETIC_CSV as DATA_PATH


def generate(n: int = 6000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    emp = rng.choice(EMPLOYMENT, n, p=[0.55, 0.2, 0.15, 0.1])
    diff = rng.integers(1, 6, n)
    age = rng.integers(18, 66, n)
    income = np.where(emp == "unemployed", 0, np.where(emp == "student", rng.normal(25000, 10000, n),
                      rng.lognormal(11.6, 0.55, n))).clip(0)
    savings = (income * rng.uniform(0, 14, n) + rng.normal(0, 60000, n)).clip(0)
    cost = rng.uniform(250000, 900000, n)
    df = pd.DataFrame({
        "country_difficulty": diff, "age": age, "monthly_income_lkr": income.round(), "savings_lkr": savings.round(),
        "employment": emp,
        "travel_history_count": rng.poisson(1.2, n).clip(0, 15),
        "previous_rejections": rng.choice([0, 1, 2, 3], n, p=[0.8, 0.13, 0.05, 0.02]),
        "bank_statement_months": rng.choice([0, 1, 3, 6], n, p=[0.1, 0.15, 0.3, 0.45]),
        "has_return_ticket": rng.random(n) < 0.7,
        "has_accommodation": rng.random(n) < 0.65,
        "has_sponsor_or_invitation": rng.random(n) < 0.25,
        "trip_days": rng.integers(3, 60, n),
        "estimated_trip_cost_lkr": cost.round(),
    })
    X = to_frame(df.to_dict("records"))
    z = (
        -0.1
        - 0.55 * (X.country_difficulty - 3)
        + 0.9 * np.minimum(X.funds_ratio, 2.0) - 0.6
        + 0.30 * np.minimum(X.travel_history_count, 4)
        - 0.95 * X.previous_rejections
        + 0.12 * np.minimum(X.bank_statement_months, 6)
        + 0.55 * X.has_return_ticket + 0.50 * X.has_accommodation + 0.60 * X.has_sponsor_or_invitation
        + X.employment.map({"employed": 0.5, "self_employed": 0.1, "student": -0.1, "unemployed": -0.9})
        - 0.015 * np.maximum(X.trip_days - 30, 0)
        + 0.25 * (np.log1p(X.monthly_income_lkr) - 11) * (X.monthly_income_lkr > 0)
        + rng.normal(0, 0.6, n)
    )
    df["approved"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    return df


def build_pipeline() -> Pipeline:
    pre = ColumnTransformer([
        ("num", StandardScaler(), NUMERIC + BOOLEAN),
        ("cat", OneHotEncoder(categories=[EMPLOYMENT], handle_unknown="ignore"), CATEGORICAL),
    ])
    clf = GradientBoostingClassifier(n_estimators=250, max_depth=3, learning_rate=0.06, subsample=0.9, random_state=42)
    return Pipeline([("pre", pre), ("clf", clf)])


def train(data_csv=None) -> dict:
    """Train + evaluate + save. Pass a CSV path to train on real outcomes instead of synthetic data."""
    if data_csv:
        df = pd.read_csv(data_csv)
        source = f"real:{data_csv}"
    else:
        df = generate()
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
        source = "synthetic"

    X = to_frame(df.drop(columns=["approved"]).to_dict("records"))
    y = df["approved"].astype(int)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = build_pipeline().fit(X_tr, y_tr)
    proba = model.predict_proba(X_te)[:, 1]
    pred = (proba >= 0.5).astype(int)
    metrics = {
        "data_source": source, "rows": int(len(df)), "approval_rate": round(float(y.mean()), 3),
        "accuracy": round(float(accuracy_score(y_te, pred)), 3),
        "f1": round(float(f1_score(y_te, pred)), 3),
        "roc_auc": round(float(roc_auc_score(y_te, proba)), 3),
    }
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    global _model
    _model = None  # force reload of the new artifact
    return metrics


# ===================== prediction + weak points =====================
_model = None


def load():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError("Visa-risk model not trained yet. Run: python -m src.training.train_guidance_visa_risk")
        _model = joblib.load(MODEL_PATH)
    return _model


def metrics():
    return json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else {}


def _score(model, row: dict) -> float:
    return float(model.predict_proba(to_frame([row]))[0, 1])


def _fixes(row: dict):
    """(key, title, advice, modifier(row)->row) for each actionable factor currently weak."""
    cost = max(row["estimated_trip_cost_lkr"], 1)
    out = []
    if row["savings_lkr"] / cost < 1.5:
        need = int(max(0, cost * 1.5 - row["savings_lkr"]))
        out.append(("funds", "Insufficient proof of funds",
                    f"Show savings of at least 1.5x the estimated trip cost. You are about LKR {need:,} short.",
                    lambda r: {**r, "savings_lkr": cost * 1.5}))
    if row["bank_statement_months"] < 6:
        out.append(("bank", "Short bank statement history",
                    "Provide 6 months of consistent bank statements; sudden large deposits raise doubts.",
                    lambda r: {**r, "bank_statement_months": 6}))
    if not row["has_return_ticket"]:
        out.append(("ticket", "No return itinerary", "Include a refundable return flight reservation to show you intend to come back.",
                    lambda r: {**r, "has_return_ticket": True}))
    if not row["has_accommodation"]:
        out.append(("stay", "No accommodation proof", "Add hotel bookings or an invitation letter covering the full stay.",
                    lambda r: {**r, "has_accommodation": True}))
    if not row["has_sponsor_or_invitation"]:
        out.append(("sponsor", "No sponsor or invitation", "If applicable, add an invitation letter or sponsor declaration with their financial documents.",
                    lambda r: {**r, "has_sponsor_or_invitation": True}))
    if row["trip_days"] > 30:
        out.append(("duration", "Long planned stay", "Long stays draw more scrutiny. Consider a shorter itinerary or justify the duration clearly.",
                    lambda r: {**r, "trip_days": 30}))
    return out


def predict(row: dict) -> dict:
    model = load()
    base = _score(model, row)

    weak = []
    for key, title, advice, fix in _fixes(row):
        gain = _score(model, fix(row)) - base
        if gain >= 0.005:
            weak.append({"key": key, "title": title, "advice": advice, "impact_points": round(gain * 100, 1),
                         "actionable": True})
    weak.sort(key=lambda w: -w["impact_points"])

    # Context factors the applicant cannot change quickly - shown for transparency, no counterfactual.
    if row["previous_rejections"] > 0:
        weak.append({"key": "rejections", "title": "Previous visa refusal(s)",
                     "advice": "Address the exact reason for the earlier refusal in your cover letter; do not reapply unchanged.",
                     "impact_points": None, "actionable": False})
    if row["travel_history_count"] == 0:
        weak.append({"key": "history", "title": "No prior international travel",
                     "advice": "First-time travellers face more scrutiny. Strong ties to Sri Lanka (job, property, family) help.",
                     "impact_points": None, "actionable": False})
    if row["employment"] == "unemployed":
        weak.append({"key": "employment", "title": "No current employment",
                     "advice": "Provide evidence of other ties and a sponsor or invitation if possible.",
                     "impact_points": None, "actionable": False})

    risk = "low" if base >= 0.75 else "medium" if base >= 0.5 else "high"
    return {
        "approval_probability": round(base, 3),
        "rejection_probability": round(1 - base, 3),
        "risk_level": risk,
        "weak_points": weak,
        "disclaimer": "Estimate from a statistical model. Visa decisions are made by consular officers and are never guaranteed.",
        "model": metrics(),
    }
