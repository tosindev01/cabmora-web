import { Modal, Select } from '@cabmora/ui';
import { CheckCircle2, Clock, DollarSign, FileText, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { PaymentRow, PaymentStatus } from '@cabmora/api-client';

import { confirmPayment, refundPayment } from '@/features/billing/api';
import { RefundForm } from '@/features/billing/components/RefundForm';
import { UnmatchedFundsPanel } from '@/features/billing/components/UnmatchedFundsPanel';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_PILL,
  REFUND_STATE_LABEL,
  formatDate,
  formatMinor,
} from '@/features/billing/display';
import {
  useAdminPayments,
  type PaymentStatusFilter,
} from '@/features/billing/hooks/useAdminPayments';

/**
 * Every movement of money, and the three figures that summarise them.
 *
 * The design is the designer's; only the data source changed. Three things had
 * to move because the fixture could not express what the API records:
 *
 * - The status filter offers the API's payment states rather than
 *   `Paid | Pending | Refunded`. "Refunded" was never a payment status — a
 *   refund is a separate record, and a payment can be partly refunded, which
 *   one status cannot say. Refunds show as a badge beside the amount instead.
 * - Refunding opens a form rather than `confirm()`, because the API requires a
 *   reason and a browser dialog cannot collect one.
 * - Totals come from `/admin/billing/stats`, not from summing the visible page.
 */
export default function AdminPaymentManagementPage() {
  const {
    items,
    total,
    page,
    pageSize,
    pageCount,
    filters,
    error,
    stats,
    setPage,
    setFilter,
    refresh,
  } = useAdminPayments();

  const [selected, setSelected] = useState<PaymentRow | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = items ?? [];
  const currency = stats?.currency ?? 'GBP';
  const firstShown = total === 0 ? 0 : page * pageSize + 1;
  const lastShown = page * pageSize + rows.length;

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="max-w-[1320px] mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Payment &amp; Invoice Management
            </h1>
            <p className="text-ink/60 text-[15.5px]">
              Display platform transactions, client invoices, gateway payouts, issue refunds, and
              review financial summaries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Cleared Revenue Volume
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-ink tabular-nums">
              {stats ? formatMinor(stats.paid_minor, currency) : '—'}
            </div>
            <div className="text-[13.5px] text-emerald-600 flex items-center gap-1 mt-2 pt-2 border-t border-ink/5">
              <CheckCircle2 size={14} /> Confirmed against issued invoices
            </div>
          </div>

          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Pending Invoices / Wire
              </span>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Clock size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-amber-700 tabular-nums">
              {stats ? formatMinor(stats.pending_minor, currency) : '—'}
            </div>
            <div className="text-[13.5px] text-amber-700 mt-2 pt-2 border-t border-ink/5">
              Awaiting client bank transfer clearance
            </div>
          </div>

          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Total Refunded Volume
              </span>
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                <RotateCcw size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-ink tabular-nums">
              {stats ? formatMinor(stats.refunded_minor, currency) : '—'}
            </div>
            <div className="text-[13.5px] text-ink/50 mt-2 pt-2 border-t border-ink/5">
              Admin approved client refunds
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
          >
            {error}
          </div>
        )}

        {/* Above the list, not below it. Money nobody can place is the one
            thing on this screen that is wrong right now; the payments table
            is a record of things that went right. */}
        <UnmatchedFundsPanel />

        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              disabled
              placeholder="Search is filtered server-side by status for now"
              aria-label="Search payments"
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[14.5px] outline-none rounded-lg disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50">
              Status:
            </span>
            <Select
              value={filters.status_filter}
              onChange={(e) => setFilter('status_filter', e.target.value as PaymentStatusFilter)}
              aria-label="Filter by payment status"
              className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[190px]"
            >
              <option value="All">All Transactions ({total})</option>
              {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {PAYMENT_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14.5px] min-w-[1000px]">
              <thead>
                <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[11.5px] font-bold">
                  <th className="py-4 px-5">Invoice ID</th>
                  <th className="py-4 px-4">Client Name</th>
                  <th className="py-4 px-4">Assigned Creator</th>
                  <th className="py-4 px-4">Gateway</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {items === null ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-ink/50 text-[15.5px]">
                      Loading transactions…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-ink/50 text-[15.5px]">
                      <DollarSign size={24} className="mx-auto mb-3 opacity-40" />
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-canvas/60 transition-colors">
                      <td className="py-4 px-5">
                        <Link
                          to={`/admin/invoices/${row.invoice_id}`}
                          className="font-semibold text-ink hover:text-gold transition-colors"
                        >
                          {row.invoice_number ?? 'Draft'}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-ink/80">{row.customer_name ?? '—'}</td>
                      <td className="py-4 px-4 text-ink/80">{row.creator_name ?? 'Cabmora'}</td>
                      <td className="py-4 px-4 text-ink/70">{PAYMENT_METHOD_LABEL[row.method]}</td>
                      <td className="py-4 px-4 tabular-nums font-medium text-ink whitespace-nowrap">
                        {formatMinor(row.amount_minor, row.currency)}
                        {row.refund_state !== 'none' && (
                          <span className="block text-[12.5px] font-normal text-purple-700">
                            {REFUND_STATE_LABEL[row.refund_state]}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${PAYMENT_STATUS_PILL[row.status]}`}
                        >
                          {PAYMENT_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-ink/60 text-[13.5px] whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelected(row)}
                            className="px-2.5 py-1 text-[12.5px] font-semibold border border-ink/15 rounded hover:bg-canvas flex items-center gap-1 cursor-pointer"
                          >
                            <FileText size={13} /> View Invoice
                          </button>

                          {row.status === 'pending' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void act(() => confirmPayment(row.id))}
                              className="px-2.5 py-1 text-[12.5px] font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}

                          {row.status === 'confirmed' && row.refundable_minor > 0 && (
                            <RefundForm
                              maxMinor={row.refundable_minor}
                              currency={row.currency}
                              disabled={busy}
                              onSubmit={(amountMinor, reason) =>
                                act(() =>
                                  refundPayment(row.id, { amount_minor: amountMinor, reason }),
                                )
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-5 py-3">
            <p className="text-[13.5px] text-ink/60 tabular-nums">
              {total === 0 ? 'No transactions' : `Showing ${firstShown}–${lastShown} of ${total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded border border-ink/15 text-ink/70 text-[13.5px] hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[13.5px] text-ink/70 tabular-nums">
                Page {page + 1} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= pageCount}
                className="px-3 py-1.5 rounded border border-ink/15 text-ink/70 text-[13.5px] hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setSelected(null);
          }}
          size="sm"
          title={<>{selected.invoice_number ?? 'Draft invoice'}</>}
          description="INVOICE STATEMENT"
        >
          <div className="space-y-4 text-[14.5px]">
            <div className="p-4 bg-canvas border border-ink/10 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-ink/60">Billed To:</span>
                <strong className="text-ink">{selected.customer_name ?? '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Creator Service:</span>
                <strong className="text-ink">{selected.creator_name ?? 'Cabmora'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Payment Gateway:</span>
                <strong className="text-ink">{PAYMENT_METHOD_LABEL[selected.method]}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Payment Date:</span>
                <strong className="text-ink">{formatDate(selected.created_at)}</strong>
              </div>
            </div>

            <div className="p-4 border border-ink/10 rounded-lg space-y-2">
              <div className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink/50">
                Project
              </div>
              <div className="flex justify-between font-medium text-ink">
                <span>{selected.project_title ?? '—'}</span>
                <span className="tabular-nums">
                  {formatMinor(selected.amount_minor, selected.currency)}
                </span>
              </div>
              <div className="flex justify-between text-ink/60 text-[13.5px] pt-2 border-t border-ink/10">
                <span>Invoice total</span>
                <span className="tabular-nums">
                  {formatMinor(selected.invoice_total_minor, selected.currency)}
                </span>
              </div>
            </div>

            <Link
              to={`/admin/invoices/${selected.invoice_id}`}
              className="block text-center px-4 py-2.5 rounded-lg bg-gold text-ink text-[13.5px] font-semibold hover:bg-gold-dark transition-colors"
            >
              Open full invoice
            </Link>
          </div>
        </Modal>
      )}
    </>
  );
}
