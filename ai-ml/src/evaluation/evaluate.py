"""
SafeMaga Model Evaluation Module.
Computes test set metrics (Accuracy, Precision, Recall, F1, ROC-AUC)
and generates diagnostic summaries.
"""

import os
import logging
import joblib
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def evaluate_saved_model(model_path: str = None):
    """
    Loads saved model checkpoint and evaluates against benchmark dataset.
    """
    if not model_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "saved_models", "baseline_model.joblib")

    if not os.path.exists(model_path):
        logger.error(f"Model file not found at: {model_path}. Train a model first via src/training/train.py.")
        return None

    model = joblib.load(model_path)
    logger.info(f"Loaded model artifact from: {model_path}")

    # Generate benchmark evaluation data
    np.random.seed(99)
    X_test = np.random.randn(200, 4)
    y_test = (X_test[:, 0] * 1.5 + X_test[:, 1] * -2.0 + np.random.randn(200) > 0).astype(int)

    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

    logger.info("Evaluation Confusion Matrix:")
    logger.info("\n" + str(confusion_matrix(y_test, preds)))

    logger.info("Classification Report:")
    report = classification_report(y_test, preds, output_dict=True)
    logger.info("\n" + classification_report(y_test, preds))

    auc = roc_auc_score(y_test, probs) if probs is not None else None
    if auc is not None:
        logger.info(f"ROC-AUC Score: {auc:.4f}")

    return {
        "classification_report": report,
        "roc_auc": auc,
    }


if __name__ == "__main__":
    evaluate_saved_model()
