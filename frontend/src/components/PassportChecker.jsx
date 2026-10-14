import React, { useState, useEffect } from 'react';

export const PassportChecker = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountryName, setSelectedCountryName] = useState('Saudi Arabia');
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/country-rules');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
          setSelectedCountryName(data[0].country);
        }
      } catch (err) {
        console.error('Error fetching country rules from server:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const selectedCountry = countries.find((c) => c.country === selectedCountryName) || countries[0];

  const calculateValidity = () => {
    if (!travelDate || !expiryDate || !selectedCountry) return null;

    const travel = new Date(travelDate);
    const expiry = new Date(expiryDate);
    const departure = returnDate ? new Date(returnDate) : travel;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travel < today) {
      return {
        status: 'invalid_date',
        message: 'Intended travel date cannot be in the past.',
      };
    }

    if (expiry <= travel) {
      return {
        status: 'expired',
        message: 'Your passport expires on or before your intended travel date.',
      };
    }

    const anchorDate = selectedCountry.validity_basis === 'departure' ? departure : travel;
    const diffTime = expiry.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = parseFloat((diffDays / 30.4375).toFixed(1));

    const minDays = selectedCountry.validity_min_days;
    const isValid = diffDays >= minDays;

    const basisLabel =
      selectedCountry.validity_basis === 'departure'
        ? 'planned return/departure date'
        : selectedCountry.validity_basis === 'stay_end'
        ? 'full stay duration'
        : 'arrival date';

    return {
      status: isValid ? 'valid' : 'warning',
      diffDays,
      diffMonths,
      minDays,
      message: isValid
        ? `Valid! Your passport has ${diffMonths} months (${diffDays} days) of validity remaining from your ${basisLabel}, meeting ${selectedCountry.country}'s minimum requirement of ${minDays} days (${Math.round(minDays / 30)} months).`
        : `Action Required: Your passport has only ${diffMonths} months (${diffDays} days) of validity remaining from your ${basisLabel}. ${selectedCountry.country} requires a minimum of ${minDays} days (${Math.round(minDays / 30)} months).`,
    };
  };

  const result = calculateValidity();

  return (
    <div
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
        <span style={{ fontSize: '1.8rem' }}>🛂</span>
        <div>
          <h2 style={{ margin: 0, color: '#542d1e', fontSize: '1.35rem', fontWeight: '700' }}>
            Passport Validity Checker
          </h2>
          <p style={{ margin: 0, color: '#986629', fontSize: '0.9rem' }}>
            Verify if your Sri Lankan passport meets entry rules for 30 official destination countries
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#986629', textAlign: 'center', padding: '1rem' }}>Loading country rules...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Destination Country
              </label>
              <select
                value={selectedCountryName}
                onChange={(e) => setSelectedCountryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #D6C7B2',
                  fontSize: '0.95rem',
                  color: '#38383a',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                {countries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country} ({c.validity_min_days === 0 ? 'Full Stay' : `${Math.round(c.validity_min_days / 30)} Mo.`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Intended Travel / Arrival Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #D6C7B2',
                  fontSize: '0.95rem',
                  color: '#38383a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Planned Return Date (Optional)
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #D6C7B2',
                  fontSize: '0.95rem',
                  color: '#38383a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                Passport Expiration Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
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

          {selectedCountry && (
            <div
              style={{
                backgroundColor: '#F5EFE6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                borderLeft: '4px solid #986629',
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#542d1e', marginBottom: '0.4rem' }}>
                <span><strong>Visa Rule:</strong> {selectedCountry.visa_type}</span>
                <span><strong>Min Blank Pages:</strong> {selectedCountry.blank_pages_min}</span>
                <span><strong>Validity Basis:</strong> {selectedCountry.validity_basis.replace('_', ' ').toUpperCase()}</span>
              </div>
              {selectedCountry.key_notices && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#38383a' }}>
                  <strong>Important Note:</strong> {selectedCountry.key_notices}
                </p>
              )}
            </div>
          )}

          {result ? (
            <div
              style={{
                borderRadius: '8px',
                padding: '1.25rem',
                backgroundColor:
                  result.status === 'valid'
                    ? '#F0F9F5'
                    : result.status === 'warning'
                    ? '#FDF6ED'
                    : '#FDF2F2',
                border: `1.5px solid ${
                  result.status === 'valid'
                    ? '#66ac92'
                    : result.status === 'warning'
                    ? '#986629'
                    : '#542d1e'
                }`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>
                {result.status === 'valid' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
              </span>
              <div>
                <h4
                  style={{
                    margin: '0 0 0.3rem 0',
                    color:
                      result.status === 'valid'
                        ? '#2E6B56'
                        : result.status === 'warning'
                        ? '#986629'
                        : '#542d1e',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                  }}
                >
                  {result.status === 'valid'
                    ? 'Passport Valid for Destination'
                    : result.status === 'warning'
                    ? 'Passport Renewal Recommended'
                    : 'Invalid Travel or Expiry Date'}
                </h4>
                <p style={{ margin: 0, color: '#38383a', fontSize: '0.92rem', lineHeight: '1.4' }}>
                  {result.message}
                </p>

                {result.status === 'warning' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href="https://www.immigration.gov.lk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#b0a74a',
                        color: '#FFFFFF',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                      }}
                    >
                      Renew Passport via Department of Immigration ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: '#FDFBF7',
                borderRadius: '8px',
                border: '1px dashed #D6C7B2',
                color: '#986629',
                fontSize: '0.88rem',
              }}
            >
              Select your travel date and passport expiration date above to perform an instant validity assessment against 30 official destination rules.
            </div>
          )}
        </>
      )}
    </div>
  );
};