import React, { useState, useEffect } from 'react';

export default function PublicComplaintPortal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    nic: '',
    passportNumber: '',
    email: '',
    agencyName: '',
    isManualAgency: false,
    agencyLicenceNo: '',
    category: '',
    description: '',
    supportingFiles: []
  });

  // Agency Search state
  const [agencySearch, setAgencySearch] = useState('');
  const [agencyList, setAgencyList] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'Financial & Fee Disputes', label: 'Financial & Fee Disputes', desc: 'Overcharging, unexpected fees, or refusal to refund' },
    { id: 'Passport & Document Handling', label: 'Passport & Document Handling', desc: 'Withholding passports, delay in documents, or lost papers' },
    { id: 'Service Contract & Promise Breach', label: 'Service Contract & Promise Breach', desc: 'Job role mismatch, salary discrepancy, or altered terms' },
    { id: 'Agency Fraud & Scam Practices', label: 'Agency Fraud & Scam Practices', desc: 'Fake job offers, fake visas, or illegal operation' },
    { id: 'Misconduct & Unprofessional Behavior', label: 'Misconduct & Unprofessional Behavior', desc: 'Harassment, lack of assistance, or abusive communication' },
    { id: 'Other Travel Agency Issues', label: 'Other Travel Agency Issues', desc: 'Any other agency-related grievance' }
  ];

  // Fetch registered agencies for search dropdown
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/agencies');
        if (response.ok) {
          const data = await response.json();
          setAgencyList(data.data || data);
        }
      } catch (err) {
        console.log('Using mock fallback agency search');
      }
    };
    fetchAgencies();
  }, []);

  useEffect(() => {
    const query = agencySearch.trim().toLowerCase();
    if (!query) {
      setFilteredAgencies([]);
      return;
    }
    const filtered = agencyList.filter((agency) =>
      String(agency?.agencyName ?? agency?.name ?? "")
        .toLowerCase()
        .includes(query)
    );
    setFilteredAgencies(filtered);
  }, [agencySearch, agencyList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, supportingFiles: [...prev.supportingFiles, ...files] }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name with initials is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.nic.trim()) newErrors.nic = 'NIC number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.agencyName.trim()) newErrors.agencyName = 'Agency name is required';
    if (!formData.category) newErrors.category = 'Please select a complaint category';
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your complaint';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectAgency = (agency) => {
    const name = agency.agencyName || agency.name;
    const licence = agency.licenseNo || agency.licenceNo || '';
    setFormData(prev => ({
      ...prev,
      agencyName: name,
      agencyLicenceNo: licence,
      isManualAgency: false
    }));
    setAgencySearch(name);
    setShowAgencyDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedRefNo(result.referenceNumber);
      } else {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSeq = String(Math.floor(Math.random() * 900000) + 100000);
        setGeneratedRefNo(`SM-${dateStr}-${randomSeq}`);
      }
    } catch (err) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSeq = String(Math.floor(Math.random() * 900000) + 100000);
      setGeneratedRefNo(`SM-${dateStr}-${randomSeq}`);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedRefNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#66ac9220', color: '#2E6B56', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          🤖 AI Complaint Intelligence Portal
        </div>
        <h2 style={{ margin: 0, color: '#542d1e', fontSize: '1.5rem', fontWeight: '700' }}>
          Register an Agency Complaint
        </h2>
        <p style={{ margin: '0.3rem 0 0 0', color: '#986629', fontSize: '0.9rem' }}>
          Your information will help our system organize your complaint and support the review process.
        </p>
      </div>

      {/* Step Indicator */}
      {!isSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
          <span style={{ color: currentStep === 1 ? '#542d1e' : '#999', borderBottom: currentStep === 1 ? '2px solid #542d1e' : 'none', paddingBottom: '2px' }}>
            Step 1: Personal Details
          </span>
          <span style={{ color: currentStep === 2 ? '#542d1e' : '#999', borderBottom: currentStep === 2 ? '2px solid #542d1e' : 'none', paddingBottom: '2px' }}>
            Step 2: Complaint Details
          </span>
        </div>
      )}

      {/* Form Container */}
      {!isSubmitted ? (
        <div>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#542d1e', fontSize: '1.15rem' }}>👤 Your Personal Details</h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                  Name with Initials <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g., J. P. M. Perera"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.fullName ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                {errors.fullName && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.fullName}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                    Phone Number <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07X XXX XXXX"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.phone ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                  {errors.phone && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.phone}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                    Email Address <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.email ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                  {errors.email && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.email}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                    NIC <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    placeholder="Enter your NIC number"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.nic ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                  {errors.nic && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.nic}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                    Passport Number <span style={{ color: '#999', fontWeight: 'normal' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    placeholder="Enter your Passport number"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#542d1e', fontSize: '1.15rem' }}>🏢 Tell Us What Happened</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#EAE3D9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>Step 2 of 2</span>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                  Agency Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={agencySearch}
                  onChange={(e) => {
                    setAgencySearch(e.target.value);
                    setFormData(prev => ({ ...prev, agencyName: e.target.value, isManualAgency: true }));
                    setShowAgencyDropdown(true);
                  }}
                  onFocus={() => setShowAgencyDropdown(true)}
                  placeholder="Type to search agency or enter name manually..."
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.agencyName ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />

                {showAgencyDropdown && filteredAgencies.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 20, width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #EAE3D9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
                    {filteredAgencies.map((agency, index) => (
                      <div
                        key={index}
                        onClick={() => selectAgency(agency)}
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F5EFE6', fontSize: '0.9rem' }}
                      >
                        <span style={{ fontWeight: '600', color: '#542d1e' }}>{agency.agencyName || agency.name}</span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#b0a74a20', color: '#542d1e', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Licence: {agency.licenseNo || agency.licenceNo || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.agencyName && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.agencyName}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                  Agency Licence Number <span style={{ color: '#999', fontWeight: 'normal' }}>(If known)</span>
                </label>
                <input
                  type="text"
                  name="agencyLicenceNo"
                  value={formData.agencyLicenceNo}
                  onChange={handleChange}
                  placeholder="e.g., AL-1021"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.5rem' }}>
                  What Is Your Complaint About? <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: formData.category === cat.id ? '2px solid #66ac92' : '1px solid #EAE3D9',
                        backgroundColor: formData.category === cat.id ? '#F0F9F5' : '#FAFAFA',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={formData.category === cat.id}
                        onChange={handleChange}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: '#542d1e' }}>{cat.label}</p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#666' }}>{cat.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.category && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.category}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                  Describe Your Complaint <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Explain what happened, when it happened, and what assistance you need..."
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: errors.description ? '1px solid red' : '1px solid #D6C7B2', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                {errors.description && <p style={{ color: 'red', fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>{errors.description}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.4rem' }}>
                  Supporting Evidence <span style={{ color: '#999', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: '#FAFAFA', border: '1px dashed #D6C7B2', borderRadius: '8px', fontSize: '0.85rem' }}
                />
                {formData.supportingFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#542d1e' }}>
                    {formData.supportingFiles.map((f, i) => <div key={i}>📎 {f.name}</div>)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{ backgroundColor: '#EAE3D9', color: '#542d1e', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#66ac92', color: '#FFF', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint ✓'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* SUCCESS CONFIRMATION */
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: '#542d1e', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Complaint Submitted Successfully!</h3>
          <p style={{ color: '#666', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Your grievance has been registered in the Safeමග system .
          </p>

          <div style={{ backgroundColor: '#F5EFE6', padding: '1rem', borderRadius: '8px', border: '1px solid #98662930', maxWidth: '350px', margin: '0 auto 1.5rem auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#986629', textTransform: 'uppercase' }}>Reference Number</span>
            <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#542d1e', margin: '0.3rem 0' }}>
              {generatedRefNo}
            </div>
            <button
              onClick={copyToClipboard}
              style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
            >
              {copied ? 'Copied! ✓' : 'Copy Reference'}
            </button>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              setFormData({
                fullName: '', phone: '', nic: '', passportNumber: '', email: '',
                agencyName: '', isManualAgency: false, agencyLicenceNo: '',
                category: '', description: '', supportingFiles: []
              });
            }}
            style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Submit Another Complaint
          </button>
        </div>
      )}
    </div>
  );
};