import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import g, { errMsg } from '../api';
import { useAuth } from '@/context/AuthContext';
import { Chip, ErrorBox, PageTitle } from '../components/ui.jsx';

const STATUS = {
  covered: ['valid', 'Covered'],
  expired: ['warning', 'Expired / invalid'],
  missing: ['invalid', 'Missing'],
};
const yesNo = (v) => (v === true ? 'Required' : v === false ? 'Not required' : 'Unknown');

export default function Requirements() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ purposes: {}, countries: [] });
  const [guideSlugs, setGuideSlugs] = useState(new Set());
  const [detail, setDetail] = useState(null);
  const [ready, setReady] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const slug = params.get('country') || '';
  const purpose = params.get('purpose') || 'traveler';
  const select = (next) => setParams({ country: slug, purpose, ...next }, { replace: true });

  useEffect(() => {
    g.get('/requirements').then((r) => {
      setMeta(r.data);
      if (!params.get('country') && r.data.countries[0]) setParams({ country: r.data.countries[0].slug, purpose }, { replace: true });
    }).catch((e) => setErr(errMsg(e)));
    g.get('/countries').then((r) => setGuideSlugs(new Set(r.data.map((c) => c.slug)))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setErr(''); setReady(null); setLoading(true);
    g.get(`/requirements/${slug}`, { params: { purpose } })
      .then((r) => setDetail(r.data))
      .catch((e) => { setDetail(null); setErr(e?.response?.status === 404 ? 'There is no document-requirement data for this country yet.' : errMsg(e)); })
      .finally(() => setLoading(false));
    if (user) g.get(`/requirements/${slug}/readiness`, { params: { purpose } }).then((r) => setReady(r.data)).catch(() => {});
  }, [slug, purpose, user?.id]);

  const statusFor = (order) => ready?.items.find((i) => i.order === order);

  return (
    <div>
      <PageTitle title="Document requirements" sub="Choose a destination and the purpose of your trip to see which documents to prepare. When you are logged in, we compare the list with the documents you have scanned." />
      <ErrorBox msg={err} />

      <div className="card mb-5 grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">Destination</label>
          <select className="input" value={slug} onChange={(e) => select({ country: e.target.value })}>
            {meta.countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Purpose of travel</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(meta.purposes).map(([key, label]) => (
              <button key={key} type="button" className={purpose === key ? 'btn' : 'btn-outline'} onClick={() => select({ purpose: key })}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="py-6 text-center text-gray-500">Loading…</p>}

      {detail && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h2 className="mb-1 text-lg">{detail.name} · {detail.purposeLabel}</h2>
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="chip bg-gray-100 text-gray-700">Entry: {detail.entryType}</span>
              <span className="chip bg-gray-100 text-gray-700">Biometrics: {yesNo(detail.biometrics)}</span>
              <span className="chip bg-gray-100 text-gray-700">Interview: {yesNo(detail.interview)}</span>
              {detail.passportType && <span className="chip bg-gray-100 text-gray-700">Passport: {detail.passportType}</span>}
            </div>
            <ol className="space-y-3">
              {detail.checklist.map((item) => {
                const st = statusFor(item.order);
                const [kind, label] = st ? STATUS[st.status] : [];
                return (
                  <li key={item.order} className="flex gap-3 rounded-lg border border-gray-200 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{item.order}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{item.category}</p>
                        {st && <Chip kind={kind}>{label}</Chip>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                      {st?.documents.length > 0 && <p className="mt-1 text-xs text-gray-500">Matched: {st.documents.map((d) => d.label).join(', ')}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            {detail.notes?.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 rounded-sm bg-yellow-50 py-3 pl-8 pr-3 text-xs text-yellow-800">
                {detail.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            )}
          </div>

          <div className="space-y-5">
            <div className="card">
              <h2 className="mb-2 text-lg">Your readiness</h2>
              {!user ? (
                <p className="text-sm text-gray-600"><Link to="/login" state={{ from: `/guidance/requirements?country=${slug}&purpose=${purpose}` }} className="font-semibold text-secondary">Log in</Link> to compare this list with your scanned documents.</p>
              ) : ready ? (
                <>
                  <div className="mb-1 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${ready.readinessPercent}%` }} /></div>
                  <p className="mb-3 text-xs text-gray-500">{ready.readinessPercent}% of categories covered</p>
                  <p className="text-xs text-gray-500">{ready.note}</p>
                </>
              ) : <p className="text-sm text-gray-500">Checking your documents…</p>}
              <Link to="/guidance/documents" className="btn mt-4 w-full">Scan a document</Link>
            </div>
            <div className="card text-sm">
              <h2 className="mb-2 text-lg">Next steps</h2>
              {guideSlugs.has(slug) && <Link to={`/guidance/countries/${slug}`} className="btn-outline mb-2 w-full">Step-by-step visa guide</Link>}
              <Link to={`/guidance/costs?country=${slug}`} className="btn-outline mb-2 w-full">Estimate costs</Link>
              <Link to={`/guidance/risk?country=${slug}`} className="btn-outline w-full">Check approval risk</Link>
            </div>
          </div>
        </div>
      )}
      <p className="mt-6 rounded-sm bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
        Requirements come from the project dataset and may be out of date. Always confirm on the official embassy or immigration website before applying.
      </p>
    </div>
  );
}
