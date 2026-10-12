import React, { useState, useEffect } from 'react';
import { predictionService } from '../services/predictionService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await predictionService.runPrediction({ input: inputText });
      setResult(data);
    } catch (err) {
      console.error('Inference error:', err);
      setError(err.response?.data?.message || 'Failed to complete prediction request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Research Analytics & AI Model Testing
      </h2>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>Run Model Inference</h3>
        <form onSubmit={handlePredict}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Sample Input Data / Query:
            </label>
            <textarea
              rows="4"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
              placeholder="Enter research data parameters or text to analyze..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading || !inputText.trim()}>
            {loading ? 'Evaluating Model...' : 'Submit to AI Engine'}
          </Button>
        </form>

        {loading && <Loader message="Calling Express API and FastAPI ML Bridge..." />}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
            <h4 style={{ color: '#166534', marginBottom: '0.5rem' }}>Prediction Results:</h4>
            <pre style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
