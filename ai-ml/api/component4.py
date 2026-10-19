
import re
from fastapi import APIRouter
from pydantic import BaseModel, Field
import io
import shutil

import pytesseract
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import UploadFile, File, HTTPException


# Independent API routes for Research Component 4
router = APIRouter(
    prefix="/component4",
    tags=["Component 4 - Fraud Detection"]
)


class AdvertisementRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10000)


# Initial transparent baseline rules.
# These are hypotheses to evaluate, not a trained ML model.
SCAM_INDICATORS = [
    {
        "name": "Unrealistic guarantee",
        "pattern": r"(?:100\s*%|guaranteed|guarantee|assured).{0,45}(?:visa|job|approval|approved)",
        "weight": 3
    },
    {
        "name": "Advance payment request",
        "pattern": r"(?:pay|send|transfer|deposit|payment|advance).{0,40}(?:fee|money|lkr|rs\.?|deposit|payment|advance|bank)",
        "weight": 3
    },
    {
        "name": "Request for sensitive credentials",
        "pattern": r"\b(?:otp|one[-\s]?time password|password|bank pin|cvv)\b",
        "weight": 4
    },
    {
        "name": "Urgency or pressure",
        "pattern": r"\b(?:pay|apply|send|transfer|contact|register)\b.{0,30}\b(?:now|today|immediately|urgent|within 24 hours)\b",
        "weight": 2
    },
    {
        "name": "Unusual recruitment promises",
        "pattern": r"\b(?:no interview|no documents|no experience needed|without interview)\b",
        "weight": 2
    },
    {
        "name": "Restricted communication channel",
        "pattern": r"\b(?:whatsapp only|contact only on whatsapp)\b",
        "weight": 1
    }
]


@router.post("/analyze")
def analyze_advertisement(payload: AdvertisementRequest):
    text = payload.text.strip()
    indicators = []
    total_score = 0

    for rule in SCAM_INDICATORS:
        match = re.search(
            rule["pattern"],
            text,
            flags=re.IGNORECASE
        )

        if match:
            indicators.append({
                "name": rule["name"],
                "evidence": match.group(0),
                "points": rule["weight"]
            })
            total_score += rule["weight"]

    if total_score >= 5:
        risk_level = "High-Risk Scam"
    elif total_score >= 2:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe"

    return {
        "success": True,
        "riskLevel": risk_level,
        "riskScore": min(total_score, 10),
        "indicators": indicators,
        "method": "Rule-based research baseline v1",
        "mlModelTrained": False,
        "recommendation": (
            "Independently verify the advertisement and "
            "recruitment agency using official sources "
            "before paying money or sharing documents."
        ),
        "disclaimer": (
            "This is a preliminary screening result, "
            "not proof of fraud or legitimacy. "
            "The initial rules are English-focused "
            "and require further evaluation."
        )
    }


# Component 4 - OCR Advertisement Analysis
# Supports English, Sinhala and Tamil text extraction.

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_IMAGE_PIXELS = 12_000_000

# Use the system installation, or the default Windows path.
pytesseract.pytesseract.tesseract_cmd = (
    shutil.which("tesseract")
    or r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


@router.post("/analyze-image")
async def analyze_advertisement_image(
    file: UploadFile = File(...)
):
    allowed_types = {
        "image/png",
        "image/jpeg",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail="Only PNG, JPG and WebP images are supported."
        )

    image_bytes = await file.read(MAX_FILE_SIZE + 1)

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 5 MB upload limit."
        )

    try:
        with Image.open(io.BytesIO(image_bytes)) as original:
            if original.format not in {"PNG", "JPEG", "WEBP"}:
                raise HTTPException(
                    status_code=415,
                    detail="Unsupported image format."
                )

            if original.width * original.height > MAX_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=413,
                    detail="Image dimensions are too large."
                )

            image = ImageOps.exif_transpose(original).convert("RGB")

    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="Cannot read the uploaded image."
        )

    try:
        extracted_text = pytesseract.image_to_string(
            image,
            lang="eng+sin+tam"
        ).strip()

    except pytesseract.TesseractError:
        raise HTTPException(
            status_code=503,
            detail="OCR failed. Check Tesseract language installation."
        )

    if len(extracted_text) < 10:
        raise HTTPException(
            status_code=422,
            detail="Not enough readable text found in the image."
        )

    # Reuse the existing research baseline detector.
    analysis = analyze_advertisement(
        AdvertisementRequest(text=extracted_text[:10000])
    )

    return {
        "success": True,
        "extractedText": extracted_text,
        "ocrLanguages": ["eng", "sin", "tam"],
        "analysis": analysis,
        "textTruncatedForAnalysis": len(extracted_text) > 10000,
        "note": (
            "OCR supports three languages, but the current "
            "fraud detection rules are primarily English-based. "
            "Risk results are preliminary."
        )
    }
