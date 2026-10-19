# SafeMaga Database Subsystem

This directory contains standalone MongoDB schemas, connection utilities, and seeding tools to ensure data consistency across development and research environments.

## Directory Structure
- `connection.js`: Reusable Mongoose connection/disconnection wrapper with environment variable support.
- `schemas/`: Modular Mongoose schema declarations.
  - `userSchema.js`: User credentials and team role metadata.
  - `analysisSchema.js`: Experiment runs, hypotheses, and analytical metric logs.
- `seeds/`: Initial data population files.
  - `sampleData.json`: Seed data for the 4-person research team and initial experiments.
  - `seedDatabase.js`: Automated seed runner script.

- `schemas/` was missing from the repository although `seedDatabase.js` requires it; `userSchema.js` and `analysisSchema.js` were added.
- `package.json`: install the utility's own dependencies once with `cd database && npm install`.
- `seeds/guidance/`: Module 2 (Legal, Document & Cost Guidance) seed **data** - `countries.js` (visa guides + costs) and
  `requirements.json` (document requirements, generated from the CSV by `ai-ml`). It is loaded by
  `cd backend && npm run seed:guidance` (kept in `backend/` so the models and the DB connection share one mongoose instance).

## Running Seed Scripts


> **Warning:** `seeds/seedDatabase.js` **deletes all users and analyses** before inserting sample data. Never run it against a
> database that holds real accounts. After running it, re-run `cd backend && npm run seed:guidance` to restore the Module 2
> admin/demo accounts. The users it inserts have placeholder passwords and cannot log in.

Ensure your MongoDB daemon is running locally (default: `mongodb://localhost:27017/safemaga_db`):
```bash
# From workspace root
cd database && npm install && npm run seed

# Module 2 data (countries, document requirements, admin + demo accounts) - inserts only what is missing
cd backend && npm run seed:guidance            # add  -- --reset  to wipe the Module 2 collections first
```
