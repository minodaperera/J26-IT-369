import { Link } from 'react-router-dom';
import { useLang } from '@/i18n';

const features = [
  ['🌍', 'Interactive country selector', 'World map colour-coded by visa difficulty, safety and cost.'],
  ['🧭', 'Step-by-step visa guide', 'Visit and work visa steps with a document checklist per country.'],
  ['📄', 'AI document reader', 'OCR reads passport MRZ, medical and police reports and validates expiry.'],
  ['💰', 'Cost estimator & planner', 'Itemised costs in LKR and a monthly savings plan.'],
  ['📊', 'Approval risk & weak points', 'ML model scores your profile and tells you what to fix first.'],
  ['⏰', 'Expiry alerts', 'Be warned before passports, medicals or clearances lapse.'],
];

export default function GuidanceHome() {
  const { t } = useLang();
  return (
    <div>
      <section className="rounded-2xl border border-gray-200 px-6 py-14 text-center md:px-16">
        <p className="mb-3 inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-emerald-800">SafeMaga · Visa Guidance</p>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">Travel abroad with confidence — <span className="text-secondary">without relying on agents</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">{t('tagline')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/guidance/countries" className="btn">{t('explore')}</Link>
          <Link to="/register" className="btn-outline">{t('getStarted')}</Link>
        </div>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([icon, title, text]) => (
          <div key={title} className="card">
            <div className="mb-2 text-2xl">{icon}</div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
