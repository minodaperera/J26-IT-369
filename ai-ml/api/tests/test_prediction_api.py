import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure ai-ml is on sys.path
ai_ml_dir = Path(__file__).resolve().parent.parent.parent
if str(ai_ml_dir) not in sys.path:
    sys.path.insert(0, str(ai_ml_dir))

from api.main import app
from api.routes.visa_prediction.service import visa_service

client = TestClient(app)

# Canonical benchmark sample
VALID_SAMPLE = {
    "applicant_age": 28,
    "available_bank_balance_lkr": 2500000.0,
    "destination": "USA",
    "migration_type": "first_time",
    "document_submitted_date": "2024-04-15"
}

def test_health_endpoint():
    """Verify system health check and model loading state."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["components"]["visa_prediction"]["model_loaded"] is True

def test_metadata_endpoint():
    """Verify component metadata exposes 16 destinations and proper schema."""
    response = client.get("/api/v1/visa/metadata")
    assert response.status_code == 200
    data = response.json()
    assert len(data["supported_destinations"]) == 16
    assert "USA" in data["supported_destinations"]
    assert "Australia" in data["supported_destinations"]
    assert data["valid_age_range"]["min"] == 18
    assert data["valid_age_range"]["max"] == 69

def test_valid_prediction_modular_endpoint():
    """Verify POST /api/v1/visa/predict produces expected regression output."""
    response = client.post("/api/v1/visa/predict", json=VALID_SAMPLE)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_processing_days" in data
    assert "estimated_processing_days_rounded" in data
    assert data["unit"] == "days"
    assert data["predicted_processing_days"] > 0
    assert abs(data["predicted_processing_days"] - 13.89) < 0.1
    assert data["estimated_processing_days_rounded"] == 14
    assert data["input_echo"]["destination"] == "USA"

def test_valid_prediction_root_endpoint():
    """Verify POST /predict compatibility alias functions identically."""
    response = client.post("/predict", json=VALID_SAMPLE)
    assert response.status_code == 200
    data = response.json()
    assert abs(data["predicted_processing_days"] - 13.89) < 0.1
    assert data["estimated_processing_days_rounded"] == 14

def test_wrapped_node_payload_compatibility():
    """Verify backend Node.js express wrapped format {'input': {...}}."""
    wrapped_payload = {"input": VALID_SAMPLE}
    response = client.post("/predict", json=wrapped_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_processing_days_rounded"] == 14

def test_all_16_destinations():
    """Verify all 16 supported destinations produce valid numeric forecasts."""
    destinations = [
        "Australia", "Canada", "China", "France", "Germany", "India",
        "Italy", "Japan", "Malaysia", "New Zealand", "South Africa",
        "South Korea", "Turkey", "UAE", "UK", "USA"
    ]
    for dest in destinations:
        sample = VALID_SAMPLE.copy()
        sample["destination"] = dest
        response = client.post("/api/v1/visa/predict", json=sample)
        assert response.status_code == 200
        data = response.json()
        assert data["predicted_processing_days"] > 0
        assert isinstance(data["estimated_processing_days_rounded"], int)

def test_invalid_destination_rejection():
    """Verify unsupported destination returns HTTP 422 with descriptive error."""
    invalid_sample = VALID_SAMPLE.copy()
    invalid_sample["destination"] = "Atlantis"
    response = client.post("/api/v1/visa/predict", json=invalid_sample)
    assert response.status_code == 422
    assert "Unsupported destination" in response.text

def test_invalid_migration_type_rejection():
    """Verify invalid migration type returns HTTP 422."""
    invalid_sample = VALID_SAMPLE.copy()
    invalid_sample["migration_type"] = "tourist_visitor"
    response = client.post("/api/v1/visa/predict", json=invalid_sample)
    assert response.status_code == 422
    assert "Invalid migration_type" in response.text

def test_age_boundary_enforcement():
    """Verify age boundaries (18 to 69). Underage and overage are rejected."""
    # Underage (17)
    underage_sample = VALID_SAMPLE.copy()
    underage_sample["applicant_age"] = 17
    res_under = client.post("/api/v1/visa/predict", json=underage_sample)
    assert res_under.status_code == 422

    # Overage (70)
    overage_sample = VALID_SAMPLE.copy()
    overage_sample["applicant_age"] = 70
    res_over = client.post("/api/v1/visa/predict", json=overage_sample)
    assert res_over.status_code == 422

    # Boundary valid (18 and 69)
    sample_18 = VALID_SAMPLE.copy()
    sample_18["applicant_age"] = 18
    assert client.post("/api/v1/visa/predict", json=sample_18).status_code == 200

    sample_69 = VALID_SAMPLE.copy()
    sample_69["applicant_age"] = 69
    assert client.post("/api/v1/visa/predict", json=sample_69).status_code == 200

def test_negative_bank_balance_rejection():
    """Verify negative bank balance is rejected."""
    invalid_sample = VALID_SAMPLE.copy()
    invalid_sample["available_bank_balance_lkr"] = -1000.0
    response = client.post("/api/v1/visa/predict", json=invalid_sample)
    assert response.status_code == 422

def test_malformed_date_rejection():
    """Verify malformed date strings return HTTP 422."""
    for bad_date in ["not-a-date", "15/04/2024", "2024-13-45", "1990-01-01"]:
        invalid_sample = VALID_SAMPLE.copy()
        invalid_sample["document_submitted_date"] = bad_date
        response = client.post("/api/v1/visa/predict", json=invalid_sample)
        assert response.status_code == 422

def test_missing_required_fields():
    """Verify missing fields are rejected with HTTP 422."""
    for key in VALID_SAMPLE.keys():
        incomplete = VALID_SAMPLE.copy()
        del incomplete[key]
        response = client.post("/api/v1/visa/predict", json=incomplete)
        assert response.status_code == 422

def test_target_leakage_prevention():
    """Verify post-decision fields like visa_result_date are explicitly rejected."""
    leak_sample = VALID_SAMPLE.copy()
    leak_sample["visa_result_date"] = "2024-05-15"
    response = client.post("/api/v1/visa/predict", json=leak_sample)
    assert response.status_code == 422
    assert "Target leakage" in response.text

def test_repeated_requests_statelessness():
    """Verify repeated requests return identical deterministic results without state drift."""
    first_pred = client.post("/api/v1/visa/predict", json=VALID_SAMPLE).json()["predicted_processing_days"]
    for _ in range(10):
        res = client.post("/api/v1/visa/predict", json=VALID_SAMPLE)
        assert res.status_code == 200
        assert res.json()["predicted_processing_days"] == first_pred

if __name__ == "__main__":
    pytest.main(["-v", __file__])
