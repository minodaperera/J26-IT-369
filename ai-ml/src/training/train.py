"""
SafeMaga Model Training Pipeline.
Trains a baseline classification/regression model, tracks parameters,
and serializes artifacts to saved_models/.
"""

import os
import logging
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def train_model(
    model_save_path: str = None,
    random_seed: int = 42,
    test_size: float = 0.2
):
    """
    Executes end-to-end model training, validation, and artifact serialization.
    """
    logger.info("Initializing synthetic research training dataset...")
    np.random.seed(random_seed)
    
    # Baseline features
    X = np.random.randn(500, 4)
    y = (X[:, 0] * 1.5 + X[:, 1] * -2.0 + np.random.randn(500) > 0).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_seed
    )

    logger.info(f"Training Logistic Regression baseline on {len(X_train)} samples...")
    model = LogisticRegression()
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    acc = accuracy_score(y_test, predictions)
    logger.info(f"Validation Accuracy: {acc:.4f}")
    logger.info("\n" + classification_report(y_test, predictions))

    if not model_save_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_save_path = os.path.join(base_dir, "saved_models", "baseline_model.joblib")

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(model, model_save_path)
    logger.info(f"Model artifact successfully saved to: {model_save_path}")

    return model, acc


if __name__ == "__main__":
    train_model()
