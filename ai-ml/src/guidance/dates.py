"""Lenient date finder for OCR text (medical certificates, police clearance, contracts)."""
import re
from datetime import date, datetime

MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], start=1)}

_PATTERNS = [
    (re.compile(r"\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b"), "ymd"),
    (re.compile(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b"), "dmy"),
    (re.compile(r"\b(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b"), "dMy"),
]


def _mk(y, m, d):
    try:
        return date(int(y), int(m), int(d))
    except ValueError:
        return None


def find_dates(text: str):
    """Return list of (position, date) found in text."""
    out = []
    for pat, kind in _PATTERNS:
        for m in pat.finditer(text):
            if kind == "ymd":
                d = _mk(m.group(1), m.group(2), m.group(3))
            elif kind == "dmy":
                d = _mk(m.group(3), m.group(2), m.group(1))  # Sri Lanka uses day-first
            else:
                mon = MONTHS.get(m.group(2)[:3].lower())
                d = _mk(m.group(3), mon, m.group(1)) if mon else None
            if d:
                out.append((m.start(), d))
    return sorted(out)


def labelled_date(text: str, labels):
    """Find the first date appearing shortly after any of the given labels."""
    low = text.lower()
    best = None
    for lab in labels:
        for m in re.finditer(re.escape(lab), low):
            window = text[m.end(): m.end() + 40]
            ds = find_dates(window)
            if ds:
                pos = m.start()
                if best is None or pos < best[0]:
                    best = (pos, ds[0][1])
    return best[1] if best else None
