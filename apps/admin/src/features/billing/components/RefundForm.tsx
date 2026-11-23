import { useState, type FormEvent } from 'react';

import { Modal } from '@cabmora/ui';
import { RotateCcw } from 'lucide-react';

import { formatMinor } from '@/features/billing/display';

interface Props {
  maxMinor: number;
  currency: string;
  disabled?: boolean;
  onSubmit: (amountMinor: number, reason: string) => Promise<void>;
}

/**
 * Give money back against one payment.
 *
 * A reason is required, not optional: it is shown to the customer and to
 * whoever reconciles the account, and "refund — no reason given" is the entry
 * nobody can explain a year later. The API enforces it too.
 */
export function RefundForm({ maxMinor, currency, disabled, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amountMinor = Math.round(Number(form.get('amount')) * 100);

    setSubmitting(true);
    await onSubmit(amountMinor, String(form.get('reason')));
    setSubmitting(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/15 text-ink/70 text-[12.5px] font-semibold uppercase tracking-[0.06em] hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RotateCcw size={12} /> Refund
      </button>

      {open && (
        <Modal open onOpenChange={setOpen} title="Refund this payment" size="sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="refund-amount"
                className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/55 block"
              >
                Amount
              </label>
              <input
                id="refund-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxMinor / 100}
                defaultValue={(maxMinor / 100).toFixed(2)}
                required
                autoFocus
                className="w-full bg-canvas border border-ink/15 px-3 py-2.5 text-[15.5px] tabular-nums outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-lg"
              />
              <p className="text-[12.5px] text-ink/45">
                {formatMinor(maxMinor, currency)} can still be refunded.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="refund-reason"
                className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/55 block"
              >
                Reason
              </label>
              <input
                id="refund-reason"
                name="reason"
                type="text"
                maxLength={500}
                required
                placeholder="Album downgraded to 30pp"
                className="w-full bg-canvas border border-ink/15 px-3 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-lg"
              />
            </div>

            <p className="text-[13.5px] text-ink/55 leading-relaxed border-t border-ink/10 pt-4">
              Recorded as pending. The balance only changes once an administrator confirms the money
              has gone back.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-[13.5px] font-medium hover:bg-canvas transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-gold text-ink text-[13.5px] font-semibold hover:bg-gold-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Recording…' : 'Record refund'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
