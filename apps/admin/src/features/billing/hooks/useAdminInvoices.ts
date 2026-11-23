import { useCallback } from 'react';

import { ApiError } from '@cabmora/api-client';
import type { Invoice, InvoiceStatus, Settlement } from '@cabmora/api-client';

import { issueInvoice, listInvoices, voidInvoice } from '@/features/billing/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export type StatusFilter = 'All' | InvoiceStatus;
export type SettlementFilter = 'All' | Settlement;

interface Filters extends Record<string, string | undefined> {
  status_filter: StatusFilter;
  settlement: SettlementFilter;
  q: string;
}

/**
 * The invoice list, paged and filtered by the server.
 *
 * Same shape as `useAdminProjects`: `usePaginatedList` owns paging, debouncing
 * and the stale-response guard, and this adds only the actions specific to
 * invoices.
 */
export function useAdminInvoices() {
  // Stable identity: `usePaginatedList` depends on the fetcher, so an inline
  // arrow would rebuild it every render and re-fetch in a loop.
  const fetcher = useCallback(listInvoices, []);

  const list = usePaginatedList<Invoice, Filters>({
    fetcher,
    initialFilters: { status_filter: 'All', settlement: 'All', q: '' },
    debounceKeys: ['q'],
  });

  const { replaceItem, setError } = list;

  const issue = useCallback(
    async (id: string) => {
      try {
        // From the server's response, never guessed: the invoice number is
        // assigned server-side from a sequence, so an optimistic update would
        // have to invent one and would then be wrong on screen.
        replaceItem((invoice) => invoice.id === id, await issueInvoice(id));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not issue the invoice.');
      }
    },
    [replaceItem, setError],
  );

  const cancel = useCallback(
    async (id: string) => {
      try {
        replaceItem((invoice) => invoice.id === id, await voidInvoice(id));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not void the invoice.');
      }
    },
    [replaceItem, setError],
  );

  return { ...list, issue, cancel };
}
