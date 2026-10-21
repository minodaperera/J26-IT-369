
import React, { useMemo, useState } from "react";

// SafeMaga Component 4 - Admin Dashboard Prototype
// All cases are fictional demonstration data.
// No backend, authentication or real reporting is connected.

const initialCases = [
  {
    id: "DEMO-001",
    language: "English",
    source: "WhatsApp",
    risk: "High-Risk Scam",
    status: "Pending",
    text:
      "100% guaranteed Canada visa approval. " +
      "Pay Rs. 120000 immediately to secure your job.",
    indicators: [
      "Unrealistic guarantee",
      "Advance payment",
      "Urgency"
    ],
    notes: ""
  },
  {
    id: "DEMO-002",
    language: "Sinhala",
    source: "Facebook",
    risk: "High-Risk Scam",
    status: "Pending",
    text:
      "කැනඩා වීසා 100% සහතිකයි. " +
      "ඔබගේ ගිණුම් අංකය සහ මුදල් අදම එවන්න.",
    indicators: [
      "Visa guarantee",
      "Payment request"
    ],
    notes: ""
  },
  {
    id: "DEMO-003",
    language: "Tamil",
    source: "Social media",
    risk: "High-Risk Scam",
    status: "In Review",
    text:
      "உடனடி வேலை! நேர்முகத் தேர்வு தேவையில்லை. " +
      "பதிவு கட்டணத்தை இன்று செலுத்துங்கள்.",
    indicators: [
      "No interview",
      "Advance fee",
      "Urgency"
    ],
    notes: "Verify the recruitment information."
  },
  {
    id: "DEMO-004",
    language: "English",
    source: "Website",
    risk: "Safe",
    status: "Reviewed",
    text:
      "Licensed recruitment agency offering " +
      "caregiver positions. Verify the agency " +
      "licence through official sources.",
    indicators: [
      "No predefined warning indicators"
    ],
    notes:
      "Demo review completed. This does not " +
      "certify the advertisement as legitimate."
  },
  {
    id: "DEMO-005",
    language: "English",
    source: "Facebook",
    risk: "Suspicious",
    status: "Pending",
    text:
      "Overseas employment opportunities. " +
      "Limited vacancies. Contact our agent " +
      "for further details today.",
    indicators: [
      "Possible urgency",
      "Further verification needed"
    ],
    notes: ""
  },
  {
    id: "DEMO-006",
    language: "Tamil",
    source: "WhatsApp",
    risk: "High-Risk Scam",
    status: "In Review",
    text:
      "வெளிநாட்டு வேலை உறுதி. " +
      "முன்பணம் உடனே செலுத்துங்கள்.",
    indicators: [
      "Employment guarantee",
      "Advance payment"
    ],
    notes: ""
  }
];

const statusOptions = [
  "Pending",
  "In Review",
  "Reviewed"
];

const statusColors = {
  Pending: "#d97706",
  "In Review": "#2563eb",
  Reviewed: "#15803d"
};

const riskColors = {
  "High-Risk Scam": "#dc2626",
  Suspicious: "#d97706",
  Safe: "#475569"
};

const card = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 3px 12px rgba(0,0,0,0.04)"
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#ffffff",
  color: "#172033",
  fontSize: 14
};

function StatCard({ title, count, color }) {
  return (
    <div style={card}>
      <p style={{
        color: "#64748b",
        fontWeight: 600,
        marginTop: 0
      }}>
        {title}
      </p>

      <h2 style={{
        fontSize: 32,
        color,
        marginBottom: 0
      }}>
        {count}
      </h2>
    </div>
  );
}

export default function Component4AdminDemo() {
  const [cases, setCases] = useState(initialCases);
  const [selectedId, setSelectedId] = useState("DEMO-001");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");

  // Statistics are calculated from the current demo cases.
  const stats = {
    total: cases.length,
    pending: cases.filter(
      (item) => item.status === "Pending"
    ).length,
    inReview: cases.filter(
      (item) => item.status === "In Review"
    ).length,
    reviewed: cases.filter(
      (item) => item.status === "Reviewed"
    ).length
  };

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const searchText = [
        item.id,
        item.text,
        item.language,
        item.source,
        item.risk
      ].join(" ").toLowerCase();

      const matchesSearch =
        !query || searchText.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesLanguage =
        languageFilter === "All" ||
        item.language === languageFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLanguage
      );
    });
  }, [cases, search, statusFilter, languageFilter]);

  const selectedCase = cases.find(
    (item) => item.id === selectedId
  );

  function updateCase(changes) {
    setCases((previous) =>
      previous.map((item) =>
        item.id === selectedId
          ? { ...item, ...changes }
          : item
      )
    );
  }

  function resetDemo() {
    setCases(initialCases);
    setSelectedId("DEMO-001");
    setSearch("");
    setStatusFilter("All");
    setLanguageFilter("All");
  }

  return (
    <main style={{
      background: "#f4f7fc",
      minHeight: "100vh",
      padding: "40px 20px",
      color: "#172033"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto"
      }}>

        {/* PAGE HEADER */}

        <p style={{
          color: "#2563eb",
          fontWeight: 700
        }}>
          SAFEMAGA | COMPONENT 04
        </p>

        <h1 style={{
          fontSize: 32,
          marginBottom: 8
        }}>
          Fraud Report Review Dashboard
        </h1>

        <p style={{
          color: "#64748b",
          lineHeight: 1.7
        }}>
          Demonstration of advertisement review,
          case tracking and administrative decisions.
        </p>

        {/* IMPORTANT DEMO NOTICE */}

        <div style={{
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: 10,
          padding: 17,
          margin: "22px 0"
        }}>
          <strong>Research Demonstration Mode</strong>

          <p style={{
            marginBottom: 0,
            lineHeight: 1.7
          }}>
            All reports on this dashboard are
            fictional synthetic examples.
            Status changes and notes exist only
            in this browser session and reset
            when the page reloads.
            This is not a live administrative
            service and has no authentication
            or database connection.
          </p>
        </div>

        {/* SUMMARY CARDS */}

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 26
        }}>
          <StatCard
            title="Total Demo Reports"
            count={stats.total}
            color="#172033"
          />

          <StatCard
            title="Pending Review"
            count={stats.pending}
            color="#d97706"
          />

          <StatCard
            title="In Review"
            count={stats.inReview}
            color="#2563eb"
          />

          <StatCard
            title="Reviewed"
            count={stats.reviewed}
            color="#15803d"
          />
        </div>

        {/* FILTERS */}

        <section style={{
          ...card,
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 21, marginTop: 0 }}>
            Search and Filter Reports
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14
          }}>
            <div>
              <label htmlFor="case-search">
                Search
              </label>

              <input
                id="case-search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Case ID or advertisement text"
                style={{
                  ...inputStyle,
                  marginTop: 7
                }}
              />
            </div>

            <div>
              <label htmlFor="status-filter">
                Review Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                style={{
                  ...inputStyle,
                  marginTop: 7
                }}
              >
                <option value="All">All statuses</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language-filter">
                Advertisement Language
              </label>

              <select
                id="language-filter"
                value={languageFilter}
                onChange={(e) =>
                  setLanguageFilter(e.target.value)
                }
                style={{
                  ...inputStyle,
                  marginTop: 7
                }}
              >
                <option value="All">All languages</option>
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>
        </section>

        {/* CASE LIST AND DETAILS */}

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 22,
          alignItems: "start"
        }}>

          {/* LEFT - CASE QUEUE */}

          <section style={card}>
            <h2 style={{
              fontSize: 21,
              marginTop: 0
            }}>
              Flagged Advertisement Queue
            </h2>

            <p style={{
              color: "#64748b",
              fontSize: 14
            }}>
              Showing {filteredCases.length} of{" "}
              {cases.length} demo reports
            </p>

            {filteredCases.length === 0 && (
              <p>No matching demonstration reports.</p>
            )}

            <div style={{
              display: "grid",
              gap: 12
            }}>
              {filteredCases.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedId(item.id)
                  }
                  style={{
                    textAlign: "left",
                    width: "100%",
                    background:
                      selectedId === item.id
                        ? "#eff6ff"
                        : "#ffffff",
                    border:
                      selectedId === item.id
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 15,
                    cursor: "pointer",
                    color: "#172033"
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8
                  }}>
                    <strong>{item.id}</strong>

                    <span style={{
                      color: statusColors[item.status],
                      fontSize: 13,
                      fontWeight: 700
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <p style={{
                    margin: "11px 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    overflowWrap: "anywhere"
                  }}>
                    {item.text.length > 110
                      ? item.text.slice(0, 110) + "..."
                      : item.text}
                  </p>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                    fontSize: 13
                  }}>
                    <span>
                      {item.language} · {item.source}
                    </span>

                    <strong style={{
                      color: riskColors[item.risk]
                    }}>
                      {item.risk}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT - SELECTED CASE */}

          <section style={card}>
            <h2 style={{
              fontSize: 21,
              marginTop: 0
            }}>
              Case Review Details
            </h2>

            {selectedCase ? (
              <>
                <p>
                  <strong>Case ID:</strong>{" "}
                  {selectedCase.id}
                </p>

                <p>
                  <strong>Language:</strong>{" "}
                  {selectedCase.language}
                </p>

                <p>
                  <strong>Source:</strong>{" "}
                  {selectedCase.source}
                </p>

                <p>
                  <strong>Preliminary Risk:</strong>{" "}
                  <span style={{
                    color:
                      riskColors[selectedCase.risk],
                    fontWeight: 700
                  }}>
                    {selectedCase.risk}
                  </span>
                </p>

                <h3>Advertisement Content</h3>

                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 9,
                  padding: 16,
                  lineHeight: 1.7,
                  overflowWrap: "anywhere"
                }}>
                  {selectedCase.text}
                </div>

                <h3>Demo Warning Indicators</h3>

                <ul style={{
                  paddingLeft: 22,
                  lineHeight: 1.8
                }}>
                  {selectedCase.indicators.map(
                    (indicator, index) => (
                      <li key={index}>
                        {indicator}
                      </li>
                    )
                  )}
                </ul>

                <h3>Administrative Review</h3>

                <label htmlFor="case-status">
                  Review Status
                </label>

                <select
                  id="case-status"
                  value={selectedCase.status}
                  onChange={(e) =>
                    updateCase({
                      status: e.target.value
                    })
                  }
                  style={{
                    ...inputStyle,
                    marginTop: 8,
                    marginBottom: 18
                  }}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <label htmlFor="review-notes">
                  Reviewer Notes
                </label>

                <textarea
                  id="review-notes"
                  value={selectedCase.notes}
                  onChange={(e) =>
                    updateCase({
                      notes: e.target.value
                    })
                  }
                  rows={5}
                  placeholder={
                    "Record verification steps or " +
                    "follow-up actions for this demo case..."
                  }
                  style={{
                    ...inputStyle,
                    marginTop: 8,
                    resize: "vertical"
                  }}
                />

                <p style={{
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.7
                }}>
                  Status changes represent a
                  demonstration of administrative
                  workflow only. Marking a case
                  Reviewed does not confirm that
                  the advertisement is fraudulent
                  or legitimate.
                </p>
              </>
            ) : (
              <p>Select a case to inspect.</p>
            )}
          </section>
        </div>

        {/* RESET AND RESEARCH LIMITATION */}

        <div style={{
          textAlign: "center",
          marginTop: 28
        }}>
          <button
            type="button"
            onClick={resetDemo}
            style={{
              background: "#e2e8f0",
              color: "#172033",
              border: "none",
              borderRadius: 8,
              padding: "12px 22px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Reset Demonstration Data
          </button>

          <p style={{
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.7,
            marginTop: 20
          }}>
            SafeMaga Component 4 — Admin UI Prototype.
            Real flagged submissions, secure authentication,
            authorization, persistent storage and
            audit logging are planned development stages.
          </p>
        </div>

      </div>
    </main>
  );
}
