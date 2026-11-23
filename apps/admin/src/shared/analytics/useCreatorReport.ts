import { useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';
import type { CreatorReport } from '@cabmora/api-client';

import { getCreatorReport } from '@/shared/analytics/api';

/**
 * Workload and billing per creator, Cabmora included.
 *
 * Separate from `useAnalytics` because only the dashboard renders this panel;
 * folding it in would make the reporting screen pay for a read it never shows.
 */
export function useCreatorReport() {
  const [report, setReport] = useState<CreatorReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCreatorReport()
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load creator figures.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { report, error, loading };
}
