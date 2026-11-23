import { useCallback, useEffect, useState } from 'react';

import { PersonAvatar, Select } from '@cabmora/ui';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ApiError, type User, type UserRole, type UserStatus } from '@cabmora/api-client';

import { UserAccess } from '@/features/users/components/UserAccess';
import { UserBilling } from '@/features/users/components/UserBilling';
import { UserFeatures } from '@/features/users/components/UserFeatures';
import { getUser, updateUser } from '@/features/users/api';
import {
  ROLE_OPTIONS,
  ROLE_PILL,
  STATUS_DOT,
  STATUS_PILL,
  displayName,
  initials,
  joinedOn,
  title,
} from '@/features/users/display';

/**
 * One account, as an action surface.
 *
 * Everything on it is answerable from real data. Storage, specialisation and
 * last login are still absent because nothing records them, and an empty tile
 * implying the figure is real and merely zero is how a wrong decision gets
 * made on an admin console.
 *
 * The three panels build to the control at the bottom, which is what somebody
 * came here to use: what this account can open, what it can reach, and —
 * for a client — what it owes. Changing a role is the last thing on the page
 * because it should be the last thing you do.
 */
export default function AdminUserDetailPage() {
  const { id = '' } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    getUser(id)
      .then(setUser)
      .catch(() => undefined);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getUser(id)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiError ? err.message : 'Could not load this account.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const patch = useCallback(
    async (changes: { role?: UserRole; status?: UserStatus }) => {
      setBusy(true);
      setError(null);
      try {
        // Replaced from the server's response, never guessed: the API refuses
        // an admin demoting or suspending themselves, and an optimistic update
        // would show a change that never happened.
        setUser(await updateUser(id, changes));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not update this account.');
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  if (notFound) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20">
        <h1 className="text-[24px] font-sans font-medium text-ink mb-2">Account not found</h1>
        <p className="text-ink/60 text-[15.5px] mb-6">
          It may have been removed, or the link may be wrong.
        </p>
        <Link
          to="/admin/users"
          className="text-[13.5px] font-bold uppercase tracking-[0.05em] text-gold hover:text-ink transition-colors"
        >
          Back to user management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-[13.5px] font-bold uppercase tracking-[0.05em] text-ink/60 hover:text-gold transition-colors"
      >
        <ArrowLeft size={16} />
        User management
      </Link>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {user === null && !notFound ? (
        <p className="text-ink/50 text-[15.5px] py-12">Loading account…</p>
      ) : user ? (
        <>
          {/* Identity */}
          <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <PersonAvatar src={user.avatar_url} initials={initials(user)} size={64} />

            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-sans font-medium text-ink truncate">
                {displayName(user.full_name)}
              </h1>
              <p className="text-ink/60 text-[14.5px] flex items-center gap-1.5 truncate">
                <Mail size={14} className="flex-shrink-0" />
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-block px-2.5 py-1 rounded text-[12.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${ROLE_PILL[user.role]}`}
              >
                {title(user.role)}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] inline-flex items-center gap-1.5 whitespace-nowrap ${STATUS_PILL[user.status]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[user.status]}`} />
                {title(user.status)}
              </span>
            </div>
          </div>

          {/* Facts the API actually holds */}
          <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-4">
              Account
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[14.5px]">
              <div>
                <dt className="text-ink/50 mb-0.5">Joined</dt>
                <dd className="text-ink font-medium">{joinedOn(user)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-ink/50 mb-0.5">Account ID</dt>
                <dd className="text-ink font-mono text-[13.5px] truncate">{user.id}</dd>
              </div>
            </dl>
          </div>

          <UserAccess user={user} />

          {/* Console roles only. Every customer reaches exactly the same five
              portal screens and every creator the same five — a panel that
              reads identically for every account of a given kind tells you
              nothing about the account in front of you. It varies for a
              coordinator, which is the case worth showing. */}
          {(user.role === 'admin' || user.role === 'coordinator') && (
            <UserFeatures user={user} onChanged={reload} />
          )}

          {/* Customers only. A creator's money runs the other way — earnings
              and payouts — and one panel serving both would invite reading
              one as the other. */}
          {user.role === 'customer' && <UserBilling user={user} />}

          {/* Actions */}
          <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 space-y-5">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
              Manage access
            </h2>

            {user.status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[14.5px] text-amber-900">
                  This account is waiting to be accepted. Until then they can sign in but cannot use
                  the platform.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ status: 'active' })}
                  className="px-4 py-2 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  Accept account
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label
                  htmlFor="detail-role"
                  className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5"
                >
                  Role
                </label>
                <Select
                  id="detail-role"
                  value={user.role}
                  disabled={busy}
                  onChange={(e) => void patch({ role: e.target.value as UserRole })}
                  className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg disabled:opacity-50"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void patch({ status: user.status === 'suspended' ? 'active' : 'suspended' })
                }
                className={`px-4 py-2 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap ${
                  user.status === 'suspended'
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {user.status === 'suspended' ? 'Reinstate account' : 'Suspend account'}
              </button>
            </div>

            <p className="text-[13.5px] text-ink/50 border-t border-ink/10 pt-4">
              Suspending ends the session on their next request. Email and password belong to the
              account holder and cannot be changed here.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
