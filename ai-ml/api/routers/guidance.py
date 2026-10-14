"""Module 2 (Legal, Document & Cost Guidance) endpoints for the AI/ML bridge. Mounted at /guidance.

  GET  /guidance/health         engine/model status
  POST /guidance/ocr/extract    multipart: file (jpg/png/pdf) + doc_type  -> fields, dates, validation
  POST /guidance/risk/predict   JSON profile -> visa approval probability + weak points
  POST /guidance/docs/classify  JSON {text} -> requirement category
"""
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

load_dotenv()  # TESSERACT_CMD, POPPLER_PATH, ANTHROPIC_API_KEY ... from ai-ml/.env (must run before importing ocr)

from src.guidance import doc_classifier, llm, ocr, visa_risk  # noqa: E402
from src.guidance.paths import DOC_CLASSIFIER_MODEL, VISA_RISK_MODEL  # noqa: E402

router = APIRouter(prefix="/guidance", tags=["module-2-guidance"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "application/pdf"}
DOC_TYPES = {"passport", "medical", "police_clearance", "contract", "other"}
MAX_BYTES = int(os.getenv("MAX_UPLOAD_MB", "8")) * 1024 * 1024


class RiskInput(BaseModel):
    country_difficulty: int = Field(ge=1, le=5)
    age: int = Field(ge=16, le=90)
    monthly_income_lkr: float = Field(ge=0)
    savings_lkr: float = Field(ge=0)
    employment: Literal["employed", "self_employed", "student", "unemployed"]
    travel_history_count: int = Field(ge=0, le=100, default=0)
    previous_rejections: int = Field(ge=0, le=20, default=0)
    bank_statement_months: int = Field(ge=0, le=60, default=0)
    has_return_ticket: bool = False
    has_accommodation: bool = False
    has_sponsor_or_invitation: bool = False
    trip_days: int = Field(ge=1, le=365, default=14)
    estimated_trip_cost_lkr: float = Field(gt=0)


class ClassifyInput(BaseModel):
    text: str = Field(min_length=1, max_length=20000)


@router.get("/health")
def health():
    return {
        "status": "ok",
        "tesseract": ocr.tesseract_available(),
        "model_trained": VISA_RISK_MODEL.exists(),
        "doc_classifier_trained": DOC_CLASSIFIER_MODEL.exists(),
        "llm_enabled": llm.enabled(),
    }


@router.post("/ocr/extract")
async def extract(file: UploadFile = File(...), doc_type: str = Form(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPG, PNG or PDF files are supported")
    if doc_type not in DOC_TYPES:
        raise HTTPException(400, "Invalid doc_type")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, f"File too large (max {MAX_BYTES // (1024 * 1024)} MB)")
    try:
        # processed in memory only - nothing is written to disk
        return ocr.process(data, file.content_type, file.filename or "", doc_type)
    except ocr.OcrUnavailable as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(422, f"Could not read document: {e}")


@router.post("/risk/predict")
def predict(payload: RiskInput):
    try:
        return visa_risk.predict(payload.model_dump())
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))


@router.post("/docs/classify")
def classify(payload: ClassifyInput):
    try:
        return doc_classifier.classify(payload.text)
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))
