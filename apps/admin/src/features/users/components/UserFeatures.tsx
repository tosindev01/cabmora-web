import { useEffect, useState } from 'react';
import { Check, Lock, Minus } from 'lucide-react';

import type { AccessGroup, Permission, User } from '@cabmora/api-client';

import { canOpen } from '@/shared/auth';
import { setUserPermissions } from '@/features/users/api';
import { listGroups, setUserGroups } from '@/features/users/groups';

/** The console, as the sidebar lists it. Read through `canOpen` rather than
 *  restated, so a section a coordinator loses here is lost in both places. */
/** The four an administrator may hand out, and the reason each of the others
 *  cannot be. Mirrors `GRANTABLE` on the server, which is what enforces it —
 *  a list the interface declines to draw is a list somebody can still POST. */
const GRANT: Record<string, Permission | { locked: string }> = {
  '/admin/payments': 'payments',
  '/admin/reviews': 'reviews',
  '/admin/creator-applications': 'creator_applications',
  '/admin/reports': 'reports',
  '/admin/projects': { locked: 'Every coordinator has this' },
  '/admin/enquiries': { locked: 'Every coordinator has this' },
  '/admin/users': { locked: 'Admin only — changing roles is a promotion' },
  '/admin/team': { locked: 'Admin only — team membership reaches every client' },
  '/admin/dashboard': { locked: 'Admin only' },
};

/** A permission as the console names it, for listing what a group gives. */
const LABEL = (permission: Permission): string =>
  ({
    payments: 'Payment management',
    reviews: 'Review moderation',
    creator_applications: 'Creator applications',
    reports: 'Reporting dashboard',
  })[permission as string] ?? permission;

const CONSOLE_SECTIONS: { path: string; label: string }[] = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/users', label: 'User management' },
  { path: '/admin/team', label: 'Team' },
  { path: '/admin/projects', label: 'Project management' },
  { path: '/admin/enquiries', label: 'Enquiry management' },
  { path: '/admin/creator-applications', label: 'Creator applications' },
  { path: '/admin/reviews', label: 'Review moderation' },
  { path: '/admin/payments', label: 'Payment management' },
  { path: '/admin/reports', label: 'Reporting dashboard' },
];

/** Only the two roles that sign into this console get here — see the caller. */
const INTRO: Record<'admin' | 'coordinator', string> = {
  admin: 'Every section of this console, and every client in it.',
  coordinator: 'The console, limited to the sections the API will serve them.',
};

/**
 * Which parts of the product this account can reach.
 *
 * Sits beside "can open", which answers the same question about *projects*.
 * This one answers it about screens: a coordinator being told they have
 * access to two projects does not tell you they cannot open payments, and
 * before changing somebody's role that is the thing worth knowing.
 */
export function UserFeatures({ user, onChanged }: { user: User; onChanged: () => void }) {
  const role = user.role as 'admin' | 'coordinator';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<AccessGroup[]>([]);

  useEffect(() => {
    if (role !== 'coordinator') return;
    listGroups()
      .then(setGroups)
      .catch(() => undefined);
  }, [role]);

  const inGroups = new Set(user.group_names ?? []);
  const fromGroups = new Set(user.from_groups ?? []);

  async function toggleGroup(group: AccessGroup, on: boolean) {
    const names = new Set(inGroups);
    if (on) names.add(group.name);
    else names.delete(group.name);
    const ids = groups.filter((g) => names.has(g.name)).map((g) => g.id);
    setBusy(true);
    setError(null);
    try {
      await setUserGroups(user.id, ids);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change that.');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(permission: Permission, on: boolean) {
    const current = new Set(user.granted ?? []);
    if (on) current.add(permission);
    else current.delete(permission);
    setBusy(true);
    setError(null);
    try {
      await setUserPermissions(user.id, [...current]);
      // Re-read rather than patch locally: `reachable` is computed by the
      // API from role and grants together, and guessing it here would be the
      // second implementation this whole design exists to avoid.
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
      <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-1">
        Can reach
      </h2>
      <p className="text-ink/55 text-[14.5px] mb-4">{INTRO[role]}</p>

      <ul className="divide-y divide-ink/8 border-y border-ink/8">
        {CONSOLE_SECTIONS.map((section) => {
          const allowed = canOpen(user, section.path);
          const grant = GRANT[section.path];
          const grantable = role === 'coordinator' && typeof grant === 'string';
          return (
            <li key={section.path} className="flex items-center gap-3 py-2.5">
              {grantable ? (
                /* The only rows that are controls. The rest say why they are
                   not, because a silently absent checkbox reads as a missing
                   feature and the reason is the interesting part. */
                <input
                  type="checkbox"
                  checked={allowed}
                  disabled={busy}
                  onChange={(event) => void toggle(grant as Permission, event.target.checked)}
                  aria-label={`Let them reach ${section.label}`}
                  className="accent-gold w-4 h-4 cursor-pointer flex-shrink-0"
                />
              ) : allowed ? (
                <Check size={15} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <Minus size={15} className="text-ink/25 flex-shrink-0" />
              )}
              <span className="flex-1 min-w-0">
                <span className={`block text-[14.5px] ${allowed ? 'text-ink' : 'text-ink/35'}`}>
                  {section.label}
                </span>
              </span>
              {grantable && fromGroups.has(grant as Permission) && (
                /* Why unticking the box may not turn it off. Without this an
                   admin unticks Payments, watches it stay on because a group
                   still gives it, and reads that as broken. */
                <span className="text-[12.5px] text-ink/45 whitespace-nowrap">
                  also via a group
                </span>
              )}
              {!grantable && typeof grant === 'object' && role === 'coordinator' && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-ink/45 whitespace-nowrap">
                  <Lock size={12} />
                  {grant.locked}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* The console mirrors the API's guards, it does not replace them.
          Saying so here stops this panel being read as the rule itself. */}
      {role === 'coordinator' && groups.length > 0 && (
        <div className="mt-5 pt-4 border-t border-ink/10">
          <h3 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-1">
            Groups
          </h3>
          <p className="text-ink/55 text-[13.5px] mb-3">
            A group gives everybody in it the same sections. Changing the group changes them for
            everyone at once.
          </p>
          <ul className="divide-y divide-ink/8 border-y border-ink/8">
            {groups.map((group) => (
              <li key={group.id} className="flex items-center gap-3 py-2.5">
                <input
                  type="checkbox"
                  checked={inGroups.has(group.name)}
                  disabled={busy}
                  onChange={(event) => void toggleGroup(group, event.target.checked)}
                  aria-label={`Put them in ${group.name}`}
                  className="accent-gold w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] text-ink">{group.name}</span>
                  <span className="block text-[13px] text-ink/50">
                    {group.permissions.length === 0
                      ? 'Gives nothing yet'
                      : group.permissions.map(LABEL).join(', ')}
                  </span>
                </span>
                <span className="text-[12.5px] text-ink/40 whitespace-nowrap">
                  {group.member_count} {group.member_count === 1 ? 'person' : 'people'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[13.5px] text-red-700 mt-4">
          {error}
        </p>
      )}

      <p className="text-[13px] text-ink/45 mt-4">
        What a request is actually allowed to do is decided by the API. This is what the interface
        offers them.
      </p>
    </div>
  );
}
