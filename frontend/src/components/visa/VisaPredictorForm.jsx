import React from 'react';
import { ArrowRight, PlaneTakeoff, RotateCcw } from 'lucide-react';
import { VISA_DOMAIN_DATA } from '../../services/predictionService';

export const VisaPredictorForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-xs p-6 sm:p-7">
      <div className="mb-6 pb-4 border-b border-stone-100">
        <h2 className="text-lg font-bold text-stone-900">
          Applicant Details
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Provide your profile details to calculate estimated visa processing times.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Destination Country */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Target Destination
          </label>
          <div className="relative">
            <select
              value={formData.destination}
              onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-[#451e11] focus:ring-2 focus:ring-[#451e11]/15 text-stone-900 outline-none transition appearance-none cursor-pointer"
            >
              {VISA_DOMAIN_DATA.destinations.map((d) => (
                <option key={d.country} value={d.country}>
                  {d.flag} {d.country}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Applicant Age */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Applicant Age
            </label>
            <span className="text-xs font-bold text-stone-900">
              {formData.applicant_age} <span className="font-normal text-stone-500">years</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={18}
              max={69}
              value={formData.applicant_age}
              onChange={(e) => setFormData((prev) => ({ ...prev, applicant_age: parseInt(e.target.value) || 18 }))}
              className="flex-1 accent-[#451e11] cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <input
              type="number"
              min={18}
              max={69}
              value={formData.applicant_age}
              onChange={(e) => setFormData((prev) => ({ ...prev, applicant_age: parseInt(e.target.value) || 18 }))}
              className="w-16 px-2.5 py-1.5 text-center text-xs font-bold rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#451e11] focus:outline-none text-stone-900"
            />
          </div>
        </div>

        {/* Available Bank Balance */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Available Bank Balance (LKR)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
              LKR
            </span>
            <input
              type="number"
              min={0}
              step={50000}
              value={formData.available_bank_balance_lkr}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, available_bank_balance_lkr: parseFloat(e.target.value) || 0 }))
              }
              placeholder="e.g. 2500000"
              required
              className="w-full pl-12 pr-3.5 py-2.5 text-sm font-semibold rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-[#451e11] focus:ring-2 focus:ring-[#451e11]/15 text-stone-900 outline-none transition"
            />
          </div>
        </div>

        {/* Migration Type: Minimal Segmented Toggle */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Applicant Category
          </label>
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl gap-1">
            {VISA_DOMAIN_DATA.migrationTypes.map((t) => {
              const isSelected = formData.migration_type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, migration_type: t.id }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 ${
                    isSelected
                      ? 'border-[#451e11] bg-white text-[#451e11] font-bold shadow-xs'
                      : 'border-transparent text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.id === 'first_time' ? (
                    <PlaneTakeoff size={14} className={isSelected ? 'text-[#451e11]' : 'text-stone-500'} />
                  ) : (
                    <RotateCcw size={14} className={isSelected ? 'text-[#451e11]' : 'text-stone-500'} />
                  )}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submission Date */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Submission Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.document_submitted_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, document_submitted_date: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-[#451e11] focus:ring-2 focus:ring-[#451e11]/15 text-stone-900 outline-none transition cursor-pointer"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-[#451e11] hover:bg-[#36160c] shadow-md shadow-[#451e11]/20 hover:shadow-lg hover:shadow-[#451e11]/30 active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
        >
          {loading ? (
            <span>Calculating Timeline...</span>
          ) : (
            <>
              <span>Predict Visa Turnaround Time</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default VisaPredictorForm;
