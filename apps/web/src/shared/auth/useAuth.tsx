import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { authApi, type AccountType, type User } from '@cabmora/api-client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    accountType?: AccountType,
  ) => Promise<User>;
  logout: () => Promise<void>;
  /** Re-read the session — for flows that set the cookie outside `login`. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // The session lives in an HttpOnly cookie, so the app cannot inspect it — it
  // has to ask. One /auth/me on mount: a 200 means signed in, a 401 means not,
  // and either way `loading` clears. The old version short-circuited on a
  // readable localStorage token, which is exactly the readability we gave up
  // on purpose.
  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.fetchMe());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    authApi
      .fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // The response body still carries a token for non-browser clients; the app
    // ignores it. The cookie the server set on this response is the session.
    const result = await authApi.login(email, password);
    setUser(result.user);
    // Returned so the caller can route on role without re-reading context,
    // which would still hold the previous value on this render.
    return result.user;
  }, []);

  const register = useCallback(
    async (
      email: string,
      firstName: string,
      lastName: string,
      password: string,
      accountType: AccountType = 'customer',
    ) => {
      await authApi.register(email, firstName, lastName, password, accountType);
      const result = await authApi.login(email, password);
      setUser(result.user);
      return result.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    // Only the server can clear an HttpOnly cookie, so signing out is a request
    // rather than a local delete. Clear locally regardless — a failed logout
    // should still drop the user out of the UI.
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
