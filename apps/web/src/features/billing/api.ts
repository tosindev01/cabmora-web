import { apiFetch, fetchPage } from '@cabmora/api-client';
import type { Invoice, InvoiceDetail } from '@cabmora/api-client';

/**
 * The customer's own invoices, and paying one.
 *
 * Three calls, deliberately. Everything that *changes* an invoice is staff-only
 * and lives in `apps/admin`; this app can read what it owns and start a
 * payment. The API scopes all three to the signed-in customer, so there is no
 * customer id to pass and nothing here to get wrong.
 */

export interface Checkout {
  checkout_url: string;
  reference: string;
  amount_minor: number;
}

export const listMyInvoices = (
  params: Record<string, string | number | boolean | undefined> = {},
) => fetchPage<Invoice>('/invoices', params);

export const getMyInvoice = (id: string) => apiFetch<InvoiceDetail>(`/invoices/${id}`);

/** Omit `amountMinor` to pay the whole outstanding balance. */
export const startCheckout = (id: string, amountMinor?: number) =>
  apiFetch<Checkout>(`/invoices/${id}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ amount_minor: amountMinor }),
  });

/**
 * An account the gateway issued for this customer, which it reconciles itself.
 *
 * Not the studio's own account — that is `PaymentInstructions`, the same for
 * everybody and printed on the invoice. This one belongs to one client, so it
 * is never cached, never shared, and fetched only when they ask to see it.
 */
export interface BankTransferFunding {
  reference: string;
  account_holder_name: string;
  sort_code: string;
  account_number: string;
  /** Must be quoted on the transfer, or the gateway falls back to matching on
   *  the exact amount — which settles the wrong invoice when two match. */
  payment_reference: string;
  amount_minor: number;
  hosted_instructions_url: string | null;
}

/** POST, not GET: it opens a payment at the gateway, and the first call for a
 *  given client also creates them there. A prefetcher must not fire it. */
export const startBankTransfer = (id: string, amountMinor?: number) =>
  apiFetch<BankTransferFunding>(`/invoices/${id}/bank-transfer`, {
    method: 'POST',
    body: JSON.stringify({ amount_minor: amountMinor }),
  });
