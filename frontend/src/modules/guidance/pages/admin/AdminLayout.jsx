import { NavLink, Outlet } from 'react-router-dom';
import { PageTitle } from '../../components/ui.jsx';

const tab = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-sm font-semibold ${isActive ? 'bg-brand text-white' : 'border border-gray-300 text-brand hover:border-secondary'}`;

export default function AdminLayout() {
  return (
    <div>
      <PageTitle title="Admin console" sub="Monitor the platform, manage users and keep the country visa data accurate." />
      <div className="mb-6 flex flex-wrap gap-2">
        <NavLink end to="/guidance/admin" className={tab}>Overview</NavLink>
        <NavLink to="/guidance/admin/users" className={tab}>Users</NavLink>
        <NavLink to="/guidance/admin/countries" className={tab}>Countries &amp; visa data</NavLink>
      </div>
      <Outlet />
    </div>
  );
}
