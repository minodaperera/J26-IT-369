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
  "language": "en"
}
```
> The role is **never** read from the request: public registrations are always `user`. Admins are created by the seed script or promoted via the Module 2 admin console (`PUT /api/guidance/admin/users/:id/role`). `language` (`en`|`si`|`ta`) is optional.
- **Response** (`201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64fe1a782b...",
    "name": "Jane Doe",
    "email": "jane@safemaga.research",
    "role": "user",
    "language": "en"
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
    "role": "user",
    "language": "en"
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
    "role": "user",
    "language": "en"
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

---

### 4. Authentication - profile update (added for Module 2)

#### Update Profile
- **Endpoint**: `PUT /auth/profile` (JWT required)
- **Body** (all optional): `{ "name", "language", "profile": { "age", "monthlyIncomeLKR", "savingsLKR", "employment", "travelHistoryCount", "previousRejections" } }`
- **Response**: `{ "success": true, "user": { id, name, email, role, language, profile } }`

---

### 5. Module 2 - Legal, Documents & Costs (`/api/guidance/*`)

Rate-limited (600 req / 15 min) with security headers. Responses are plain JSON (no `{success}` envelope); errors use `{ "success": false, "message": "..." }`.
🔒 = `Authorization: Bearer <token>`; 🛡 = admin only (role re-checked in the database).

| Method | Path | Description |
|---|---|---|
| GET | `/guidance/health` | Module status + AI service status (Tesseract, models) |
| GET | `/guidance/countries` | Map summary: difficulty, safety, salary, estimated cost (LKR) |
| GET | `/guidance/countries/:slug` | Visa types, steps, document checklist, embassy, costs |
| GET | `/guidance/requirements` | Countries with requirement data + purpose labels |
| GET | `/guidance/requirements/:slug?purpose=` | Document checklist for `traveler\|medical\|business\|student\|child` |
| GET 🔒 | `/guidance/requirements/:slug/readiness?purpose=` | Compares the checklist with the user's scanned documents |
| GET | `/guidance/costs/estimate?country=&visaType=&months=` | Itemised cost in USD + LKR |
| POST 🔒 | `/guidance/costs/savings-plan` | Monthly savings plan |
| GET 🔒 | `/guidance/costs/savings-plan` | Saved plans |
| GET 🔒 | `/guidance/documents` | User's documents (metadata only) |
| POST 🔒 | `/guidance/documents/upload` | multipart `file` (jpg/png/pdf, 8 MB) + `docType` (+ `travelDate`); file is processed in memory and never stored |
| POST 🔒 | `/guidance/documents` | Manual entry `{docType,label,expiryDate,category?}` |
| DELETE 🔒 | `/guidance/documents/:id` | Delete a document record |
| GET 🔒 | `/guidance/alerts` | Documents expired or expiring within 90 days |
| POST 🔒 | `/guidance/risk/predict` | Visa approval probability + ranked weak points |
| GET 🔒 | `/guidance/risk/history` | Last 20 predictions |
| GET 🛡 | `/guidance/admin/stats` | Aggregate counts + system status (no document contents) |
| GET 🛡 | `/guidance/admin/users?search=` | Users with document counts |
| PUT 🛡 | `/guidance/admin/users/:id/role` | Change role |
| DELETE 🛡 | `/guidance/admin/users/:id` | Delete user and their Module 2 data |
| POST/PUT/DELETE 🛡 | `/guidance/admin/countries[/:id]` | Manage country visa data |
