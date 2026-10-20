import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, ShieldCheck, Cpu, Database, ArrowRight, Sparkles } from 'lucide-react';
import logo from '../assets/safemaga-logo.png';

const Home = () => {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-4">
          <img src={logo} alt="SafeMaga Logo" className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md hover:scale-105 transition-transform" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-100 text-sage-800 border border-sage-200 mb-6">
          <Sparkles size={13} className="text-sage-800" />
          Empowering Sri Lankan Migrants
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-800 tracking-tight leading-tight mb-4">
          SafeMaga Abroad Migration Assistant
        </h1>
        <p className="text-lg text-brand-600 max-w-2xl mx-auto leading-relaxed mb-8">
          AI-powered visa turnaround time prediction and embassy proof-of-funds validation to help individuals confidently prepare for migration abroad.
        </p>
        <div className="flex flex-wrap gap-3.5 justify-center">
          <Link
            to="/visa-timeline"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#451e11] hover:bg-[#36160c] active:scale-95 text-white font-bold text-base shadow-lg shadow-[#451e11]/20 transition-all"
          >
            Test Visa Prediction AI
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#faf6f2] border border-[#e8e4df] active:scale-95 text-[#451e11] font-bold text-base transition-all"
          >
            Model Test Sandbox
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center mb-4">
            <Cpu size={22} />
          </div>
          <h3 className="text-lg font-bold text-brand-800 mb-2">AI Turnaround Predictor</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Optuna-tuned Random Forest regression evaluating 22 applicant demographic, destination, and financial features with millisecond latency.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Proof-of-Funds Validation</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Real-time solvency benchmark checks for 16 destination countries with seasonal peak intake detection.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Globe2 size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">FastAPI AI/ML Bridge</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dedicated high-throughput Python inference engine bridging data pipelines, model inference, and real-time analytical evaluation.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Database size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Modular Data Layer</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Clean MongoDB persistence layer structured with Mongoose schemas, connection pooling, and automated seed scripts for team parity.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
