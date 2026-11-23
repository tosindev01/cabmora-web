import { useCallback, useEffect, useState } from 'react';

import { ArrowLeft, Check, Download, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ApiError, type InvoiceDetail, type PaymentMethod } from '@cabmora/api-client';

import {
  confirmPayment,
  confirmRefund,
  getInvoice,
  invoicePdfUrl,
  issueInvoice,
  recordPayment,
  refundPayment,
  voidInvoice,
} from '@/features/billing/api';
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_PILL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_PILL,
  REFUND_STATE_LABEL,
  SETTLEMENT_LABEL,
  SETTLEMENT_PILL,
  formatDate,
  formatMinor,
} from '@/features/billing/display';
import { RecordPaymentForm } from '@/features/billing/components/RecordPaymentForm';
import { RefundForm } from '@/features/billing/components/RefundForm';

/**
 * One invoice, as an action surface.
 *
 * Every button is gated on `allowed_actions` from the API rather than on a rule
 * reimplemented here — the server derives it from the same checks it enforces,
 * so the UI cannot offer something that will be refused.
 *
 * After any action the invoice is re-fetched rather than patched locally.
 * Settlement is derived from payments and refunds server-side, so guessing the
 * new totals in the client is how the screen ends up disagreeing with the API
 * about how much is owed.
 */
export default function AdminInvoiceDetailPage() {
  const { id = '' } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setInvoice(await getInvoice(id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError(err instanceof ApiError ? err.message : 'Could not load this invoice.');
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getInvoice(id)
      .then((next) => {
        if (!cancelled) setInvoice(next);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiError ? err.message : 'Could not load this invoice.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  /** One place where an action runs, reports and reloads. */
  const run = useCallback(
    async (action: () => Promise<unknown>, failure: string) => {
      setBusy(true);
      setError(null);
      try {
        await action();
        await load();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : failure);
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  if (notFound) {
    return (
      <div className="max-w-[900px] mx-auto py-16 text-center">
        <h1 className="font-serif text-[26px] text-ink mb-2">Invoice not found</h1>
        <Link to="/admin/invoices" className="text-gold text-[14.5px] hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-ink/50 text-[15.5px] py-12 text-center">Loading invoice…</p>;
  }

  const can = (action: string) => invoice.allowed_actions.includes(action as never);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <Link
        to="/admin/invoices"
        className="inline-flex items-center gap-2 text-[13.5px] text-ink/60 hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} /> Invoices
      </Link>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* ── header ─────────────────────────────────────────── */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-[28px] text-ink leading-tight">
              {invoice.number ?? 'Draft invoice'}
            </h1>
            <p className="text-ink/55 text-[14.5px] font-light mt-1">
              Due {formatDate(invoice.due_at)}
              {invoice.issued_at && ` · Issued ${formatDate(invoice.issued_at)}`}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] ${INVOICE_STATUS_PILL[invoice.status]}`}
              >
                {INVOICE_STATUS_LABEL[invoice.status]}
              </span>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] ${SETTLEMENT_PILL[invoice.settlement]}`}
              >
                {SETTLEMENT_LABEL[invoice.settlement]}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Only once it has been issued. A draft has no number and is not
                a document yet — offering a PDF of one invites somebody to
                send a client a page that says DRAFT across it. */}
            {invoice.issued_at && (
              <a
                href={invoicePdfUrl(invoice.id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-canvas transition-colors"
              >
                <Download size={14} />
                PDF
              </a>
            )}
            {can('issue') && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() => issueInvoice(invoice.id), 'Could not issue this invoice.')
                }
                className="px-4 py-2 rounded-lg bg-gold text-ink text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-gold-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                Issue invoice
              </button>
            )}
            {can('void') && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() => voidInvoice(invoice.id), 'Could not void this invoice.')
                }
                className="px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
              >
                Void
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-ink/10">
          {[
            ['Total', invoice.total_minor],
            ['Paid', invoice.paid_minor],
            ['Outstanding', invoice.due_minor],
            ['Refunded', invoice.refunded_minor],
          ].map(([label, minor]) => (
            <div key={label as string}>
              <p className="text-[11.5px] uppercase tracking-[0.15em] text-ink/45 font-bold mb-1">
                {label}
              </p>
              <p className="font-serif text-[22px] text-ink tabular-nums">
                {formatMinor(minor as number, invoice.currency)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── line items ─────────────────────────────────────── */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
        <h2 className="font-serif text-[19.5px] text-ink px-6 pt-5 pb-3">Line items</h2>
        <table className="w-full text-left text-[14.5px]">
          <thead>
            <tr className="bg-canvas border-y border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[11.5px] font-bold">
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Unit</th>
              <th className="py-3 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {invoice.line_items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-6 text-ink">{item.description}</td>
                <td className="py-3 px-4 text-right tabular-nums text-ink/70">{item.quantity}</td>
                <td className="py-3 px-4 text-right tabular-nums text-ink/70">
                  {formatMinor(item.unit_amount_minor, invoice.currency)}
                </td>
                <td className="py-3 px-6 text-right tabular-nums font-semibold text-ink">
                  {formatMinor(item.amount_minor, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── payments ───────────────────────────────────────── */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-[19.5px] text-ink">Payments</h2>
          {can('record_payment') && (
            <RecordPaymentForm
              maxMinor={invoice.due_minor}
              currency={invoice.currency}
              disabled={busy}
              onSubmit={(amountMinor, method: PaymentMethod, reference) =>
                run(
                  () => recordPayment(invoice.id, { amount_minor: amountMinor, method, reference }),
                  'Could not record that payment.',
                )
              }
            />
          )}
        </div>

        {invoice.payments.length === 0 ? (
          <p className="text-ink/50 text-[14.5px] font-light">Nothing received yet.</p>
        ) : (
          <ul className="space-y-3">
            {invoice.payments.map((payment) => (
              <li key={payment.id} className="border border-ink/10 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-ink font-semibold tabular-nums">
                      {formatMinor(payment.amount_minor, invoice.currency)}
                      <span className="text-ink/50 font-normal text-[13.5px] ml-2">
                        {PAYMENT_METHOD_LABEL[payment.method]}
                        {payment.reference && ` · ${payment.reference}`}
                      </span>
                    </p>
                    <p className="text-[12.5px] text-ink/45 mt-0.5">
                      {formatDate(payment.created_at)}
                      {payment.refund_state !== 'none' &&
                        ` · ${REFUND_STATE_LABEL[payment.refund_state]}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] ${PAYMENT_STATUS_PILL[payment.status]}`}
                    >
                      {PAYMENT_STATUS_LABEL[payment.status]}
                    </span>

                    {/* Confirming is admin-only server-side. A creator sees the
                        button fail rather than never seeing it, which is honest:
                        the API is the authority, not this component. */}
                    {payment.status === 'pending' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => confirmPayment(payment.id),
                            'Could not confirm that payment.',
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-[12.5px] font-semibold uppercase tracking-[0.06em] hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Check size={12} /> Confirm
                      </button>
                    )}

                    {payment.refundable_minor > 0 && payment.status === 'confirmed' && (
                      <RefundForm
                        maxMinor={payment.refundable_minor}
                        currency={invoice.currency}
                        disabled={busy}
                        onSubmit={(amountMinor, reason) =>
                          run(
                            () =>
                              refundPayment(payment.id, {
                                amount_minor: amountMinor,
                                reason,
                              }),
                            'Could not record that refund.',
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {payment.refunds.length > 0 && (
                  <ul className="mt-3 pt-3 border-t border-ink/10 space-y-2">
                    {payment.refunds.map((refund) => (
                      <li
                        key={refund.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-[13.5px]"
                      >
                        <span className="text-ink/70">
                          <RotateCcw size={11} className="inline mr-1.5 -mt-0.5" />
                          {formatMinor(refund.amount_minor, invoice.currency)} — {refund.reason}
                        </span>
                        {refund.status === 'pending' ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => confirmRefund(refund.id),
                                'Could not confirm that refund.',
                              )
                            }
                            className="px-2.5 py-1 rounded border border-ink/15 text-ink/70 text-[11.5px] font-semibold uppercase tracking-[0.06em] hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Confirm refund
                          </button>
                        ) : (
                          <span className="text-ink/45 text-[12.5px] uppercase tracking-[0.06em]">
                            {refund.status}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
