# Research Notebooks Workflow

This directory contains Jupyter notebooks for exploratory data analysis (EDA), hypothesis testing, feature experimentation, and prototyping.

## Notebook Naming Convention
To maintain clarity across the 4-person research team, prefix notebooks with a sequence number and descriptive topic:
- `01_exploratory_data_analysis.ipynb` - Initial data ingestion, distributions, and missing values.
- `02_feature_engineering.ipynb` - Feature correlations, transformations, and embeddings.
- `03_baseline_model_training.ipynb` - Benchmark model selection and baseline metrics.
- `04_model_tuning_and_ablation.ipynb` - Hyperparameter search, cross-validation, and ablation analysis.

## Guidelines
1. **Reproducibility**: Clear all notebook outputs before committing to git (`Cell -> All Output -> Clear`) to prevent git diff bloat.
2. **Modularity**: Once an algorithm or cleaning step stabilizes in a notebook, refactor it into `src/preprocessing/` or `src/training/`.
3. **Environment**: Activate the Python virtual environment before launching Jupyter:
   ```bash
   # Windows
   ..\venv\Scripts\activate
   jupyter lab
   ```
