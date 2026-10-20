# SafeMaga AI/ML Prediction Microservice

High-performance, modular FastAPI microservice serving machine learning models for the SafeMaga platform.

Architected with isolated sub-routers under `routes/` to enable collaborative multi-member model development with zero git merge conflicts.

---

## 1. Directory Structure

```text
ai-ml/api/
├── main.py                     # Central FastAPI application & gateway
├── config.py                   # Environment settings & path resolvers
├── routes/
│   ├── __init__.py
│   └── visa_prediction/        # Isolated component for Visa Processing-Time Prediction
│       ├── __init__.py
│       ├── schemas.py          # Pydantic request & response validation schemas
│       ├── service.py          # Preprocessor and Random Forest model inference service
│       └── router.py           # APIRouter definitions
├── tests/
│   ├── __init__.py
│   └── test_prediction_api.py  # 14-test regression and validation test suite
└── README.md                   # Microservice documentation
```

---

## 2. Requirements & Virtual Environment

The microservice runs on the existing project virtual environment located in `ai-ml/.venv`.

### Activate Virtual Environment (Windows PowerShell):
```powershell
# From project root or ai-ml directory:
& "d:\EDUCATION\SLIIT\project\Research_Chorta\SafeMaga\ai-ml\.venv\Scripts\Activate.ps1"
```

Or invoke Python directly without activating:
```powershell
& "d:\EDUCATION\SLIIT\project\Research_Chorta\SafeMaga\ai-ml\.venv\Scripts\python.exe"
```

---

## 3. How to Start the Backend Server

Run the server using `uvicorn`:

```powershell
# From the ai-ml directory:
& "d:\EDUCATION\SLIIT\project\Research_Chorta\SafeMaga\ai-ml\.venv\Scripts\python.exe" -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

The service will start at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
- **Health Check**: `http://127.0.0.1:8000/health`

---

## 4. API Endpoints & Request/Response Formats

### A. Primary Prediction Endpoint (Modular Route)
- **Method**: `POST`
- **Path**: `/api/v1/visa/predict` (or root alias `/predict`)
- **Headers**: `Content-Type: application/json`

#### Expected JSON Request Body:
```json
{
  "applicant_age": 28,
  "available_bank_balance_lkr": 2500000.0,
  "destination": "USA",
  "migration_type": "first_time",
  "document_submitted_date": "2024-04-15"
}
```

#### Field Validation Rules:
- `applicant_age` *(int, required)*: Must be between 18 and 69 years.
- `available_bank_balance_lkr` *(float, required)*: Must be $\ge 0.0$ LKR.
- `destination` *(string, required)*: Must be one of the 16 supported destinations:
  `["Australia", "Canada", "China", "France", "Germany", "India", "Italy", "Japan", "Malaysia", "New Zealand", "South Africa", "South Korea", "Turkey", "UAE", "UK", "USA"]`.
- `migration_type` *(string, required)*: Must be `'first_time'` or `'repeat'`.
- `document_submitted_date` *(string, required)*: Format `'YYYY-MM-DD'` (e.g. `'2024-04-15'`).
- `visa_result_date`: **Explicitly forbidden** in requests (protects against target leakage).

#### Successful Response (`200 OK`):
```json
{
  "predicted_processing_days": 13.89,
  "estimated_processing_days_rounded": 14,
  "unit": "days",
  "model_name": "Tuned Random Forest Regressor",
  "model_version": "v1.0.0",
  "timestamp": "2026-10-17T03:26:00.000000+00:00",
  "input_echo": {
    "applicant_age": 28,
    "available_bank_balance_lkr": 2500000.0,
    "destination": "USA",
    "migration_type": "first_time",
    "document_submitted_date": "2024-04-15"
  }
}
```

#### Validation Error Response (`422 Unprocessable Entity`):
```json
{
  "detail": "Unsupported destination 'Atlantis'. Supported destinations are: Australia, Canada, China, France, Germany, India, Italy, Japan, Malaysia, New Zealand, South Africa, South Korea, Turkey, UAE, UK, USA"
}
```

---

### B. Metadata Endpoint
- **Method**: `GET`
- **Path**: `/api/v1/visa/metadata`

Returns list of supported destinations, valid age range, migration types, and seasonal intake months.

---

## 5. How to Run the Automated Test Suite

Run pytest using the project virtual environment:

```powershell
& "d:\EDUCATION\SLIIT\project\Research_Chorta\SafeMaga\ai-ml\.venv\Scripts\python.exe" -m pytest "d:\EDUCATION\SLIIT\project\Research_Chorta\SafeMaga\ai-ml\api\tests\test_prediction_api.py" -v
```

All 14 tests verify:
- Health check status
- Metadata validation
- Modular `/api/v1/visa/predict` inference
- Root `/predict` compatibility
- Node.js Express wrapped payload compatibility (`{"input": {...}}`)
- All 16 destination countries
- Rejection of invalid destinations, migration types, out-of-bounds ages, negative balances, malformed dates, and missing fields
- Explicit target leakage prevention (`visa_result_date`)
- Deterministic repeated requests (zero retraining)
