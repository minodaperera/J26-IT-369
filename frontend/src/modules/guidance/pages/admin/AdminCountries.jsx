import { useEffect, useState } from 'react';
import g, { errMsg } from '../../api';
import { ErrorBox, Field } from '../../components/ui.jsx';

const blankVisa = (type, category) => ({ type, category, processingDays: { min: 0, max: 0 }, stayDuration: '', visaFeeUSD: 0, docsText: '', stepsText: '' });
const blank = () => ({
  name: '', isoNumeric: '', isoAlpha3: '', region: '', visaDifficulty: 3, safetyRating: 3, avgMonthlySalaryUSD: 0,
  embassy: { name: '', phone: '', website: '' },
  costs: { agencyFeeUSD: 0, medicalUSD: 0, airfareUSD: 0, insuranceUSD: 0, policeClearanceUSD: 0, accommodationPerMonthUSD: 0, otherUSD: 0 },
  visas: [blankVisa('Visit Visa', 'visit'), blankVisa('Work Visa', 'work')],
  lastVerified: new Date().toISOString().slice(0, 10),
});

// API country -> editable form state
const toForm = (c) => ({
  ...blank(), ...c, _id: c._id,
  embassy: { name: '', phone: '', website: '', ...(c.embassy || {}) },
  costs: { ...blank().costs, ...(c.costs || {}) },
  lastVerified: c.lastVerified ? c.lastVerified.slice(0, 10) : '',
  visas: (c.visaTypes || []).map((v) => ({
    ...v, processingDays: v.processingDays || { min: 0, max: 0 },
    docsText: (v.requiredDocuments || []).join('\n'),
    stepsText: (v.steps || []).map((s) => `${s.title} | ${s.description}`).join('\n'),
  })),
});
// form state -> API payload
const toPayload = (f) => ({
  ...f,
  visaTypes: f.visas.map((v) => ({
    type: v.type, category: v.category, processingDays: v.processingDays, stayDuration: v.stayDuration, visaFeeUSD: v.visaFeeUSD,
    requiredDocuments: v.docsText.split('\n'),
    steps: v.stepsText.split('\n').filter((l) => l.trim()).map((l) => { const [title, ...rest] = l.split('|'); return { title: title.trim(), description: rest.join('|').trim() }; }),
  })),
});

export default function AdminCountries() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = () => g.get('/countries').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);

  const edit = async (slug) => { setErr(''); setOk(''); setForm(toForm((await g.get(`/countries/${slug}`)).data)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    try {
      if (form._id) await g.put(`/admin/countries/${form._id}`, toPayload(form)); else await g.post('/admin/countries', toPayload(form));
      setOk(`${form.name} saved`); setForm(null); load();
    } catch (e2) { setErr(errMsg(e2)); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name}? Existing risk-check history for it will lose its country link.`)) return;
    try { await g.delete(`/admin/countries/${c._id}`); load(); } catch (e2) { setErr(errMsg(e2)); }
  };

  const set = (path, value) => setForm((f) => { const n = structuredClone(f); let o = n; const k = path.split('.'); k.slice(0, -1).forEach((p) => (o = o[p])); o[k.at(-1)] = value; return n; });
  const inp = (label, path, type = 'text', extra = {}) => {
    const val = path.split('.').reduce((o, k) => o?.[k], form);
    return <Field label={label}><input className="input" type={type} value={val ?? ''} onChange={(e) => set(path, e.target.value)} {...extra} /></Field>;
  };

  return (
    <div>
      <ErrorBox msg={err} />
      {ok && <div className="mb-4 rounded-lg border border-emerald-200 bg-accent-light px-3 py-2 text-sm text-emerald-800">{ok}</div>}

      {form ? (
        <form onSubmit={save} className="card mb-6 space-y-5">
          <h2 className="text-lg">{form._id ? `Edit ${form.name}` : 'Add country'}</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {inp('Name', 'name', 'text', { required: true })}
            {inp('ISO numeric (map id, e.g. 392)', 'isoNumeric', 'number', { required: true })}
            {inp('ISO alpha-3', 'isoAlpha3', 'text', { maxLength: 3 })}
            {inp('Region', 'region')}
            {inp('Visa difficulty (1-5)', 'visaDifficulty', 'number', { min: 1, max: 5 })}
            {inp('Safety rating (1-5)', 'safetyRating', 'number', { min: 1, max: 5 })}
            {inp('Avg monthly salary (USD)', 'avgMonthlySalaryUSD', 'number', { min: 0 })}
            {inp('Data last verified', 'lastVerified', 'date')}
            {inp('Embassy / authority name', 'embassy.name')}
            {inp('Official website', 'embassy.website')}
            {inp('Phone', 'embassy.phone')}
          </div>
          <div><h3 className="mb-2 text-brand">Costs (USD)</h3>
            <div className="grid gap-3 md:grid-cols-4">
              {[['agencyFeeUSD', 'Agency fee'], ['medicalUSD', 'Medical'], ['policeClearanceUSD', 'Police clearance'], ['airfareUSD', 'Airfare'], ['insuranceUSD', 'Insurance'], ['accommodationPerMonthUSD', 'Accommodation / month'], ['otherUSD', 'Other']].map(([k, l]) => inp(l, `costs.${k}`, 'number', { min: 0 }))}
            </div></div>
          {form.visas.map((v, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-brand">{v.type}</h3>
              <div className="grid gap-3 md:grid-cols-4">
                {inp('Visa fee (USD)', `visas.${i}.visaFeeUSD`, 'number', { min: 0 })}
                {inp('Processing min (days)', `visas.${i}.processingDays.min`, 'number', { min: 0 })}
                {inp('Processing max (days)', `visas.${i}.processingDays.max`, 'number', { min: 0 })}
                {inp('Stay duration', `visas.${i}.stayDuration`)}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field label="Required documents (one per line)"><textarea className="input h-40" value={v.docsText} onChange={(e) => set(`visas.${i}.docsText`, e.target.value)} /></Field>
                <Field label="Steps (one per line:  Title | Description)"><textarea className="input h-40" value={v.stepsText} onChange={(e) => set(`visas.${i}.stepsText`, e.target.value)} /></Field>
              </div>
            </div>
          ))}
          <div className="flex gap-2"><button className="btn">Save country</button><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      ) : (
        <button className="btn mb-4" onClick={() => { setOk(''); setForm(blank()); }}>+ Add country</button>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-brand"><tr><th className="px-3 py-2">Country</th><th className="px-3 py-2">Region</th><th className="px-3 py-2">Difficulty</th><th className="px-3 py-2">Safety</th><th /></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{c.name}</td><td className="px-3 py-2">{c.region}</td><td className="px-3 py-2">{c.visaDifficulty}/5</td><td className="px-3 py-2">{c.safetyRating}/5</td>
                <td className="space-x-3 px-3 py-2 text-right"><button className="font-semibold text-secondary" onClick={() => edit(c.slug)}>Edit</button><button className="font-semibold text-red-600" onClick={() => remove(c)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
