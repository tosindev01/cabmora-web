import { nameCase } from '@/shared/format';
import { ChevronLeft, ChevronRight, Inbox, Search, UserX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Select } from '@cabmora/ui';

import type { EnquiryStatus } from '@/features/enquiries/api';
import { STATUS_LABEL, STATUS_PILL, formatDate } from '@/features/enquiries/display';
import { useAdminEnquiries, type StatusFilter } from '@/features/enquiries/hooks/useAdminEnquiries';

/**
 * The lead pipeline.
 *
 * Wired to `GET/PATCH /api/v1/admin/enquiries`. Filtering, search and paging all
 * happen on the server, so the footer count describes the whole result set
 * rather than the page in front of you.
 */
export default function AdminEnquiryManagementPage() {
  const { items, total, page, pageSize, pageCount, filters, error, setPage, setFilter, setStatus } =
    useAdminEnquiries();
  const navigate = useNavigate();

  const rows = items ?? [];
  const firstShown = total === 0 ? 0 : page * pageSize + 1;
  const lastShown = page * pageSize + rows.length;
  const unassigned = rows.filter((e) => !e.assigned_to).length;

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      <div className="border-b border-ink/10 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-6 h-px bg-gold" />
          <span className="text-[11.5px] tracking-[0.3em] uppercase text-gold font-medium">
            Administration
          </span>
        </div>
        <h1 className="font-serif text-[32px] leading-tight text-ink">Enquiries</h1>
        <p className="text-ink/55 text-[15.5px] font-light mt-1">
          Work leads from first contact through to a booked project.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* A lead nobody owns is the one that goes cold — worth surfacing rather
          than leaving to be noticed. */}
      {unassigned > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3 rounded-xl text-[14.5px] flex items-center gap-2">
          <UserX size={16} className="flex-shrink-0" />
          {unassigned}{' '}
          {unassigned === 1 ? 'enquiry on this page has' : 'enquiries on this page have'} nobody
          assigned.
        </div>
      )}

      <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search by name, email or event..."
            aria-label="Search enquiries"
            className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="enquiry-status-filter"
            className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50"
          >
            Status
          </label>
          <Select
            id="enquiry-status-filter"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as StatusFilter)}
            className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[170px]"
          >
            <option value="All">All statuses</option>
            {(Object.keys(STATUS_LABEL) as EnquiryStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14.5px] table-fixed min-w-[880px]">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[11.5px] font-bold">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {items === null ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink/50 text-[15.5px]">
                    Loading enquiries…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink/50 text-[15.5px]">
                    <Inbox size={24} className="mx-auto mb-3 opacity-40" />
                    No enquiries match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, select, a, [data-no-row-nav]'))
                        return;
                      navigate(`/admin/enquiries/${enquiry.id}`);
                    }}
                    className="hover:bg-canvas/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/enquiries/${enquiry.id}`}
                          className="font-semibold text-ink truncate block hover:text-gold transition-colors"
                        >
                          {nameCase(enquiry.full_name)}
                        </Link>
                        <div className="text-[12.5px] text-ink/50 truncate">{enquiry.email}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4 min-w-0">
                      <div className="truncate text-ink/80">{enquiry.event_type}</div>
                      <div className="text-[12.5px] text-ink/45">
                        {formatDate(enquiry.event_date)}
                      </div>
                    </td>

                    <td className="py-3 px-4" data-no-row-nav>
                      {/* Only legal moves. A terminal status renders as a pill —
                          a dropdown holding nothing is worse than no dropdown. */}
                      {enquiry.allowed_next_statuses.length === 0 ? (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${STATUS_PILL[enquiry.status]}`}
                        >
                          {STATUS_LABEL[enquiry.status]}
                        </span>
                      ) : (
                        <Select
                          aria-label={`Status for ${nameCase(enquiry.full_name)}`}
                          value={enquiry.status}
                          onChange={(e) =>
                            void setStatus(enquiry.id, e.target.value as EnquiryStatus)
                          }
                          chevronInset="sm"
                          className={`pl-2.5 pr-7 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] outline-none w-full ${STATUS_PILL[enquiry.status]}`}
                        >
                          <option value={enquiry.status}>{STATUS_LABEL[enquiry.status]}</option>
                          {enquiry.allowed_next_statuses.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </Select>
                      )}
                    </td>

                    <td className="py-3 px-4 min-w-0">
                      {enquiry.assigned_to_name ? (
                        <span className="truncate block text-ink/80">
                          {enquiry.assigned_to_name}
                        </span>
                      ) : (
                        <span className="text-ink/35 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-ink/60 whitespace-nowrap">
                      {formatDate(enquiry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-4 py-3">
          <p className="text-[13.5px] text-ink/60 tabular-nums">
            {total === 0 ? 'No enquiries' : `Showing ${firstShown}–${lastShown} of ${total}`}
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
