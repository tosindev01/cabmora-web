import type { ComponentType, ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '@/app/AdminLayout';
import AdminLoginPage from '@/features/auth/pages/AdminLoginPage';
import AdminDashboardPage from '@/features/dashboard/pages/AdminDashboardPage';
import AdminInvoiceDetailPage from '@/features/billing/pages/AdminInvoiceDetailPage';
import AdminPaymentManagementPage from '@/features/billing/pages/AdminPaymentManagementPage';
import AdminCreatorApplicationsPage from '@/features/creators/pages/AdminCreatorApplicationsPage';
import AdminEnquiryDetailPage from '@/features/enquiries/pages/AdminEnquiryDetailPage';
import AdminEnquiryManagementPage from '@/features/enquiries/pages/AdminEnquiryManagementPage';
import AdminProjectDetailPage from '@/features/projects/pages/AdminProjectDetailPage';
import AdminProjectManagementPage from '@/features/projects/pages/AdminProjectManagementPage';
import AdminReportingDashboardPage from '@/features/reporting/pages/AdminReportingDashboardPage';
import AdminReviewModerationPage from '@/features/reviews/pages/AdminReviewModerationPage';
import AcceptInvitePage from '@/features/auth/pages/AcceptInvitePage';
import AdminIssueInboxPage from '@/features/support/pages/AdminIssueInboxPage';
import AdminTeamPage from '@/features/users/pages/AdminTeamPage';
import AdminUserDetailPage from '@/features/users/pages/AdminUserDetailPage';
import AdminAccessGroupsPage from '@/features/users/pages/AdminAccessGroupsPage';
import AdminUserManagementPage from '@/features/users/pages/AdminUserManagementPage';
import { canOpen, landingPath, useAdminAuth } from '@/shared/auth';

/**
 * Every screen behind the admin guard.
 *
 * This was nine near-identical `<Route>` blocks, each repeating the guard —
 * so adding a screen meant remembering to wrap it, and forgetting would have
 * shipped an unguarded admin page. A table cannot forget.
 */
const PROTECTED_ROUTES: { path: string; screen: ComponentType }[] = [
  { path: '/admin', screen: AdminDashboardPage },
  { path: '/admin/dashboard', screen: AdminDashboardPage },
  { path: '/admin/users', screen: AdminUserManagementPage },
  { path: '/admin/users/:id', screen: AdminUserDetailPage },
  { path: '/admin/team', screen: AdminTeamPage },
  { path: '/admin/groups', screen: AdminAccessGroupsPage },
  { path: '/admin/projects', screen: AdminProjectManagementPage },
  { path: '/admin/projects/:id', screen: AdminProjectDetailPage },
  { path: '/admin/enquiries', screen: AdminEnquiryManagementPage },
  { path: '/admin/enquiries/:id', screen: AdminEnquiryDetailPage },
  { path: '/admin/creator-applications', screen: AdminCreatorApplicationsPage },
  { path: '/admin/reviews', screen: AdminReviewModerationPage },
  { path: '/admin/invoices/:id', screen: AdminInvoiceDetailPage },
  { path: '/admin/payments', screen: AdminPaymentManagementPage },
  { path: '/admin/reports', screen: AdminReportingDashboardPage },
  { path: '/admin/issues', screen: AdminIssueInboxPage },
];

function RequireAdmin({ children }: { children: ReactNode }) {
  const { staff, loading } = useAdminAuth();

  // The session is an HttpOnly cookie the app cannot read, so on a hard refresh
  // `staff` is null until /auth/me answers. Redirecting during that window
  // would throw a signed-in colleague back to /login on every reload.
  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div
          role="status"
          aria-label="Checking your session"
          className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin"
        />
      </div>
    );
  }

  if (!staff) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** The guard and the chrome, applied once to everything nested inside. */
function AdminShell() {
  return (
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  );
}

export default function AdminRouter() {
  const { staff } = useAdminAuth();
  const home = staff ? landingPath(staff.role) : '/login';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      <Route element={<AdminShell />}>
        {/* Routes this role may not open are not registered at all, so the
            catch-all sends them home rather than rendering a screen whose
            every request the API would refuse. */}
        {PROTECTED_ROUTES.filter(({ path }) => !staff || canOpen(staff, path)).map(
          ({ path, screen: Screen }) => (
            <Route key={path} path={path} element={<Screen />} />
          ),
        )}
      </Route>

      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
