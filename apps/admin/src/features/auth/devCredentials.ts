/**
 * Pre-filled sign-in details, development only.
 *
 * Guarded on `import.meta.env.DEV`, which Vite replaces with a literal at build
 * time. In a production build this becomes `false ? {...} : null` and the
 * object — credentials included — is dropped by dead-code elimination. It is
 * not hidden behind a flag at runtime; it is not in the bundle at all.
 *
 * The defaults are the accounts `cabmora-api/scripts/seed_dev.py` creates. That
 * script keeps its passwords in the repository on purpose and refuses to run
 * unless ENVIRONMENT=local, so nothing secret is being written down here that
 * was not already public. Override with VITE_DEV_EMAIL / VITE_DEV_PASSWORD in
 * `.env.local` to sign in as somebody else without editing source.
 */
export interface DevCredentials {
  email: string;
  password: string;
}

export const DEV_CREDENTIALS: DevCredentials | null = import.meta.env.DEV
  ? {
      email: import.meta.env.VITE_DEV_EMAIL ?? 'admin@cabmora.com',
      password: import.meta.env.VITE_DEV_PASSWORD ?? 'adminpassword123',
    }
  : null;
