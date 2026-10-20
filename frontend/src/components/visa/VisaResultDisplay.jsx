import React from 'react';

export const VisaResultDisplay = ({ result, inputData }) => {
  if (!result) return null;

  // Calculate estimated result date
  const subDate = inputData?.document_submitted_date ? new Date(inputData.document_submitted_date) : new Date();
  const daysToAdd = result.estimated_processing_days_rounded || Math.round(result.predicted_processing_days) || 14;
  const decisionDate = new Date(subDate);
  decisionDate.setDate(decisionDate.getDate() + daysToAdd);

  const formattedSubDate = subDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDecisionDate = decisionDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-xs p-6 sm:p-8">
      {/* Header Info */}
      <div className="flex items-start justify-between pb-5 border-b border-stone-100">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-[#eef8f2] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full mb-1.5">
            Prediction Result
          </span>
          <h2 className="text-xl font-bold text-stone-900">
            Estimated Visa Turnaround Time
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {inputData?.destination} • {inputData?.migration_type === 'first_time' ? 'First-Time Applicant' : 'Repeat Applicant'} • {inputData?.applicant_age} years
          </p>
        </div>
      </div>

      {/* Clean, Highlighted Main Result (20 Calendar Days) */}
      <div className="my-7 py-8 px-4 text-center rounded-2xl bg-[#faf8f5] border border-[#e8e4df]">
        <div className="text-7xl sm:text-8xl font-black text-[#451e11] tracking-tight leading-none">
          {daysToAdd}
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-stone-800 tracking-widest uppercase">
          Calendar Days
        </div>
      </div>

      {/* Clean 2-Point Timeline */}
      <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/70">
        <div className="flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Submitted</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">{formattedSubDate}</span>
          </div>

          <div className="flex-1 mx-4 flex items-center justify-center">
            <div className="h-0.5 w-full bg-stone-200 relative flex items-center justify-center">
              <span className="px-2 py-0.5 bg-white border border-stone-200 rounded-full text-[10px] font-bold text-[#451e11]">
                {daysToAdd} Days
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Estimated Decision</span>
            <span className="font-semibold text-stone-800 mt-0.5 block">{formattedDecisionDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaResultDisplay;
