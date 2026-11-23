import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { AccountType } from '@cabmora/api-client';

import { useAuth } from '@/shared/auth';
import { toErrorState, type SubmitState } from '@/features/auth/hooks/useSubmitState';
import { homePathForRole } from '@/shared/auth';

/**
 * Registration, then straight into the portal.
 *
 * `register` signs in immediately afterwards, so the session cookie is set by
 * the time this resolves — there is no separate "now log in" step.
 */
export function useSignupForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  const submit = useCallback(
    async (
      email: string,
      firstName: string,
      lastName: string,
      password: string,
      accountType: AccountType = 'customer',
    ) => {
      setState({ status: 'submitting' });
      try {
        const user = await register(email, firstName, lastName, password, accountType);
        navigate(homePathForRole(user.role), { replace: true });
      } catch (err) {
        setState(toErrorState(err));
      }
    },
    [register, navigate],
  );

  return { state, submit };
}
