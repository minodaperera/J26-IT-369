"""ICAO 9303 machine-readable-zone (MRZ) parsing and checksum verification for TD3 passports."""
import re
from datetime import date

WEIGHTS = (7, 3, 1)


def _val(ch: str) -> int:
    if ch.isdigit():
        return int(ch)
    if "A" <= ch <= "Z":
        return ord(ch) - 55
    return 0  # '<' filler


def check_digit(field: str) -> str:
    return str(sum(_val(c) * WEIGHTS[i % 3] for i, c in enumerate(field)) % 10)


def _clean_line(line: str) -> str:
    line = re.sub(r"\s+", "", line.upper())
    # common OCR confusions for the filler character
    line = line.replace("«", "<").replace("‹", "<").replace("{", "<").replace("(", "<")
    return re.sub(r"[^A-Z0-9<]", "<", line)


def find_mrz_lines(text: str):
    """Return the two 44-char TD3 lines from raw OCR text, or None."""
    cands = []
    for raw in text.splitlines():
        line = _clean_line(raw)
        if len(line) >= 40 and line.count("<") >= 3:
            cands.append(line)
    for i in range(len(cands) - 1):
        l1, l2 = cands[i], cands[i + 1]
        if l1.startswith("P"):
            return l1.ljust(44, "<")[:44], l2.ljust(44, "<")[:44]
    return None


def _date(yymmdd: str, kind: str):
    """kind='birth' resolves century so dates are in the past; kind='expiry' assumes 2000s."""
    if not re.fullmatch(r"\d{6}", yymmdd):
        return None
    yy, mm, dd = int(yymmdd[:2]), int(yymmdd[2:4]), int(yymmdd[4:])
    year = 2000 + yy
    if kind == "birth" and year > date.today().year:
        year -= 100
    try:
        return date(year, mm, dd)
    except ValueError:
        return None


def parse_td3(line1: str, line2: str) -> dict:
    names = line1[5:].split("<<", 1)
    surname = names[0].replace("<", " ").strip()
    given = names[1].replace("<", " ").strip() if len(names) > 1 else ""

    number, c_number = line2[0:9], line2[9]
    nationality = line2[10:13].replace("<", "")
    dob, c_dob = line2[13:19], line2[19]
    sex = line2[20]
    exp, c_exp = line2[21:27], line2[27]
    personal, c_personal = line2[28:42], line2[42]
    c_final = line2[43]

    checks = {
        "passportNumber": check_digit(number) == c_number,
        "dateOfBirth": check_digit(dob) == c_dob,
        "dateOfExpiry": check_digit(exp) == c_exp,
        "personalNumber": check_digit(personal) == c_personal or set(personal) == {"<"},
        "composite": check_digit(line2[0:10] + line2[13:20] + line2[21:43]) == c_final,
    }
    dob_d, exp_d = _date(dob, "birth"), _date(exp, "expiry")
    return {
        "fields": {
            "documentType": line1[0:2].replace("<", ""),
            "issuingCountry": line1[2:5].replace("<", ""),
            "surname": surname,
            "givenNames": given,
            "passportNumber": number.replace("<", ""),
            "nationality": nationality,
            "dateOfBirth": dob_d.isoformat() if dob_d else None,
            "sex": sex if sex in "MF" else "X",
            "dateOfExpiry": exp_d.isoformat() if exp_d else None,
        },
        "checks": checks,
        "expiry": exp_d,
        "all_valid": all(checks.values()),
    }
