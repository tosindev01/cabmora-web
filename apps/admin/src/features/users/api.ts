import {
  apiFetch,
  fetchPage,
  type Permission,
  type Project,
  type User,
  type UserRole,
  type UserStatus,
} from '@cabmora/api-client';

/** Must match DEFAULT_PAGE_SIZE in the API's ListUsers use case. */
export const PAGE_SIZE = 30;

export interface ListUsersParams {
  /** One role, or several — the console's two lists are each a set of roles. */
  role?: UserRole | UserRole[];
  status?: UserStatus;
  /** Matches email, or first + last name concatenated. */
  q?: string;
  limit?: number;
  offset?: number;
}

/** Thin typed shim over the shared page client — no bespoke query building. */
export const listUsers = (params: ListUsersParams = {}) =>
  fetchPage<User>('/admin/users', { ...params });

export const getUser = (id: string) => apiFetch<User>(`/admin/users/${id}`);

/**
 * Only the two fields administration owns — mirrors `UpdateUser` on the API.
 * Email and password belong to the account holder and are not editable here.
 */
export const updateUser = (id: string, patch: { role?: UserRole; status?: UserStatus }) =>
  apiFetch<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

export interface ProvisionedAccount {
  id: string;
  email: string;
  full_name: string;
  /**
   * The one-time invite link. Populated only outside production, where the
   * logging email sender does not actually deliver — in production the
   * customer's inbox is the only place this appears.
   */
  invite_url: string | null;
}

export interface NewAccount {
  email: string;
  first_name: string;
  last_name: string;
  /** Defaults to `customer` on the API, which is what the new-project flow wants. */
  role?: UserRole;
}

/**
 * Create an account for somebody who has not signed up — a client booked over
 * the phone, or a new colleague.
 *
 * No password: the API emails them a single-use link and they choose their
 * own, so nobody here ever knows it. Where that link points follows from the
 * role and is decided server-side; staff are sent to this console rather than
 * the public site, because the session cookie is scoped to the host that sets
 * it.
 */
export const createAccount = (body: NewAccount) =>
  apiFetch<ProvisionedAccount>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * The projects one account can open.
 *
 * Three different questions wearing one name, because access itself works
 * three different ways: a client reaches their own work, staff reach the
 * shoots they are on, and an administrator reaches everything. Asking the
 * wrong one produces a confident empty list, which on this screen reads as
 * "this person can see nothing" — the most expensive thing it could say
 * wrongly. `unrestricted` is therefore returned rather than inferred by the
 * caller, and the query is chosen here, once.
 */
export async function listAccessibleProjects(user: Pick<User, 'id' | 'role'>) {
  if (user.role === 'admin') return { projects: [], total: 0, unrestricted: true };

  // `customer_id` for a client, `access_for` for staff — the API's `access_for`
  // mirrors its own can-open rule, which deliberately excludes customers.
  const scope = user.role === 'customer' ? { customer_id: user.id } : { access_for: user.id };

  const page = await fetchPage<Project>('/admin/projects', { ...scope, limit: 100 });
  return { projects: page.items, total: page.total, unrestricted: false };
}

/**
 * Replace which extra sections a coordinator may reach.
 *
 * The whole set, not a delta — add and remove endpoints that can disagree are
 * how somebody keeps access they were taken off. The API refuses granting to
 * yourself, to anyone who is not a coordinator, and anything outside its own
 * grantable list; none of those are the console's to decide.
 */
export const setUserPermissions = (id: string, permissions: Permission[]) =>
  apiFetch<User>(`/admin/users/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
