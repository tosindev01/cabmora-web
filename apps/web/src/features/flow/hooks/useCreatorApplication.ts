import { useCallback, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  applyToFlow,
  type CreatorApplicationBody,
  type CreatorApplicationReceipt,
} from '@/features/flow/api';

/**
 * Submitting an application, and what to show while it is in flight.
 *
 * The receipt is kept rather than a bare boolean: the success screen names the
 * studio back to the applicant, and reading that from the server's answer
 * rather than the form means it says what was actually recorded.
 */
export function useCreatorApplication() {
  const [receipt, setReceipt] = useState<CreatorApplicationReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (body: CreatorApplicationBody) => {
    setSubmitting(true);
    setError(null);
    try {
      setReceipt(await applyToFlow(body));
      return true;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { receipt, submitting, error, submit };
}
