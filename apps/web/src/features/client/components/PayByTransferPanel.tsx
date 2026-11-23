import { Landmark } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@cabmora/api-client';
import { formatMinor } from '@cabmora/ui';

import { startBankTransfer, type BankTransferFunding } from '@/features/billing/api';
import type { ClientInvoice } from '@/features/client/api';

/**
 * Show this client the account the gateway issued them for this invoice.
 *
 * The account number is theirs and stays theirs across every invoice, which
 * is the entire mechanism: the gateway knows whose money arrived because of
 * which account it arrived in, so the payment settles itself and nobody at
 * the studio has to reconcile it by hand.
 *
 * Fetched on click rather than with the page. Asking opens a payment at the
 * gateway and, the first time, creates the customer there — neither of which
 * should happen because somebody scrolled past a billing screen.
 *
 * Deliberately *not* rendered as a second "how to pay" block alongside the
 * studio's own account. Two sets of bank details on one screen is how a
 * client pays into the one that nothing is watching.
 */
export function PayByTransferPanel({
  invoice,
  onIssued,
}: {
  invoice: ClientInvoice;
  /** Called once the gateway has issued an account, so the page can stop
   *  showing the studio's own — see the note above about two sets of
   *  details on one screen. */
  onIssued?: () => void;
}) {
  const [funding, setFunding] = useState<BankTransferFunding | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      setFunding(await startBankTransfer(invoice.id));
      onIssued?.();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Transfer details could not be prepared.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (funding) {
    return (
      <div className="w-full border border-ink/10 bg-canvas rounded-xl p-5 mt-1">
        <p className="text-[13.5px] text-ink/70 mb-4">
          Transfer{' '}
          <strong className="font-semibold tabular-nums">
            {formatMinor(funding.amount_minor, invoice.currency)}
          </strong>{' '}
          to the account below. It is yours, so you can reuse it for future invoices.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account name" value={funding.account_holder_name} />
          <Field label="Sort code" value={funding.sort_code} />
          <Field label="Account number" value={funding.account_number} />
          <Field label="Reference" value={funding.payment_reference} />
        </dl>
        {/* The one instruction that cannot be dropped. Without the reference
            the gateway matches on the exact amount instead, and two clients
            owing the same figure is not a rare coincidence on a price list. */}
        <p className="text-[13px] text-ink/75 mt-4 bg-white rounded-lg px-3.5 py-3">
          Please use <strong className="font-semibold">{funding.payment_reference}</strong> as
          the payment reference. We are told automatically when it arrives — there is no
          need to let us know.
        </p>
        {funding.hosted_instructions_url && (
          <a
            href={funding.hosted_instructions_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[12.5px] text-ink/60 underline mt-3 hover:text-ink"
          >
            View these details on a secure page
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void reveal()}
        disabled={busy}
        className="flex items-center gap-2 border border-ink/15 text-ink px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:border-gold hover:bg-canvas transition-colors disabled:opacity-60"
      >
        <Landmark size={14} className="text-gold" />
        {busy ? 'Preparing…' : 'Pay by transfer'}
      </button>
      {error && <p className="w-full text-[12.5px] text-red-700">{error}</p>}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9.5px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-1">
        {label}
      </dt>
      <dd className="text-[14px] font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
