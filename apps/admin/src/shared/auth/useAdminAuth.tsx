import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiError, authApi, type User } from '@cabmora/api-client';

import { CONSOLE_ROLES } from './access';

interface AdminAuthContextValue {
  /** The signed-in member of staff, or null. Never anyone else — see `signIn`. */
  staff: User | null;
  loading: boolean;
  /** Resolves with the signed-in user, so the caller can route by role. */
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** Thrown when the credentials are valid but the account is not staff. */
export class NotAnAdminError extends Error {
  constructor() {
    super('This account does not have access to the console.');
  }
}

/**
 * The admin session.
 *
 * Same cookie mechanism as the public site, but a different origin: the browser
 * scopes `cabmora_session` to the host that set it, so a session on
 * cabmora.com grants nothing on admin.cabmora.com. Signing in here is a
 * genuinely separate act, which is what docs/INTEGRATION_PLAN.md §2 asks for.
 *
 * This replaces an `AdminStore` flag that initialised to `true` and a `login()`
 * that accepted any non-empty password — the console rendered for anyone who
 * loaded it.
 *
 * The role check here is UX, not security. It stops a customer from seeing
 * admin chrome; it does not protect data. That is `require_role(Role.ADMIN)` on
 * `/api/v1/admin/*`, which the screens will need once they call the API at all.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // The session is an HttpOnly cookie the app cannot read, so on load it has to
  // ask. A 401 means no session; a 200 from someone who is not staff means a
  // person signed in on this origin who does not belong here, and is treated
  // as no session.
  useEffect(() => {
    let cancelled = false;
    authApi
      .fetchMe()
      .then((me) => {
        if (!cancelled) setStaff(CONSOLE_ROLES.includes(me.role) ? me : null);
      })
      .catch(() => {
        if (!cancelled) setStaff(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    if (!CONSOLE_ROLES.includes(user.role)) {
      // The credentials were good, so the API has just set a valid session
      // cookie on the admin origin. Leaving it there would keep a live session
      // for someone with no business holding one, so give it straight back
      // before reporting the failure.
      await authApi.logout().catch(() => {
        /* best effort — the refusal below matters more than the cleanup */
      });
      setStaff(null);
      throw new NotAnAdminError();
    }
    setStaff(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    // Only the server can clear an HttpOnly cookie. Drop the local state either
    // way — a failed request should still end the session in the UI.
    try {
      await authApi.logout();
    } finally {
      setStaff(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ staff, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

/** Turn a thrown value into a line the sign-in form can show. */
export function toSignInMessage(err: unknown): string {
  if (err instanceof NotAnAdminError) return err.message;
  if (err instanceof ApiError) return err.message;
  return 'Could not reach the server. Please try again.';
}
