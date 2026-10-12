# Backend Express API Specification

Base URL: `http://localhost:5000/api`

---

### 1. Health Check
- **Endpoint**: `GET /health`
- **Auth**: None
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-12T15:45:00.000Z",
  "service": "SafeMaga Express API Backend",
  "version": "1.0.0"
}
```

---

### 2. User Authentication

#### Register User
- **Endpoint**: `POST /auth/register`
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@safemaga.research",
  "password": "securePassword123",
  "role": "researcher"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64fe1a782b...",
    "name": "Jane Doe",
    "email": "jane@safemaga.research",
    "role": "researcher"
  }
}
```

#### User Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
```json
{
  "email": "jane@safemaga.research",
  "password": "securePassword123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64fe1a782b...",
    "name": "Jane Doe",
    "email": "jane@safemaga.research",
    "role": "researcher"
  }
}
```

#### Get Current User Profile
- **Endpoint**: `GET /auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": "64fe1a782b...",
    "name": "Jane Doe",
    "email": "jane@safemaga.research",
    "role": "researcher"
  }
}
```

---

### 3. Prediction & Inference Endpoints

#### Run Prediction
- **Endpoint**: `POST /predict`
- **Request Body**:
```json
{
  "input": "Risk payload data point or query",
  "parameters": {
    "threshold": 0.5
  }
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "prediction": "NORMAL_PATTERN",
    "confidence": 0.92,
    "modelVersion": "v1.0.0-baseline",
    "inferenceLatencyMs": 11.4
  },
  "latencyMs": 18,
  "persistedId": "651d2f9...",
  "isMock": false
}
```

#### Get Prediction History
- **Endpoint**: `GET /predict/history`
- **Header**: `Authorization: Bearer <token>` (Optional)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "651d2f9...",
      "inputQuery": "Risk payload data point",
      "inferenceOutput": { ... },
      "modelVersion": "v1.0.0-baseline",
      "latencyMs": 18,
      "status": "SUCCESS",
      "createdAt": "2026-10-12T15:47:00.000Z"
    }
  ]
}
```

#### AI Bridge Status
- **Endpoint**: `GET /predict/status`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "aiBridge": {
    "status": "healthy",
    "service": "SafeMaga AI/ML FastAPI Bridge",
    "modelLoaded": true
  }
}
```
