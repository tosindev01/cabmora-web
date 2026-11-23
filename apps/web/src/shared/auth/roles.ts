import type { User, UserRole } from '@cabmora/api-client';

/**
 * Where a role lands after signing in **on this site**.
 *
 * Staff are the awkward case and used to be handled by pretending they were
 * not: `admin` was sent to `/dashboard`, which is the *Creator Studio*
 * dashboard, and `coordinator` to the marketing homepage. A new team member
 * accepting an invite and signing in therefore landed on a creator portal or
 * on the public site looking signed out — reported as "team creation bug: log
 * in access redirect to customer page instead of admin". The old comment here
 * explained the behaviour as deliberate, which is how it survived so long.
 *
 * It is not routable from here: the console is a separate application on its
 * own origin, so react-router cannot reach it. `consoleRedirect` handles that;
 * this function only answers for the paths that exist in *this* app.
 */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'customer':
      return '/client/dashboard';
    case 'creator':
      return '/dashboard';
    case 'admin':
    case 'coordinator':
      // Only reached when the API could not say where the console is — see
      // `consoleRedirect`. The marketing home is somewhere unguarded, which it
      // has to be: `ProtectedRoute` sends an unlisted role to whatever this
      // returns, so naming a route they cannot enter would redirect them to
      // themselves for ever.
      return '/';
  }
}

/**
 * The console's address, when this person belongs there.
 *
 * `console_url` comes from the API, which is the only part of the system that
 * knows the console's origin. Baking it in at build time with a `VITE_` var
 * would mean one image per environment, and the whole deployment rests on one
 * image running everywhere — see the root CLAUDE.md.
 *
 * Null for customers and creators, and null for staff when `ADMIN_BASE_URL` is
 * unset on the API. The caller must leave them where they are in that case
 * rather than guess a host: a redirect to an invented origin is a 404 with no
 * way back.
 */
export function consoleRedirect(user: User): string | null {
  return user.console_url ?? null;
}
