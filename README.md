# J26-IT-369
GitHub repository for Group J26 – IT – 369

# SafeMaga | Intelligent Research & Analytics Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-yellow.svg)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-47A248.svg)](https://www.mongodb.com/)

> **SafeMaga** is a modular, multi-tier research platform integrating the **MERN** stack (MongoDB, Express, React, Node.js) with a dedicated **Python AI/ML** research environment connected through an asynchronous FastAPI inference bridge.

---

## 🏛 System Architecture

The platform separates concerns across four distinct tiers, providing scientific rigor in the machine learning subsystem while maintaining a modern, reactive user interface and a secure orchestration backend.

```
                      +---------------------------------------+
                      |         React.js + Vite Client        |
                      |            (Port: 3000)               |
                      +-------------------+-------------------+
                                          |
                                HTTP REST / JSON
                                          |
                                          v
                      +---------------------------------------+
                      |      Node.js + Express API Gateway    |
                      |            (Port: 5000)               |
                      +---------+-------------------+---------+
                                |                   |
                      Mongoose ODM        Internal HTTP Bridge
                                |                   |
                                v                   v
          +-----------------------+       +-----------------------+
          |    MongoDB Database   |       |   FastAPI ML Bridge   |
          |     (Port: 27017)     |       |     (Port: 8000)      |
          +-----------------------+       +-----------+-----------+
                                                      |
                                              Python ML Pipeline
                                          (Preprocessing/Models)
                                                      |
                                                      v
                                          +-----------------------+
                                          | Serialized Model (.joblib)
                                          +-----------------------+
```

---

## 📁 Repository Structure

```text
SafeMaga/
├── .gitignore                    # Universal ignore file (Node, Python, .env, large datasets, OS)
├── README.md                     # Project architecture, setup, and team contribution guide
│
├── frontend/                     # React.js (Vite) client application
│   ├── .env.example              # Client environment variables
│   ├── package.json              # Frontend dependencies and Vite scripts
│   ├── vite.config.js            # Vite build configuration and proxy rules
│   ├── index.html                # HTML5 entry point
│   └── src/
│       ├── assets/               # SVGs, icons, and static assets
│       ├── components/           # Modular UI components (common, layout)
│       ├── context/              # React Context (AuthContext, etc.)
│       ├── pages/                # Routed views (Home, Dashboard, NotFound)
│       ├── services/             # Axios API client and backend service wrappers
│       ├── styles/               # CSS modules and theme variables
│       ├── App.jsx               # Application routing and provider tree
│       └── main.jsx              # React DOM initialization
│
├── backend/                      # Node.js & Express API Gateway
│   ├── .env.example              # Server environment template
│   ├── package.json              # Backend dependencies and scripts
│   ├── server.js                 # Server entry point & DB connection bootstrapper
│   └── src/
│       ├── config/               # Database and environment configurations
│       ├── controllers/          # Request handlers (auth, predictions)
│       ├── middleware/           # Auth guard, request logging, error handling
│       ├── models/               # Mongoose schemas (User, AnalysisResult)
│       ├── routes/               # Modular Express API route endpoints
│       ├── services/             # AI microservice HTTP bridge client
│       └── app.js                # Express app setup and middleware pipeline
│
├── ai-ml/                        # Python AI/ML Research Environment
│   ├── .env.example              # FastAPI bridge environment template
│   ├── requirements.txt          # Python dependencies (NumPy, Scikit-learn, FastAPI, etc.)
│   ├── api/                      # FastAPI REST inference bridge (main.py)
│   ├── data/
│   │   ├── raw/                  # Immutable raw datasets (.gitignore protected)
│   │   └── processed/            # Feature-engineered and cleaned datasets
│   ├── notebooks/                # Jupyter exploratory research notebooks (EDA)
│   ├── saved_models/             # Serialized model checkpoints (.joblib, .pt)
│   └── src/
│       ├── preprocessing/        # Data transformation scripts (clean_data.py)
│       ├── training/             # Model training pipelines (train.py)
│       └── evaluation/           # Metric evaluation and validation (evaluate.py)
│
├── database/                     # MongoDB Schemas, Utilities & Seed Tools
│   ├── connection.js             # Reusable Mongoose connection utility
│   ├── README.md                 # Database instructions
│   ├── schemas/                  # Independent Mongoose schema models
│   └── seeds/                    # Seed dataset (sampleData.json, seedDatabase.js)
│
└── docs/                         # Research Documentation & API Specifications
    ├── architecture/             # Architecture overview and sequence data flow diagrams
    ├── api/                      # Node.js backend and FastAPI bridge endpoint specs
    └── research/                 # Literature review and experimental methodology
```

---

## 🛠 Tech Stack Summary

| Subsystem | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios | User interface, visualization, analytics console |
| **Backend** | Node.js, Express, JWT, Mongoose, Cors | API gateway, auth, database persistence, ML bridging |
| **AI/ML Engine** | Python 3.10+, FastAPI, Scikit-learn, Pandas | Model training, statistical evaluation, fast inference |
| **Database** | MongoDB 6.0+, Mongoose | Documents, user profiles, analysis audit logs |
| **Documentation**| Markdown, Mermaid.js, KaTeX | Research reproducibility, architecture specifications |

---

## 🚀 Local Setup & Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.x or later (`node -v`)
- **Python**: v3.10 or later (`python --version`)
- **MongoDB**: Community Server running locally on `localhost:27017` or MongoDB Atlas URI

---

### 2. Backend Setup (`/backend`)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Server boots at http://localhost:5000
```

---

### 3. AI/ML Environment & FastAPI Bridge (`/ai-ml`)
```bash
cd ai-ml
cp .env.example .env

# Create and activate Python virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install research dependencies
pip install -r requirements.txt

# (Optional) Run model training pipeline
python src/training/train.py

# Launch FastAPI Inference Bridge
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
# Interactive Swagger docs: http://127.0.0.1:8000/docs
```

---

### 4. Database Initialization & Seeding (`/database`)
```bash
# Seed initial 4-member team profiles and baseline experiments
node database/seeds/seedDatabase.js
```

---

### 5. Frontend Client Setup (`/frontend`)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Frontend web portal boots at http://localhost:3000
```

---

## 👥 4-Member Research Team Contribution Guide

To maintain engineering discipline and prevent merge collisions across frontend, backend, database, and AI subsystems, the research group follows a strict role and branch governance model.

### 1. Team Role & Subsystem Ownership Matrix

| Member | Primary Role | Domain Responsibility | Primary Workspace |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Software Architect & Backend Lead** | Express gateway, API design, security/JWT, ML bridge service | `/backend`, `/docs/api` |
| **Member 2** | **Frontend & UI/UX Specialist** | React client, Vite configuration, user state, data visualization | `/frontend` |
| **Member 3** | **AI/ML Research & Modeling Lead** | Notebooks, feature extraction, model training, evaluation metrics | `/ai-ml/src`, `/ai-ml/notebooks` |
| **Member 4** | **Data Engineer & QA Specialist** | MongoDB schemas, migrations, seeding, integration tests, docs | `/database`, `/docs` |

---

### 2. Git Branching Strategy

> *Note: Git initialization should be performed by the Project Lead once the team workspace is approved.*

We follow **Feature Branching**:
- `main`: Protected production-ready releases. Only merges from `develop` via PR with 2+ team approvals.
- `develop`: Integration branch where all completed features are tested together.
- `feature/<subsystem>-<short-description>`: Individual work branches.
  - Examples:
    - `feature/frontend-auth-modal`
    - `feature/backend-rate-limiter`
    - `feature/aiml-xgboost-baseline`
    - `feature/db-schema-validation`
- `bugfix/<issue-name>`: Targeted defect resolutions.

---

### 3. Pull Request (PR) Workflow & Quality Checklist

Before submitting a Pull Request into `develop`:
1. **Pull Latest Changes**: Ensure your branch is rebased on or merged with the latest `develop`.
2. **Clean Notebooks**: Jupyter notebooks in `/ai-ml/notebooks` must have all outputs cleared prior to commit to avoid massive git diffs.
3. **Never Commit Secrets or Datasets**:
   - Verify `.env` files are not staged (`.gitignore` protects them; use `.env.example`).
   - Raw binary models (`.h5`, `.joblib`) and large datasets (`.csv`, `.parquet`) must not be committed to Git.
4. **Peer Review**: Each PR requires at least **one peer review** from the adjacent subsystem (e.g., Frontend lead reviews Backend endpoints, AI lead reviews Data schemas).
5. **PR Title Standard**: `[<SUBSYSTEM>] Brief description` (e.g., `[AI-ML] Add confusion matrix export to evaluation pipeline`).

---

## 📄 License & Attribution
Developed for the SafeMaga Research Initiative (2026). All rights reserved.
