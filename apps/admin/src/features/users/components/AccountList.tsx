import { useState } from 'react';

import { ChevronLeft, ChevronRight, Search, ShieldAlert, UserPlus, Users } from 'lucide-react';

import { PersonAvatar, Select } from '@cabmora/ui';
import { Link, useNavigate } from 'react-router-dom';

import type { UserRole } from '@cabmora/api-client';

import {
  ROLE_OPTIONS,
  ROLE_PILL,
  type RoleGroup,
  STATUS_DOT,
  STATUS_PILL,
  displayName,
  initials,
  joinedOn,
  title,
} from '@/features/users/display';
import { NewAccountModal } from '@/features/users/components/NewAccountModal';
import {
  useAdminUsers,
  type RoleFilter,
  type StatusFilter,
} from '@/features/users/hooks/useAdminUsers';

interface Props {
  /** Which people this screen is for — see `RoleGroup`. */
  group: RoleGroup;
  heading: string;
  blurb: string;
  /** Shown when the filters match nothing. */
  empty: string;
  /** The add button's label — "Add a client" reads better than "Add account". */
  addLabel: string;
}

/**
 * A list of accounts — the PRD's "[M] User management".
 *
 * One implementation behind both screens. Clients and Cabmora's own team are
 * separate pages because they are managed for different reasons, but they are
 * the same table over the same endpoint, and two copies of it would be two
 * places for a column, a control or a guard to go stale.
 *
 * Filtering, search and paging all happen on the server. Doing any of them in
 * the browser would make the footer describe one page while claiming to
 * describe the result set — "3 pending" meaning "3 pending on this page".
 *
 * Columns the API cannot back are absent rather than filled from seed data:
 * storage usage, project counts and lifetime earnings each need entities that
 * do not exist yet, and a fabricated number on an admin console is where a bad
 * decision starts. Add-user and delete-user are gone too — accounts
 * self-register, and the PRD asks for "manage users' accessibility", which is
 * suspension, not deletion.
 */
export function AccountList({ group, heading, blurb, empty, addLabel }: Props) {
  const {
    users,
    total,
    page,
    pageCount,
    pageSize,
    filters,
    error,
    busyId,
    setPage,
    setFilter,
    patch,
    refresh,
  } = useAdminUsers(group);

  const [adding, setAdding] = useState(false);

  const { role, status, q: search } = filters;
  const navigate = useNavigate();

  const rows = users ?? [];
  // Only this screen's roles in its own filter; the whole list in the inline
  // editor, because moving somebody between the two screens is exactly what
  // that control is for.
  const filterRoles = ROLE_OPTIONS.filter((r) => r.group === group);
  const firstShown = total === 0 ? 0 : page * pageSize + 1;
  const lastShown = page * pageSize + rows.length;

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          <h1 className="text-[30px] font-sans font-medium text-ink">{heading}</h1>
          <p className="text-ink/60 text-[15.5px]">{blurb}</p>
        </div>

        <div className="flex items-center gap-3">
          {group === 'client' && (
            <button
              type="button"
              onClick={() => setFilter('status', status === 'pending' ? 'All' : 'pending')}
              className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase transition-colors flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                status === 'pending'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200'
              }`}
            >
              <ShieldAlert size={16} />
              {status === 'pending' ? 'Showing queue' : 'Acceptance queue'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase transition-colors flex items-center gap-2 cursor-pointer border border-ink bg-ink text-white hover:bg-gold hover:text-ink hover:border-gold whitespace-nowrap"
          >
            <UserPlus size={16} />
            {addLabel}
          </button>
        </div>
      </div>

      <NewAccountModal
        group={group}
        open={adding}
        onOpenChange={setAdding}
        // Re-read rather than splice the row in: it may not belong on the
        // current page, or under the current filters, and a row that ignores
        // them makes the footer's count a lie.
        onCreated={() => void refresh()}
      />

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* Filter controls */}
      <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search users"
            className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="role-filter"
              className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50"
            >
              Role
            </label>
            {/* No counts on these options: each would need its own query, and a
                count taken from the current page is wrong past page one. */}
            <Select
              id="role-filter"
              value={role}
              onChange={(e) => setFilter('role', e.target.value as RoleFilter)}
              className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[150px]"
            >
              <option value="All">All roles</option>
              {filterRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.plural}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50"
            >
              Status
            </label>
            <Select
              id="status-filter"
              value={status}
              onChange={(e) => setFilter('status', e.target.value as StatusFilter)}
              className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[150px]"
            >
              <option value="All">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14.5px] table-fixed min-w-[960px]">
            {/* Fixed widths so a long name truncates instead of shoving its
                neighbour. Under `table-fixed` a cramped cell overflows into
                its neighbour rather than growing, so these are pixels, not
                percentages: a percentage of a table that can be any width is
                not a promise that "COORDINATOR" fits, and it did not — the
                pill sat on top of the status beside it. User takes whatever
                is left. */}
            <colgroup>
              <col />
              <col className="w-[150px]" />
              <col className="w-[128px]" />
              <col className="w-[124px]" />
              <col className="w-[292px]" />
            </colgroup>
            <thead>
              <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[11.5px] font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users === null ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink/50 text-[15.5px]">
                    Loading accounts…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink/50 text-[15.5px]">
                    <Users size={24} className="mx-auto mb-3 opacity-40" />
                    {empty}
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <tr
                    key={user.id}
                    onClick={(e) => {
                      // Ignore anything that started on a control or inside the
                      // actions cell: without this, Suspend would also navigate
                      // away, and changing the role select would leave the page
                      // mid-change.
                      if (
                        (e.target as HTMLElement).closest(
                          'button, select, a, input, [data-no-row-nav]',
                        )
                      ) {
                        return;
                      }
                      navigate(`/admin/users/${user.id}`);
                    }}
                    className="hover:bg-canvas/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      {/* min-w-0 is what makes `truncate` work: without it a
                          flex child refuses to shrink below its content. */}
                      <div className="flex items-center gap-3 min-w-0">
                        <PersonAvatar src={user.avatar_url} initials={initials(user)} size={40} />
                        <div className="min-w-0">
                          {/* Kept as a real <a> even though the row is
                              clickable: a row onClick is not focusable, is not
                              announced as a link, and cannot be cmd-clicked or
                              opened in a new tab. This is the accessible
                              affordance; the row is the convenient one. */}
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="font-semibold text-ink text-[15.5px] truncate block hover:text-gold transition-colors"
                          >
                            {displayName(user.full_name)}
                          </Link>
                          <div className="text-[12.5px] text-ink/50 truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[12.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${ROLE_PILL[user.role]}`}
                      >
                        {title(user.role)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] inline-flex items-center gap-1.5 w-fit whitespace-nowrap ${STATUS_PILL[user.status]}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[user.status]}`} />
                        {title(user.status)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-ink/70 whitespace-nowrap">{joinedOn(user)}</td>

                    <td className="py-3 px-4" data-no-row-nav>
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {user.status === 'pending' && (
                          <button
                            type="button"
                            disabled={busyId === user.id}
                            onClick={() => void patch(user.id, { status: 'active' })}
                            className="px-2.5 py-1 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Accept
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={busyId === user.id}
                          onClick={() =>
                            void patch(user.id, {
                              status: user.status === 'suspended' ? 'active' : 'suspended',
                            })
                          }
                          className={`px-2.5 py-1 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] transition-colors disabled:opacity-50 cursor-pointer ${
                            user.status === 'suspended'
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                        >
                          {user.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                        </button>

                        <Select
                          aria-label={`Role for ${displayName(user.full_name)}`}
                          value={user.role}
                          disabled={busyId === user.id}
                          onChange={(e) =>
                            void patch(user.id, { role: e.target.value as UserRole })
                          }
                          className="bg-canvas border border-ink/15 pl-2 pr-7 py-1 text-[12.5px] font-medium outline-none focus:border-gold rounded disabled:opacity-50 cursor-pointer"
                          chevronInset="sm"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pager. `total` comes from the API and describes the filtered result
            set, so this line is true rather than a description of one page. */}
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-4 py-3">
          <p className="text-[13.5px] text-ink/60 tabular-nums">
            {total === 0 ? 'No accounts' : `Showing ${firstShown}–${lastShown} of ${total}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
              className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13.5px] text-ink/70 tabular-nums">
              Page {page + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= pageCount}
              aria-label="Next page"
              className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
