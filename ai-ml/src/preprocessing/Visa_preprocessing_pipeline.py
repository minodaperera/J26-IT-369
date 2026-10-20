import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder

# Minimum bank balance requirements in LKR per destination country
MIN_BALANCE_REQUIREMENTS = {
    "USA": 1800000,
    "UK": 1200000,
    "Australia": 1000000,
    "Canada": 890000,
    "Italy": 800000,
    "China": 550000,
    "Germany": 500000,
    "France": 500000,
    "South Korea": 450000,
    "Japan": 400000,
    "Turkey": 350000,
    "UAE": 300000,
    "South Africa": 300000,
    "Malaysia": 250000,
    "New Zealand": 185000,
    "India": 100000
}

# Binary migration type mapping
MIGRATION_MAPPING = {
    "first_time": 0,
    "repeat": 1
}

# Peak intake calendar months (January, April, August, December)
SEASONAL_MONTHS = [1, 4, 8, 12]

class VisaDataPreprocessor(BaseEstimator, TransformerMixin):
    """
    Production-ready, reusable preprocessing pipeline for SafeMaga Visa Dataset.
    Transforms raw applicant inputs into 22 model-ready numeric features.
    Can be serialized via joblib and reused in the FastAPI inference service.
    """
    def __init__(self):
        self.min_balance_req = MIN_BALANCE_REQUIREMENTS
        self.migration_map = MIGRATION_MAPPING
        self.seasonal_months = SEASONAL_MONTHS
        self.ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        self.dest_categories_ = None
        self.feature_names_out_ = None
        
    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()
        # Fit OneHotEncoder exclusively on training destinations
        self.ohe.fit(X_df[['destination']])
        self.dest_categories_ = list(self.ohe.categories_[0])
        
        # Define deterministic feature names order
        dest_cols = [f"destination_{c}" for c in self.dest_categories_]
        self.feature_names_out_ = [
            'applicant_age',
            'available_bank_balance_lkr',
            'migration_type',
            'bank_status',
            'seasonal',
            'age_category'
        ] + dest_cols
        return self
        
    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        
        # 1. migration_type mapping (first_time -> 0, repeat -> 1)
        mig_series = X_df['migration_type'].map(self.migration_map)
        
        # 2. bank_status mapping (1 if balance >= min requirement, else 0)
        def compute_bank_status(row):
            dest = row.get('destination')
            balance = row.get('available_bank_balance_lkr')
            if pd.isna(dest) or pd.isna(balance) or dest not in self.min_balance_req:
                return np.nan
            return 1.0 if balance >= self.min_balance_req[dest] else 0.0
            
        bank_status_series = X_df.apply(compute_bank_status, axis=1)
        
        # 3. seasonal feature from document_submitted_date (months 1, 4, 8, 12 -> 1, else 0)
        sub_dates = pd.to_datetime(X_df['document_submitted_date'], errors='coerce')
        seasonal_series = sub_dates.dt.month.apply(
            lambda m: np.nan if pd.isna(m) else (1.0 if int(m) in self.seasonal_months else 0.0)
        )
        
        # 4. age_category feature from applicant_age (<=25: 0, 26-50: 1, >=51: 2)
        def compute_age_category(age):
            if pd.isna(age) or age < 18 or age > 69:
                return np.nan
            if age <= 25:
                return 0.0
            elif age <= 50:
                return 1.0
            else:
                return 2.0
                
        age_cat_series = X_df['applicant_age'].apply(compute_age_category)
        
        # 5. One-Hot Encode destination
        ohe_array = self.ohe.transform(X_df[['destination']])
        dest_col_names = [f"destination_{c}" for c in self.dest_categories_]
        dest_df = pd.DataFrame(ohe_array, columns=dest_col_names, index=X_df.index)
        
        # 6. Combine all features into clean numeric DataFrame
        processed_df = pd.DataFrame({
            'applicant_age': X_df['applicant_age'].astype(float),
            'available_bank_balance_lkr': X_df['available_bank_balance_lkr'].astype(float),
            'migration_type': mig_series.astype(float),
            'bank_status': bank_status_series.astype(float),
            'seasonal': seasonal_series.astype(float),
            'age_category': age_cat_series.astype(float)
        }, index=X_df.index)
        
        final_df = pd.concat([processed_df, dest_df], axis=1)
        return final_df[self.feature_names_out_]
