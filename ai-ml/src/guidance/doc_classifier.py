"""Document-category classifier: OCR text of an uploaded document -> one of the 5 requirement categories.

    python -m src.training.train_guidance_doc_classifier   # train + evaluate + save saved_models/guidance/doc_classifier.joblib

Categories (from the requirements CSV "Doc Type" column):
  Visa / Entry Permit | Standard Identity Papers | Financial Support | Health & Vaccinations | Accommodation & Itinerary

Training data
  1. The requirement sentences in data/comprehensive_visa_doc_dataset.csv (country names removed).
     NOTE: this file contains only 5 distinct sentences per purpose, so it is a very small training set.
  2. SEED phrases below - hand-written examples of what each document type looks like after OCR.
  3. Optional data/raw/guidance_doc_text_samples.csv with columns `text,category` - add REAL OCR text from real
     (anonymised) documents here and re-run; this is the single best way to improve accuracy.

Evaluation: HOLDOUT phrases are never used for training, and the model is first trained on the CSV alone and
tested on them to show how well it generalises to different wording than the CSV. The numbers are indicative
only - the holdout was written by the developers, not collected from real documents.
"""
import json
import re

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline

from .paths import DOC_CLASSIFIER_METRICS as METRICS
from .paths import DOC_CLASSIFIER_MODEL as MODEL
from .paths import DOC_TEXT_SAMPLES_CSV as EXTRA
from .paths import REQUIREMENTS_CLEAN_CSV as CSV
PURPOSES = ["traveler", "medical", "business", "student", "child"]
MIN_CONFIDENCE = 0.45

SEED = {
    "Visa / Entry Permit": [
        "Electronic Travel Authorization approved reference number valid for multiple entries until",
        "Visa grant notice you are permitted to enter and remain for 30 days single entry",
        "Embassy visa label type visitor number of entries multiple valid from valid until",
        "e-visa approval letter application ID status granted entry permit",
        "Return flight e-ticket booking reference departure arrival passenger name",
        "Entry permit issued by the immigration department of the destination country",
    ],
    "Standard Identity Papers": [
        "Passport type P code LKA surname given names nationality Sri Lankan date of birth place of birth date of expiry",
        "Democratic Socialist Republic of Sri Lanka National Identity Card ID number",
        "Police clearance certificate Sri Lanka Police no adverse record found",
        "Certificate of birth Registrar General's Department date of birth place of birth",
        "Marriage certificate registrar district full names of parties",
        "P<LKA machine readable zone passport number nationality sex expiry",
    ],
    "Financial Support": [
        "Bank statement account number period opening balance closing balance LKR credits debits",
        "Pay slip employee salary basic allowances EPF ETF deductions net pay",
        "Income tax assessment taxable income inland revenue department year of assessment",
        "Fixed deposit certificate maturity value interest rate account holder",
        "Affidavit of support sponsor declares to bear all expenses of the applicant",
        "Company bank statement business registration certificate annual turnover",
    ],
    "Health & Vaccinations": [
        "International certificate of vaccination yellow fever dose date batch number",
        "Medical report hospital patient diagnosis treatment recommended consultant physician",
        "Travel insurance policy certificate coverage medical expenses repatriation sum insured",
        "Medical examination fitness certificate chest x-ray blood test results fit to travel",
        "Vaccination card polio MMR immunisation record date administered",
        "Health insurance policy cover emergency hospitalisation period of cover",
    ],
    "Accommodation & Itinerary": [
        "Hotel reservation confirmation guest name check-in check-out nights room type",
        "Travel itinerary day 1 arrival day 2 sightseeing day 3 departure",
        "Invitation letter I am pleased to invite my friend to stay at my residence address",
        "Booking confirmation apartment host address dates of stay total price",
        "Letter of accommodation university student housing dormitory room allocated from semester",
        "Conference registration business meeting schedule agenda venue dates",
    ],
}

HOLDOUT = {  # never trained on - evaluation only
    "Visa / Entry Permit": [
        "Your visa application has been approved, please print this grant letter",
        "ETA number issued traveller may enter the country for tourism up to 90 days",
        "Visitor visa sticker valid for one entry affixed in passport",
        "Airline ticket PNR flight number seat return journey confirmed",
        "Approval notice entry clearance granted to the holder",
    ],
    "Standard Identity Papers": [
        "Republic of Sri Lanka passport holder photograph signature date of issue",
        "NIC number date of birth gender address Department of Registration of Persons",
        "Report of police verification applicant has no criminal convictions",
        "Birth certificate of the child father mother registered",
        "Name surname nationality sex date of expiry passport no",
    ],
    "Financial Support": [
        "Statement of account savings current balance transactions deposits withdrawals bank",
        "Salary certificate employer confirms monthly earnings of the employee",
        "Letter from sponsor undertaking to finance accommodation and travel costs",
        "Audited financial statements profit and loss business owner",
        "Savings account passbook balance sufficient funds",
    ],
    "Health & Vaccinations": [
        "Doctor's letter patient condition requires specialised treatment abroad",
        "Insurance schedule policyholder medical cover emergency evacuation limit",
        "Immunization certificate vaccines received dates signed by health officer",
        "Laboratory report haemoglobin blood sugar normal medically fit",
        "Health certificate confirming the traveller is free of infectious disease",
    ],
    "Accommodation & Itinerary": [
        "Reservation number hotel arrival date departure date adults rooms",
        "Planned itinerary of cities and activities during the trip",
        "Host letter confirming the visitor will stay at our home",
        "Rental booking property address check in instructions guest",
        "Schedule of meetings with clients trade fair registration",
    ],
}


def _norm(t: str) -> str:
    return re.sub(r"\s+", " ", str(t)).strip()


def csv_texts():
    df = pd.read_csv(CSV)
    rows = set()
    for r in df.itertuples():
        for p in PURPOSES:
            text = re.sub(re.escape(r.country), "the destination", str(getattr(r, p)), flags=re.I)
            rows.add((_norm(text), r.category))
    return sorted(rows)


def extra_texts():
    if not EXTRA.exists():
        return []
    d = pd.read_csv(EXTRA)
    return [(_norm(t), c) for t, c in zip(d["text"], d["category"])]


def pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
        ("clf", LogisticRegression(C=8, max_iter=2000, class_weight="balanced")),
    ])


def flatten(d):
    return [(_norm(t), c) for c, ts in d.items() for t in ts]


def train():
    csv_rows, seed_rows, extra_rows, hold = csv_texts(), flatten(SEED), extra_texts(), flatten(HOLDOUT)
    X_h, y_h = [t for t, _ in hold], [c for _, c in hold]

    # 1) generalisation test: train on the CSV ONLY, test on independently-worded holdout
    m_csv = pipeline().fit([t for t, _ in csv_rows], [c for _, c in csv_rows])
    p_csv = m_csv.predict(X_h)
    csv_only = {"train_rows": len(csv_rows), "holdout_accuracy": round(accuracy_score(y_h, p_csv), 3)}

    # 2) final model: CSV + seed phrases (+ optional real samples)
    all_rows = csv_rows + seed_rows + extra_rows
    X, y = [t for t, _ in all_rows], [c for _, c in all_rows]
    model = pipeline().fit(X, y)
    p = model.predict(X_h)
    final = {
        "train_rows": len(all_rows), "holdout_rows": len(hold),
        "holdout_accuracy": round(accuracy_score(y_h, p), 3),
        "holdout_macro_f1": round(f1_score(y_h, p, average="macro"), 3),
    }
    # 3) cross-validation on training rows (optimistic: CSV sentences repeat across purposes)
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    cv_acc = accuracy_score(y, cross_val_predict(pipeline(), X, y, cv=cv))

    metrics = {
        "note": "Indicative only. The CSV has 5 distinct sentences per purpose; the holdout is developer-written, "
                "not real OCR output. Add real samples to data/raw/guidance_doc_text_samples.csv and retrain.",
        "trained_on_csv_only": csv_only, "final_model": final, "cross_val_accuracy_train_rows": round(cv_acc, 3),
        "real_samples_used": len(extra_rows), "classes": list(model.classes_),
    }
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL)
    METRICS.write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))
    print(classification_report(y_h, p, zero_division=0))


_model = None


def load():
    global _model
    if _model is None:
        if not MODEL.exists():
            raise FileNotFoundError("Document classifier not trained. Run: python -m src.training.train_guidance_doc_classifier")
        _model = joblib.load(MODEL)
    return _model


def classify(text: str) -> dict:
    """Return {category|None, confidence, scores}. category is None when the model is not confident."""
    text = _norm(text)
    if len(text) < 15:
        return {"category": None, "confidence": 0.0, "scores": {}}
    m = load()
    proba = m.predict_proba([text])[0]
    i = int(np.argmax(proba))
    conf = float(proba[i])
    return {"category": str(m.classes_[i]) if conf >= MIN_CONFIDENCE else None, "confidence": round(conf, 3),
            "scores": {str(c): round(float(p), 3) for c, p in zip(m.classes_, proba)}}
