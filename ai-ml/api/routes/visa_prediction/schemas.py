from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator, model_validator
from api.config import settings

class VisaPredictionRequest(BaseModel):
    """
    Input schema for Visa Processing-Time Prediction.
    Captures raw applicant demographic, financial, and application data.
    """
    applicant_age: int = Field(
        ...,
        ge=settings.MIN_AGE,
        le=settings.MAX_AGE,
        description=f"Applicant age in years ({settings.MIN_AGE} to {settings.MAX_AGE})",
        examples=[28]
    )
    available_bank_balance_lkr: float = Field(
        ...,
        ge=0.0,
        description="Available proof-of-funds bank balance in Sri Lankan Rupees (LKR)",
        examples=[2500000.0]
    )
    destination: str = Field(
        ...,
        description=f"Target destination country. Supported: {', '.join(settings.SUPPORTED_DESTINATIONS)}",
        examples=["USA"]
    )
    migration_type: str = Field(
        ...,
        description="Type of migration: 'first_time' or 'repeat'",
        examples=["first_time"]
    )
    document_submitted_date: str = Field(
        ...,
        description="Application document submission date in YYYY-MM-DD format",
        examples=["2024-04-15"]
    )

    @field_validator("destination")
    @classmethod
    def validate_destination(cls, v: str) -> str:
        clean_v = v.strip()
        # Find case-insensitive match among supported destinations
        match = next((d for d in settings.SUPPORTED_DESTINATIONS if d.lower() == clean_v.lower()), None)
        if not match:
            raise ValueError(
                f"Unsupported destination '{v}'. Supported destinations are: {', '.join(settings.SUPPORTED_DESTINATIONS)}"
            )
        return match

    @field_validator("migration_type")
    @classmethod
    def validate_migration_type(cls, v: str) -> str:
        clean_v = v.strip().lower()
        if clean_v not in settings.SUPPORTED_MIGRATION_TYPES:
            raise ValueError(
                f"Invalid migration_type '{v}'. Must be one of: {settings.SUPPORTED_MIGRATION_TYPES}"
            )
        return clean_v

    @field_validator("document_submitted_date")
    @classmethod
    def validate_document_submitted_date(cls, v: str) -> str:
        clean_v = v.strip()
        try:
            parsed_date = datetime.strptime(clean_v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date format. Expected 'YYYY-MM-DD' (e.g. '2024-04-15')")
        
        # Guardrail on realistic submission years
        if parsed_date.year < 2010 or parsed_date.year > 2035:
            raise ValueError(f"Submission year {parsed_date.year} is outside valid operational bounds (2010-2035)")
        return clean_v

    @model_validator(mode="before")
    @classmethod
    def reject_target_leakage(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "processing_days" in values or "visa_result_date" in values:
                raise ValueError(
                    "Target leakage error: 'processing_days' and 'visa_result_date' must not be provided in prediction requests."
                )
        return values

    model_config = {
        "json_schema_extra": {
            "example": {
                "applicant_age": 28,
                "available_bank_balance_lkr": 2500000.0,
                "destination": "USA",
                "migration_type": "first_time",
                "document_submitted_date": "2024-04-15"
            }
        }
    }


class VisaPredictionResponse(BaseModel):
    """
    Response schema returning model forecasts and execution metadata.
    """
    predicted_processing_days: float = Field(
        ...,
        description="Continuous model prediction in calendar days"
    )
    estimated_processing_days_rounded: int = Field(
        ...,
        description="Estimated processing days rounded to nearest whole calendar day"
    )
    unit: str = Field(default="days", description="Unit of measurement")
    model_name: str = Field(default="Tuned Random Forest Regressor")
    model_version: str = Field(default="v1.0.0")
    timestamp: str = Field(..., description="ISO 8601 prediction timestamp")
    input_echo: Optional[Dict[str, Any]] = Field(default=None, description="Sanitized input fields evaluated")


class VisaMetadataResponse(BaseModel):
    """
    Metadata schema describing supported parameters and domain rules.
    """
    component: str = "Visa Processing-Time Prediction"
    model_architecture: str = "Random Forest Regressor (Optuna Tuned)"
    target_variable: str = "processing_days (Calendar Days)"
    feature_count: int = 22
    supported_destinations: List[str]
    supported_migration_types: List[str]
    valid_age_range: Dict[str, int]
    seasonal_intake_months: List[int]
