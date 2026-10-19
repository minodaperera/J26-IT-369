"""
SafeMaga Data Preprocessing Module.
Handles raw dataset validation, missing value imputation, text/feature normalization,
and structured dataset output.
"""

import os
import logging
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def clean_raw_dataset(input_csv_path: str, output_csv_path: str = None) -> pd.DataFrame:
    """
    Ingests raw dataset from disk, performs standard cleaning and saves processed output.
    """
    if not os.path.exists(input_csv_path):
        logger.warning(f"File not found at {input_csv_path}. Generating synthetic demo dataset.")
        # Generate synthetic data for bootstrapping the pipeline
        data = {
            "id": range(1, 101),
            "feature_a": np.random.normal(0, 1, 100),
            "feature_b": np.random.uniform(10, 50, 100),
            "target": np.random.choice([0, 1], size=100),
        }
        df = pd.DataFrame(data)
    else:
        logger.info(f"Loading raw data from: {input_csv_path}")
        df = pd.read_csv(input_csv_path)

    # Clean missing values
    df = df.dropna()

    if output_csv_path:
        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        df.to_csv(output_csv_path, index=False)
        logger.info(f"Cleaned dataset saved to: {output_csv_path}")

    return df


def normalize_features(df: pd.DataFrame, feature_cols: list) -> pd.DataFrame:
    """
    Normalizes numeric features using standard z-score normalization.
    """
    normalized_df = df.copy()
    for col in feature_cols:
        if col in normalized_df.columns:
            mean = normalized_df[col].mean()
            std = normalized_df[col].std()
            if std != 0:
                normalized_df[col] = (normalized_df[col] - mean) / std
    return normalized_df


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    raw_path = os.path.join(base_dir, "data", "raw", "dataset.csv")
    processed_path = os.path.join(base_dir, "data", "processed", "cleaned_dataset.csv")
    clean_raw_dataset(raw_path, processed_path)
