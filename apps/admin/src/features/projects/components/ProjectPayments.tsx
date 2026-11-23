import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Download, FileText, Plus } from 'lucide-react';

import { formatMinor } from '@cabmora/ui';
import type { Invoice, PaymentRow, Project } from '@cabmora/api-client';

import { confirmPayment, invoicePdfUrl, listInvoices, listPayments } from '@/shared/billing/api';
import { ConfirmPaymentDialog } from '@/features/projects/components/ConfirmPaymentDialog';
import { RaiseInvoiceDialog } from '@/features/projects/components/RaiseInvoiceDialog';
import { formatDate } from '@/features/projects/display';

const SETTLEMENT: Record<Invoice['settlement'], string> = {
  unpaid: 'bg-ink/8 text-ink/60',
  part_paid: 'bg-amber-50 text-amber-900',
  paid: 'bg-emerald-50 text-emerald-800',
  overdue: 'bg-red-50 text-red-800',
};

/**
 * The money on one project: what has been billed, and what has arrived.
 *
 * This tab said "payments are not built yet" long after they were. The
 * endpoints existed, the invoices existed, and a client could be sent a bill
 * from a screen that told the person managing the shoot there was no such
 * thing.
 *
 * Pending payments sit at the top because they are the only thing here that
 * needs somebody to act. Everything else is a record.
 */
export function ProjectPayments({
  project,
  onConfirmed,
}: {
  project: Project;
  onConfirmed: () => void;
}) {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [confirming, setConfirming] = useState<PaymentRow | null>(null);
  const [raising, setRaising] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [bills, paid] = await Promise.all([
        listInvoices({ project_id: project.id, limit: 50 }),
        listPayments({ project_id: project.id, limit: 50 }),
      ]);
      setInvoices(bills.items);
      setPayments(paid.items);
    } catch {
      setInvoices([]);
    }
  }, [project.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pending = payments.filter((payment) => payment.status === 'pending');

  async function confirm(payment: PaymentRow) {
    setBusy(true);
    try {
      await confirmPayment(payment.id);
      await refresh();
      // The project is reloaded too: confirming can settle the balance, and
      // settling is what lifts the watermark — the settings tab and the
      // summary strip would otherwise still describe the old state.
      onConfirmed();
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  if (invoices === null) {
    return <p className="text-ink/50 text-[14.5px] py-8">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
          {invoices.length} invoice{invoices.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setRaising(true)}
          className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Raise an invoice
        </button>
      </div>

      {pending.length > 0 && (
        <section className="border border-gold/40 bg-gold/8 rounded-xl p-5">
          <h3 className="font-serif text-[18px] mb-1">Waiting on you</h3>
          <p className="text-[13.5px] text-ink/60 mb-4">
            {pending.length === 1
              ? 'A payment has been reported but not confirmed.'
              : `${pending.length} payments have been reported but not confirmed.`}{' '}
            Nothing counts until you have seen the money land.
          </p>
          <ul className="space-y-2">
            {pending.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-4 bg-white border border-ink/10 rounded-lg px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[14.5px] font-medium tabular-nums">
                    {formatMinor(payment.amount_minor, payment.currency)}
                  </p>
                  <p className="text-[12.5px] text-ink/50">
                    {payment.invoice_number ?? 'Invoice'} ·{' '}
                    {payment.reference ? `ref ${payment.reference}` : 'no reference given'} ·{' '}
                    {formatDate(payment.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirming(payment)}
                  className="shrink-0 px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-10 text-center">
          <FileText size={26} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
          <p className="text-[15.5px] text-ink/70 font-medium mb-1">Nothing billed yet</p>
          <p className="text-[14.5px] text-ink/50 max-w-[460px] mx-auto">
            Raise an invoice from Payment Management and it will appear here with whatever has been
            paid against it.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="bg-white border border-ink/10 rounded-xl shadow-xs p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[16px] font-medium">{invoice.number ?? 'Draft'}</p>
                  <p className="text-[12.5px] text-ink/50 mt-0.5">
                    {invoice.issued_at
                      ? `Issued ${formatDate(invoice.issued_at)} · due ${formatDate(invoice.due_at)}`
                      : 'Not issued'}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.06em] ${SETTLEMENT[invoice.settlement]}`}
                >
                  {invoice.settlement.replace('_', ' ')}
                </span>
              </div>

              <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-4 pt-3.5 border-t border-ink/8">
                <Figure label="Total" value={formatMinor(invoice.total_minor, invoice.currency)} />
                <Figure
                  label="Paid"
                  value={formatMinor(invoice.paid_minor, invoice.currency)}
                  tone={invoice.paid_minor > 0 ? 'text-emerald-700' : undefined}
                />
                <Figure
                  label="Outstanding"
                  value={formatMinor(invoice.due_minor, invoice.currency)}
                  tone={invoice.due_minor > 0 ? 'text-amber-800' : undefined}
                />
              </dl>

              <a
                href={invoicePdfUrl(invoice.id)}
                className="inline-flex items-center gap-2 mt-4 border border-ink/15 px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:border-gold hover:bg-canvas transition-colors"
              >
                <Download size={13} className="text-gold" />
                PDF
              </a>
            </li>
          ))}
        </ul>
      )}

      {payments.length > 0 && (
        <section className="bg-white border border-ink/10 rounded-xl shadow-xs p-5">
          <h3 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-3 flex items-center gap-2">
            <CreditCard size={14} className="text-gold" />
            Every payment
          </h3>
          <ul className="divide-y divide-ink/8">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[13.5px] tabular-nums">
                  {formatMinor(payment.amount_minor, payment.currency)}
                </span>
                <span className="text-[12.5px] text-ink/50">
                  {payment.method.replace('_', ' ')} · {formatDate(payment.created_at)} ·{' '}
                  {payment.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {raising && (
        <RaiseInvoiceDialog
          project={project}
          onRaised={() => {
            void refresh();
            // Issuing can change what the client is allowed to see, so the
            // page reloads too rather than only this tab.
            onConfirmed();
          }}
          onClose={() => setRaising(false)}
        />
      )}

      {confirming && (
        <ConfirmPaymentDialog
          project={project}
          payment={confirming}
          remainingMinor={
            (invoices.find((invoice) => invoice.id === confirming.invoice_id)?.due_minor ?? 0) -
            confirming.amount_minor
          }
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={() => void confirm(confirming)}
        />
      )}
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-[9.5px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-1">
        {label}
      </dt>
      <dd className={`text-[14px] font-medium tabular-nums ${tone ?? 'text-ink'}`}>{value}</dd>
    </div>
  );
}
