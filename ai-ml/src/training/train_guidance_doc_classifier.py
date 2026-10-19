"""Module 2: train the document-category classifier (OCR text -> requirement category).

    python -m src.training.train_guidance_doc_classifier

Run src.preprocessing.clean_guidance_requirements first (it creates the cleaned CSV this reads).
To improve accuracy, add real OCR text to data/raw/guidance_doc_text_samples.csv (columns: text,category).
"""
import logging

from src.guidance.doc_classifier import train

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

if __name__ == "__main__":
    train()
