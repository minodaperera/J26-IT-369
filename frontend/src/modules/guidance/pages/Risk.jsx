import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import g, { errMsg } from '../api';
import { useAuth } from '@/context/AuthContext';
import { Check, Chip, ErrorBox, Field, PageTitle } from '../components/ui.jsx';
import { useLang } from '@/i18n';

export default function Risk() {
  const { t } = useLang();
  const { user, updateProfile } = useAuth();
  const [params] = useSearchParams();
  const p = user?.profile || {};
  const [countries, setCountries] = useState([]);
  const [f, setF] = useState({
    country: params.get('country') || '', age: p.age || 30, monthlyIncomeLKR: p.monthlyIncomeLKR || 0, savingsLKR: p.savingsLKR || 0,
    employment: p.employment || 'employed', travelHistoryCount: p.travelHistoryCount || 0, previousRejections: p.previousRejections || 0,
    bankStatementMonths: 3, tripDays: 14, hasReturnTicket: false, hasAccommodation: false, hasSponsor: false,
  });
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { g.get('/countries').then((r) => { setCountries(r.data); setF((x) => ({ ...x, country: x.country || r.data[0]?.slug || '' })); }); }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setRes(null);
    try {
      const r = await g.post('/risk/predict', f);
      setRes(r.data);
      updateProfile({ profile: { age: +f.age, monthlyIncomeLKR: +f.monthlyIncomeLKR, savingsLKR: +f.savingsLKR, employment: f.employment, travelHistoryCount: +f.travelHistoryCount, previousRejections: +f.previousRejections } }).catch(() => {});
    } catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };

  const pct = res ? Math.round(res.approval_probability * 100) : 0;
  const num = (label, k, min = 0) => <Field label={label}><input className="input" type="number" min={min} value={f[k]} onChange={set(k)} required /></Field>;

  return (
    <div>
      <PageTitle title={t('riskTitle')} sub="An ML model estimates your visa approval probability from your profile and highlights the weak points to fix before you apply. It is a guide, not a guarantee." />
      <ErrorBox msg={err} />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Destination"><select className="input" value={f.country} onChange={set('country')}>{countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></Field></div>
          {num('Age', 'age', 16)}
          <Field label="Employment"><select className="input" value={f.employment} onChange={set('employment')}><option value="employed">Employed</option><option value="self_employed">Self-employed</option><option value="student">Student</option><option value="unemployed">Unemployed</option></select></Field>
          {num('Monthly income (LKR)', 'monthlyIncomeLKR')}
          {num('Savings (LKR)', 'savingsLKR')}
          {num('Countries visited before', 'travelHistoryCount')}
          {num('Previous visa refusals', 'previousRejections')}
          {num('Bank statement months', 'bankStatementMonths')}
          {num('Trip length (days)', 'tripDays', 1)}
          <div className="space-y-2 sm:col-span-2">
            <Check label="I have a return ticket / itinerary" checked={f.hasReturnTicket} onChange={(v) => setF({ ...f, hasReturnTicket: v })} />
            <Check label="I have accommodation proof" checked={f.hasAccommodation} onChange={(v) => setF({ ...f, hasAccommodation: v })} />
            <Check label="I have a sponsor or invitation letter" checked={f.hasSponsor} onChange={(v) => setF({ ...f, hasSponsor: v })} />
          </div>
          <button className="btn sm:col-span-2" disabled={busy}>{busy ? 'Analysing…' : 'Predict approval chances'}</button>
        </form>

        <div className="card">
          {!res ? <p className="text-sm text-gray-500">Your result will appear here.</p> : (
            <>
              <div className="flex items-center gap-5">
                <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#66ac92 ${pct * 3.6}deg, #eeeeee 0deg)` }}>
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-2xl font-extrabold text-brand">{pct}%</div>
                </div>
                <div><p className="text-sm text-gray-500">Estimated approval chance · {res.country}</p><div className="mt-1"><Chip kind={res.risk_level}>{res.risk_level} rejection risk</Chip></div></div>
              </div>
              <h3 className="mb-2 mt-5 text-brand">Weak points{res.weak_points.length ? '' : ' — none found'}</h3>
              <ul className="space-y-3">
                {res.weak_points.map((w) => (
                  <li key={w.key} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-2"><p className="font-semibold">{w.title}</p>{w.impact_points != null && <span className="chip bg-accent-light text-emerald-800">+{w.impact_points} pts if fixed</span>}</div>
                    <p className="mt-1 text-sm text-gray-600">{w.advice}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-gray-500">{res.disclaimer}</p>
              {res.model?.data_source === 'synthetic' && <p className="mt-1 rounded-sm bg-yellow-50 px-2 py-1 text-xs text-yellow-800">Prototype model trained on synthetic data — replace with real anonymised outcomes before relying on the numbers.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
