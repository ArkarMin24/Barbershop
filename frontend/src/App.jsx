import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SeatsPage from './pages/admin/SeatsPage';
import QueuePage from './pages/admin/QueuePage';
import BarbersPage from './pages/admin/BarbersPage';
import CustomersPage from './pages/admin/CustomersPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';
import CustomerPage from './pages/CustomerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<CustomerPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/seats" element={<SeatsPage />} />
          <Route path="/admin/queue" element={<QueuePage />} />
          <Route path="/admin/barbers" element={<BarbersPage />} />
          <Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/admin/appointments" element={<AppointmentsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
