import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError, type User } from '@cabmora/api-client';

import {
  listAssignableStaff,
  setProjectMembers,
  type ProjectDetail,
} from '@/features/projects/api';

/**
 * Who is on a shoot, and who could be.
 *
 * Holds the selection locally until it is saved, because assignment is the
 * one thing here that changes what another person can see: a checkbox that
 * granted access to a client's photographs the instant it was ticked gives
 * nobody a chance to notice they ticked the wrong row.
 */
export function useProjectTeam(project: ProjectDetail | null) {
  const [staff, setStaff] = useState<User[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAssignableStaff()
      .then((people) => !cancelled && setStaff(people))
      .catch(() => !cancelled && setStaff([]));
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset whenever the project loads or changes underneath us, so the
  // checkboxes always start from what the server actually holds.
  useEffect(() => {
    setSelected(project?.member_ids ?? []);
  }, [project?.id, project?.member_ids]);

  const toggle = useCallback((userId: string) => {
    setSavedAt(null);
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }, []);

  const dirty = useMemo(() => {
    const before = [...(project?.member_ids ?? [])].sort().join();
    return before !== [...selected].sort().join();
  }, [project?.member_ids, selected]);

  const save = useCallback(async () => {
    if (!project) return null;
    setSaving(true);
    setError(null);
    try {
      const updated = await setProjectMembers(project.id, selected);
      setSavedAt(Date.now());
      return updated;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the team.');
      return null;
    } finally {
      setSaving(false);
    }
  }, [project, selected]);

  return { staff, selected, toggle, dirty, saving, error, savedAt, save };
}
