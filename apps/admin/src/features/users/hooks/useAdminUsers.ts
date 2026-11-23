import { useCallback, useMemo, useState } from 'react';

import { ApiError, type User, type UserRole, type UserStatus } from '@cabmora/api-client';

import { listUsers, updateUser } from '@/features/users/api';
import { rolesIn, type RoleGroup } from '@/features/users/display';
import { usePaginatedList, type FilterValue } from '@/shared/hooks/usePaginatedList';

export type RoleFilter = 'All' | UserRole;
export type StatusFilter = 'All' | UserStatus;

interface Filters extends Record<string, string | undefined> {
  role: RoleFilter;
  status: StatusFilter;
  q: string;
}

/**
 * One list of accounts, scoped to a group of roles.
 *
 * The group is not a filter the user can clear. Clearing the Role dropdown
 * falls back to the group's own roles rather than to everybody, so the Team
 * screen cannot quietly start listing customers — which would defeat the
 * point of having two screens.
 */
export function useAdminUsers(group: RoleGroup) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const scope = useMemo(() => rolesIn(group), [group]);

  // Stable identity: `usePaginatedList` depends on the fetcher, so an inline
  // arrow would rebuild it every render and re-fetch in a loop.
  const fetcher = useCallback(
    ({ role, ...rest }: Record<string, FilterValue>) =>
      listUsers({ ...rest, role: role ? (String(role) as UserRole) : scope }),
    [scope],
  );

  const list = usePaginatedList<User, Filters>({
    fetcher,
    initialFilters: { role: 'All', status: 'All', q: '' },
    debounceKeys: ['q'],
  });

  const patch = useCallback(
    async (id: string, changes: { role?: UserRole; status?: UserStatus }) => {
      setBusyId(id);
      list.setError(null);
      try {
        const updated = await updateUser(id, changes);
        // From the server's response, never guessed: the API refuses an admin
        // demoting or suspending themselves, and an optimistic update would
        // render a change that never happened.
        list.replaceItem((u) => u.id === id, updated);
        // A status change can move a row out of the active filter, and a role
        // change can move the account off this screen entirely — promoting a
        // creator to coordinator belongs on the Team list, not this one. The
        // total moves with it either way, so re-read rather than leave a
        // stale row and a stale footer.
        if (changes.role || (changes.status && list.filters.status !== 'All')) {
          void list.refresh();
        }
      } catch (err) {
        list.setError(err instanceof ApiError ? err.message : 'Could not update that account.');
      } finally {
        setBusyId(null);
      }
    },
    [list],
  );

  return { ...list, users: list.items, busyId, patch };
}
