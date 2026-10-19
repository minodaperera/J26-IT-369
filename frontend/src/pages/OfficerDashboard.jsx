import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/complaints');
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.data || data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      // Mock fallback data for testing UI if backend route isn't created yet
      setComplaints([
        {
          _id: '1',
          referenceNumber: 'SM-20261016-000001',
          fullName: 'J. P. M. Perera',
          agencyName: 'Lanka Overseas Services',
          category: 'Financial & Fee Disputes',
          description: 'Charged an extra 150,000 LKR fee for visa processing without issuing a valid receipt.',
          status: 'Submitted',
          createdAt: new Date().toISOString(),
          aiIntelligence: {
            priorityLevel: 'High',
            priorityScore: 8.5,
            predictedCategory: 'Agency Fraud & Scam Practices',
            confidenceScore: 0.94,
            clusterId: 'CLUSTER-FIN-01',
            aiSummary: 'Extortion of unauthorized fees exceeding standard regulatory limits.'
          }
        },
        {
          _id: '2',
          referenceNumber: 'SM-20261016-000002',
          fullName: 'A. K. Gunawardena',
          agencyName: 'Global Recruitment Services',
          category: 'Passport & Document Handling',
          description: 'Agency has been withholding my original passport for over 3 months after visa rejection.',
          status: 'Under AI Review',
          createdAt: new Date().toISOString(),
          aiIntelligence: {
            priorityLevel: 'Critical',
            priorityScore: 9.2,
            predictedCategory: 'Passport & Document Handling',
            confidenceScore: 0.98,
            clusterId: 'CLUSTER-DOC-04',
            aiSummary: 'Withholding legal identity documents (Passport retention violation).'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle status/notes update submission
  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint._id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus || selectedComplaint.status, officerNotes })
      });

      if (res.ok) {
        alert('Complaint updated successfully!');
        setSelectedComplaint(null);
        fetchComplaints();
      } else {
        alert('Failed to update complaint');
      }
    } catch (err) {
      // Offline fallback mock update
      setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, status: newStatus || c.status, aiIntelligence: { ...c.aiIntelligence, officerNotes } } : c));
      alert('Updated locally (backend endpoint pending)');
      setSelectedComplaint(null);
    }
  };

  const filteredComplaints = filterPriority === 'ALL' 
    ? complaints 
    : complaints.filter(c => c.aiIntelligence?.priorityLevel === filterPriority);

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', padding: '2rem 1.5rem', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Header & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button onClick={() => navigate('/')} style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
              ← Back to Home
            </button>
            <h1 style={{ color: '#542d1e', fontSize: '2rem', margin: '0' }}>Officer AI Intelligence Dashboard</h1>
            <p style={{ color: '#986629', margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>
              Automated NLP classification, clustering, and priority scoring for User Complaints.
            </p>
          </div>

          <button onClick={fetchComplaints} style={{ backgroundColor: '#66ac92', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            🔄 Refresh AI Feed
          </button>
        </div>

        {/* AI Metrics Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EAE3D9', borderLeft: '5px solid #542d1e' }}>
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>TOTAL COMPLAINTS</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#542d1e' }}>{complaints.length}</h3>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EAE3D9', borderLeft: '5px solid #d97706' }}>
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>CRITICAL / HIGH PRIORITY</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#d97706' }}>
              {complaints.filter(c => ['Critical', 'High'].includes(c.aiIntelligence?.priorityLevel)).length}
            </h3>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EAE3D9', borderLeft: '5px solid #66ac92' }}>
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>AI CLUSTER GROUPS</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#66ac92' }}>4 Active</h3>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: '10px', border: '1px solid #EAE3D9', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', color: '#542d1e', fontSize: '0.9rem' }}>Filter by Priority:</span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterPriority(level)}
              style={{
                backgroundColor: filterPriority === level ? '#542d1e' : '#F5EFE6',
                color: filterPriority === level ? '#FFF' : '#542d1e',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Complaints Table / List */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#986629', padding: '3rem' }}>Loading AI complaint analysis feed...</p>
        ) : filteredComplaints.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>No complaints found matching this priority filter.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {filteredComplaints.map((c) => {
              const priority = c.aiIntelligence?.priorityLevel || 'Medium';
              const priorityColor = priority === 'Critical' ? '#DC2626' : priority === 'High' ? '#D97706' : priority === 'Medium' ? '#2563EB' : '#10B981';

              return (
                <div key={c._id || c.referenceNumber} style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '10px', border: '1px solid #EAE3D9', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#542d1e', backgroundColor: '#F5EFE6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {c.referenceNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: priorityColor + '20', color: priorityColor, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        ⚡ {priority} Priority ({c.aiIntelligence?.priorityScore || 'N/A'})
                      </span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#EAE3D9', color: '#38383a', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '600' }}>
                        Status: {c.status}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.3rem 0', color: '#542d1e', fontSize: '1.1rem' }}>
                      {c.agencyName} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#666' }}>({c.fullName})</span>
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#38383a', lineHeight: '1.4' }}>
                      {c.description}
                    </p>

                    {/* AI Insights box */}
                    <div style={{ backgroundColor: '#F9F6F0', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid #66ac92', fontSize: '0.85rem', color: '#38383a' }}>
                      <div><strong>AI Predicted Category:</strong> {c.aiIntelligence?.predictedCategory || c.category} ({Math.round((c.aiIntelligence?.confidenceScore || 0.9) * 100)}% match)</div>
                      <div><strong>AI Summary:</strong> {c.aiIntelligence?.aiSummary || 'Automated text analysis completed.'}</div>
                      {c.aiIntelligence?.clusterId && <div><strong>Cluster Group:</strong> {c.aiIntelligence.clusterId}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.status);
                        setOfficerNotes(c.aiIntelligence?.officerNotes || '');
                      }}
                      style={{ backgroundColor: '#542d1e', color: '#FFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Review & Verify AI ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Officer Review Modal */}
        {selectedComplaint && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '550px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#542d1e', margin: '0 0 0.5rem 0' }}>Officer Review: {selectedComplaint.referenceNumber}</h3>
              <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '1.25rem' }}>
                Verify AI predictions, override severity ratings, or update complaint lifecycle status.
              </p>

              <form onSubmit={handleUpdateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.3rem' }}>Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D6C7B2', fontSize: '0.9rem' }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under AI Review">Under AI Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#542d1e', marginBottom: '0.3rem' }}>Officer Action Notes</label>
                  <textarea
                    rows="3"
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter investigation remarks or confirmation of AI classification..."
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D6C7B2', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    style={{ backgroundColor: '#EAE3D9', color: '#542d1e', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: '#66ac92', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Save Changes ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}