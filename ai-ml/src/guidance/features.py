"""Shared feature definitions for the visa approval model."""
import pandas as pd

NUMERIC = [
    "country_difficulty", "age", "monthly_income_lkr", "savings_lkr", "travel_history_count",
    "previous_rejections", "bank_statement_months", "trip_days", "funds_ratio",
]
BOOLEAN = ["has_return_ticket", "has_accommodation", "has_sponsor_or_invitation"]
CATEGORICAL = ["employment"]
EMPLOYMENT = ["employed", "self_employed", "student", "unemployed"]


def to_frame(rows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    cost = df["estimated_trip_cost_lkr"].clip(lower=1)
    df["funds_ratio"] = (df["savings_lkr"] / cost).clip(0, 5)
    for b in BOOLEAN:
        df[b] = df[b].astype(int)
    return df[NUMERIC + BOOLEAN + CATEGORICAL]
