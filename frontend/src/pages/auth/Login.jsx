import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { errMsg } from '@/services/apiHelpers';
import { ErrorBox, Field, PageTitle } from '@/components/common/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const u = await login({ email: f.email, password: f.password });
      nav(loc.state?.from || (u.role === 'admin' ? '/guidance/admin' : '/guidance/dashboard'), { replace: true });
    } catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md">
      <PageTitle title="Log in" />
      <form onSubmit={submit} className="card space-y-4">
        <ErrorBox msg={err} />
        <Field label="Email"><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <p className="text-center text-sm text-gray-600">No account? <Link className="font-semibold text-secondary" to="/register">Register</Link></p>
        <p className="rounded-sm bg-gray-50 px-3 py-2 text-center text-xs text-gray-600">
          Demo account (created by <code>npm run seed:guidance</code>)<br />email: demo.lk@gmail.com · password: demo1234
        </p>
      </form>
    </div>
  );
}
