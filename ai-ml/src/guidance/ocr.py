"""Document reading pipeline: image/PDF -> OCR (Tesseract) -> MRZ / rules -> optional LLM refinement."""
import io
import os
import re
from datetime import date, timedelta

from PIL import Image, ImageOps

from . import doc_classifier, llm
from .dates import find_dates, labelled_date
from .mrz import find_mrz_lines, parse_td3

import shutil

try:
    import pytesseract
except ImportError:  # pragma: no cover
    pytesseract = None


class OcrUnavailable(RuntimeError):
    """Raised when the Tesseract OCR engine cannot be found on this machine."""


INSTALL_HELP = (
    "Tesseract OCR is not installed (or not found) on the machine running the ML service. "
    "Install it - Windows: https://github.com/UB-Mannheim/tesseract/wiki , Ubuntu: sudo apt install tesseract-ocr , "
    "macOS: brew install tesseract - then set TESSERACT_CMD in ai-ml/.env "
    "(e.g. C:\\Program Files\\Tesseract-OCR\\tesseract.exe) and restart uvicorn."
)

_COMMON_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    "/opt/homebrew/bin/tesseract",
    "/usr/local/bin/tesseract",
    "/usr/bin/tesseract",
]


def _configure_tesseract():
    """Use TESSERACT_CMD if set; otherwise PATH; otherwise try the usual install locations."""
    if pytesseract is None:
        return
    cmd = os.getenv("TESSERACT_CMD")
    if not cmd and not shutil.which("tesseract"):
        cmd = next((p for p in _COMMON_PATHS if os.path.exists(p)), None)
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd


_configure_tesseract()


def tesseract_available() -> bool:
    if pytesseract is None:
        return False
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


# Typical validity when the document does not state an expiry (assumptions; flagged to the user).
DEFAULT_VALIDITY_DAYS = {"medical": 90, "police_clearance": 180}

EXPIRY_LABELS = ["date of expiry", "expiry date", "expires", "valid until", "valid till", "valid to", "expiry"]
ISSUE_LABELS = ["date of issue", "issue date", "issued on", "date issued", "dated"]


def load_image(data: bytes, content_type: str, filename: str = "") -> Image.Image:
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        from pdf2image import convert_from_bytes
        kwargs = {"first_page": 1, "last_page": 1, "dpi": 250}
        if os.getenv("POPPLER_PATH"):
            kwargs["poppler_path"] = os.getenv("POPPLER_PATH")
        return convert_from_bytes(data, **kwargs)[0]
    return Image.open(io.BytesIO(data))


def preprocess(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img).convert("L")
    if img.width < 1600:  # upscale small photos; Tesseract works best around 300 DPI
        scale = 1600 / img.width
        img = img.resize((1600, int(img.height * scale)))
    return ImageOps.autocontrast(img)


def run_ocr(img: Image.Image, psm: int = 6):
    if pytesseract is None:
        raise OcrUnavailable("The pytesseract Python package is not installed. Run: pip install -r requirements.txt")
    try:
        text = pytesseract.image_to_string(img, config=f"--oem 3 --psm {psm}")
    except pytesseract.TesseractNotFoundError:
        raise OcrUnavailable(INSTALL_HELP)
    try:
        data = pytesseract.image_to_data(img, config=f"--oem 3 --psm {psm}", output_type=pytesseract.Output.DICT)
        confs = [float(c) for c in data["conf"] if str(c) not in ("-1", "")]
        conf = sum(confs) / len(confs) / 100 if confs else 0.0
    except Exception:
        conf = 0.0
    return text, conf


def _iso(d):
    return d.isoformat() if d else None


def _parse_llm_date(v):
    try:
        y, m, d = map(int, str(v)[:10].split("-"))
        return date(y, m, d)
    except Exception:
        return None


def extract_passport(img: Image.Image, text: str, ocr_conf: float):
    issues, checks = [], {}
    result = {"fields": {}, "issues": issues, "checks": checks, "method": "tesseract+mrz",
              "confidence": round(ocr_conf, 2), "status": "unverified", "expiryDate": None, "issueDate": None}

    lines = find_mrz_lines(text)
    if not lines:  # second attempt on the bottom third of the page, where the MRZ lives
        bottom = img.crop((0, int(img.height * 0.6), img.width, img.height))
        t2, _ = run_ocr(bottom, psm=6)
        lines = find_mrz_lines(t2)

    if lines:
        parsed = parse_td3(*lines)
        result["fields"] = parsed["fields"]
        checks.update({f"mrz_{k}": v for k, v in parsed["checks"].items()})
        checks["mrzChecksum"] = parsed["all_valid"]
        result["expiryDate"] = _iso(parsed["expiry"])
        if parsed["all_valid"]:
            result["status"] = "valid"
            result["confidence"] = max(result["confidence"], 0.95)
        else:
            result["status"] = "warning"
            bad = [k for k, v in parsed["checks"].items() if not v]
            issues.append("MRZ checksum failed for: " + ", ".join(bad) + ". Re-scan in better light or correct manually.")
        if parsed["fields"].get("nationality") and parsed["fields"]["nationality"] != "LKA":
            issues.append(f"Nationality on passport is {parsed['fields']['nationality']}, not LKA.")
    else:
        issues.append("Could not locate the machine-readable zone (the two lines of < characters at the bottom of the photo page).")

    # Optional LLM cross-check / fill gaps
    llm_fields = llm.extract(img, "passport")
    if llm_fields:
        result["method"] += "+llm"
        for k, v in llm_fields.items():
            if v and not result["fields"].get(k):
                result["fields"][k] = v
        if not result["expiryDate"]:
            d = _parse_llm_date(llm_fields.get("dateOfExpiry"))
            result["expiryDate"] = _iso(d)
            if d and result["status"] == "unverified":
                result["status"] = "warning"
                issues.append("Expiry read by AI without checksum verification; please confirm it is correct.")
        di = _parse_llm_date(llm_fields.get("dateOfIssue"))
        result["issueDate"] = _iso(di)
    return result


def extract_generic(img: Image.Image, text: str, ocr_conf: float, doc_type: str):
    issues, checks = [], {}
    fields = {}
    method = "tesseract+rules"

    llm_fields = llm.extract(img, doc_type)
    if llm_fields:
        method += "+llm"
        fields.update({k: v for k, v in llm_fields.items() if v})

    issue = _parse_llm_date(fields.get("dateOfIssue")) or labelled_date(text, ISSUE_LABELS)
    expiry = _parse_llm_date(fields.get("dateOfExpiry")) or labelled_date(text, EXPIRY_LABELS)
    if doc_type == "contract":
        expiry = expiry or _parse_llm_date(fields.get("contractEndDate"))

    if not issue:
        found = find_dates(text)
        if found:
            issue = min(d for _, d in found)  # earliest date is usually the issue date
    if not expiry and issue and doc_type in DEFAULT_VALIDITY_DAYS:
        expiry = issue + timedelta(days=DEFAULT_VALIDITY_DAYS[doc_type])
        checks["expiryEstimated"] = True
        issues.append(f"No expiry date found; assumed {DEFAULT_VALIDITY_DAYS[doc_type]} days after issue. Confirm with the issuing authority.")
    if not issue and not expiry:
        issues.append("No dates could be read. Upload a clearer image or enter the dates manually.")

    snippet = re.sub(r"\s+", " ", text).strip()[:300]
    fields.setdefault("textPreview", snippet)

    # Match the document to a requirement category (Visa / Identity / Financial / Health / Accommodation).
    try:
        guess = doc_classifier.classify(text)
        if guess["category"]:
            fields["documentCategory"] = guess["category"]
            fields["categoryConfidence"] = guess["confidence"]
    except FileNotFoundError:
        pass  # classifier not trained yet - OCR still works
    except Exception as e:  # never let classification break document reading
        print("doc classification skipped:", e)
    if issue:
        fields["dateOfIssue"] = _iso(issue)
    if expiry:
        fields["dateOfExpiry"] = _iso(expiry)

    status = "unverified"
    if expiry and not checks.get("expiryEstimated"):
        status = "valid"
    elif expiry:
        status = "warning"
    return {"fields": fields, "issues": issues, "checks": checks, "method": method,
            "confidence": round(ocr_conf, 2), "status": status,
            "expiryDate": _iso(expiry), "issueDate": _iso(issue)}


def process(data: bytes, content_type: str, filename: str, doc_type: str) -> dict:
    img = preprocess(load_image(data, content_type, filename))
    text, conf = run_ocr(img)
    if doc_type == "passport":
        return extract_passport(img, text, conf)
    return extract_generic(img, text, conf, doc_type)
