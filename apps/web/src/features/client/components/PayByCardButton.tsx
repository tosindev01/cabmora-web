import { CreditCard } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import { startCheckout } from '@/features/billing/api';
import type { ClientInvoice } from '@/features/client/api';

/**
 * Pay this invoice with a card, through the gateway's own hosted page.
 *
 * Hosted rather than a card form here, and that is the whole point: no card
 * number ever reaches Cabmora's code, which is the difference between a
 * payment integration and a compliance problem.
 *
 * Sits beside declaring a bank transfer rather than replacing it. A wedding
 * invoice is often paid by transfer, and the studio confirms those by hand —
 * taking that away to offer cards would be a worse service, not a better one.
 */
export function PayByCardButton({ invoice }: { invoice: ClientInvoice }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const { checkout_url } = await startCheckout(invoice.id);
      // A full navigation, not a new tab. The gateway sends them back here
      // afterwards, and a popup would strand the return on a tab the reader
      // has already lost track of.
      window.location.assign(checkout_url);
    } catch (err) {
      // The server's sentence. Card payments fail for reasons worth reading —
      // an invoice already settled, an amount above what is outstanding.
      setError(err instanceof ApiError ? err.message : 'Card payment could not be started.');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void pay()}
        disabled={busy}
        className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-noir transition-colors disabled:opacity-60"
      >
        <CreditCard size={14} className="text-gold" />
        {busy ? 'Taking you to pay…' : 'Pay by card'}
      </button>
      {error && <p className="w-full text-[12.5px] text-red-700">{error}</p>}
    </>
  );
}
