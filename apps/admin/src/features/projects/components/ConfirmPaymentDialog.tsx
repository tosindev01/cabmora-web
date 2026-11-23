import { AlertTriangle, ArrowRight, Eye, Stamp } from 'lucide-react';
import type { ReactNode } from 'react';

import { Modal, formatMinor, nameCase } from '@cabmora/ui';
import type { Project } from '@cabmora/api-client';

import type { PaymentRow } from '@cabmora/api-client';

interface Props {
  project: Project;
  payment: PaymentRow;
  /** What would still be owed once this one counts. */
  remainingMinor: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * The step between "the client says they paid" and the money being real.
 *
 * Confirming used to be a single click on a row, and it was the right size of
 * gesture when it only moved a figure. It is not any more: since the
 * watermark lifts on payment, confirming the last part of a balance is also
 * the moment a client stops seeing proofs and starts holding the finished
 * files. That is not something to discover afterwards.
 *
 * Deliberately not reversible-sounding. There is no unconfirm — money that
 * went in by mistake comes back out as a refund, with its own date and
 * reason, because an audit trail you can edit is not one.
 */
export function ConfirmPaymentDialog({
  project,
  payment,
  remainingMinor,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  const client = project.customer_name ? nameCase(project.customer_name) : 'The client';
  const settles = remainingMinor <= 0;
  // Only a policy that waits on payment changes anything here. `always` and
  // `never` are unaffected, and saying otherwise would be noise.
  const liftsWatermark = settles && project.watermark_policy === 'until_paid';
  const opensGallery = settles && project.require_payment_before_delivery;

  return (
    <Modal
      open
      onOpenChange={(next) => !next && onCancel()}
      title={`Confirm ${formatMinor(payment.amount_minor)} from ${client}?`}
      size="md"
    >
      <div className="space-y-3.5">
        <Consequence icon={Eye}>
          This records the money as received.{' '}
          <strong className="font-semibold">Only do it once you have seen it land</strong> — a
          confirmed payment is not undone, it is refunded.
        </Consequence>

        {settles ? (
          <Consequence icon={ArrowRight}>
            It settles the invoice in full. Nothing further is outstanding.
          </Consequence>
        ) : (
          <Consequence icon={ArrowRight}>
            {formatMinor(remainingMinor)} would still be outstanding afterwards, so this is a part
            payment and the project stays unsettled.
          </Consequence>
        )}

        {liftsWatermark && (
          <Consequence icon={Stamp} tone="amber">
            <strong className="font-semibold">The watermark comes off.</strong> This project hands
            over the originals once it is paid for, so {client} will be holding the full-resolution
            files the moment you confirm this.
          </Consequence>
        )}

        {opensGallery && (
          <Consequence icon={AlertTriangle} tone="amber">
            The gallery opens. Delivery is held until the balance is paid on this project, and this
            is the payment that releases it.
          </Consequence>
        )}

        {payment.reference && (
          <Consequence icon={Eye} muted>
            Sent with the reference <strong className="font-semibold">{payment.reference}</strong>.
            Worth checking that against the bank before confirming.
          </Consequence>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-ink/10 pt-4 mt-6">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
        >
          {busy ? 'Confirming…' : 'I have seen it land'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function Consequence({
  icon: Icon,
  tone,
  muted,
  children,
}: {
  icon: typeof Eye;
  tone?: 'amber';
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={`flex gap-3 text-[13.5px] leading-relaxed rounded-lg ${
        tone === 'amber'
          ? 'bg-amber-50 border border-amber-200 text-amber-900 p-3'
          : muted
            ? 'text-ink/55'
            : 'text-ink/75'
      }`}
    >
      <Icon
        size={15}
        className={`flex-shrink-0 mt-[3px] ${tone === 'amber' ? 'text-amber-700' : 'text-gold'}`}
      />
      <span>{children}</span>
    </p>
  );
}
