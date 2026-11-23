import { useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';
import type { AdminStats, BillingStats, MonthlyReport } from '@cabmora/api-client';

import { getAdminStats, getBillingStats, getMonthlyReport } from '@/shared/analytics/api';

interface Analytics {
  stats: AdminStats | null;
  billing: BillingStats | null;
  report: MonthlyReport | null;
  loading: boolean;
  error: string | null;
}

/**
 * The aggregate reads both analytics screens need.
 *
 * `months = 0` skips the monthly report: the overview does not chart anything,
 * and fetching a series nobody renders is a request paid for on every page
 * load.
 *
 * Requested together rather than sequentially — three dependent awaits would
 * make the dashboard wait for the slowest twice over.
 */
export function useAnalytics(months = 0): Analytics {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [billing, setBilling] = useState<BillingStats | null>(null);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getAdminStats(),
      getBillingStats(),
      months > 0 ? getMonthlyReport(months) : Promise.resolve(null),
    ])
      .then(([nextStats, nextBilling, nextReport]) => {
        if (cancelled) return;
        setStats(nextStats);
        setBilling(nextBilling);
        setReport(nextReport);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load the figures.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [months]);

  return { stats, billing, report, loading, error };
}
