import { useState } from 'react';
import { Check, Send } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { Modal, formatMinor } from '@cabmora/ui';

import { declareMyPayment, type ClientInvoice } from '@/features/client/api';

/**
 * The client saying they have sent a payment.
 *
 * Nothing it does settles anything. The record lands pending and an
 * administrator has to confirm the money arrived — which is exactly why it is
 * safe to put this in front of the person who owes it. What it buys them is a
 * way to show they have done their part, instead of a transfer sent on a
 * Friday being invisible until somebody reconciles the bank.
 *
 * Part payments are the normal case rather than the exception: a deposit now
 * and the balance later is how most of this work is actually paid for, so the
 * amount defaults to the full balance and is editable down.
 */
export function DeclarePaymentForm({ invoice }: { invoice: ClientInvoice }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(() => (invoice.due_minor / 100).toFixed(2));
  const [reference, setReference] = useState(invoice.number ?? '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    // Pounds to pence at the edge, and only here: every figure that travels
    // or is stored is an integer.
    const minor = Math.round(Number(amount) * 100);
    if (!Number.isFinite(minor) || minor <= 0) {
      setError('Enter the amount you sent.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await declareMyPayment(invoice.id, {
        amount_minor: minor,
        method: 'bank_transfer',
        reference: reference.trim() || undefined,
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Could not record that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors cursor-pointer"
      >
        <Send size={13} />I have paid this
      </button>

      {open && (
        <Modal
          open
          onOpenChange={(next) => !next && setOpen(false)}
          title={done ? 'Thank you' : 'Tell us about your payment'}
          size="sm"
        >
          {done ? (
            <p className="flex gap-3 text-[14px] leading-relaxed text-ink/75">
              <Check size={16} className="text-emerald-600 flex-shrink-0 mt-1" />
              <span>
                We have made a note of it. Your balance updates once we have seen the money land. we
                check every working day, and nothing needs chasing from you in the meantime.
              </span>
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-[13.5px] text-ink/60 leading-relaxed">
                This tells us to look out for it. Your balance changes once we have confirmed the
                money arrived, not before.
              </p>

              <label className="block">
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                  How much did you send?
                </span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-gold tabular-nums"
                />
                <span className="block text-[12px] text-ink/45 mt-1.5">
                  {formatMinor(invoice.due_minor, invoice.currency)} is outstanding. Part payments
                  are fine. Send what you have agreed and tell us the amount.
                </span>
              </label>

              <label className="block">
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                  Reference you used
                </span>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  maxLength={255}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-gold"
                />
              </label>

              {error && <p className="text-[13px] text-red-700">{error}</p>}

              <div className="flex items-center gap-2 border-t border-ink/10 pt-4">
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy}
                  className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Sending…' : 'Tell them'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
