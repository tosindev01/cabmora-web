import { useState, type FormEvent } from 'react';

import { Modal, Select } from '@cabmora/ui';
import { Plus } from 'lucide-react';

import type { PaymentMethod } from '@cabmora/api-client';

import { PAYMENT_METHOD_LABEL, formatMinor } from '@/features/billing/display';

interface Props {
  maxMinor: number;
  currency: string;
  disabled?: boolean;
  onSubmit: (
    amountMinor: number,
    method: PaymentMethod,
    reference: string | undefined,
  ) => Promise<void>;
}

/**
 * Log money received against an invoice.
 *
 * Card is absent from the method list on purpose: card payments arrive from the
 * gateway with a reference that can be verified, and the API refuses a
 * hand-entered one. Offering it here would only produce a 422.
 *
 * Amounts are entered in major units because that is what a person reads off a
 * bank statement, and converted at the boundary — the contract is minor units
 * everywhere else.
 */
const MANUAL_METHODS: PaymentMethod[] = ['bank_transfer', 'cash', 'other'];

export function RecordPaymentForm({ maxMinor, currency, disabled, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Rounded, not truncated: 42.4 pence is a typo, and Math.round keeps the
    // nearer penny rather than silently discarding it.
    const amountMinor = Math.round(Number(form.get('amount')) * 100);
    const reference = String(form.get('reference') ?? '').trim();

    setSubmitting(true);
    await onSubmit(amountMinor, form.get('method') as PaymentMethod, reference || undefined);
    setSubmitting(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gold/40 bg-gold/10 text-ink text-[12.5px] font-semibold uppercase tracking-[0.06em] hover:bg-gold/20 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Plus size={13} /> Record payment
      </button>

      {open && (
        <Modal open onOpenChange={setOpen} title="Record a payment" size="sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="payment-amount"
                className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/55 block"
              >
                Amount
              </label>
              <input
                id="payment-amount"
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
                {formatMinor(maxMinor, currency)} outstanding.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payment-method"
                className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/55 block"
              >
                Method
              </label>
              <Select
                id="payment-method"
                name="method"
                defaultValue="bank_transfer"
                className="w-full bg-canvas border border-ink/15 pl-3 pr-9 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg"
              >
                {MANUAL_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABEL[m]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payment-reference"
                className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/55 block"
              >
                Reference <span className="font-normal normal-case text-ink/40">(optional)</span>
              </label>
              <input
                id="payment-reference"
                name="reference"
                type="text"
                maxLength={255}
                placeholder="Bank reference"
                className="w-full bg-canvas border border-ink/15 px-3 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-lg"
              />
            </div>

            <p className="text-[13.5px] text-ink/55 leading-relaxed border-t border-ink/10 pt-4">
              This is recorded as awaiting confirmation. It does not count towards the balance until
              an administrator confirms the money arrived.
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
                {submitting ? 'Recording…' : 'Record payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
