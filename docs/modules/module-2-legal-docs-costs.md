# Module 2 - Legal, Documents & Costs

Owner: M.T. Thamadhi (IT23175402) · Component title in the proposal: *Passport & Visit Visa Step-by-Step Guidance*.
Frontend route prefix: `/guidance` · API prefix: `/api/guidance` · AI prefix: `/guidance`.

## 1. What it does (proposal objectives)

| Objective | Page (`/guidance/...`) | Backend | AI/ML |
|---|---|---|---|
| O1 Interactive country selector | `countries` (world map by difficulty / safety / cost; also filtered by the Header search box) | `routes/guidance/countries.js` | - |
| O2 Step-by-step visa guide | `countries/:slug` (visit + work visa, checklist) | same | - |
| - Document requirements by purpose | `requirements` (country + purpose -> checklist, readiness %) | `routes/guidance/requirements.js` | `doc_classifier` |
| O3 AI document reader | `documents` | `routes/guidance/documents.js` | `ocr.py`, `mrz.py`, `doc_classifier.py`, optional `llm.py` |
| O4 Cost estimator & savings planner | `costs` | `routes/guidance/costs.js` | - |
| O5 Rejection risk & weak points | `risk` | `routes/guidance/risk.js` | `visa_risk.py` |
| O6 Expiry alerts | `alerts`, `dashboard` | `routes/guidance/alerts.js` | - |
| Admin console | `admin`, `admin/users`, `admin/countries` | `routes/guidance/admin.js` | - |

Request path: **React -> Express (`/api/guidance/*`, JWT) -> FastAPI (`/guidance/*`) -> Tesseract / scikit-learn**; MongoDB stores users, countries,
requirements, document *metadata*, predictions and savings plans.

## 2. Setup

1. **Tesseract OCR program** (the Python package alone is not enough). macOS: `brew install tesseract poppler`
   (Poppler is only for PDF uploads). Windows: UB-Mannheim installer, then set `TESSERACT_CMD` / `POPPLER_PATH` in `ai-ml/.env`.
   Linux: `sudo apt install tesseract-ocr poppler-utils`. The service looks in the standard Homebrew/Windows folders automatically.
   After installing, **restart uvicorn** and check `http://localhost:8000/guidance/health` -> `"tesseract": true`.
2. **AI service**: `cd ai-ml && pip install -r requirements.txt`, then train (artifacts go to `ai-ml/saved_models/guidance/` and are git-ignored):
   ```bash
   python -m src.preprocessing.clean_guidance_requirements   # CSV -> processed CSV + database/seeds/guidance/requirements.json
   python -m src.training.train_guidance_doc_classifier
   python -m src.training.train_guidance_visa_risk
   python -m src.evaluation.evaluate_guidance                # prints saved metrics
   uvicorn api.main:app --port 8000 --reload
   ```
3. **Backend**: `cd backend && npm install && npm run seed:guidance && npm run dev` (port 5000). The seed inserts only missing records (admin edits are kept);
   `-- --reset` wipes the Module 2 collections first.
4. **Frontend**: `cd frontend && npm install && npm run dev` (port 3000). New dependencies: `react-simple-maps`, `world-atlas`.

Environment: `backend/.env` -> `MONGODB_URI`, `JWT_SECRET`, `AI_SERVICE_URL`, `USD_TO_LKR`. `ai-ml/.env` -> optional `ANTHROPIC_API_KEY`
(if set, document images are sent to the Anthropic API to fill fields OCR missed - leave empty to stay fully local).

## 3. Data and models - what is real and what is not

**Visa/country data** (`database/seeds/guidance/countries.js`) is *illustrative starting data*: fees, processing times, costs and the difficulty/safety ratings
must be verified against official embassy/immigration sites. Admins can correct them in `/guidance/admin/countries`; `lastVerified` is shown to users.

**Document-requirements dataset** (`comprehensive_visa_doc_dataset.csv`, 75 rows = 15 countries x 5 categories). Findings:
- Cleaned: country spellings fixed (`Malayasia`, `Italty`, `New Zealend`, lower-case `china`/`south Africa`/`united kingdom`, `UAE`, `USA`), the empty `visa_type` column dropped, `Interviwes` renamed, yes/no turned into booleans.
- After removing the country name, each purpose column has only **5 distinct sentences (one per category)**, identical for all 15 countries. Only the *entry type*, *biometrics*, *interview* and *notes* differ per country.
  The checklist is therefore the same generic five categories everywhere. For genuinely country-specific lists, the CSV needs country-specific rows.
- Because it is a lookup table with no outcome to predict, it is served by **lookup** (MongoDB `DocRequirement`), not by a trained model - a model could only be less accurate than reading the table.
- Only 8 of the 15 dataset countries (Malaysia, UAE, Japan, UK, Australia, South Korea, Germany, Italy) also have a visa guide in `countries.js`; the other seven (India, France, Turkey, China, South Africa, New Zealand, USA) have requirements only, and
  7 guide countries (Qatar, Saudi Arabia, Kuwait, Oman, Singapore, Thailand, Canada) have no requirements entry. The UI handles both cases.

**Document classifier** (OCR text -> requirement category; sets `fields.documentCategory`, used by the readiness check). Trained on the 25 distinct CSV sentences + 30 hand-written seed phrases.
Saved metrics (`doc_classifier_metrics.json`): trained on the CSV alone it reaches only **0.52** on 25 held-out, differently-worded phrases; with the seed phrases **0.88** (macro-F1 0.879).
The holdout phrases were written by the developers, not collected from real documents, so treat these as indicative. It abstains (returns no category) below 0.45 confidence.
**To improve it:** add real OCR text from real, anonymised documents to `ai-ml/data/raw/guidance_doc_text_samples.csv` (columns `text,category`) and retrain.

**Visa approval-risk model** (gradient boosting; weak points are counterfactual "what if you fixed this" score gains). It is trained on **synthetic** data generated from hand-written rules
(6000 rows; saved metrics acc 0.79, ROC-AUC 0.796). Those numbers only show the pipeline works - **never report them as real-world accuracy**. Retrain on real, anonymised outcomes:
`python -m src.training.train_guidance_visa_risk --data file.csv` with columns
`country_difficulty, age, monthly_income_lkr, savings_lkr, employment, travel_history_count, previous_rejections, bank_statement_months, has_return_ticket, has_accommodation, has_sponsor_or_invitation, trip_days, estimated_trip_cost_lkr, approved`.

**Document reader**: passports are read from the MRZ with all ICAO 9303 check digits verified (this is a format/integrity check, not proof of authenticity); the 6-month rule is applied against the travel date.
Medical/police documents use label-based date extraction; when no expiry is printed, an assumed validity (90 / 180 days) is applied and flagged as an estimate.

## 4. Privacy and security

- Uploaded files are processed in memory and never written to disk or MongoDB; only extracted fields are stored.
- Admins see aggregate counts only, never document contents.
- Public registration always creates role `user` (the role in the request body is ignored). Admin routes re-check the role in the database.
- Default dev accounts (`admin@safemaga.lk / Admin@12345`, `demo.lk@gmail.com / demo1234`) exist only for development: change them; the seed refuses to create them when `NODE_ENV=production` unless `SEED_ADMIN_PASSWORD` is set.

## 5. Integration notes for other modules

- Shared: `User` model (`language`, `profile` added; roles `user|researcher|engineer|lead|admin`), `Country` collection (reusable by Module 3 for per-country data), auth endpoints, `PUT /api/auth/profile`.
- Module 1 has a `CountryRule` model with passport-validity rules per country: once merged, `routes/guidance/documents.js` can use it instead of the fixed 6-month rule.
- Headers: send `Authorization: Bearer <token>` (token key in localStorage is `token`). File uploads need `Content-Type: multipart/form-data` explicitly because the shared axios instance defaults to JSON.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| "Tesseract OCR is not installed (or not found)" | Install the program (step 2.1), set `TESSERACT_CMD` if needed, restart uvicorn. |
| Upload says the AI service is unreachable | Start uvicorn from `ai-ml/` (`uvicorn api.main:app --port 8000`); check `AI_SERVICE_URL`. |
| Admin overview: "Module 2 endpoints did not load" | `pip install -r requirements.txt` in `ai-ml` (needs pillow, pytesseract, python-multipart) and restart. |
| Requirements page empty | Run `npm run seed:guidance` in `backend`. |
| Risk page: "model not trained" | Run the two training commands in step 2.2. |
| Map is blank | `npm install` in `frontend` (needs `react-simple-maps`, `world-atlas`). |
