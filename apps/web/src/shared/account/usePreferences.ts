import { useCallback, useEffect, useState } from 'react';

import { accountApi, ApiError, type PreferenceChanges, type Preferences } from '@cabmora/api-client';

interface PreferencesState {
  preferences: Preferences | null;
  error: string | null;
  saving: boolean;
  saved: boolean;
  save: (changes: PreferenceChanges) => Promise<void>;
}

/**
 * The account's preferences, loaded once and saved a field at a time.
 *
 * Three sections of the settings screen read the same row, so the fetch lives
 * here rather than in each of them — three components each loading it would be
 * three requests and three chances to be showing a different answer.
 */
export function usePreferences(): PreferencesState {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    accountApi
      .getPreferences()
      .then((loaded) => !cancelled && setPreferences(loaded))
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Your settings could not be loaded.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (changes: PreferenceChanges) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // The server's answer replaces local state rather than the optimistic
      // value — it is the one that has been validated and stored.
      setPreferences(await accountApi.updatePreferences(changes));
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'That could not be saved.');
    } finally {
      setSaving(false);
    }
  }, []);

  return { preferences, error, saving, saved, save };
}
