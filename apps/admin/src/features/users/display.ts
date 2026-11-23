import type { User, UserRole, UserStatus } from '@cabmora/api-client';

/**
 * Presentation for an account. Shared so the list and the detail page cannot
 * drift into showing the same account two different ways.
 */

/**
 * Who a role belongs to.
 *
 * `client` is the people Cabmora serves — the customers who book work and the
 * partner creators who deliver their own. `team` is Cabmora's own staff. The
 * console lists them on separate screens because they are managed for
 * different reasons: one is a customer record, the other is an access
 * decision. Two screens reading one list is what stops them drifting apart.
 */
export type RoleGroup = 'client' | 'team';

/**
 * Every role, once.
 *
 * Three screens listed these as hardcoded `<option>` tags — the filter, the
 * detail page and the inline editor — and adding `coordinator` to the API
 * left all three silently out of date, so the role existed but could not be
 * granted. A list the screens map over cannot drift like that.
 */
export const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  plural: string;
  group: RoleGroup;
}[] = [
  { value: 'customer', label: 'Customer', plural: 'Customers', group: 'client' },
  { value: 'creator', label: 'Creator', plural: 'Creators', group: 'client' },
  { value: 'coordinator', label: 'Coordinator', plural: 'Coordinators', group: 'team' },
  { value: 'admin', label: 'Admin', plural: 'Admins', group: 'team' },
];

/** The roles in one group, in the order above. */
export const rolesIn = (group: RoleGroup): UserRole[] =>
  ROLE_OPTIONS.filter((r) => r.group === group).map((r) => r.value);

export const ROLE_PILL: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-900 border border-purple-200',
  // Cabmora's own staff, scoped to the shoots they are on. Coloured apart
  // from admin on purpose: the difference between "sees everything" and
  // "sees four projects" should be legible at a glance in a user list.
  coordinator: 'bg-teal-50 text-teal-900 border border-teal-200',
  creator: 'bg-gold/20 text-ink border border-gold/40',
  customer: 'bg-blue-50 text-blue-800 border border-blue-200',
};

export const STATUS_PILL: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
};

export const STATUS_DOT: Record<UserStatus, string> = {
  active: 'bg-emerald-600',
  suspended: 'bg-red-600',
  pending: 'bg-amber-600',
};

/** The API speaks lowercase; the design speaks Title Case. Display only. */
export const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Capitalise each part of a name for display.
 *
 * Only the first letter is touched and the rest is left exactly as typed, so
 * "McDonald" and "O'Brien" survive — lower-casing first would flatten them to
 * "Mcdonald" and "O'brien". Display only: nobody's name is rewritten in the
 * database on the strength of a guess.
 */
export const displayName = (value: string) => value.split(' ').filter(Boolean).map(title).join(' ');

export function initials(user: Pick<User, 'first_name' | 'last_name'>) {
  return (
    [user.first_name, user.last_name]
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?'
  );
}

export function joinedOn(user: Pick<User, 'created_at'>) {
  return new Date(user.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
