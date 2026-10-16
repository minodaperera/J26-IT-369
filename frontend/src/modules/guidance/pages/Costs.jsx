import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import g, { errMsg, lkr } from '../api';
import { useAuth } from '@/context/AuthContext';
import { Check, ErrorBox, Field, PageTitle } from '../components/ui.jsx';
import { useLang } from '@/i18n';

export default function Costs() {
  const { t } = useLang();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(params.get('country') || '');
  const [visaType, setVisaType] = useState('Visit Visa');
  const [months, setMonths] = useState(1);
  const [skipAgency, setSkipAgency] = useState(true);
  const [est, setEst] = useState(null);
  const [plan, setPlan] = useState({ months: 6, currentSavingsLKR: 0 });
  const [planRes, setPlanRes] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { g.get('/countries').then((r) => { setCountries(r.data); if (!country && r.data[0]) setCountry(r.data[0].slug); }).catch((e) => setErr(errMsg(e))); }, []);
  useEffect(() => {
    if (!country) return;
    setPlanRes(null);
    g.get('/costs/estimate', { params: { country, visaType, months } }).then((r) => setEst(r.data)).catch((e) => setErr(errMsg(e)));
  }, [country, visaType, months]);

  const total = est ? (skipAgency ? est.totalWithoutAgencyLKR : est.totalLKR) : 0;

  const makePlan = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const r = await g.post('/costs/savings-plan', { country, visaType, stayMonths: months, excludeAgency: skipAgency, months: Number(plan.months), currentSavingsLKR: Number(plan.currentSavingsLKR) });
      setPlanRes(r.data);
    } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <div>
      <PageTitle title={t('costsTitle')} sub="Itemised cost per destination and visa type, plus a monthly plan to reach your budget. Agency fees are shown separately so you can see what applying directly saves." />
      <ErrorBox msg={err} />
      <div className="card mb-5 grid gap-3 md:grid-cols-4">
        <Field label="Country"><select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>{countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></Field>
        <Field label="Visa type"><select className="input" value={visaType} onChange={(e) => setVisaType(e.target.value)}><option>Visit Visa</option><option>Work Visa</option></select></Field>
        <Field label="Stay (months, for accommodation)"><input className="input" type="number" min="1" max="12" value={months} onChange={(e) => setMonths(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} /></Field>
        <div className="flex items-end"><Check label="Apply directly (no agency fee)" checked={skipAgency} onChange={setSkipAgency} /></div>
      </div>

      {est && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card overflow-x-auto lg:col-span-2">
            <h2 className="mb-3 text-lg">{est.country} · {est.visaType}</h2>
            <table className="w-full text-sm">
              <tbody>
                {est.items.map((i) => (
                  <tr key={i.key} className={`border-b border-gray-100 ${i.optional && skipAgency ? 'text-gray-400 line-through' : ''}`}>
                    <td className="py-2">{i.label}</td><td className="py-2 text-right text-xs text-gray-500">${i.usd.toLocaleString()}</td><td className="py-2 text-right font-medium">{lkr(i.lkr)}</td>
                  </tr>
                ))}
                <tr><td className="pt-3 font-bold text-brand" colSpan={2}>Total</td><td className="pt-3 text-right text-lg font-bold text-secondary">{lkr(total)}</td></tr>
              </tbody>
            </table>
            {skipAgency && <p className="mt-3 rounded-lg bg-accent-light px-3 py-2 text-xs text-emerald-900">Applying directly could save about {lkr(est.potentialSavingLKR)} in typical agency fees. Rate used: 1 USD = LKR {est.rate}.</p>}
          </div>

          <form onSubmit={makePlan} className="card space-y-3">
            <h2 className="text-lg">Savings planner</h2>
            <p className="text-sm text-gray-600">Target: <b>{lkr(total)}</b></p>
            <Field label="Months to save"><input className="input" type="number" min="1" max="60" value={plan.months} onChange={(e) => setPlan({ ...plan, months: e.target.value })} /></Field>
            <Field label="Already saved (LKR)"><input className="input" type="number" min="0" value={plan.currentSavingsLKR} onChange={(e) => setPlan({ ...plan, currentSavingsLKR: e.target.value })} /></Field>
            {user ? <button className="btn w-full">Create plan</button> : <p className="text-xs text-gray-500">Log in to create and save a plan.</p>}
            {planRes && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p>Save <b className="text-secondary">{lkr(planRes.plan.monthlyRequiredLKR)}</b> per month for {planRes.plan.months} months.</p>
                <p className="text-xs text-gray-500">Target date: {new Date(planRes.plan.targetDate).toLocaleDateString()}</p>
                <div className="mt-2 space-y-1">
                  {planRes.schedule.filter((_, i, a) => a.length <= 8 || i % Math.ceil(a.length / 8) === 0 || i === a.length - 1).map((s) => (
                    <div key={s.month} className="flex items-center gap-2 text-xs"><span className="w-10">M{s.month}</span><div className="h-2 flex-1 rounded-sm bg-gray-200"><div className="h-2 rounded-sm bg-accent" style={{ width: `${Math.min(100, (s.saved / planRes.plan.targetAmountLKR) * 100)}%` }} /></div></div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
