import { useEffect, useState } from 'react';
import { Building2, Download, FileText } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { formatMinor } from '@cabmora/ui';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { DeclarePaymentForm } from '@/features/client/components/DeclarePaymentForm';
import { PayByCardButton } from '@/features/client/components/PayByCardButton';
import { PayByTransferPanel } from '@/features/client/components/PayByTransferPanel';
import {
  formatDate,
  getPaymentInstructions,
  listMyInvoices,
  type ClientInvoice,
  type PaymentInstructions,
} from '@/features/client/api';

const SETTLEMENT: Record<ClientInvoice['settlement'], { label: string; pill: string }> = {
  unpaid: { label: 'Due', pill: 'bg-ink/8 text-ink/60' },
  part_paid: { label: 'Part paid', pill: 'bg-amber-50 text-amber-900' },
  paid: { label: 'Paid', pill: 'bg-emerald-50 text-emerald-800' },
  overdue: { label: 'Overdue', pill: 'bg-red-50 text-red-800' },
};

/**
 * What the client owes, and how to settle it.
 *
 * Replaces a placeholder. The API has served a customer their own invoices
 * for a while and the portal rendered "coming soon" over the top of it, so a
 * client could be emailed an invoice and then find nothing in the one place
 * they would look for it.
 */
export default function ClientBillingPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[] | null>(null);
  const [bank, setBank] = useState<PaymentInstructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);
  // Whether the gateway has issued this client an account for one of these
  // invoices. Once it has, the studio's own account comes off the screen:
  // two sets of bank details is how somebody pays into the one that nothing
  // is watching.
  const [gatewayIssued, setGatewayIssued] = useState(false);

  /* Back from the gateway. The browser returns the moment the card is
     accepted, and the webhook that actually settles the invoice arrives
     separately — usually within a second, occasionally not. So this says the
     payment went through and that we are confirming it, which is both true
     at this instant, rather than claiming a settled invoice the page may be
     about to render as still outstanding. */
  const justPaid = new URLSearchParams(window.location.search).has('paid');
  const [confirming, setConfirming] = useState(justPaid);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMyInvoices(), getPaymentInstructions()])
      .then(([page, instructions]) => {
        if (cancelled) return;
        setInvoices(page.items);
        setBank(instructions);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Could not load your billing.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloads]);

  // One look back, a few seconds later, to catch the webhook landing. A
  // single retry rather than a poll: if it has not arrived by then it is a
  // problem to be told about, not one to be hidden by a spinner that never
  // stops.
  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => {
      setReloads((n) => n + 1);
      setConfirming(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const open = (invoices ?? []).filter(
    (invoice) => invoice.status === 'issued' && invoice.due_minor > 0,
  );

  return (
    <ClientPortalShell title="Billing" subtitle="Your invoices and how to settle them">
      {confirming && (
        <div
          role="status"
          className="bg-forest-light/15 border border-forest/25 text-forest-dark px-5 py-3 rounded-xl text-[13px] mb-6"
        >
          Thank you — your payment went through. We are confirming it now, so the balance below may
          take a moment to catch up.
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[13px] mb-6"
        >
          {error}
        </div>
      )}

      {invoices === null ? (
        <p className="text-ink/50 text-[14px] py-12">Loading…</p>
      ) : invoices.length === 0 ? (
        <div className="border border-ink/10 bg-white rounded-xl p-12 text-center">
          <FileText size={28} className="mx-auto mb-4 text-gold" strokeWidth={1.5} />
          <p className="text-[14px] text-ink/55">
            Nothing to settle. Invoices appear here once we raise them.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Each invoice carries its own balance. Deliberately not summed
              here — money is added up by the API or not at all, and a total
              computed in a browser is one that can disagree with the bill. */}
          <section className="space-y-3">
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="border border-ink/10 bg-white rounded-xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-serif text-[20px] leading-tight">
                      {invoice.number ?? 'Draft invoice'}
                    </p>
                    <p className="text-[12.5px] text-ink/50 mt-1">
                      {invoice.issued_at
                        ? `Issued ${formatDate(invoice.issued_at)} · due ${formatDate(invoice.due_at)}`
                        : `Due ${formatDate(invoice.due_at)}`}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.06em] ${SETTLEMENT[invoice.settlement].pill}`}
                  >
                    {SETTLEMENT[invoice.settlement].label}
                  </span>
                </div>

                <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-5 pt-4 border-t border-ink/8">
                  <Figure
                    label="Total"
                    value={formatMinor(invoice.total_minor, invoice.currency)}
                  />
                  {invoice.paid_minor > 0 && (
                    <Figure
                      label="Paid"
                      value={formatMinor(invoice.paid_minor, invoice.currency)}
                      tone="text-emerald-700"
                    />
                  )}
                  <Figure
                    label="Outstanding"
                    value={formatMinor(invoice.due_minor, invoice.currency)}
                    tone={invoice.due_minor > 0 ? 'text-amber-800' : 'text-ink'}
                  />
                </dl>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  {/* `?save=1`, because a control labelled "Download PDF"
                      that opens a viewer is a control that lies. The server
                      answers with an `attachment` disposition rather than
                      this relying on the `download` attribute below, which
                      browsers honour only for same-origin URLs. */}
                  <a
                    href={`/api/v1/invoices/${invoice.id}/pdf?save=1`}
                    download
                    className="flex items-center gap-2 border border-ink/15 text-ink px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:border-gold hover:bg-canvas transition-colors"
                  >
                    <Download size={14} className="text-gold" />
                    Download PDF
                  </a>
                  {invoice.status === 'issued' && invoice.due_minor > 0 && (
                    <>
                      <PayByCardButton invoice={invoice} />
                      <PayByTransferPanel
                        invoice={invoice}
                        onIssued={() => setGatewayIssued(true)}
                      />
                      <DeclarePaymentForm invoice={invoice} />
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>

          {open.length > 0 && !gatewayIssued && (
            <section className="border border-ink/10 bg-white rounded-xl p-6">
              <h2 className="font-serif text-[20px] mb-1 flex items-center gap-2">
                <Building2 size={18} className="text-gold" />
                How to pay
              </h2>
              {bank ? (
                <>
                  <p className="text-[13.5px] text-ink/60 mb-4">
                    Bank transfer to <strong className="font-semibold">{bank.account_name}</strong>.
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Detail label="Bank" value={bank.bank_name} />
                    <Detail label="Sort code" value={bank.sort_code} />
                    <Detail label="Account number" value={bank.account_number} />
                    {bank.iban && <Detail label="IBAN" value={bank.iban} />}
                  </dl>
                  {/* The operationally important line. Without it a transfer
                      arrives as an amount from a name and somebody has to
                      guess which invoice it settles. */}
                  <p className="text-[13.5px] text-ink/75 mt-4 bg-canvas rounded-lg px-3.5 py-3">
                    Please quote the invoice number as the reference:{' '}
                    <strong className="font-semibold">{open[0]!.number}</strong> for the one above.
                    Once you have sent it, tell us with <em>I have paid this</em> and we will
                    confirm it as soon as it lands.
                  </p>
                </>
              ) : (
                <p className="text-[13.5px] text-ink/60">
                  Get in touch and we will send you payment details.
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </ClientPortalShell>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas rounded-lg px-3.5 py-3">
      <dt className="text-[9.5px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-1">
        {label}
      </dt>
      <dd className="text-[14px] font-medium tabular-nums select-all">{value}</dd>
    </div>
  );
}
