import type { Settlement } from '@cabmora/api-client';

/**
 * Customer-facing wording for invoice state.
 *
 * Separate from the admin console's copy rather than shared: the customer never
 * sees a draft or a void invoice, and "Part paid" reads as bookkeeping to
 * someone who just wants to know what they owe. Duplicating four short strings
 * is cheaper than one vocabulary that suits neither audience — the same reason
 * each feature carries its own `display.ts`.
 */
export const SETTLEMENT_LABEL: Record<Settlement, string> = {
  unpaid: 'Due',
  part_paid: 'Partly paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

export const SETTLEMENT_PILL: Record<Settlement, string> = {
  unpaid: 'bg-amber-50 text-amber-900 border border-amber-200',
  part_paid: 'bg-gold/20 text-ink border border-gold/40',
  paid: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  overdue: 'bg-red-50 text-red-800 border border-red-200',
};

/** Divided only here, at the edge — see the API's integer minor units. */
export function formatMinor(minor: number, currency = 'GBP'): string {
  return (minor / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
