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

## Running Seed Scripts
Ensure your MongoDB daemon is running locally (default: `mongodb://localhost:27017/safemaga_db`):
```bash
# From workspace root
node database/seeds/seedDatabase.js
```
