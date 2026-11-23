import { useCallback } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  listEnquiries,
  updateEnquiry,
  type Enquiry,
  type EnquiryStatus,
} from '@/features/enquiries/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export type StatusFilter = 'All' | EnquiryStatus;

interface Filters extends Record<string, string | undefined> {
  status: StatusFilter;
  q: string;
}

export function useAdminEnquiries() {
  // Stable identity: `usePaginatedList` depends on the fetcher, so an inline
  // arrow would rebuild it every render and re-fetch in a loop.
  const fetcher = useCallback(listEnquiries, []);

  const list = usePaginatedList<Enquiry, Filters>({
    fetcher,
    initialFilters: { status: 'All', q: '' },
    debounceKeys: ['q'],
  });

  const setStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      list.setError(null);
      try {
        const updated = await updateEnquiry(id, { status });
        // From the server's response, never guessed: the API refuses illegal
        // transitions, and an optimistic move would show one that never took.
        list.replaceItem((e) => e.id === id, updated);
        // A status change can move a row out of the active filter, and the
        // total moves with it — re-read rather than leave a stale footer.
        if (list.filters.status !== 'All') void list.refresh();
      } catch (err) {
        list.setError(err instanceof ApiError ? err.message : 'Could not update that enquiry.');
      }
    },
    [list],
  );

  return { ...list, setStatus };
}
