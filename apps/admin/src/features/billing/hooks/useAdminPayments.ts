import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';
import type { BillingStats, PaymentRow, PaymentStatus } from '@cabmora/api-client';

import { listPayments } from '@/features/billing/api';
import { getBillingStats } from '@/shared/analytics';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export type PaymentStatusFilter = 'All' | PaymentStatus;

interface Filters extends Record<string, string | undefined> {
  status_filter: PaymentStatusFilter;
}

/**
 * The payments screen: the list plus the three headline figures above it.
 *
 * Totals come from `/admin/billing/stats` rather than being summed from the
 * page. Summing the visible rows would report the first thirty payments as if
 * they were the business — which is what the fixture version did, and it looked
 * completely convincing.
 */
export function useAdminPayments() {
  const fetcher = useCallback(listPayments, []);

  const list = usePaginatedList<PaymentRow, Filters>({
    fetcher,
    initialFilters: { status_filter: 'All' },
  });

  const [stats, setStats] = useState<BillingStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Re-read whenever the list changes: confirming a payment moves money between
  // "pending" and "cleared", and stale headline figures on a money screen are
  // worse than none.
  const version = list.items;

  useEffect(() => {
    let cancelled = false;
    getBillingStats()
      .then((next) => {
        if (!cancelled) setStats(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatsError(err instanceof ApiError ? err.message : 'Could not load the totals.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { ...list, stats, statsError };
}
