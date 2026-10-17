import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Only users with role "admin" may enter. (The API enforces this too - this is just for UX.)
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="py-20 text-center text-gray-500">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return user.role === 'admin' ? children : <Navigate to="/" replace />;
}
