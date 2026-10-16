import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import g from '../api';
import { useAuth } from '@/context/AuthContext';
import { Chip, PageTitle } from '../components/ui.jsx';

export default function GuidanceDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [docs, setDocs] = useState([]);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    g.get('/alerts').then((r) => setAlerts(r.data)).catch(() => {});
    g.get('/documents').then((r) => setDocs(r.data)).catch(() => {});
    g.get('/risk/history').then((r) => setHistory(r.data)).catch(() => {});
  }, []);

  const tiles = [
    ['Documents tracked', docs.length, '/guidance/documents'],
    ['Expiry alerts', alerts.length, '/guidance/alerts'],
    ['Risk checks run', history.length, '/guidance/risk'],
  ];
  return (
    <div>
      <PageTitle title={`Welcome, ${user.name.split(' ')[0]}`} sub="Your visa readiness at a glance." />
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map(([label, n, to]) => (
          <Link key={label} to={to} className="card transition hover:border-secondary"><p className="text-3xl font-extrabold text-secondary">{n}</p><p className="text-sm text-gray-600">{label}</p></Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg">Needs attention</h2>
          {alerts.length === 0 ? <p className="text-sm text-gray-500">Nothing urgent.</p> : alerts.slice(0, 4).map((a) => (
            <div key={a.documentId} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"><span>{a.message}</span><Chip kind={a.severity} /></div>
          ))}
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg">Recent risk checks</h2>
          {history.length === 0 ? <p className="text-sm text-gray-500">No checks yet. <Link to="/guidance/risk" className="font-semibold text-secondary">Run one</Link>.</p> : history.slice(0, 4).map((h) => (
            <div key={h._id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"><span>{h.country?.name}</span><span className="font-semibold">{Math.round(h.approvalProbability * 100)}% <Chip kind={h.riskLevel} /></span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
