import { apiFetch } from './client';
import type { AccountType, TokenResponse, User } from './types';

/**
 * The auth endpoints, shared by both frontends.
 *
 * None of these handle a token. `login` sets an HttpOnly cookie server-side and
 * `apiFetch` sends it automatically; the `access_token` in the response body is
 * there for clients without a cookie jar and browsers should ignore it.
 */

export function register(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  accountType: AccountType = 'customer',
) {
  // No confirm-password field: the API has nothing to compare it against, so
  // the match is checked in the form before this is ever called.
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      account_type: accountType,
    }),
  });
}

export function login(email: string, password: string) {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe() {
  return apiFetch<User>('/auth/me');
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

/**
 * Claim an account an admin created, by setting a password.
 *
 * Returns a session: the holder has just proved they have a single-use link
 * sent to their address and chosen a password, so a login form afterwards is
 * friction with no security.
 */
export function acceptInvite(token: string, password: string) {
  return apiFetch<TokenResponse>('/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Ask for a password reset link.
 *
 * Resolves the same way whether or not that address has an account. The API
 * answers identically on purpose — anything else would turn the sign-in page
 * into a way to ask whether someone is a Cabmora client — so the screen must
 * not try to report "no such account" either.
 */
export function forgotPassword(email: string) {
  return apiFetch<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Spend a reset link and choose a new password.
 *
 * Returns a session, for the same reason `acceptInvite` does.
 */
export function resetPassword(token: string, password: string) {
  return apiFetch<TokenResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
