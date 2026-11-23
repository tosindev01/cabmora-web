import { apiFetch } from '@cabmora/api-client';
import { fetchPage } from '@cabmora/api-client';
import type {
  AdminStats,
  BillingStats,
  CreatorReport,
  MonthlyReport,
  Project,
} from '@cabmora/api-client';

/**
 * Platform-wide aggregate reads.
 *
 * In `shared/` rather than a feature because three features want them — the
 * dashboard, the reporting screen and the payments screen all render totals —
 * and the rule is that if two features both need something it is not a feature.
 * Putting them in `features/dashboard` would force reporting to import across
 * features, which is the violation this avoids.
 *
 * Read-only by construction. Everything that *changes* money lives in
 * `features/billing/api.ts` with the row-level checks that belong to it.
 */
export const getAdminStats = () => apiFetch<AdminStats>('/admin/stats');

/** Money in scope. `customerId` narrows it to one client, which is what the
 *  user detail screen asks for — the same computation, so "outstanding"
 *  cannot come to mean two different things on two screens. */
export const getBillingStats = (customerId?: string) =>
  apiFetch<BillingStats>(
    customerId
      ? `/admin/billing/stats?customer_id=${encodeURIComponent(customerId)}`
      : '/admin/billing/stats',
  );

/** `months` is capped at 24 server-side. */
export const getMonthlyReport = (months = 6) =>
  apiFetch<MonthlyReport>(`/admin/reports/monthly?months=${months}`);

/** Includes an in-house "Cabmora" row for projects with no creator assigned. */
export const getCreatorReport = () => apiFetch<CreatorReport>('/admin/reports/creators');

/**
 * The most recent projects, for the overview table.
 *
 * A read, not the projects feature's API: the dashboard shows a summary of
 * everything and must not import across features to get it. `features/projects`
 * keeps the writes and the full list with its filters.
 */
export const getRecentProjects = (limit = 4) =>
  fetchPage<Project>('/admin/projects', { limit, offset: 0 });
