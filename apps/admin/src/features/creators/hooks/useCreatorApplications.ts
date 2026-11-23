import { useCallback, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  approveApplication,
  declineApplication,
  listCreatorApplications,
  type ApplicationStatus,
  type CreatorApplication,
} from '@/features/creators/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export type StatusFilter = 'All' | ApplicationStatus;

interface Filters extends Record<string, string | undefined> {
  status: StatusFilter;
}

export function useCreatorApplications() {
  // Stable identity: `usePaginatedList` depends on the fetcher, so an inline
  // arrow would rebuild it every render and re-fetch in a loop.
  const fetcher = useCallback(listCreatorApplications, []);

  const list = usePaginatedList<CreatorApplication, Filters>({
    fetcher,
    // Opens on what needs doing. The other two are history.
    initialFilters: { status: 'pending' },
  });

  const [deciding, setDeciding] = useState<string[]>([]);
  //: Shown once after an approval, and only in local development — the API
  //: returns it nowhere else. Keyed by application so two approvals in a row
  //: cannot show the wrong studio's link.
  const [setupLinks, setSetupLinks] = useState<Record<string, string>>({});

  const decide = useCallback(
    async (id: string, action: () => Promise<CreatorApplication>) => {
      setDeciding((current) => [...current, id]);
      list.setError(null);
      try {
        const updated = await action();
        // From the server's answer, never guessed: the API refuses a second
        // decision, and an optimistic move would show one that never took.
        list.replaceItem((a) => a.id === id, updated);
        // A decision moves the row out of the pending filter, and the total
        // moves with it — re-read rather than leave a stale footer.
        await list.refresh();
      } catch (err) {
        list.setError(err instanceof ApiError ? err.message : 'Could not record that decision.');
      } finally {
        setDeciding((current) => current.filter((x) => x !== id));
      }
    },
    [list],
  );

  const approve = useCallback(
    (id: string) =>
      decide(id, async () => {
        const result = await approveApplication(id);
        if (result.setup_url) {
          setSetupLinks((current) => ({ ...current, [id]: result.setup_url! }));
        }
        return result.application;
      }),
    [decide],
  );

  const decline = useCallback(
    (id: string, note?: string) => decide(id, () => declineApplication(id, note)),
    [decide],
  );

  return { ...list, deciding, setupLinks, approve, decline };
}
