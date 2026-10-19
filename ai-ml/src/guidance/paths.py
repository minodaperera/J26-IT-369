"""Central file locations for Module 2 (Legal, Document & Cost Guidance) AI components."""
from pathlib import Path

AI_ML_ROOT = Path(__file__).resolve().parents[2]          # .../ai-ml
REPO_ROOT = AI_ML_ROOT.parent

RAW = AI_ML_ROOT / "data" / "raw"
PROCESSED = AI_ML_ROOT / "data" / "processed"
MODELS = AI_ML_ROOT / "saved_models" / "guidance"

# --- inputs ---
REQUIREMENTS_RAW_CSV = RAW / "comprehensive_visa_doc_dataset.csv"
DOC_TEXT_SAMPLES_CSV = RAW / "guidance_doc_text_samples.csv"   # optional: real OCR text, columns: text,category

# --- processed outputs ---
REQUIREMENTS_CLEAN_CSV = PROCESSED / "guidance_requirements_clean.csv"
VISA_RISK_SYNTHETIC_CSV = PROCESSED / "guidance_visa_risk_synthetic.csv"
# committed seed file consumed by backend/scripts/seedGuidance.js
REQUIREMENTS_SEED_JSON = REPO_ROOT / "database" / "seeds" / "guidance" / "requirements.json"

# --- model artifacts (git-ignored; regenerate with the training scripts) ---
VISA_RISK_MODEL = MODELS / "visa_risk_model.joblib"
VISA_RISK_METRICS = MODELS / "visa_risk_metrics.json"
DOC_CLASSIFIER_MODEL = MODELS / "doc_classifier.joblib"
DOC_CLASSIFIER_METRICS = MODELS / "doc_classifier_metrics.json"
