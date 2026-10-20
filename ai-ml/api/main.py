from contextlib import asynccontextmanager
from typing import Dict, Any, Union
from fastapi import FastAPI, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings
from api.routes.visa_prediction.router import router as visa_router
from api.routes.visa_prediction.service import visa_service
from api.routes.visa_prediction.schemas import VisaPredictionRequest, VisaPredictionResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML artifacts into memory so first request has zero latency
    print(f"[{settings.PROJECT_NAME}] Initializing AI/ML microservice...")
    _ = visa_service
    print(f"[{settings.PROJECT_NAME}] Visa Prediction Model & Preprocessor loaded successfully.")
    yield
    # Shutdown logic if needed
    print(f"[{settings.PROJECT_NAME}] Shutting down AI/ML microservice.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description=(
        "SafeMaga AI/ML Microservice providing high-performance, modular machine learning inference APIs.\n"
        "Architected with isolated feature routers to facilitate collaborative multi-model team development."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend and Node.js gateway connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Mount Modular Routers (Each team member's component gets its own prefix)
app.include_router(visa_router, prefix="/api/v1")

# 2. Compatibility Root Prediction Endpoint
# Supports direct calls to POST /predict as configured in Node.js backend aiService
@app.post(
    "/predict",
    response_model=VisaPredictionResponse,
    tags=["Compatibility Endpoints"],
    summary="Root Prediction Gateway (Visa Processing-Time)",
    description="Universal prediction endpoint supporting direct applicant payloads or Node.js bridge payloads."
)
def root_predict(
    payload: Union[VisaPredictionRequest, Dict[str, Any]] = Body(...)
) -> VisaPredictionResponse:
    # If wrapped payload from Node.js (e.g., {"input": {...}}), unwrap it
    if isinstance(payload, dict):
        candidate_data = payload.get("input", payload)
        if isinstance(candidate_data, dict):
            validated_req = VisaPredictionRequest(**candidate_data)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Expected structured applicant object with fields: applicant_age, destination, etc."
            )
    else:
        validated_req = payload

    try:
        return visa_service.predict(validated_req)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

# 3. System Health Check
@app.get(
    "/health",
    tags=["System"],
    summary="Global Health Check",
    description="Returns the health status of the microservice and registered model components."
)
def health_check():
    return {
        "status": "healthy",
        "service": "safemaga-ai-bridge",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "components": {
            "visa_prediction": {
                "status": "healthy" if visa_service.is_loaded else "unhealthy",
                "model_loaded": visa_service.is_loaded
            }
        }
    }

# 4. Root Info Endpoint
@app.get(
    "/",
    tags=["System"],
    summary="Microservice Index",
    description="Returns API service information and documentation links."
)
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "visa_predict_v1": "/api/v1/visa/predict",
            "visa_metadata_v1": "/api/v1/visa/metadata",
            "root_predict": "/predict"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
