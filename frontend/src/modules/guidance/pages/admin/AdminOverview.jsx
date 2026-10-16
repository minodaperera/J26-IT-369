import { useEffect, useState } from 'react';
import g, { errMsg } from '../../api';
import { Chip, ErrorBox } from '../../components/ui.jsx';

const Bars = ({ data }) => {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <p className="text-sm text-gray-500">No data yet.</p>;
  return entries.map(([k, v]) => (
    <div key={k} className="mb-2 flex items-center gap-2 text-sm">
      <span className="w-32 capitalize">{k.replace('_', ' ')}</span>
      <div className="h-3 flex-1 rounded-sm bg-gray-100"><div className="h-3 rounded-sm bg-secondary" style={{ width: `${(v / max) * 100}%` }} /></div>
      <span className="w-8 text-right font-semibold">{v}</span>
    </div>
  ));
};

const Status = ({ ok, label }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"><span>{label}</span><Chip kind={ok ? 'valid' : 'invalid'}>{ok ? 'OK' : 'Problem'}</Chip></div>
);

export default function AdminOverview() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { g.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox msg={err} />;
  if (!s) return <p className="py-10 text-center text-gray-500">Loading…</p>;

  const ml = s.system.ml || {};
  const tiles = [['Users', s.totals.users], ['Countries', s.totals.countries], ['Documents scanned', s.totals.documents], ['Risk checks', s.totals.riskChecks], ['Savings plans', s.totals.savingsPlans], ['Expiring in 30 days', s.documents.expiringIn30Days]];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([l, n]) => <div key={l} className="card"><p className="text-3xl font-extrabold text-secondary">{n}</p><p className="text-sm text-gray-600">{l}</p></div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card"><h2 className="mb-3 text-lg">Documents by type</h2><Bars data={s.documents.byType} />
          <h2 className="mb-3 mt-5 text-lg">Validation results</h2><Bars data={s.documents.byStatus} />
          <p className="mt-3 text-xs text-gray-500">Only counts are shown. Uploaded files are never stored and admins cannot read users’ document contents.</p></div>
        <div className="card"><h2 className="mb-3 text-lg">System status</h2>
          <Status ok label="Express API" />
          <Status ok={ml.status === 'ok'} label="AI/ML service (Module 2 endpoints)" />
          <Status ok={!!ml.tesseract} label="Tesseract OCR engine (document reading)" />
          <Status ok={!!ml.model_trained} label="Visa-risk model trained" />
          <Status ok={!!ml.doc_classifier_trained} label="Document classifier trained" />
          <div className="flex items-center justify-between py-2 text-sm"><span>Claude LLM extraction</span><Chip kind="unverified">{ml.llm_enabled ? 'Enabled' : 'Off (local OCR only)'}</Chip></div>
          {!ml.tesseract && ml.status === 'ok' && <p className="mt-2 rounded-sm bg-yellow-50 px-3 py-2 text-xs text-yellow-800">Document uploads will fail until Tesseract is installed - see docs/modules/module-2-legal-docs-costs.md.</p>}
          {ml.status === 'degraded' && <p className="mt-2 rounded-sm bg-yellow-50 px-3 py-2 text-xs text-yellow-800">The AI service is running but the Module 2 endpoints did not load. Run <code>pip install -r requirements.txt</code> in ai-ml and restart it.</p>}
          {ml.status !== 'ok' && ml.status !== 'degraded' && <p className="mt-2 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-700">AI service is not reachable. Start it from ai-ml with: uvicorn api.main:app --port 8000 --reload</p>}
        </div>
        <div className="card"><h2 className="mb-3 text-lg">Most risk-checked destinations</h2>
          {s.risk.topCountries.length === 0 ? <p className="text-sm text-gray-500">No risk checks yet.</p> : s.risk.topCountries.map((c) => (
            <div key={c.name} className="flex justify-between border-b border-gray-100 py-2 text-sm"><span>{c.name}</span><span>{c.checks} checks · avg {Math.round(c.avg * 100)}%</span></div>))}
        </div>
        <div className="card"><h2 className="mb-3 text-lg">Newest users</h2>
          {s.recentUsers.map((u) => <div key={u._id} className="flex justify-between border-b border-gray-100 py-2 text-sm"><span>{u.name} <span className="text-gray-400">· {u.email}</span></span><span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span></div>)}
        </div>
      </div>
    </div>
  );
}
