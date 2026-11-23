/**
 * Pre-filled sign-in details, development only.
 *
 * See the admin console's copy for why this is safe: `import.meta.env.DEV` is
 * substituted at build time, so the whole object is eliminated from a
 * production bundle rather than merely unused.
 *
 * Defaults to the seeded customer, since that is the persona this app is signed
 * in as most of the time. For the creator portal, set VITE_DEV_EMAIL to
 * `creator@cabmora.com` and VITE_DEV_PASSWORD to `creatorpass123` in
 * `.env.local`.
 */
export interface DevCredentials {
  email: string;
  password: string;
}

export const DEV_CREDENTIALS: DevCredentials | null = import.meta.env.DEV
  ? {
      email: import.meta.env.VITE_DEV_EMAIL ?? 'customer@cabmora.com',
      password: import.meta.env.VITE_DEV_PASSWORD ?? 'customerpass123',
    }
  : null;
