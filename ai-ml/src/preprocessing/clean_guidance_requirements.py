"""Module 2: clean the document-requirements CSV and export the backend seed file.

    python -m src.preprocessing.clean_guidance_requirements [--csv path]
"""
from src.guidance.requirements_data import main

if __name__ == "__main__":
    main()
