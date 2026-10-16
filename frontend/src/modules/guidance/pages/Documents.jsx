import { useEffect, useState } from 'react';
import g, { errMsg } from '../api';
import { Chip, ErrorBox, Field, PageTitle } from '../components/ui.jsx';
import { useLang } from '@/i18n';

const TYPES = [['passport', 'Passport'], ['medical', 'Medical certificate'], ['police_clearance', 'Police clearance'], ['contract', 'Employment contract'], ['other', 'Other']];
const CATEGORIES = ['Visa / Entry Permit', 'Standard Identity Papers', 'Financial Support', 'Health & Vaccinations', 'Accommodation & Itinerary'];
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export default function Documents() {
  const { t } = useLang();
  const [docs, setDocs] = useState([]);
  const [docType, setDocType] = useState('passport');
  const [file, setFile] = useState(null);
  const [travelDate, setTravelDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState({ docType: 'medical', label: '', expiryDate: '', category: '' });

  const load = () => g.get('/documents').then((r) => setDocs(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault(); if (!file) return;
    setBusy(true); setErr(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('docType', docType); fd.append('file', file);
      if (travelDate) fd.append('travelDate', travelDate);
      // the shared axios instance defaults to JSON; multipart must be explicit, and OCR can take longer than 10 s
      const r = await g.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
      setResult(r.data); setFile(null); e.target.reset(); load();
    } catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  const addManual = async (e) => {
    e.preventDefault(); setErr('');
    try { await g.post('/documents', manual); setManual({ ...manual, label: '', expiryDate: '', category: '' }); load(); } catch (e2) { setErr(errMsg(e2)); }
  };
  const remove = async (id) => { await g.delete(`/documents/${id}`); load(); };

  return (
    <div>
      <PageTitle title={t('documentsTitle')} sub="Upload a JPG, PNG or PDF. We read the key fields, check expiry rules (e.g. passport 6-month rule, MRZ checksums) and track expiry dates. Your file is processed in memory and never stored — only the extracted details are saved. Documents of type “Other” are also matched to a requirement category (see Document Requirements)." />
      <ErrorBox msg={err} />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={upload} className="card space-y-4">
          <h2 className="text-lg">Scan a document</h2>
          <Field label="Document type"><select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          {docType === 'passport' && <Field label="Planned travel date (for 6-month rule)"><input className="input" type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} /></Field>}
          <Field label="File (JPG / PNG / PDF, max 8 MB)"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(e) => setFile(e.target.files[0])} /></Field>
          <button className="btn w-full" disabled={busy || !file}>{busy ? 'Reading document…' : 'Upload & verify'}</button>
          {docType === 'passport' && <p className="text-xs text-gray-500">Tip: photograph the photo page flat, in good light, with the two lines of “&lt;&lt;&lt;” at the bottom fully visible.</p>}
        </form>

        <div className="card">
          <h2 className="mb-3 text-lg">Latest result</h2>
          {result ? <DocCard d={result} /> : <p className="text-sm text-gray-500">Your verification result will appear here.</p>}
        </div>
      </div>

      <form onSubmit={addManual} className="card mt-5 grid items-end gap-3 md:grid-cols-5">
        <Field label="Add manually - type"><select className="input" value={manual.docType} onChange={(e) => setManual({ ...manual, docType: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Label"><input className="input" required placeholder="e.g. Medical (GAMCA)" value={manual.label} onChange={(e) => setManual({ ...manual, label: e.target.value })} /></Field>
        <Field label="Requirement category (optional)"><select className="input" value={manual.category} onChange={(e) => setManual({ ...manual, category: e.target.value })}><option value="">Auto / none</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
        <Field label="Expiry date"><input className="input" type="date" required value={manual.expiryDate} onChange={(e) => setManual({ ...manual, expiryDate: e.target.value })} /></Field>
        <button className="btn">Add for expiry tracking</button>
      </form>

      <h2 className="mb-3 mt-8 text-lg">My documents</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {docs.length === 0 && <p className="text-sm text-gray-500">No documents yet.</p>}
        {docs.map((d) => <DocCard key={d._id} d={d} onDelete={() => remove(d._id)} />)}
      </div>
    </div>
  );
}

function DocCard({ d, onDelete }) {
  const f = d.fields || {};
  const show = Object.entries(f).filter(([k, v]) => v && k !== 'textPreview').slice(0, 8);
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div><p className="font-semibold capitalize">{d.label || d.docType}</p><p className="text-xs text-gray-500">via {d.extractionMethod || 'manual'}{d.confidence ? ` · confidence ${Math.round(d.confidence * 100)}%` : ''}</p></div>
        <Chip kind={d.validation?.status} />
      </div>
      <p className="mt-2 text-sm"><b>Expires:</b> {fmt(d.expiryDate)}</p>
      {show.length > 0 && <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">{show.map(([k, v]) => <div key={k}><dt className="text-gray-500">{k}</dt><dd className="font-medium">{String(v)}</dd></div>)}</dl>}
      {d.validation?.issues?.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-yellow-800">{d.validation.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
      {onDelete && <button onClick={onDelete} className="mt-3 text-xs font-semibold text-red-600">Delete</button>}
    </div>
  );
}
