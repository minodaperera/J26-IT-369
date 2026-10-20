import os
import sys
from pathlib import Path
from dataclasses import dataclass, field
from dotenv import load_dotenv

api_dir = Path(__file__).resolve().parent
project_root = api_dir.parent
src_dir = project_root / "src"

# Ensure ai-ml/src is on sys.path for unpickling preprocessor and custom classes
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Load .env if present
env_path = project_root / ".env"
if env_path.exists():
    load_dotenv(env_path)

@dataclass
class Settings:
    PROJECT_NAME: str = "SafeMaga AI/ML Microservice"
    API_VERSION: str = "v1.0.0"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Path configurations
    PROJECT_ROOT: Path = project_root
    SAVED_MODELS_DIR: Path = project_root / "saved_models"
    VISA_MODEL_PATH: Path = project_root / "saved_models" / "random_forest_best_model.joblib"
    VISA_PREPROCESSOR_PATH: Path = project_root / "saved_models" / "Visa_preprocessing_pipeline.joblib"
    
    # Supported categorical values as calibrated in Step 6 & 7
    SUPPORTED_DESTINATIONS: list = field(default_factory=lambda: [
        "Australia", "Canada", "China", "France", "Germany", "India",
        "Italy", "Japan", "Malaysia", "New Zealand", "South Africa",
        "South Korea", "Turkey", "UAE", "UK", "USA"
    ])
    SUPPORTED_MIGRATION_TYPES: list = field(default_factory=lambda: ["first_time", "repeat"])
    MIN_AGE: int = 0
    MAX_AGE: int = 100

settings = Settings()
