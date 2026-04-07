import { createBrowserRouter, Navigate } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/mobile/Home';
import FavoritesPage from '../pages/mobile/Favorites';
import HotelListPage from '../pages/mobile/HotelList';
import HotelDetailPage from '../pages/mobile/HotelDetail';
import LoginPage from '../pages/admin/Login';
import RegisterPage from '../pages/admin/Register';
import MerchantHotelListPage from '../pages/admin/MerchantHotelList';
import MerchantHotelFormPage from '../pages/admin/MerchantHotelForm';
import AdminHotelAuditPage from '../pages/admin/AdminHotelAudit';
import { store } from '../store';

const requireAuth = (roles = []) => {
  const state = store.getState();
  const user = state.auth.user || JSON.parse(localStorage.getItem('easyStayUser') || 'null');
  if (!user) return <Navigate to="/admin/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/admin/login" replace />;
  return null;
};

const ProtectedRoute = ({ roles, children }) => {
  const redirect = requireAuth(roles);
  return redirect || children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MobileLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'hotels', element: <HotelListPage /> },
      { path: 'hotels/:id', element: <HotelDetailPage /> },
    ],
  },
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/admin/register', element: <RegisterPage /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['merchant', 'admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/login" replace /> },
      { path: 'merchant/hotels', element: <ProtectedRoute roles={['merchant']}><MerchantHotelListPage /></ProtectedRoute> },
      { path: 'merchant/hotels/new', element: <ProtectedRoute roles={['merchant']}><MerchantHotelFormPage /></ProtectedRoute> },
      { path: 'merchant/hotels/:id/edit', element: <ProtectedRoute roles={['merchant']}><MerchantHotelFormPage /></ProtectedRoute> },
      { path: 'audit', element: <ProtectedRoute roles={['admin']}><AdminHotelAuditPage /></ProtectedRoute> },
      { path: 'logs', element: <ProtectedRoute roles={['admin']}><AdminHotelAuditPage mode="logs" /></ProtectedRoute> },
    ],
  },
]);
