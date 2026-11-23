import { useEffect, useState } from 'react';

import { ApiError, type Project, type User } from '@cabmora/api-client';

import { listAccessibleProjects } from '@/features/users/api';

export interface UserAccess {
  /** Null while loading — distinct from `[]`, which means "none". */
  projects: Project[] | null;
  total: number;
  /** The role reaches everything, so the list is beside the point. */
  unrestricted: boolean;
  error: string | null;
}

/**
 * What this account can open.
 *
 * Keyed on the role as well as the id: changing somebody's role on this page
 * changes the answer, and a stale list would keep showing a coordinator's old
 * shoots after they were made an administrator.
 */
export function useUserAccess(user: User | null): UserAccess {
  const [state, setState] = useState<UserAccess>({
    projects: null,
    total: 0,
    unrestricted: false,
    error: null,
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setState({ projects: null, total: 0, unrestricted: false, error: null });

    listAccessibleProjects(user)
      .then((result) => {
        if (!cancelled) setState({ ...result, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // An empty list on failure would read as "can open nothing", so the
        // error is carried and the panel says it could not find out.
        setState({
          projects: null,
          total: 0,
          unrestricted: false,
          error: err instanceof ApiError ? err.message : 'Could not load this list.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  return state;
}
