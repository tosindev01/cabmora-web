import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminProjectManagementPage from './pages/AdminProjectManagementPage';
import AdminEnquiryManagementPage from './pages/AdminEnquiryManagementPage';
import AdminReviewModerationPage from './pages/AdminReviewModerationPage';
import AdminPaymentManagementPage from './pages/AdminPaymentManagementPage';
import AdminPlatformSettingsPage from './pages/AdminPlatformSettingsPage';
import AdminReportingDashboardPage from './pages/AdminReportingDashboardPage';

/**
 * Security Guard: Ensures only authenticated administrators can view admin modules.
 */
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdmin();

  if (!isAdminLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Root Router with Admin Guard
 */
function AppRoutes() {
  const { isAdminLoggedIn } = useAdmin();

  return (
    <Routes>
      {/* Root redirects to Login or Admin Dashboard */}
      <Route
        path="/"
        element={<Navigate to={isAdminLoggedIn ? '/admin/dashboard' : '/login'} replace />}
      />

      {/* Admin Login Page */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Protected Admin Suite Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminRoute>
            <AdminUserManagementPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedAdminRoute>
            <AdminProjectManagementPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/enquiries"
        element={
          <ProtectedAdminRoute>
            <AdminEnquiryManagementPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedAdminRoute>
            <AdminReviewModerationPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedAdminRoute>
            <AdminPaymentManagementPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedAdminRoute>
            <AdminPlatformSettingsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedAdminRoute>
            <AdminReportingDashboardPage />
          </ProtectedAdminRoute>
        }
      />

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AdminProvider>
  );
}
