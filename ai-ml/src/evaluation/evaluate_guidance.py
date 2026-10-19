"""Module 2: print the saved training/evaluation metrics of the guidance models."""
import json

from src.guidance.paths import DOC_CLASSIFIER_METRICS, VISA_RISK_METRICS


def show(title, path):
    print(f"\n=== {title} ({path.name}) ===")
    print(json.dumps(json.loads(path.read_text()), indent=2) if path.exists() else "not trained yet")


if __name__ == "__main__":
    show("Visa approval-risk model", VISA_RISK_METRICS)
    show("Document-category classifier", DOC_CLASSIFIER_METRICS)
