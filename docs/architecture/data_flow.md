# SafeMaga Data Flow & Request Lifecycle

## 1. Inference Request Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Researcher
    participant FE as React Client (Vite)
    participant BE as Express API Gateway
    participant DB as MongoDB
    participant AI as FastAPI ML Bridge
    participant Model as ML Artifact

    User->>FE: Submits query / features via Dashboard
    FE->>BE: POST /api/predict (JSON payload + JWT)
    BE->>BE: Validate schema & sanitize inputs
    BE->>AI: POST /predict (Internal HTTP: 8000)
    AI->>Model: Execute inference pipeline
    Model-->>AI: Output label, confidence score, latency
    AI-->>BE: 200 OK (Inference JSON response)
    BE->>DB: Persist AnalysisResult record
    DB-->>BE: Saved record ACK
    BE-->>FE: 200 OK (Formatted result + DB ID + Latency)
    FE-->>User: Render visual prediction & metrics
```

## 2. Research Data Ingestion & Model Lifecycle
1. **Raw Collection**: Datasets collected into `ai-ml/data/raw/`.
2. **Preprocessing Pipeline**: `src/preprocessing/clean_data.py` executes:
   - Null handling, duplicate removal.
   - Normalization / standardization.
   - Output emitted to `ai-ml/data/processed/cleaned_dataset.csv`.
3. **Training & Validation**: `src/training/train.py` executes:
   - Stratified train-test split.
   - Model parameter optimization.
   - Metric evaluation (Accuracy, F1-score, Precision/Recall).
   - Artifact export to `ai-ml/saved_models/baseline_model.joblib`.
4. **Bridge Serving**: FastAPI hot-loads the new artifact upon service initialization.
