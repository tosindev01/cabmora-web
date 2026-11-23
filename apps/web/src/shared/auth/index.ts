/**
 * The browser session.
 *
 * In `shared/`, not `features/auth/`, because more than one feature needs it —
 * and so does chrome in `shared/`: the public Navigation shows Log out, and the
 * portal sidebar needs to actually end the session. Per the dependency rule in
 * CLAUDE.md, `shared/` must never import a feature, so a session hook living
 * under `features/auth` made both of those imports violations.
 *
 * `features/auth` keeps the screens and the form hooks; this is only the state.
 */
export { AuthProvider, useAuth } from './useAuth';
export { consoleRedirect, homePathForRole } from './roles';
