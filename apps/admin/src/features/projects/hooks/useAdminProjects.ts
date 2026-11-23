import { useCallback } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  changeStage,
  listProjects,
  type Project,
  type ProjectStage,
} from '@/features/projects/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

interface Filters extends Record<string, string | undefined> {
  stage: 'All' | ProjectStage;
  q: string;
  /* Event date window, inclusive both ends. Empty strings are dropped before
     the request, so an unset end is simply a half-open range. */
  event_from: string;
  event_to: string;
  /* Deadline within this many days, including work already overdue. 'All'
     means no deadline filter — the hook drops it like any empty value. */
  due_within_days: string;
}

export function useAdminProjects() {
  // Stable identity: `usePaginatedList` depends on the fetcher, so an inline
  // arrow would rebuild it every render and re-fetch in a loop.
  const fetcher = useCallback(listProjects, []);

  const list = usePaginatedList<Project, Filters>({
    fetcher,
    initialFilters: { stage: 'All', q: '', event_from: '', event_to: '', due_within_days: 'All' },
    debounceKeys: ['q'],
  });

  const moveStage = useCallback(
    async (id: string, stage: ProjectStage) => {
      try {
        const updated = await changeStage(id, stage);
        // From the server's response, never guessed: the API refuses illegal
        // transitions, and an optimistic move would show one that never took.
        list.replaceItem((p) => p.id === id, updated);
      } catch (err) {
        list.setError(err instanceof ApiError ? err.message : 'Could not change the stage.');
      }
    },
    [list],
  );

  return { ...list, moveStage };
}
