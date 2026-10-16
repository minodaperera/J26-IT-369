import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import g, { errMsg } from '../api';
import { Check, ErrorBox, PageTitle } from '../components/ui.jsx';

export default function CountryDetail() {
  const { slug } = useParams();
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState({});

  useEffect(() => {
    g.get(`/countries/${slug}`).then((r) => setC(r.data)).catch((e) => setErr(errMsg(e)));
    try { setDone(JSON.parse(localStorage.getItem(`checklist_${slug}`) || '{}')); } catch { setDone({}); }
  }, [slug]);

  const toggle = (key, v) => {
    const next = { ...done, [key]: v }; setDone(next);
    try { localStorage.setItem(`checklist_${slug}`, JSON.stringify(next)); } catch { /* ignore */ }
  };

  if (err) return <ErrorBox msg={err} />;
  if (!c) return <p className="py-20 text-center text-gray-500">Loading…</p>;
  const v = c.visaTypes[tab];
  const key = (d) => `${v.type}:${d}`;
  const progress = v.requiredDocuments.length ? Math.round((v.requiredDocuments.filter((d) => done[key(d)]).length / v.requiredDocuments.length) * 100) : 0;

  return (
    <div>
      <Link to="/guidance/countries" className="text-sm font-semibold text-secondary">← All countries</Link>
      <div className="mt-2"><PageTitle title={`${c.name} visa guide`} sub={`${c.region} · Difficulty ${c.visaDifficulty}/5 · Safety ${c.safetyRating}/5`} /></div>

      <div className="mb-4 flex gap-2">
        {c.visaTypes.map((x, i) => <button key={x.type} className={tab === i ? 'btn' : 'btn-outline'} onClick={() => setTab(i)}>{x.type}</button>)}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg">Step-by-step process</h2>
          <ol className="space-y-4">
            {v.steps.map((s) => (
              <li key={s.order} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{s.order}</span>
                <div><p className="font-semibold">{s.title}</p><p className="text-sm text-gray-600">{s.description}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-lg">Document checklist</h2>
            <div className="my-2 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="mb-3 text-xs text-gray-500">{progress}% ready</p>
            <div className="space-y-2">{v.requiredDocuments.map((d) => <Check key={d} label={d} checked={!!done[key(d)]} onChange={(val) => toggle(key(d), val)} />)}</div>
            <Link to={`/guidance/requirements?country=${c.slug}`} className="btn mt-4 w-full">Requirements by purpose</Link>
            <Link to="/guidance/documents" className="btn-outline mt-2 w-full">Verify documents with AI</Link>
          </div>
          <div className="card text-sm">
            <h2 className="mb-2 text-lg">Key facts</h2>
            <p><b>Processing:</b> {v.processingDays?.min}–{v.processingDays?.max} days</p>
            <p><b>Stay:</b> {v.stayDuration}</p>
            <p><b>Visa fee:</b> ${v.visaFeeUSD}</p>
            <p className="mt-2"><b>Official source:</b> <a className="font-semibold text-secondary underline" href={c.embassy?.website} target="_blank" rel="noreferrer">{c.embassy?.website}</a></p>
            <div className="mt-3 flex gap-2">
              <Link to={`/guidance/costs?country=${c.slug}`} className="btn flex-1">Costs</Link>
              <Link to={`/guidance/risk?country=${c.slug}`} className="btn-outline flex-1">Risk</Link>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
        Prototype data last reviewed {c.lastVerified ? new Date(c.lastVerified).toLocaleDateString() : 'n/a'}. Requirements change often — confirm every detail on the official website before applying, and never pay anyone who promises a guaranteed visa.
      </p>
    </div>
  );
}
