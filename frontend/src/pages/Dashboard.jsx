import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Send, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { predictionService } from '../services/predictionService';

const Dashboard = () => {
  const [inputText, setInputText] = useState(
    JSON.stringify(
      {
        applicant_age: 28,
        available_bank_balance_lkr: 2500000.0,
        destination: 'USA',
        migration_type: 'first_time',
        document_submitted_date: new Date().toISOString().split('T')[0],
      },
      null,
      2
    )
  );
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
      let parsed = inputText;
      try {
        parsed = JSON.parse(inputText);
      } catch {
        // Plain string fallback
      }
      const data = await predictionService.predictVisaTime(parsed);
      setResult(data);
    } catch (err) {
      console.error('Inference error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete prediction request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Featured Banner for Visa Turnaround */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm mb-3">
            <Sparkles size={13} /> Active Feature
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            AI Visa Turnaround Time Prediction System
          </h2>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Test the interactive UI with proof-of-funds verification, 16 destination countries, and continuous processing forecasts.
          </p>
        </div>
        <Link
          to="/visa-timeline"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all shrink-0"
        >
          <Compass size={18} />
          Open Visa Predictor
        </Link>
      </div>

      {/* Raw JSON Inference Console */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Low-Level Raw JSON Inference Console
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Directly send structured applicant JSON through Node.js Express or FastAPI to test payload bridging with the Python machine learning pipeline.
        </p>
        <form onSubmit={handlePredict} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Applicant Payload (JSON):
            </label>
            <textarea
              rows="7"
              className="w-full p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter JSON payload..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Evaluating Model...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit to AI Engine
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Prediction Response:
            </div>
            <pre className="p-4 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto shadow-inner">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
