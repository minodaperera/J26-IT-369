import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Target,
  Eye,
  ArrowRight,
  TrendingUp,
  Award,
  Users2,
  Lock,
  Building2,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import logo from '../assets/safemaga-logo.png';

const AboutUs = () => {
  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-14 text-slate-900 shadow-md border border-[#e8e4df]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="SafeMaga Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md hover:scale-105 transition-transform" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-100 text-sage-800 border border-sage-200">
              <Sparkles size={13} />
              About SafeMaga • AI-Assisted Migration Intelligence
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-800 tracking-tight leading-tight mb-5">
            Empowering Confident, Safe, and Informed Migration Decisions
          </h1>
          <p className="text-base sm:text-lg text-brand-600 leading-relaxed mb-8">
            SafeMaga was engineered to eliminate ambiguity for individuals and families preparing to move abroad.
            By coupling continuous machine learning models with calibrated embassy financial thresholds, we bring
            predictable transparency to what has traditionally been an opaque process.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/visa-timeline"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#451e11] hover:bg-[#36160c] active:scale-95 text-white font-bold text-sm shadow-lg shadow-[#451e11]/20 transition-all"
            >
              Test Visa Turnaround Predictor
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-brand-50 active:scale-95 text-brand-800 font-bold text-sm border border-[#e8e4df] transition-all"
            >
              Model Sandbox Console
            </Link>
          </div>
        </div>

        {/* Impact Numbers Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#e8e4df] text-center">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-brand-800">16+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Countries Analyzed</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">22</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Predictive Features</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">&lt;20ms</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Inference Latency</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Research Backed</div>
          </div>
        </div>
      </section>

      {/* 2. Mission & Vision Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Target size={26} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              To democratize migration data and provide aspiring migrants with unbiased, data-backed insights.
              We replace hearsay and predatory agency speculation with calibrated machine learning predictions,
              clear embassy proof-of-funds verification, and timely risk analysis.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
            <ShieldCheck size={16} /> Transparent • Accurate • Independent
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Eye size={26} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Our Vision</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              A transparent global migration ecosystem where every individual—regardless of background or destination—has
              access to transparent timeline estimates, accurate financial requirements, and actionable foresight to plan
              their overseas education, work, or settlement with complete peace of mind.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
            <Globe2 size={16} /> Global Mobility with Foresight
          </div>
        </div>
      </section>

      {/* 3. The Core Problems We Address */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            The Migration Challenge
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 mb-2">
            Why SafeMaga Matters
          </h2>
          <p className="text-slate-600 text-sm">
            Applying for foreign visas has traditionally been rife with friction, predatory middlemen, and unexpected rejections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <HelpCircle size={22} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Ambiguous Wait Times</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Embassies publish generic waiting windows that do not account for individual applicant variables, queue spikes, or destination intake cycles.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Building2 size={22} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Proof-of-Funds Deficits</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Underestimating bank balance benchmarks is a primary cause for visa refusal. SafeMaga offers real-time embassy solvency verification.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Lock size={22} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Middlemen Exploitation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unregulated migration agents often prey on uncertainty with inflated fees and baseless promises. We provide direct data independence.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <TrendingUp size={22} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Seasonal Queue Surges</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Global intakes in January, April, August, and December drastically alter consular throughput, which our pipeline explicitly factors in.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Technology & Machine Learning Architecture */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Under The Hood
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 mb-2">
            The SafeMaga AI & Data Architecture
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            Our pipeline integrates production-grade Python machine learning microservices with robust web technologies for reliable performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <Cpu size={22} />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Optuna-Tuned Random Forest</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frozen scikit-learn regressor fine-tuned via Bayesian hyperparameter optimization. Considers 22 features across applicant demographics, destination rules, and seasonal intake months.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-blue-600">
              saved_models/random_forest_model.joblib
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <FileCheck size={22} />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">FastAPI Microservice Bridge</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asynchronous Python 3.10 microservice running with Uvicorn. Validates incoming schemas with Pydantic and executes full feature extraction with sub-20ms latency.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-emerald-600">
              ai-ml/api/main.py (Port 8000)
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <Users2 size={22} />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Full-Stack Application Layer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Node.js Express API gateway with failover resilience, MongoDB document persistence, and a reactive frontend crafted with React, Vite, and modern Tailwind CSS v3.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-indigo-600">
              Vite 5 + React 18 + Tailwind v3.4
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Award size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">Scientific Rigor</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every turnaround estimate is backed by machine learning cross-validation and empirical consular statistics.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">Data Privacy First</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            We prioritize user confidentiality. Test queries and applicant financial parameters are processed securely without unnecessary persistence.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Globe2 size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">Universal Accessibility</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Free, open, and responsive. Built to run effortlessly on desktop and mobile browsers across all devices.
          </p>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white text-center shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-black mb-3">
          Ready to Predict Your Visa Turnaround Time?
        </h2>
        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
          Explore our AI predictor and evaluate proof-of-funds benchmarks for USA, UK, Australia, Canada, and 12 other global destinations.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/visa-timeline"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all"
          >
            Launch Visa Predictor
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-800/60 hover:bg-blue-800/80 text-white font-bold text-sm border border-white/20 transition-all"
          >
            Explore Model Sandbox
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
