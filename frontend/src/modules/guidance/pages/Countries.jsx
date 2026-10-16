import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import world from 'world-atlas/countries-110m.json';
import g, { errMsg, lkr } from '../api';
import { ErrorBox, PageTitle } from '../components/ui.jsx';
import { useLang } from '@/i18n';

// light -> dark, drawn from the project palette
const SCALE = ['#e6f3ee', '#66ac92', '#b0a74a', '#986629', '#542d1e'];
const METRICS = {
  difficulty: { label: 'Visa difficulty', hint: 'Teal = easier, dark brown = harder', value: (c) => c.visaDifficulty, bucket: (v) => v - 1 },
  safety: { label: 'Safety rating', hint: 'Teal = safest, dark brown = lower rating', value: (c) => c.safetyRating, bucket: (v) => 5 - v },
  cost: { label: 'Estimated cost', hint: 'Teal = cheaper, dark brown = more expensive', value: (c) => c.estimatedCostLKR, bucket: null },
};

export default function Countries() {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const [metric, setMetric] = useState('difficulty');
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [params, setParams] = useSearchParams();
  const search = (params.get('search') || '').trim().toLowerCase();

  useEffect(() => { g.get('/countries').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))); }, []);

  const byIso = useMemo(() => Object.fromEntries(list.map((c) => [c.isoNumeric, c])), [list]);
  const costBuckets = useMemo(() => {
    const v = list.map((c) => c.estimatedCostLKR).sort((a, b) => a - b);
    return [0.2, 0.4, 0.6, 0.8].map((q) => v[Math.floor(q * (v.length - 1))]);
  }, [list]);

  const colorFor = (c) => {
    if (!c) return '#eeeeee';
    const m = METRICS[metric];
    const idx = metric === 'cost' ? costBuckets.filter((b) => c.estimatedCostLKR > b).length : m.bucket(m.value(c));
    return SCALE[Math.max(0, Math.min(4, idx))];
  };

  const sorted = useMemo(() => [...list].filter((c) => !search || c.name.toLowerCase().includes(search) || (c.region || '').toLowerCase().includes(search)).sort((a, b) => {
    const k = sort.key; const av = a[k], bv = b[k];
    return (typeof av === 'string' ? av.localeCompare(bv) : av - bv) * sort.dir;
  }), [list, sort, search]);
  const th = (key, label) => (
    <th className="cursor-pointer px-3 py-2 text-left hover:text-secondary" onClick={() => setSort({ key, dir: sort.key === key ? -sort.dir : 1 })}>
      {label}{sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );
  const active = selected || hover;

  return (
    <div>
      <PageTitle title={t('countriesTitle')} sub="Click a highlighted country to see visa difficulty, safety and cost, then open its step-by-step guide." />
      <ErrorBox msg={err} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.entries(METRICS).map(([k, m]) => (
          <button key={k} onClick={() => setMetric(k)} className={metric === k ? 'btn' : 'btn-outline'}>{m.label}</button>
        ))}
        <span className="ml-2 text-xs text-gray-500">{METRICS[metric].hint}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden p-0 lg:col-span-2">
          <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: '100%', height: 'auto' }}>
            <ZoomableGroup minZoom={1} maxZoom={6}>
              <Geographies geography={world}>
                {({ geographies }) => geographies.map((geo) => {
                  const c = byIso[Number(geo.id)];
                  return (
                    <Geography key={geo.rsmKey} geography={geo}
                      onMouseEnter={() => c && setHover(c)} onMouseLeave={() => setHover(null)}
                      onClick={() => c && setSelected(c)}
                      style={{
                        default: { fill: colorFor(c), stroke: '#fff', strokeWidth: 0.4, outline: 'none' },
                        hover: { fill: c ? '#38383a' : '#eeeeee', stroke: '#fff', strokeWidth: 0.4, outline: 'none', cursor: c ? 'pointer' : 'default' },
                        pressed: { fill: '#38383a', outline: 'none' },
                      }} />
                  );
                })}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          <div className="flex items-center gap-1 border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {SCALE.map((c) => <span key={c} className="h-3 w-8" style={{ background: c }} />)}
            <span className="ml-2">low → high · grey = not yet covered</span>
          </div>
        </div>
        <div className="card">
          {active ? (
            <>
              <h2 className="text-xl">{active.name}</h2>
              <p className="text-sm text-gray-500">{active.region}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Visa difficulty</dt><dd className="font-semibold">{active.visaDifficulty} / 5</dd></div>
                <div className="flex justify-between"><dt>Safety rating</dt><dd className="font-semibold">{active.safetyRating} / 5</dd></div>
                <div className="flex justify-between"><dt>Avg. monthly salary</dt><dd className="font-semibold">${active.avgMonthlySalaryUSD?.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Est. one-off cost</dt><dd className="font-semibold">{lkr(active.estimatedCostLKR)}</dd></div>
              </dl>
              <Link to={`/guidance/countries/${active.slug}`} className="btn mt-5 w-full">View visa guide</Link>
            </>
          ) : <p className="text-sm text-gray-500">Hover or click a country on the map.</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Filter countries…" value={params.get('search') || ''}
          onChange={(e) => (e.target.value ? setParams({ search: e.target.value }, { replace: true }) : setParams({}, { replace: true }))} />
        {search && <span className="text-sm text-gray-500">{sorted.length} match{sorted.length === 1 ? '' : 'es'}</span>}
      </div>
      <div className="card mt-3 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-brand"><tr>{th('name', 'Country')}{th('visaDifficulty', 'Difficulty')}{th('safetyRating', 'Safety')}{th('avgMonthlySalaryUSD', 'Salary (USD/mo)')}{th('estimatedCostLKR', 'Est. cost (LKR)')}<th /></tr></thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{c.name}</td><td className="px-3 py-2">{c.visaDifficulty}/5</td><td className="px-3 py-2">{c.safetyRating}/5</td>
                <td className="px-3 py-2">${c.avgMonthlySalaryUSD?.toLocaleString()}</td><td className="px-3 py-2">{lkr(c.estimatedCostLKR)}</td>
                <td className="px-3 py-2 text-right"><Link className="font-semibold text-secondary" to={`/guidance/countries/${c.slug}`}>Guide →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
