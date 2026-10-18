# FastAPI AI/ML Bridge Service Specification

Base URL: `http://localhost:8000`  
Interactive OpenAPI UI: `http://localhost:8000/docs`  
ReDoc UI: `http://localhost:8000/redoc`

---

### 1. Service Health
- **Endpoint**: `GET /health`
- **Response** (`200 OK`):
```json
{
  "status": "healthy",
  "timestamp": 1728748020.12,
  "service": "SafeMaga AI/ML FastAPI Bridge",
  "version": "1.0.0",
  "modelLoaded": true
}
```

---

### 2. Model Metadata
- **Endpoint**: `GET /model-info`
- **Response** (`200 OK`):
```json
{
  "modelVersion": "v1.0.0-baseline",
  "isArtifactLoaded": true,
  "supportedEndpoints": [
    "/predict",
    "/health",
    "/model-info"
  ]
}
```

---

### 3. Model Inference
- **Endpoint**: `POST /predict`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "input": "Sample text or identifier for inference",
  "features": [0.45, -1.2, 3.14, 0.08],
  "parameters": {
    "threshold": 0.5
  }
}
```
- **Response Schema** (`200 OK`):
```json
{
  "success": true,
  "prediction": "POSITIVE_CLASSIFICATION",
  "confidence": 0.942,
  "modelVersion": "v1.0.0-baseline",
  "featuresUsed": [0.45, -1.2, 3.14, 0.08],
  "inferenceLatencyMs": 8.75,
  "metadata": {
    "inputEcho": "Sample text or identifier for inference",
    "timestamp": 1728748025.43
  }
}
```

- **Error Codes**:
  - `422 Unprocessable Entity`: Request body failed Pydantic validation.
  - `500 Internal Server Error`: Exception occurred during pipeline transformation or inference.

---

### 4. Module 2 - Guidance endpoints (`/guidance/*`)

Defined in `ai-ml/api/routers/guidance.py`; loaded defensively (if the extra packages are missing, the bridge still serves other modules and logs a warning).
Called by the Express API through `backend/src/services/guidanceAiService.js`; not meant to be exposed publicly.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/guidance/health` | - | `{status, tesseract, model_trained, doc_classifier_trained, llm_enabled}` |
| POST | `/guidance/ocr/extract` | multipart `file` (jpg/png/pdf), `doc_type` | `{fields, issueDate, expiryDate, status, issues, checks, confidence, method}`; `fields.documentCategory` when the classifier is confident. `503` with install help if Tesseract is missing |
| POST | `/guidance/risk/predict` | JSON profile (see `RiskInput`) | `{approval_probability, risk_level, weak_points[], disclaimer, model}` |
| POST | `/guidance/docs/classify` | `{ "text": "..." }` | `{category|null, confidence, scores}` |
