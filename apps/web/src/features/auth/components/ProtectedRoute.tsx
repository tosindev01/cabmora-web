import { Navigate, Outlet, useLocation } from 'react-router-dom';

import type { UserRole } from '@cabmora/api-client';

import { PendingApproval } from '@/features/auth/components/PendingApproval';
import { homePathForRole, useAuth } from '@/shared/auth';

/**
 * Route gate for the portal screens.
 *
 * The `loading` branch is not cosmetic. On a hard refresh the session is an
 * HttpOnly cookie the app cannot read, so `user` is null until /auth/me
 * answers; redirecting during that window would bounce a signed-in user to
 * /login on every refresh.
 *
 * This is a UX gate only. The cookie is what the API trusts and the API is
 * what enforces access — see docs/INTEGRATION_PLAN.md §2.
 */
interface ProtectedRouteProps {
  /**
   * Roles allowed past this gate. Omit to mean "any signed-in account".
   *
   * Without it every protected route was one block, so a customer could open
   * /dashboard and be looking at the creator studio.
   */
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps = {}) {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    // Remember where they were headed so sign-in can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Signed in, but the account is still awaiting acceptance. They stay on the
  // route they asked for — no redirect — and see the gate in place of the
  // portal. Handled here rather than per-page so a new screen cannot ship
  // without it.
  if (user.status === 'pending') {
    return <PendingApproval />;
  }

  // Signed in, accepted, but this is not their portal. Sent to their own rather
  // than to /login: they are authenticated, and asking them to sign in again
  // would suggest the session is the problem.
  //
  // A UX gate only. The API is what actually refuses their data.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
