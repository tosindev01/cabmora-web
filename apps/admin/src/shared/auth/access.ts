import type { Permission, User, UserRole } from '@cabmora/api-client';

/**
 * Who may use the console, and how much of it.
 *
 * This mirrors the API's guards and does not replace them: `CurrentAdminDep`
 * and `CurrentTeamDep` are what actually refuse a request. What is here only
 * decides what to draw, so a coordinator is not shown eight screens that would
 * answer 403 — a menu full of doors that do not open is worse than a short
 * menu.
 *
 * One predicate, read by both the route table and the sidebar, because two
 * copies of "what may a coordinator see" is how a link survives in the nav
 * after the route behind it is locked.
 */

/** Roles that may sign in here at all. Everyone else is turned away. */
export const CONSOLE_ROLES: UserRole[] = ['admin', 'coordinator'];

/** Which permission each section of the console needs. */
export const SECTION_PERMISSION: Record<string, Permission> = {
  '/admin/dashboard': 'users',
  '/admin/users': 'users',
  '/admin/team': 'team',
  '/admin/groups': 'users',
  '/admin/projects': 'projects',
  '/admin/enquiries': 'enquiries',
  '/admin/creator-applications': 'creator_applications',
  '/admin/reviews': 'reviews',
  '/admin/payments': 'payments',
  '/admin/reports': 'reports',
};

/**
 * Whether this account may open a section.
 *
 * Reads the `reachable` set the API publishes rather than inferring from the
 * role, so a coordinator who has been granted Payments gets the link and a
 * coordinator who has not does not — and neither case needs this file to know
 * the granting rules, which live on the server where they are enforced.
 *
 * Falls back to the old role rule when `reachable` is absent, which keeps a
 * cached session from an older build working rather than locking somebody out
 * of their own console.
 */
export function canOpen(user: Pick<User, 'role' | 'reachable'>, path: string): boolean {
  if (user.role === 'admin') return true;
  const needed = Object.entries(SECTION_PERMISSION).find(
    ([section]) => path === section || path.startsWith(`${section}/`),
  )?.[1];
  if (!needed) return false;
  if (!user.reachable) {
    return needed === 'projects' || needed === 'enquiries';
  }
  return user.reachable.includes(needed);
}

/**
 * Where a role lands after signing in.
 *
 * A coordinator cannot read `/admin/stats`, so the dashboard would greet them
 * with an error. Their work is the project list.
 */
export const landingPath = (role: UserRole): string =>
  role === 'admin' ? '/admin/dashboard' : '/admin/projects';
