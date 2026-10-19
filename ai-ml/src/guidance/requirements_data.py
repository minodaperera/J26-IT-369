"""Clean the document-requirements CSV and export it for the backend.

    python -m src.preprocessing.clean_guidance_requirements            # reads data/raw/comprehensive_visa_doc_dataset.csv
    python -m src.preprocessing.clean_guidance_requirements --csv x.csv

Outputs
  data/processed/guidance_requirements_clean.csv   tidy long-format table (one row per country x category)
  ../database/seeds/guidance/requirements.json     country-level records the backend seeds into MongoDB

Why this is a lookup and not a trained model: the CSV states which documents are required for a given
country and purpose. Predicting that from data would be less accurate than reading it. ML is used
elsewhere (src/guidance/doc_classifier.py) to match *uploaded documents* to these requirement categories.
"""
import argparse
import json
import re

import pandas as pd

from .paths import REQUIREMENTS_CLEAN_CSV as CLEAN_CSV
from .paths import REQUIREMENTS_RAW_CSV as DEFAULT_CSV
from .paths import REQUIREMENTS_SEED_JSON as SEED_JSON

COLS = ["country", "passport_type", "visa_type", "entry_type", "doc_no", "category",
        "traveler", "medical", "business", "student", "child", "notes", "biometrics", "interview"]
PURPOSES = ["traveler", "medical", "business", "student", "child"]

# Spelling / naming fixes found in the raw file (keys are lower-case raw values)
COUNTRY_FIX = {
    "malayasia": "Malaysia", "italty": "Italy", "new zealend": "New Zealand", "china": "China",
    "south africa": "South Africa", "united kingdom": "United Kingdom", "uae": "United Arab Emirates",
    "usa": "United States",
}


def slugify(s: str) -> str:
    return re.sub(r"[^a-z]+", "-", s.lower()).strip("-")


def clean(df: pd.DataFrame):
    df = df.copy()
    df.columns = COLS
    report = []

    raw_names = df["country"].astype(str).str.strip()
    df["raw_country"] = raw_names
    df["country"] = raw_names.map(lambda n: COUNTRY_FIX.get(n.lower(), n.title() if n.islower() else n))
    for raw, fixed in sorted({(r, c) for r, c in zip(df.raw_country, df.country) if r != c}):
        report.append(f"country '{raw}' -> '{fixed}'")

    # also fix the country name inside the sentences ("trip to Malayasia.")
    for p in PURPOSES:
        df[p] = [str(t).replace(raw, new) if raw != new else str(t)
                 for t, raw, new in zip(df[p], df.raw_country, df.country)]
        df[p] = df[p].str.strip()

    df["category"] = df["category"].str.strip()
    df["doc_no"] = df["doc_no"].astype(int)
    df = df.drop(columns=["visa_type"])  # empty in the source file
    report.append("dropped empty column 'visa_type'; renamed 'Interviwes' -> interview")

    yn = {"yes": True, "no": False}
    df["biometrics"] = df["biometrics"].astype(str).str.strip().str.lower().map(yn)
    df["interview"] = df["interview"].astype(str).str.strip().str.lower().map(yn)

    records = []
    for country, g in df.groupby("country", sort=False):
        g = g.sort_values("doc_no")
        first = g.iloc[0]
        records.append({
            "name": country, "slug": slugify(country),
            "passportType": first["passport_type"], "entryType": first["entry_type"],
            "biometrics": None if pd.isna(first["biometrics"]) else bool(first["biometrics"]),
            "interview": None if pd.isna(first["interview"]) else bool(first["interview"]),
            "notes": [] if (pd.isna(first["notes"]) or str(first["notes"]) == "nan") else [str(first["notes"]).strip()],
            "categories": [{"order": int(r.doc_no), "category": r.category,
                            "requirements": {p: getattr(r, p) for p in PURPOSES}} for r in g.itertuples()],
        })
    return df, records, report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=str(DEFAULT_CSV))
    args = ap.parse_args()

    df, records, report = clean(pd.read_csv(args.csv))
    CLEAN_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.drop(columns=["raw_country"]).to_csv(CLEAN_CSV, index=False)
    SEED_JSON.parent.mkdir(parents=True, exist_ok=True)
    SEED_JSON.write_text(json.dumps(records, indent=2, ensure_ascii=False))

    print(f"{len(df)} rows -> {len(records)} countries")
    print("Cleaning applied:"); [print("  -", r) for r in report]
    print("Wrote", CLEAN_CSV); print("Wrote", SEED_JSON)


if __name__ == "__main__":
    main()
