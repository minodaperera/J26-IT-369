import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { errMsg } from '@/services/apiHelpers';
import { ErrorBox, Field, PageTitle } from '@/components/common/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', language: 'en' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register(f); nav('/guidance/dashboard', { replace: true }); }
    catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md">
      <PageTitle title="Create your account" />
      <form onSubmit={submit} className="card space-y-4">
        <ErrorBox msg={err} />
        <Field label="Full name"><input className="input" required value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Password (min 6 characters)"><input className="input" type="password" minLength={6} required value={f.password} onChange={set('password')} /></Field>
        <Field label="Preferred language">
          <select className="input" value={f.language} onChange={set('language')}><option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option></select>
        </Field>
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="text-center text-sm text-gray-600">Already registered? <Link className="font-semibold text-secondary" to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
