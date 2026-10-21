
"""
SafeMaga Research Component 4
Synthetic-data ML baseline experiment

Models:
1. TF-IDF + Logistic Regression
2. TF-IDF + Linear SVM

IMPORTANT:
This is a pipeline demonstration using synthetic data.
It does not establish real-world fraud detection accuracy.
"""

import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
)
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

RANDOM_STATE = 42
LABELS = ["Safe", "High-Risk Scam"]

# Locate project directories
BASE_DIR = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    BASE_DIR / "data" / "raw" / "component4_synthetic.csv"
)

MODEL_DIR = BASE_DIR / "saved_models"
REPORT_DIR = BASE_DIR / "reports" / "component4"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset():
    print("\n=== SafeMaga Component 4 ===")
    print("SYNTHETIC DATASET EXPERIMENT\n")

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(
        DATASET_PATH,
        encoding="utf-8-sig"
    ).fillna("")

    required = {
        "ad_text",
        "risk_label",
        "language",
        "ground_truth_status"
    }

    missing = required - set(df.columns)

    if missing:
        raise ValueError(
            f"Missing dataset columns: {missing}"
        )

    # Normalize text without removing Sinhala/Tamil characters
    df["ad_text"] = (
        df["ad_text"]
        .astype(str)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    df["risk_label"] = (
        df["risk_label"].astype(str).str.strip()
    )

    df["language"] = (
        df["language"].astype(str).str.strip()
    )

    # Prevent misrepresenting genuine data as synthetic
    synthetic_status = df[
        "ground_truth_status"
    ].astype(str).str.contains(
        "synthetic",
        case=False,
        na=False
    )

    if not synthetic_status.all():
        raise ValueError(
            "Dataset contains records not marked synthetic. "
            "Review provenance before this experiment."
        )

    df = df[df["ad_text"].str.len() > 0].copy()

    # Check duplicate text
    duplicates = df["ad_text"].str.casefold().duplicated()

    if duplicates.any():
        raise ValueError(
            "Duplicate advertisement texts found. "
            "Resolve duplicates before splitting data."
        )

    found_labels = set(df["risk_label"].unique())

    if found_labels != set(LABELS):
        raise ValueError(
            f"Unexpected risk labels: {found_labels}"
        )

    print("Total records:", len(df))
    print("\nRisk labels:")
    print(df["risk_label"].value_counts())

    print("\nLanguage distribution:")
    print(df["language"].value_counts())

    return df


def create_models():
    # Character n-grams preserve information across
    # English, Sinhala and Tamil writing systems.
    def vectorizer():
        return TfidfVectorizer(
            analyzer="char",
            ngram_range=(2, 5),
            sublinear_tf=True,
            min_df=1
        )

    return {
        "Logistic Regression": Pipeline([
            ("tfidf", vectorizer()),
            ("classifier", LogisticRegression(
                max_iter=2000,
                class_weight="balanced",
                random_state=RANDOM_STATE
            ))
        ]),

        "Linear SVM": Pipeline([
            ("tfidf", vectorizer()),
            ("classifier", LinearSVC(
                class_weight="balanced",
                random_state=RANDOM_STATE
            ))
        ])
    }


def train_and_evaluate(df):
    # Preserve both language and class representation
    strata = df["language"] + "|" + df["risk_label"]

    train_df, test_df = train_test_split(
        df,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=strata
    )

    X_train = train_df["ad_text"]
    y_train = train_df["risk_label"]

    X_test = test_df["ad_text"]
    y_test = test_df["risk_label"]

    print("\nTraining samples:", len(train_df))
    print("Held-out test samples:", len(test_df))

    models = create_models()

    cv = StratifiedKFold(
        n_splits=4,
        shuffle=True,
        random_state=RANDOM_STATE
    )

    results = {}

    # Compare models using training data only
    for name, model in models.items():
        scores = cross_val_score(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring="f1_macro"
        )

        results[name] = {
            "mean_f1": float(scores.mean()),
            "std_f1": float(scores.std()),
            "fold_scores": [
                float(score) for score in scores
            ]
        }

        print(f"\n{name}")
        print(
            f"Cross-validation macro F1: "
            f"{scores.mean():.4f}"
        )
        print(f"Std deviation: {scores.std():.4f}")

    # Select using CV, not the held-out test set
    best_name = max(
        results,
        key=lambda name: results[name]["mean_f1"]
    )

    best_model = models[best_name]

    print("\nSelected model:", best_name)

    best_model.fit(X_train, y_train)

    # Evaluate once on held-out synthetic examples
    predictions = best_model.predict(X_test)

    print("\n=== HELD-OUT TEST EVALUATION ===")
    print("Synthetic demo data only\n")

    print(classification_report(
        y_test,
        predictions,
        labels=LABELS,
        zero_division=0
    ))

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=LABELS
    )

    print("Confusion matrix:")
    print(matrix)

    report = classification_report(
        y_test,
        predictions,
        labels=LABELS,
        output_dict=True,
        zero_division=0
    )

    metrics = {
        "dataset_type": "Synthetic demonstration only",
        "total_samples": int(len(df)),
        "train_samples": int(len(train_df)),
        "test_samples": int(len(test_df)),
        "labels": LABELS,
        "selected_model": best_name,
        "cv_results": results,
        "held_out_test_report": report,
        "confusion_matrix": matrix.tolist(),
        "limitation": (
            "Results are from a small synthetic dataset. "
            "They do not establish real-world performance."
        )
    }

    metrics_path = (
        REPORT_DIR / "synthetic_baseline_metrics.json"
    )

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(
            metrics,
            f,
            indent=2,
            ensure_ascii=False
        )

    # Save confusion matrix figure
    display = ConfusionMatrixDisplay(
        confusion_matrix=matrix,
        display_labels=LABELS
    )

    display.plot(values_format="d")

    plt.title("SafeMaga - Synthetic Test Data Only")
    plt.tight_layout()

    figure_path = (
        REPORT_DIR / "synthetic_confusion_matrix.png"
    )

    plt.savefig(
        figure_path,
        dpi=200,
        bbox_inches="tight"
    )

    plt.close()

    # Save trained model in a separate Component 4 artifact
    model_path = (
        MODEL_DIR / "component4_fraud_baseline.joblib"
    )

    joblib.dump(
        {
            "pipeline": best_model,
            "model_name": best_name,
            "labels": LABELS,
            "training_source": "synthetic_only",
            "research_status": "prototype"
        },
        model_path
    )

    print("\n=== FILES SAVED ===")
    print("Model:", model_path)
    print("Metrics:", metrics_path)
    print("Confusion Matrix:", figure_path)

    print("\nIMPORTANT:")
    print(
        "These scores demonstrate the training pipeline, "
        "not validated real-world fraud detection."
    )


if __name__ == "__main__":
    dataset = load_dataset()
    train_and_evaluate(dataset)
