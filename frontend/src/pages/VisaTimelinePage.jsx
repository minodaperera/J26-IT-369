import React, { useState } from 'react';
import {
  AlertCircle,
  Compass,
  History,
  Sparkles,
} from 'lucide-react';
import { predictionService, VISA_DOMAIN_DATA } from '../services/predictionService';
import VisaPredictorForm from '../components/visa/VisaPredictorForm';
import VisaResultDisplay from '../components/visa/VisaResultDisplay';

export const VisaTimelinePage = () => {
  // Form input state
  const [formData, setFormData] = useState({
    applicant_age: 28,
    available_bank_balance_lkr: 2500000.0,
    destination: 'USA',
    migration_type: 'first_time',
    document_submitted_date: new Date().toISOString().split('T')[0],
  });

  const [endpointMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [lastTestedInput, setLastTestedInput] = useState(null);

  // Test history cache in state
  const [history, setHistory] = useState([
    {
      id: 'demo-1',
      dest: 'USA',
      flag: '🇺🇸',
      type: 'first_time',
      days: 8,
      balance: 2500000,
      timestamp: 'Initial Benchmark',
    },
    {
      id: 'demo-2',
      dest: 'Australia',
      flag: '🇦🇺',
      type: 'first_time',
      days: 16,
      balance: 1800000,
      timestamp: 'Initial Benchmark',
    },
  ]);

  // Find country details for preview
  const activeDestObj =
    VISA_DOMAIN_DATA.destinations.find((d) => d.country.toLowerCase() === formData.destination.toLowerCase()) ||
    VISA_DOMAIN_DATA.destinations[0];

  // Handle Predict Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const predictionResponse = await predictionService.predictVisaTime(formData, endpointMode);
      setResult(predictionResponse);
      setLastTestedInput({ ...formData });

      // Add to local test history
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          dest: formData.destination,
          flag: activeDestObj.flag,
          type: formData.migration_type,
          days: predictionResponse.estimated_processing_days_rounded || Math.round(predictionResponse.predicted_processing_days),
          balance: formData.available_bank_balance_lkr,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 3),
      ]);
    } catch (err) {
      console.error('Prediction API Error:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to the prediction backend.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Minimal Clean Header */}
      <div className="text-center max-w-2xl mx-auto pt-2 space-y-2">
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          AI-Powered Visit Visa TAT Prediction
        </h1>
        <p className="text-sm text-stone-600">
          Predict your visa processing timeline with cutting-edge AI — faster
decisions, smarter planning.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-red-950">Inference Notice:</strong>
            <p className="text-red-800 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Minimalist Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Minimal Form */}
        <div className="lg:col-span-6">
          <VisaPredictorForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>

        {/* Right Column: Prediction Results or Clean Empty State */}
        <div className="lg:col-span-6">
          {result ? (
            <VisaResultDisplay result={result} inputData={lastTestedInput} />
          ) : (
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-8 sm:p-10 shadow-xs text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-full bg-[#eef8f2] text-[#166534] flex items-center justify-center mb-4">
                <Compass size={24} />
              </div>

              <h3 className="text-lg font-bold text-stone-900 mb-1">
                Ready to Predict
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
                Configure your destination and profile details on the left, then click <strong>Predict Visa Turnaround Time</strong> to calculate the forecast.
              </p>

              {/* Minimal Summary Box */}
              <div className="w-full max-w-sm p-4 rounded-xl bg-[#faf8f5] border border-[#e8e4df] text-xs space-y-2 text-left">
                <div className="flex justify-between items-center text-stone-600">
                  <span>Destination:</span>
                  <span className="font-semibold text-stone-900">{activeDestObj.flag} {activeDestObj.country}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Applicant Age:</span>
                  <span className="font-semibold text-stone-900">{formData.applicant_age} years</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Category:</span>
                  <span className="font-semibold text-stone-900">{formData.migration_type === 'first_time' ? 'First-Time' : 'Repeat'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Bank Balance:</span>
                  <span className="font-semibold text-stone-900">LKR {(formData.available_bank_balance_lkr / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Predictions Minimal Section */}
      {/* {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <History size={14} className="text-stone-500" />
              Recent Predictions
            </h4>
            <span className="text-[11px] text-stone-400">
              {history.length} runs in session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {history.map((h, i) => (
              <div
                key={h.id || i}
                className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/70 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{h.flag || '🌐'}</span>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {h.dest}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {h.type === 'first_time' ? 'First-Time' : 'Repeat'} • LKR {(h.balance / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#451e11] text-white">
                  {h.days}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default VisaTimelinePage;
