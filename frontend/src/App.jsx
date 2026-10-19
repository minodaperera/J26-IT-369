import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { PassportChecker } from './components/PassportChecker';
import PublicComplaintPortal  from './components/PublicComplaintPortal';
import { AgencyMap } from './components/AgencyMap';
import OfficerDashboard from './pages/OfficerDashboard';

const DISTRICTS = [
  'COLOMBO', 'GAMPAHA', 'KALUTARA', 'KANDY', 'MATALE', 'NUWARA ELIYA',
  'GALLE', 'MATARA', 'HAMBANTOTA', 'JAFFNA', 'KILINOCHCHI', 'MANNAR',
  'VAVUNIYA', 'MULLAITTIVU', 'BATTICALOA', 'AMPARA', 'TRINCOMALEE',
  'KURUNEGALA', 'PUTTALAM', 'ANURADHAPURA', 'POLONNARUWA', 'BADULLA',
  'MONERAGALA', 'RATNAPURA', 'KEGALLE'
];

// Landing Page View
function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <header style={{ backgroundColor: '#542d1e', color: '#FFFFFF', padding: '3rem 1rem', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>SafeMaga Protection Platform</h1>
        <p style={{ margin: 0, color: '#E5D3C1', fontSize: '1.1rem' }}>
          Empowering Sri Lankan Foreign Employment Seekers with Verified Data & AI Support
        </p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div onClick={() => navigate('/passport')} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE3D9', borderTop: '5px solid #b0a74a', borderRadius: '12px', padding: '2rem', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem' }}>🛂</div>
            <h3 style={{ color: '#542d1e' }}>Passport Validity Checker</h3>
            <p style={{ color: '#38383a' }}>Verify if your passport meets minimum entry rules for 30 official destination countries.</p>
            <button style={{ marginTop: '1rem', backgroundColor: '#b0a74a', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700' }}>Check Passport →</button>
          </div>

          <div onClick={() => navigate('/agencies')} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE3D9', borderTop: '5px solid #986629', borderRadius: '12px', padding: '2rem', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem' }}>🗺️</div>
            <h3 style={{ color: '#542d1e' }}>Agency Directory & Map</h3>
            <p style={{ color: '#38383a' }}>Search 1,055 registered foreign employment agencies with interactive district mapping.</p>
            <button style={{ marginTop: '1rem', backgroundColor: '#986629', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700' }}>Explore Agencies →</button>
          </div>

          <div onClick={() => navigate('/complaints')} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE3D9', borderTop: '5px solid #66ac92', borderRadius: '12px', padding: '2rem', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem' }}>🤖</div>
            <h3 style={{ color: '#542d1e' }}>AI Public Complaint Portal</h3>
            <p style={{ color: '#38383a' }}>Submit grievances regarding agency misconduct or fraud for automated AI classification.</p>
            <button style={{ marginTop: '1rem', backgroundColor: '#66ac92', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700' }}>File Complaint →</button>
          </div>

        </div>
      </main>
    </div>
  );
}

// Passport Page
function PassportPage() {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem' }}>← Back to Home</button>
        <PassportChecker />
      </div>
    </div>
  );
}

// Complaint Page
function ComplaintPage() {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem' }}>← Back to Home</button>
        <PublicComplaintPortal />
      </div>
    </div>
  );
}

// Agency Page Component
function AgencyPageWrapper() {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Navigation state between Agency List View and Map View
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      try {
        const limit = selectedDistrict ? '100' : '15';
        const params = new URLSearchParams({ q: query, district: selectedDistrict, page: page.toString(), limit });
        const res = await fetch(`http://localhost:5000/api/agencies?${params}`);
        const data = await res.json();
        setAgencies(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, [query, selectedDistrict, page]);

  // Open Google Maps navigation directly in a new tab
  const handleDirectNavigation = (agency) => {
    if (agency.latitude && agency.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${agency.latitude},${agency.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('GPS coordinates not available for this agency.');
    }
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', padding: '2rem 1rem', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>← Back to Home</button>
          
          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#EAE3D9', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setActiveTab('list')}
              style={{
                backgroundColor: activeTab === 'list' ? '#542d1e' : 'transparent',
                color: activeTab === 'list' ? '#FFFFFF' : '#542d1e',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              📋 Agency List View
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              style={{
                backgroundColor: activeTab === 'map' ? '#542d1e' : 'transparent',
                color: activeTab === 'map' ? '#FFFFFF' : '#542d1e',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Directory Controls & Search */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3D9', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search agencies by name, license, or address..." 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setPage(1); }} 
            style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: '1px solid #D6C7B2', fontSize: '0.95rem' }} 
          />
          <select 
            value={selectedDistrict} 
            onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }} 
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #D6C7B2', fontSize: '0.95rem' }}
          >
            <option value="">All Sri Lanka Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <p style={{ color: '#38383a', fontWeight: '600', marginBottom: '1rem' }}>Showing {totalRecords} agencies</p>

        {/* Dynamic View Toggle */}
        {activeTab === 'map' ? (
          <div style={{ border: '2px solid #EAE3D9', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <AgencyMap agencies={agencies} selectedDistrict={selectedDistrict} onSelectDistrict={(d) => { setSelectedDistrict(d); setPage(1); }} />
          </div>
        ) : (
          /* Agency List View */
          loading ? (
            <p style={{ color: '#986629', textAlign: 'center', padding: '2rem' }}>Loading agency directory...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {agencies.map((agency) => (
                <div key={agency._id} style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '8px', border: '1px solid #EAE3D9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#542d1e', fontSize: '1.1rem' }}>{agency.agencyName}</h4>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#666' }}><strong>License No:</strong> {agency.licenseNo}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#666' }}><strong>Address:</strong> {agency.address}</p>
                    {agency.district && <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#666' }}><strong>District:</strong> {agency.district}</p>}
                    {agency.telephone && <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}><strong>Telephone:</strong> {agency.telephone}</p>}
                  </div>

                  <button
                    onClick={() => handleDirectNavigation(agency)}
                    style={{ backgroundColor: '#986629', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    📍 Get Directions
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/complaints" element={<ComplaintPage />} />
        <Route path="/agencies" element={<AgencyPageWrapper />} />
        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}