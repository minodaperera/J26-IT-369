from fastapi import APIRouter, HTTPException, status
from .schemas import VisaPredictionRequest, VisaPredictionResponse, VisaMetadataResponse
from .service import visa_service

router = APIRouter(prefix="/visa", tags=["Visa Processing Time Prediction"])

@router.post(
    "/predict",
    response_model=VisaPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Visa Processing Time (Days)",
    description="Accepts raw applicant profile data, applies Step 6 preprocessing transformations, and predicts processing duration using the Step 7 Tuned Random Forest model."
)
def predict_processing_time(payload: VisaPredictionRequest) -> VisaPredictionResponse:
    try:
        response = visa_service.predict(payload)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )

@router.get(
    "/metadata",
    response_model=VisaMetadataResponse,
    summary="Get Component Metadata & Input Constraints",
    description="Returns valid boundaries, supported destination countries, migration categories, and seasonal calendar months."
)
def get_component_metadata() -> VisaMetadataResponse:
    return visa_service.get_metadata()

@router.get(
    "/health",
    summary="Health Check for Visa Prediction Component",
    description="Verifies that the serialized Random Forest model and Preprocessor pipeline are in memory."
)
def component_health():
    return {
        "status": "healthy" if visa_service.is_loaded else "unhealthy",
        "component": "visa_processing_prediction",
        "model_loaded": visa_service.is_loaded
    }
