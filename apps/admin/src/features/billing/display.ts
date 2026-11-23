import { formatMinor } from '@/shared/format';

import type {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  RefundState,
  Settlement,
} from '@cabmora/api-client';

/**
 * Two status axes, shown separately.
 *
 * `InvoiceStatus` is where the document is; `Settlement` is how much has been
 * paid. A voided invoice is not "unpaid" and a paid one is still issued, so
 * collapsing them into one pill would misreport both.
 */
export { formatMinor };

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  void: 'Void',
};

export const INVOICE_STATUS_PILL: Record<InvoiceStatus, string> = {
  draft: 'bg-ink/8 text-ink/60 border border-ink/10',
  issued: 'bg-blue-50 text-blue-800 border border-blue-200',
  void: 'bg-ink/8 text-ink/40 border border-ink/10 line-through',
};

export const SETTLEMENT_LABEL: Record<Settlement, string> = {
  unpaid: 'Unpaid',
  part_paid: 'Part paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

export const SETTLEMENT_PILL: Record<Settlement, string> = {
  unpaid: 'bg-amber-50 text-amber-900 border border-amber-200',
  part_paid: 'bg-gold/20 text-ink border border-gold/40',
  paid: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  overdue: 'bg-red-50 text-red-800 border border-red-200',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  stripe_card: 'Card',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  other: 'Other',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

export const PAYMENT_STATUS_PILL: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-900 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  failed: 'bg-red-50 text-red-800 border border-red-200',
};

export const REFUND_STATE_LABEL: Record<RefundState, string> = {
  none: '',
  partial: 'Partially refunded',
  full: 'Refunded',
};

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
