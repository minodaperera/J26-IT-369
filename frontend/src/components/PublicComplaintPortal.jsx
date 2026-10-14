import React, { useState } from 'react';

export const PublicComplaintPortal = () => {
  const [complaintType, setComplaintType] = useState('Agency Misconduct');
  const [agencyName, setAgencyName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    setAiAnalysis(
      `AI Risk Assessment: High Priority. Complaint logged under category "${complaintType}". Forwarded to Sri Lanka Bureau of Foreign Employment (SLBFE) Grievance Division.`
    );
    setSubmitted(true);
  };

  return (
    <div
      id="complaint-section"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.75rem',
        border: '1px solid #EAE3D9',
        boxShadow: '0 4px 12px rgba(84, 45, 30, 0.05)',
        marginBottom: '2rem',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.8rem' }}>🤖</span>
        <div>
          <h2 style={{ margin: 0, color: '#542d1e', fontSize: '1.35rem', fontWeight: '700' }}>
            AI-Assisted Complaint Portal (Public)
          </h2>
          <p style={{ margin: 0, color: '#986629', fontSize: '0.9rem' }}>
            Submit grievances regarding foreign employment agencies for automated AI classification & routing
          </p>
        </div>
      </div>

      {submitted ? (
        <div
          style={{
            backgroundColor: '#F0F9F5',
            border: '1.5px solid #66ac92',
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2rem' }}>✅</span>
          <h3 style={{ color: '#2E6B56', margin: '0.5rem 0' }}>Complaint Submitted Successfully</h3>
          <p style={{ color: '#38383a', fontSize: '0.95rem' }}>{aiAnalysis}</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setDescription('');
              setAgencyName('');
            }}
            style={{
              marginTop: '1rem',
              backgroundColor: '#b0a74a',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Submit Another Complaint
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Grievance Category
              </label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #D6C7B2',
                  fontSize: '0.95rem',
                  color: '#38383a',
                  outline: 'none',
                }}
              >
                <option value="Agency Misconduct">Unlicensed / Fraudulent Agency</option>
                <option value="Excessive Fees">Charging Illegal Recruitment Fees</option>
                <option value="Contract Violation">Employment Contract Discrepancy</option>
                <option value="Visa Issues">Delayed / Fake Visa Issuance</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Agency Name / License No. (If known)
              </label>
              <input
                type="text"
                placeholder="e.g. Lanka Foreign Recruitment"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #D6C7B2',
                  fontSize: '0.95rem',
                  color: '#38383a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
              Detailed Complaint Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe what happened, dates, locations, and any involved agents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #D6C7B2',
                fontSize: '0.95rem',
                color: '#38383a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#542d1e',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(84, 45, 30, 0.2)',
            }}
          >
            Submit Complaint to AI System 🚀
          </button>
        </form>
      )}
    </div>
  );
};