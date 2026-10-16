import { useEffect, useState } from 'react';
import g, { errMsg } from '../../api';
import { useAuth } from '@/context/AuthContext';
import { Chip, ErrorBox } from '../../components/ui.jsx';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = () => g.get('/admin/users', { params: { search } }).then((r) => setUsers(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]);

  const setRole = async (u, role) => {
    setErr('');
    try { await g.put(`/admin/users/${u._id}/role`, { role }); load(); } catch (e) { setErr(errMsg(e)); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.email} and all their documents, plans and risk checks? This cannot be undone.`)) return;
    setErr('');
    try { await g.delete(`/admin/users/${u._id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div>
      <ErrorBox msg={err} />
      <input className="input mb-4 max-w-sm" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-brand"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Docs</th><th className="px-3 py-2">Joined</th><th /></tr></thead>
          <tbody>
            {users.map((u) => {
              const self = u._id === me.id;
              return (
                <tr key={u._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{u.name}{self && <span className="ml-1 text-xs text-gray-400">(you)</span>}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{self ? <Chip kind="valid">admin</Chip> : (
                    <select className="rounded-sm border border-gray-300 px-2 py-1 text-xs" value={u.role} onChange={(e) => setRole(u, e.target.value)}>{['user', 'researcher', 'engineer', 'lead', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}</select>)}</td>
                  <td className="px-3 py-2">{u.documentCount}</td>
                  <td className="px-3 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right">{!self && <button className="text-xs font-semibold text-red-600" onClick={() => remove(u)}>Delete</button>}</td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
