"""Module 2: train the visa approval-probability model.

    python -m src.training.train_guidance_visa_risk                  # synthetic data (pipeline demo)
    python -m src.training.train_guidance_visa_risk --data file.csv  # real anonymised outcomes
"""
import argparse
import json
import logging

from src.guidance.visa_risk import MODEL_PATH, train

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", help="CSV with the columns listed in docs/modules/module-2-legal-docs-costs.md")
    args = ap.parse_args()
    metrics = train(args.data)
    logging.info("Saved %s", MODEL_PATH)
    print(json.dumps(metrics, indent=2))
    if metrics["data_source"] == "synthetic":
        print("NOTE: trained on SYNTHETIC data - these numbers only show the pipeline works.")
