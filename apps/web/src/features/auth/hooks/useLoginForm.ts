import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/shared/auth';
import { toErrorState, type SubmitState } from '@/features/auth/hooks/useSubmitState';
import { consoleRedirect, homePathForRole } from '@/shared/auth';

/**
 * Sign-in: the API call, the error mapping and the redirect decision.
 *
 * Lives in a hook rather than in the screen so `SignInForm` stays
 * presentational, per the direction in docs/ARCHITECTURE.md.
 */
export function useLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  const submit = useCallback(
    async (email: string, password: string) => {
      setState({ status: 'submitting' });
      try {
        const user = await login(email, password);

        // Staff first, and a full page load rather than a route change: the
        // console is a different application on a different origin, so
        // `navigate` cannot reach it. Without this an admin signing in here
        // landed on the Creator Studio dashboard and a coordinator on the
        // marketing homepage — neither of which is their work.
        //
        // They will have to sign in again on the other side. The session
        // cookie is set without a `domain` attribute (see api/session.py), so
        // it is host-only: one issued at cabmoramedia.com is not sent to the
        // console's host. This still beats the old behaviour, which left staff
        // on the creator dashboard or the marketing homepage with no sign of
        // where their work was — but it is a redirect, not a handover.
        //
        // Making it seamless means scoping the cookie to the registrable
        // domain, which hands the session to every subdomain. That is a
        // security decision, not a tidy-up, so it is not made here.
        const console_ = consoleRedirect(user);
        if (console_) {
          window.location.assign(console_);
          return;
        }

        // Back to whatever the route guard bounced them off, otherwise the
        // portal their role belongs to.
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from ?? homePathForRole(user.role), { replace: true });
        // Deliberately not resetting to idle on success: this component
        // unmounts on navigation, and flipping the button back to enabled
        // first shows a flash of "Sign In" after a successful submit.
      } catch (err) {
        setState(toErrorState(err));
      }
    },
    [login, navigate, location.state],
  );

  return { state, submit };
}
