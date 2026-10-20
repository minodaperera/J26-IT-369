import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import joblib
import numpy as np
import pandas as pd
from api.config import settings
from .schemas import VisaPredictionRequest, VisaPredictionResponse, VisaMetadataResponse

class VisaPredictionService:
    """
    Inference service managing the Step 6 Preprocessor and Step 7 Random Forest model.
    Ensures zero retraining, validates feature structure, and executes predictions.
    """
    _instance: Optional["VisaPredictionService"] = None

    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        self._load_artifacts()

    @classmethod
    def get_instance(cls) -> "VisaPredictionService":
        if cls._instance is None:
            cls._instance = VisaPredictionService()
        return cls._instance

    def _load_artifacts(self) -> None:
        """
        Loads the serialized preprocessor and model artifacts from disk.
        """
        if not settings.VISA_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model artifact not found at: {settings.VISA_MODEL_PATH.resolve()}"
            )
        if not settings.VISA_PREPROCESSOR_PATH.exists():
            raise FileNotFoundError(
                f"Preprocessing pipeline artifact not found at: {settings.VISA_PREPROCESSOR_PATH.resolve()}"
            )

        # Load preprocessor and model via joblib
        self.preprocessor = joblib.load(settings.VISA_PREPROCESSOR_PATH)
        self.model = joblib.load(settings.VISA_MODEL_PATH)
        self.is_loaded = True

    def predict(self, request: VisaPredictionRequest) -> VisaPredictionResponse:
        """
        Executes end-to-end inference on a single applicant payload.
        """
        if not self.is_loaded:
            self._load_artifacts()

        # 1. Structure raw input payload into standard DataFrame
        raw_df = pd.DataFrame([{
            'applicant_age': request.applicant_age,
            'available_bank_balance_lkr': request.available_bank_balance_lkr,
            'destination': request.destination,
            'migration_type': request.migration_type,
            'document_submitted_date': request.document_submitted_date
        }])

        # 2. Transform using the frozen, fitted Step 6 Preprocessor
        transformed_df = self.preprocessor.transform(raw_df)

        # 3. Defensive feature integrity validations
        if transformed_df.shape[1] != 22:
            raise ValueError(
                f"Feature dimension mismatch! Expected 22 features, received {transformed_df.shape[1]}"
            )
        if transformed_df.isna().sum().sum() > 0:
            nan_cols = transformed_df.columns[transformed_df.isna().any()].tolist()
            raise ValueError(f"Feature transformation produced unexpected NaN in columns: {nan_cols}")
        if np.isinf(transformed_df.values).sum() > 0:
            raise ValueError("Feature transformation produced infinite values.")

        # 4. Generate continuous days prediction via Random Forest
        raw_prediction = float(self.model.predict(transformed_df)[0])
        rounded_prediction = int(round(raw_prediction))

        # 5. Construct standardized response
        current_time = datetime.now(timezone.utc).isoformat()
        return VisaPredictionResponse(
            predicted_processing_days=round(raw_prediction, 2),
            estimated_processing_days_rounded=rounded_prediction,
            unit="days",
            model_name="Tuned Random Forest Regressor",
            model_version=settings.API_VERSION,
            timestamp=current_time,
            input_echo={
                "applicant_age": request.applicant_age,
                "available_bank_balance_lkr": request.available_bank_balance_lkr,
                "destination": request.destination,
                "migration_type": request.migration_type,
                "document_submitted_date": request.document_submitted_date
            }
        )

    def get_metadata(self) -> VisaMetadataResponse:
        """
        Returns component metadata and validation boundaries.
        """
        seasonal_months = getattr(self.preprocessor, "seasonal_months", [1, 4, 8, 12])
        return VisaMetadataResponse(
            supported_destinations=settings.SUPPORTED_DESTINATIONS,
            supported_migration_types=settings.SUPPORTED_MIGRATION_TYPES,
            valid_age_range={"min": settings.MIN_AGE, "max": settings.MAX_AGE},
            seasonal_intake_months=seasonal_months
        )

visa_service = VisaPredictionService.get_instance()
