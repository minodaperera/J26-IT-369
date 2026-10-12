# SafeMaga Experiment Methodology & Validation Protocol

## 1. Dataset Lifecycle
- **Collection & Storage**: Raw datasets are stored in `ai-ml/data/raw/` in immutable format.
- **Preprocessing**: Cleaning scripts (`ai-ml/src/preprocessing/clean_data.py`) handle normalization, missing value imputation, and noise filtering.
- **Feature Store**: Processed outputs are written to `ai-ml/data/processed/`.

## 2. Experimental Design & Splitting
- **Partitioning**: 80% Training, 20% Holdout Testing (with stratified sampling across class labels).
- **Cross-Validation**: 5-fold cross-validation utilized during hyperparameter search.
- **Random Seed Lock**: All random operations locked to `random_state=42` to guarantee scientific reproducibility.

## 3. Evaluation Metrics
1. **Accuracy**:
   $$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$
2. **Precision & Recall**:
   $$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}$$
3. **F1-Score**:
   $$\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
4. **System Latency**: End-to-end request turnaround time measured in milliseconds (ms) at 50th, 95th, and 99th percentiles.

## 4. Ablation & Sensitivity Analysis Protocol
1. Baseline benchmark against linear classifier.
2. Progressive inclusion of engineered features.
3. Quantization and latency profiling of model checkpoints before release into `ai-ml/saved_models/`.
