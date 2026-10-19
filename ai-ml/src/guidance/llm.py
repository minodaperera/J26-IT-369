"""Optional LLM-based field extraction (Claude). Only used when ANTHROPIC_API_KEY is configured.

Privacy note: when enabled, the document image is sent to the Anthropic API. Keep disabled if that is
not acceptable for your deployment; the local OCR + rules pipeline works without it.
"""
import base64
import io
import json
import os
import re

PROMPTS = {
    "passport": "Extract from this passport page: surname, givenNames, passportNumber, nationality, dateOfBirth, dateOfIssue, dateOfExpiry, placeOfBirth. Dates as YYYY-MM-DD.",
    "medical": "Extract from this medical certificate: patientName, passportNumber, medicalCentre, dateOfIssue, dateOfExpiry (if stated), result. Dates as YYYY-MM-DD.",
    "police_clearance": "Extract from this police clearance report: fullName, nicOrPassportNumber, dateOfIssue, dateOfExpiry (if stated), issuingAuthority. Dates as YYYY-MM-DD.",
    "contract": "Extract from this employment contract: employerName, jobTitle, salary, currency, contractStartDate, contractEndDate, durationMonths, destinationCountry. Dates as YYYY-MM-DD.",
    "other": "Extract any key identifying fields and dates (issue/expiry). Dates as YYYY-MM-DD.",
}


def enabled() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def extract(image, doc_type: str):
    """image: PIL.Image. Returns dict of fields or None on any failure."""
    if not enabled():
        return None
    try:
        import anthropic

        buf = io.BytesIO()
        image.convert("RGB").save(buf, format="JPEG", quality=85)
        b64 = base64.b64encode(buf.getvalue()).decode()
        client = anthropic.Anthropic()
        msg = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
            max_tokens=800,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}},
                    {"type": "text", "text": PROMPTS.get(doc_type, PROMPTS["other"]) +
                     " Respond with ONLY a JSON object. Use null for fields you cannot read. Do not guess."},
                ],
            }],
        )
        text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
        return json.loads(text)
    except Exception as e:  # never break the pipeline because of the LLM
        print("LLM extraction failed:", e)
        return None
