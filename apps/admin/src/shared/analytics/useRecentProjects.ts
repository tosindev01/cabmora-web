import { useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';
import type { Project } from '@cabmora/api-client';

import { getRecentProjects } from '@/shared/analytics/api';

/** The newest few projects for the dashboard's overview table. */
export function useRecentProjects(limit = 4) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRecentProjects(limit)
      .then((page) => {
        if (!cancelled) setProjects(page.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load projects.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { projects, error };
}
