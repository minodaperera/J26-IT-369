
import React, { useState } from "react";

// SafeMaga Component 4 API endpoints
const API_URL = "http://127.0.0.1:8001/component4/analyze";
const IMAGE_API_URL =
  "http://127.0.0.1:8001/component4/analyze-image";

// Shared interface styles
const panelStyle = {
  background: "#ffffff",
  padding: "28px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  marginBottom: "26px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "15px",
  resize: "vertical",
  lineHeight: 1.6
};

const primaryButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "13px 24px",
  cursor: "pointer",
  fontWeight: 600
};

const secondaryButton = {
  background: "#e2e8f0",
  color: "#172033",
  border: "none",
  borderRadius: "8px",
  padding: "13px 20px",
  cursor: "pointer",
  fontWeight: 600
};

// Reusable fraud analysis result component
function RiskResult({ result, title }) {
  if (!result) return null;

  const riskColors = {
    Safe: "#15803d",
    Suspicious: "#d97706",
    "High-Risk Scam": "#dc2626"
  };

  const riskColor =
    riskColors[result.riskLevel] || "#64748b";

  const displayLabel =
    result.riskLevel === "Safe"
      ? "Low Warning Indicators Detected"
      : result.riskLevel;

  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "22px",
        marginTop: "24px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}
      aria-live="polite"
    >
      <h3>{title}</h3>

      <div
        style={{
          borderLeft: `5px solid ${riskColor}`,
          background: "#ffffff",
          padding: "18px",
          borderRadius: "8px",
          marginTop: "16px"
        }}
      >
        <h2
          style={{
            color: riskColor,
            marginTop: 0
          }}
        >
          {displayLabel}
        </h2>

        <p>
          <strong>Indicator Score: </strong>
          {result.riskScore}/10
        </p>

        <small style={{ color: "#64748b" }}>
          Preliminary rule-based indicator score.
          This is not a trained ML probability
          or proof of fraud.
        </small>
      </div>

      <h3 style={{ marginTop: "24px" }}>
        Detected Warning Indicators
      </h3>

      {result.indicators?.length > 0 ? (
        <ul style={{ paddingLeft: "22px" }}>
          {result.indicators.map((item, index) => (
            <li
              key={index}
              style={{ marginBottom: "16px" }}
            >
              <strong>{item.name}</strong>

              <p style={{ margin: "5px 0" }}>
                Matched Text: "{item.evidence}"
              </p>

              <small style={{ color: "#64748b" }}>
                Indicator Points: {item.points}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#64748b" }}>
          No predefined warning indicators detected.
          This does not confirm that the advertisement
          is genuine, legitimate, or safe.
        </p>
      )}

      <h3>Safety Recommendation</h3>

      <p style={{ lineHeight: 1.7 }}>
        {result.recommendation}
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginTop: "18px"
        }}
      >
        {result.disclaimer}
      </p>
    </div>
  );
}

// Main Component 4 page
export default function FraudChecker() {

  // SECTION 1: Image analysis states
  const [imageFile, setImageFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageStatus, setImageStatus] = useState("");

  // SECTION 2: Text analysis states
  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");

  // SECTION 1 - Upload image and run OCR
  const analyzeImage = async () => {

    if (!imageFile) {
      setImageError(
        "Please select an advertisement image."
      );
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp"
    ];

    if (!allowedTypes.includes(imageFile.type)) {
      setImageError(
        "Only PNG, JPG and WebP images are supported."
      );
      return;
    }

    if (imageFile.size >  20 * 1024 * 1024) {
      setImageError(
        "Image size must not exceed 20 MB."
      );
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageResult(null);
    setOcrText("");
    setImageStatus("");

    try {
      const formData = new FormData();

      formData.append("file", imageFile);

      const response = await fetch(IMAGE_API_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          typeof errorData.detail === "string"
            ? errorData.detail
            : `API error: ${response.status}`
        );
      }

      const data = await response.json();

      // OCR results stay within the image section
      setOcrText(data.extractedText || "");
      setImageResult(data.analysis);
      setImageStatus(
        "OCR text extraction and preliminary analysis completed."
      );

    } catch (err) {
      setImageError(
        "Image analysis failed: " + err.message
      );
    } finally {
      setImageLoading(false);
    }
  };

  // SECTION 1 - Reanalyze corrected OCR text
  const reanalyzeOcr = async () => {

    if (ocrText.trim().length < 10) {
      setImageError(
        "Please enter at least 10 characters."
      );
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageResult(null);
    setImageStatus("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: ocrText
        })
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status}`
        );
      }

      const data = await response.json();

      setImageResult(data);
      setImageStatus(
        "Corrected OCR text analyzed successfully."
      );

    } catch (err) {
      setImageError(
        "Reanalysis failed: " + err.message
      );
    } finally {
      setImageLoading(false);
    }
  };

  // SECTION 2 - Analyze manually entered text
  const analyzeText = async () => {

    if (text.trim().length < 10) {
      setTextError(
        "Please enter at least 10 characters."
      );
      return;
    }

    setTextLoading(true);
    setTextError("");
    setTextResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Only update the manual text result
      setTextResult(data);

    } catch (err) {
      setTextError(
        "Text analysis failed: " + err.message
      );
    } finally {
      setTextLoading(false);
    }
  };

  const loadDemo = () => {
    setText(
      "100% guaranteed visa approval! " +
      "Pay an advance fee today. " +
      "Contact via WhatsApp only."
    );

    setTextResult(null);
    setTextError("");
  };

  return (
    <main
      style={{
        background: "#f4f7fc",
        minHeight: "90vh",
        padding: "45px 20px",
        color: "#172033"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >

        {/* PAGE HEADER */}

        <p
          style={{
            color: "#2563eb",
            fontWeight: 700,
            letterSpacing: "1px"
          }}
        >
          SAFEMAGA | RESEARCH COMPONENT 04
        </p>

        <h1
          style={{
            fontSize: "34px",
            marginBottom: "12px"
          }}
        >
          AI-Assisted Migration Scam Detection
        </h1>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.7,
            marginBottom: "32px"
          }}
        >
          Identify potential warning signs in overseas
          job, visa and migration advertisements.
          Analyze advertisement screenshots or
          manually entered text.
        </p>

        {/* SECTION 1 - IMAGE ANALYSIS */}

        <section style={panelStyle}>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "28px" }}>
              
            </span>

            <div>
              <h2 style={{ margin: 0 }}>
                Image Advertisement Analysis
              </h2>

              <p
                style={{
                  color: "#64748b",
                  margin: "6px 0"
                }}
              >
                Upload an advertisement image
                for OCR and risk screening.
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "24px",
              background: "#f8fafc",
              border: "2px dashed #cbd5e1",
              borderRadius: "12px"
            }}
          >
            <h3>Upload Advertisement Image</h3>

            <p style={{ color: "#64748b" }}>
              Supported formats: PNG, JPG, WebP.
              Maximum file size: 5 MB.
            </p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload advertisement image"
              onChange={(e) => {
                setImageFile(
                  e.target.files?.[0] || null
                );

                setOcrText("");
                setImageResult(null);
                setImageError("");
                setImageStatus("");
              }}
            />

            {imageFile && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "#475569"
                }}
              >
                Selected File: {imageFile.name}
              </p>
            )}

            <button
              type="button"
              onClick={analyzeImage}
              disabled={!imageFile || imageLoading}
              style={{
                ...primaryButton,
                marginTop: "18px",
                opacity: imageLoading ? 0.7 : 1
              }}
            >
              {imageLoading
                ? "Processing Image..."
                : "Analyze Uploaded Image"}
            </button>
          </div>

          {/* OCR EXTRACTED TEXT */}

          {ocrText && (
            <div
              style={{
                marginTop: "24px",
                background: "#f8fafc",
                padding: "22px",
                borderRadius: "12px"
              }}
            >
              <h3>OCR Extracted Text</h3>

              <p style={{ color: "#64748b" }}>
                Review the extracted text.
                You can correct OCR errors below.
              </p>

              <textarea
                value={ocrText}
                onChange={(e) => {
                  setOcrText(e.target.value);
                  setImageResult(null);
                  setImageStatus("");
                }}
                rows={7}
                maxLength={10000}
                aria-label="OCR extracted text"
                style={textareaStyle}
              />

              <button
                type="button"
                onClick={reanalyzeOcr}
                disabled={imageLoading}
                style={{
                  ...secondaryButton,
                  marginTop: "14px"
                }}
              >
                Reanalyze Corrected OCR Text
              </button>
            </div>
          )}

          {imageStatus && (
            <p
              role="status"
              style={{
                color: "#15803d",
                marginTop: "16px"
              }}
            >
              {imageStatus}
            </p>
          )}

          {imageError && (
            <p
              role="alert"
              style={{
                color: "#dc2626",
                marginTop: "16px"
              }}
            >
              {imageError}
            </p>
          )}

          {/* IMAGE ANALYSIS RESULT */}

          <RiskResult
            result={imageResult}
            title="Image Advertisement Risk Assessment"
          />

          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginTop: "16px"
            }}
          >
            OCR can extract English, Sinhala and
            Tamil text, but the current scam screening
            rules are primarily English-based.
          </p>

        </section>

        {/* SECTION 2 - MANUAL TEXT ANALYSIS */}

        <section style={panelStyle}>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "28px" }}>
            </span>

            <div>
              <h2 style={{ margin: 0 }}>
                Text Advertisement Analysis
              </h2>

              <p
                style={{
                  color: "#64748b",
                  margin: "6px 0"
                }}
              >
                Paste advertisement text
                for independent risk screening.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>

            <label htmlFor="manual-ad-text">
              <strong>Advertisement Content</strong>
            </label>

            <textarea
              id="manual-ad-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTextResult(null);
              }}
              placeholder={
                "Paste an overseas job, visa or " +
                "migration advertisement here..."
              }
              rows={7}
              maxLength={10000}
              style={{
                ...textareaStyle,
                marginTop: "12px"
              }}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "18px"
              }}
            >
              <button
                type="button"
                onClick={analyzeText}
                disabled={textLoading}
                style={primaryButton}
              >
                {textLoading
                  ? "Analyzing..."
                  : "Analyze Advertisement"}
              </button>

              <button
                type="button"
                onClick={loadDemo}
                disabled={textLoading}
                style={secondaryButton}
              >
                Load Demo Advertisement
              </button>
            </div>

            {textError && (
              <p
                role="alert"
                style={{
                  color: "#dc2626",
                  marginTop: "16px"
                }}
              >
                {textError}
              </p>
            )}

          </div>

          {/* MANUAL TEXT ANALYSIS RESULT */}

          <RiskResult
            result={textResult}
            title="Text Advertisement Risk Assessment"
          />

        </section>

        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px",
            lineHeight: 1.7
          }}
        >
          SafeMaga Research Component 4
          {" — "}Preliminary Research Prototype.
          <br />
          Current detection uses transparent
          rule-based indicators.
          ML model development and evaluation
          are pending.
        </p>

      </div>
    </main>
  );
}
