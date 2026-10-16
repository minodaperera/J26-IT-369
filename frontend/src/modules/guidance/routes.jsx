// Module 2 - Legal, Documents & Costs. Mounted by src/App.jsx at /guidance/*.
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

import GuidanceHome from './pages/GuidanceHome.jsx';
import Countries from './pages/Countries.jsx';
import CountryDetail from './pages/CountryDetail.jsx';
import Requirements from './pages/Requirements.jsx';
import Costs from './pages/Costs.jsx';
import Documents from './pages/Documents.jsx';
import Risk from './pages/Risk.jsx';
import Alerts from './pages/Alerts.jsx';
import GuidanceDashboard from './pages/GuidanceDashboard.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCountries from './pages/admin/AdminCountries.jsx';

export default function GuidanceRoutes() {
  return (
    <Routes>
      <Route index element={<GuidanceHome />} />
      <Route path="countries" element={<Countries />} />
      <Route path="countries/:slug" element={<CountryDetail />} />
      <Route path="requirements" element={<Requirements />} />
      <Route path="costs" element={<Costs />} />
      <Route path="documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="risk" element={<ProtectedRoute><Risk /></ProtectedRoute>} />
      <Route path="alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="dashboard" element={<ProtectedRoute><GuidanceDashboard /></ProtectedRoute>} />
      <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="countries" element={<AdminCountries />} />
      </Route>
      <Route path="*" element={<Navigate to="/guidance" replace />} />
    </Routes>
  );
}
