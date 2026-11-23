import { apiFetch } from '@cabmora/api-client';
import type { AccessGroup, Permission, User } from '@cabmora/api-client';

/**
 * Named bundles of permissions, assignable to coordinators.
 *
 * An additive role in everything but name. The API bounds a group by the same
 * grantable list as a direct grant — a group containing "users" would be a
 * ladder out of the whole mechanism — so nothing here needs to re-check it.
 */
export const listGroups = () => apiFetch<AccessGroup[]>('/admin/groups');

export const createGroup = (body: { name: string; permissions: Permission[] }) =>
  apiFetch<AccessGroup>('/admin/groups', { method: 'POST', body: JSON.stringify(body) });

/** Changing what a group gives changes it for everybody in it at once — which
 *  is the point, and why the response carries `member_count`. */
export const updateGroup = (id: string, body: { name: string; permissions: Permission[] }) =>
  apiFetch<AccessGroup>(`/admin/groups/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteGroup = (id: string) =>
  apiFetch<void>(`/admin/groups/${id}`, { method: 'DELETE' });

export const groupMembers = (id: string) => apiFetch<string[]>(`/admin/groups/${id}/members`);

export const setGroupMembers = (id: string, userIds: string[]) =>
  apiFetch<AccessGroup>(`/admin/groups/${id}/members`, {
    method: 'PUT',
    body: JSON.stringify({ user_ids: userIds }),
  });

/** The same change from the other end: which groups one person is in. */
export const setUserGroups = (userId: string, groupIds: string[]) =>
  apiFetch<User>(`/admin/users/${userId}/groups`, {
    method: 'PUT',
    body: JSON.stringify({ group_ids: groupIds }),
  });
