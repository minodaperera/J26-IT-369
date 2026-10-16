import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import g, { errMsg } from '../api';
import { Chip, ErrorBox, PageTitle } from '../components/ui.jsx';
import { useLang } from '@/i18n';

export default function Alerts() {
  const { t } = useLang();
  const [alerts, setAlerts] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { g.get('/alerts').then((r) => setAlerts(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  return (
    <div>
      <PageTitle title={t('alertsTitle')} sub="Alerts appear 90, 30 and 7 days before a document expires, and after it has expired." />
      <ErrorBox msg={err} />
      {alerts && alerts.length === 0 && <div className="card text-sm text-gray-600">🎉 No documents are close to expiry. <Link className="font-semibold text-secondary" to="/guidance/documents">Add or scan documents</Link> to track them.</div>}
      <div className="space-y-3">
        {alerts?.map((a) => (
          <div key={a.documentId} className="card flex items-center justify-between gap-3">
            <div><p className="font-semibold capitalize">{a.label}</p><p className="text-sm text-gray-600">{a.message}</p><p className="text-xs text-gray-400">Expiry: {new Date(a.expiryDate).toLocaleDateString()}</p></div>
            <Chip kind={a.severity}>{a.severity}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}
