
import React, { useState } from "react";

const BASE = "http://127.0.0.1:8001/component4";

const RULE_API = `${BASE}/analyze`;
const IMAGE_API = `${BASE}/analyze-image`;
const ML_API = `${BASE}/predict-ml`;

const panel = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 26,
  marginBottom: 26,
  boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: 15,
  fontSize: 15,
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  lineHeight: 1.6,
  resize: "vertical"
};

const primaryButton = {
  padding: "12px 22px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600
};

const secondaryButton = {
  ...primaryButton,
  background: "#e2e8f0",
  color: "#172033"
};

// Shared helper for JSON-based analysis endpoints
async function postAnalysis(url, adText) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: adText })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}

// Run the rule-based and trained ML models independently
async function analyzeBoth(adText) {
  const [ruleResponse, mlResponse] =
    await Promise.allSettled([
      postAnalysis(RULE_API, adText),
      postAnalysis(ML_API, adText)
    ]);

  const errors = [];

  if (ruleResponse.status === "rejected") {
    errors.push(
      "Rule-based analysis: " +
      ruleResponse.reason.message
    );
  }

  if (mlResponse.status === "rejected") {
    errors.push(
      "ML analysis: " + mlResponse.reason.message
    );
  }

  return {
    ruleResult:
      ruleResponse.status === "fulfilled"
        ? ruleResponse.value
        : null,

    mlResult:
      mlResponse.status === "fulfilled"
        ? mlResponse.value
        : null,

    error: errors.join(" | ")
  };
}

// Display rule-based results
function RuleResult({ result }) {
  if (!result) return null;

  const indicators = result.indicators || [];

  const colors = {
    "Safe": "#64748b",
    "Suspicious": "#d97706",
    "High-Risk Scam": "#dc2626"
  };

  const color = colors[result.riskLevel] || "#64748b";

  return (
    <div style={{
      padding: 20,
      background: "#f8fafc",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      minWidth: 0
    }}>
      <h3>Rule-Based Detection</h3>

      <p style={{ color, fontWeight: 700 }}>
        {result.riskLevel === "Safe"
          ? "No Predefined Warning Indicators"
          : result.riskLevel}
      </p>

      <p>
        <strong>Indicator Score:</strong>{" "}
        {result.riskScore}/10
      </p>

      <h4>Warning Indicators</h4>

      {indicators.length === 0 ? (
        <p>
          No predefined warning indicators were found.
          This does not establish legitimacy.
        </p>
      ) : (
        <ul style={{ paddingLeft: 20 }}>
          {indicators.map((item, index) => (
            <li key={index} style={{ marginBottom: 12 }}>
              <strong>{item.name}</strong>

              <p style={{ margin: "5px 0" }}>
                Matched: "{item.evidence}"
              </p>

              <small>
                Points: {item.points}
              </small>
            </li>
          ))}
        </ul>
      )}

      <h4>Safety Recommendation</h4>

      <p>{result.recommendation}</p>

      <small style={{ color: "#64748b" }}>
        {result.disclaimer}
      </small>
    </div>
  );
}


function MLResult({ result }) {
  if (!result) return null;

  const isHighRisk =
    result.prediction === "High-Risk Scam";

  const color = isHighRisk ? "#dc2626" : "#475569";

  const explanation = result.explanation;

  // Make spaces in character n-grams visible.
  const showFeature = (feature) =>
    feature.replace(/ /g, "␠");

  return (
    <div style={{
      padding: 20,
      background: "#f8fafc",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      minWidth: 0
    }}>
      <h3>Trained ML Prediction</h3>

      <p style={{
        color,
        fontWeight: 700,
        fontSize: 19
      }}>
        {result.prediction === "Safe"
          ? "Safe (Experimental Label)"
          : result.prediction}
      </p>

      <p>
        <strong>Model:</strong> {result.modelName}
      </p>

      <p>
        <strong>Method:</strong> {result.method}
      </p>

      <p>
        <strong>Training Data:</strong> {result.trainingSource}
      </p>

      <p>
        <strong>Research Status:</strong> {result.researchStatus}
      </p>

      {/* GENUINE ML EXPLAINABILITY */}

      {explanation && (
        <div style={{
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: 16,
          marginTop: 20
        }}>
          <h3 style={{ marginTop: 0 }}>
            Explainable AI (XAI)
          </h3>

          <p style={{
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.6
          }}>
            The following character fragments
            contributed to the trained SVM
            prediction. These are model features,
            not manually defined scam indicators.
          </p>

          <h4 style={{ color: "#15803d" }}>
            Features Supporting the Prediction
          </h4>

          {explanation.supportingFeatures?.length ? (
            <ul style={{ paddingLeft: 20 }}>
              {explanation.supportingFeatures.map(
                (item, index) => (
                  <li key={index} style={{
                    marginBottom: 9,
                    overflowWrap: "anywhere"
                  }}>
                    <code>
                      {showFeature(item.feature)}
                    </code>

                    <span style={{
                      color: "#15803d",
                      marginLeft: 10,
                      fontWeight: 600
                    }}>
                      +{Number(item.contribution).toFixed(5)}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>No supporting features were identified.</p>
          )}

          <h4 style={{ color: "#b45309" }}>
            Features Opposing the Prediction
          </h4>

          {explanation.opposingFeatures?.length ? (
            <ul style={{ paddingLeft: 20 }}>
              {explanation.opposingFeatures.map(
                (item, index) => (
                  <li key={index} style={{
                    marginBottom: 9,
                    overflowWrap: "anywhere"
                  }}>
                    <code>
                      {showFeature(item.feature)}
                    </code>

                    <span style={{
                      color: "#b45309",
                      marginLeft: 10,
                      fontWeight: 600
                    }}>
                      {Number(item.contribution).toFixed(5)}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>No opposing features were identified.</p>
          )}

          <p style={{
            fontSize: 12,
            color: "#64748b",
            lineHeight: 1.6
          }}>
            {explanation.note}
          </p>
        </div>
      )}

      {/* RESEARCH LIMITATION */}

      <div style={{
        padding: 14,
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: 8,
        marginTop: 18
      }}>
        <strong>Research Limitation</strong>

        <p style={{
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 0
        }}>
          {result.disclaimer}
        </p>
      </div>

      <p style={{
        fontSize: 13,
        color: "#64748b",
        marginTop: 15
      }}>
        ML feature contributions and rule-based
        warning indicators are separate explanations.
        Neither establishes that the prediction
        is correct or the advertisement is fraudulent.
      </p>
    </div>
  );
}


// Display both methods next to each other
function AnalysisResults({ ruleResult, mlResult }) {
  if (!ruleResult && !mlResult) return null;

  return (
    <div style={{ marginTop: 24 }} aria-live="polite">
      <h2 style={{ fontSize: 22 }}>
        Fraud Risk Assessment
      </h2>

      <p style={{
        color: "#64748b",
        fontSize: 14
      }}>
        Independent prototype results.
        Neither output confirms fraud or safety.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(270px, 1fr))",
        gap: 18
      }}>
        <RuleResult result={ruleResult} />
        <MLResult result={mlResult} />
      </div>
    </div>
  );
}

export default function FraudChecker() {

  // Image analysis states
  const [imageFile, setImageFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [imageRule, setImageRule] = useState(null);
  const [imageML, setImageML] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageMessage, setImageMessage] = useState("");

  // Text analysis states
  const [text, setText] = useState("");
  const [textRule, setTextRule] = useState(null);
  const [textML, setTextML] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");

  // SECTION 1: OCR image analysis
  const analyzeImage = async () => {
    if (!imageFile) {
      setImageError("Please select an image.");
      return;
    }

    if (![
      "image/jpeg",
      "image/png",
      "image/webp"
    ].includes(imageFile.type)) {
      setImageError("Use a PNG, JPG or WebP image.");
      return;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      setImageError("Maximum image size is 5 MB.");
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageMessage("");
    setImageRule(null);
    setImageML(null);
    setOcrText("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(IMAGE_API, {
        method: "POST",
        body: formData
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : `Image API error ${response.status}`
        );
      }

      // Keep OCR output separate from manual text
      const extracted = (
        data.extractedText || ""
      ).slice(0, 10000);

      setOcrText(extracted);

      // Existing image endpoint returns rule results
      setImageRule(data.analysis || null);

      setImageMessage(
        "Image OCR completed. ML analysis is running."
      );

      // Classify OCR text using trained ML model
      try {
        const ml = await postAnalysis(
          ML_API,
          extracted
        );

        setImageML(ml);
        setImageMessage(
          "Image OCR and both analyses completed."
        );

      } catch (mlError) {
        setImageError(
          "OCR succeeded, but ML prediction failed: " +
          mlError.message
        );
        setImageMessage(
          "OCR and rule-based analysis completed."
        );
      }

    } catch (err) {
      setImageError(
        "Image analysis failed: " + err.message
      );
    } finally {
      setImageLoading(false);
    }
  };

  // Reanalyze corrected OCR text with both methods
  const reanalyzeOcr = async () => {
    if (ocrText.trim().length < 10) {
      setImageError(
        "OCR text must contain at least 10 characters."
      );
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageMessage("");
    setImageRule(null);
    setImageML(null);

    try {
      const result = await analyzeBoth(ocrText);

      setImageRule(result.ruleResult);
      setImageML(result.mlResult);
      setImageError(result.error);

      if (!result.error) {
        setImageMessage(
          "Corrected OCR text analyzed successfully."
        );
      }
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageLoading(false);
    }
  };

  // SECTION 2: Manual text analysis
  const analyzeText = async () => {
    if (text.trim().length < 10) {
      setTextError(
        "Enter at least 10 characters."
      );
      return;
    }

    setTextLoading(true);
    setTextError("");
    setTextRule(null);
    setTextML(null);

    try {
      const result = await analyzeBoth(text);

      setTextRule(result.ruleResult);
      setTextML(result.mlResult);
      setTextError(result.error);

    } catch (err) {
      setTextError(err.message);
    } finally {
      setTextLoading(false);
    }
  };

  const loadDemo = () => {
    setText(
      "100% guaranteed Canada visa approval. " +
      "Pay Rs. 120000 immediately to secure your job."
    );

    setTextRule(null);
    setTextML(null);
    setTextError("");
  };

  return (
    <main style={{
      background: "#f4f7fc",
      minHeight: "90vh",
      padding: "45px 20px",
      color: "#172033"
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto"
      }}>

        {/* Header */}

        <p style={{
          color: "#2563eb",
          fontWeight: 700
        }}>
          SAFEMAGA | RESEARCH COMPONENT 04
        </p>

        <h1>
          AI-Assisted Migration Scam Detection
        </h1>

        <p style={{
          color: "#64748b",
          lineHeight: 1.7,
          marginBottom: 30
        }}>
          Analyze migration advertisements through
          OCR, explainable rule-based screening,
          and a trained Machine Learning prototype.
        </p>

        <a
  href="/fraud-awareness"
  style={{
    display: "inline-block",
    padding: "13px 22px",
    marginBottom: "24px",
    background: "#0f766e",
    color: "#ffffff",
    borderRadius: "9px",
    fontWeight: 600,
    textDecoration: "none"
  }}
>
  🛡️ Explore Fraud Awareness & Safe Migration
</a>

        {/* IMAGE ANALYSIS SECTION */}

        <section style={panel}>
          <h2>Image Advertisement Analysis</h2>

          <p style={{ color: "#64748b" }}>
            Upload a screenshot or migration
            advertisement poster.
          </p>

          <div style={{
            padding: 22,
            background: "#f8fafc",
            borderRadius: 12,
            border: "2px dashed #cbd5e1"
          }}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Select advertisement image"
              onChange={(e) => {
                setImageFile(
                  e.target.files?.[0] || null
                );
                setOcrText("");
                setImageRule(null);
                setImageML(null);
                setImageError("");
                setImageMessage("");
              }}
            />

            {imageFile && (
              <p style={{ fontSize: 14 }}>
                Selected: {imageFile.name}
              </p>
            )}

            <p style={{
              color: "#64748b",
              fontSize: 13
            }}>
              PNG, JPG or WebP. Maximum 5 MB.
            </p>

            <button
              type="button"
              style={primaryButton}
              disabled={!imageFile || imageLoading}
              onClick={analyzeImage}
            >
              {imageLoading
                ? "Processing Image..."
                : "Analyze Uploaded Image"}
            </button>
          </div>

          {/* OCR Text Editor */}

          {ocrText && (
            <div style={{ marginTop: 24 }}>
              <h3>OCR Extracted Text</h3>

              <p style={{ color: "#64748b" }}>
                Correct any OCR mistakes below.
                Changes stay in the image section.
              </p>

              <textarea
                value={ocrText}
                maxLength={10000}
                rows={7}
                aria-label="OCR extracted text"
                style={textareaStyle}
                onChange={(e) => {
                  setOcrText(e.target.value);
                  setImageRule(null);
                  setImageML(null);
                  setImageMessage("");
                }}
              />

              <button
                type="button"
                style={{
                  ...secondaryButton,
                  marginTop: 12
                }}
                disabled={imageLoading}
                onClick={reanalyzeOcr}
              >
                Reanalyze Corrected OCR Text
              </button>
            </div>
          )}

          {imageMessage && (
            <p role="status" style={{ color: "#15803d" }}>
              {imageMessage}
            </p>
          )}

          {imageError && (
            <p role="alert" style={{ color: "#dc2626" }}>
              {imageError}
            </p>
          )}

          <AnalysisResults
            ruleResult={imageRule}
            mlResult={imageML}
          />
        </section>

        {/* TEXT ANALYSIS SECTION */}

        <section style={panel}>
          <h2>Text Advertisement Analysis</h2>

          <p style={{ color: "#64748b" }}>
            Paste migration or overseas
            recruitment advertisement text.
          </p>

          <textarea
            value={text}
            rows={7}
            maxLength={10000}
            style={textareaStyle}
            aria-label="Manual advertisement text"
            placeholder="Paste advertisement text here..."
            onChange={(e) => {
              setText(e.target.value);
              setTextRule(null);
              setTextML(null);
              setTextError("");
            }}
          />

          <div style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap"
          }}>
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
            <p role="alert" style={{ color: "#dc2626" }}>
              {textError}
            </p>
          )}

          <AnalysisResults
            ruleResult={textRule}
            mlResult={textML}
          />
        </section>

        {/* Research disclaimer */}

        <p style={{
          textAlign: "center",
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.7
        }}>
          SafeMaga Component 4 — Research Prototype.
          OCR supports English, Sinhala and Tamil.
          Rule-based screening remains English-focused.
          The trained ML classifier uses a small
          synthetic dataset and has not been validated
          for real-world fraud detection.
        </p>

      </div>
    </main>
  );
}
