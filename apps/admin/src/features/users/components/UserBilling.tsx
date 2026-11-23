import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { formatMinor } from '@cabmora/ui';
import type { BillingStats, Invoice, User } from '@cabmora/api-client';

import { listInvoices } from '@/shared/billing/api';
import { getBillingStats } from '@/shared/analytics/api';

function onDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const SETTLEMENT: Record<Invoice['settlement'], { label: string; pill: string }> = {
  unpaid: { label: 'Unpaid', pill: 'bg-ink/8 text-ink/60' },
  part_paid: { label: 'Part paid', pill: 'bg-amber-50 text-amber-900' },
  paid: { label: 'Paid', pill: 'bg-emerald-50 text-emerald-800' },
  overdue: { label: 'Overdue', pill: 'bg-red-50 text-red-800' },
};

/**
 * What this client has been billed, and what is still owed.
 *
 * Totals come from the API's own figures rather than being added up from the
 * page of invoices below them: a sum over whatever happened to be fetched is
 * right until the day there are more invoices than the page holds, and then
 * it is quietly wrong on a screen somebody uses to chase money.
 *
 * Only for customers. A creator's money runs the other way — earnings and
 * payouts — and showing them a client's billing panel would invite reading
 * one as the other.
 */
export function UserBilling({ user }: { user: User }) {
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBillingStats(user.id), listInvoices({ customer_id: user.id, limit: 20 })])
      .then(([totals, page]) => {
        if (cancelled) return;
        setStats(totals);
        setInvoices(page.items);
      })
      .catch(() => {
        if (!cancelled) setInvoices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
      <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-1">
        Charges
      </h2>
      <p className="text-ink/55 text-[14.5px] mb-4">
        Everything raised against this client, and what is still outstanding.
      </p>

      {stats && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Figure label="Billed" value={formatMinor(stats.paid_minor + stats.outstanding_minor)} />
          <Figure label="Paid" value={formatMinor(stats.paid_minor)} tone="text-emerald-700" />
          <Figure
            label="Outstanding"
            value={formatMinor(stats.outstanding_minor)}
            tone={stats.outstanding_minor > 0 ? 'text-amber-800' : undefined}
          />
          {/* Reported but not yet confirmed. Shown so a balance that looks
              unpaid is not chased when the client has already sent it. */}
          <Figure
            label="Awaiting confirmation"
            value={formatMinor(stats.pending_minor)}
            tone={stats.pending_minor > 0 ? 'text-ink' : 'text-ink/40'}
          />
        </dl>
      )}

      {stats && stats.overdue_count > 0 && (
        <p className="text-[14px] text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5">
          {stats.overdue_count} invoice{stats.overdue_count === 1 ? ' is' : 's are'} past their due
          date.
        </p>
      )}

      {invoices === null ? (
        <p className="text-[14.5px] text-ink/50 py-2">Checking…</p>
      ) : invoices.length === 0 ? (
        <p className="text-[14.5px] text-ink/50 py-2">Nothing has been billed to this client.</p>
      ) : (
        <ul className="divide-y divide-ink/8 border-y border-ink/8">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="flex items-center justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <Link
                  to={`/admin/payments`}
                  className="text-[14.5px] text-ink hover:text-gold transition-colors"
                >
                  {invoice.number ?? 'Draft invoice'}
                </Link>
                <p className="text-[13px] text-ink/50">
                  {invoice.issued_at ? `Issued ${onDate(invoice.issued_at)}` : 'Not issued'} · due{' '}
                  {onDate(invoice.due_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[14.5px] tabular-nums">
                  {formatMinor(invoice.due_minor, invoice.currency)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${SETTLEMENT[invoice.settlement].pill}`}
                >
                  {SETTLEMENT[invoice.settlement].label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.12em] uppercase text-ink/45 font-bold mb-1">
        {label}
      </dt>
      <dd className={`text-[18px] font-medium tabular-nums ${tone ?? 'text-ink'}`}>{value}</dd>
    </div>
  );
}
