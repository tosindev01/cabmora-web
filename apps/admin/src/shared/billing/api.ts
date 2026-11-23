import { apiFetch, apiUrl, fetchPage } from '@cabmora/api-client';
import type {
  Invoice,
  InvoiceDetail,
  Payment,
  PaymentMethod,
  PaymentRow,
  Refund,
} from '@cabmora/api-client';

/**
 * The staff side of billing: raising, issuing, settling and refunding.
 *
 * Lives here rather than in `@cabmora/api-client` because these endpoints are
 * admin-and-creator only — `apps/web` never calls them, and putting them in the
 * shared package would ship them into the public bundle. The *types* are shared
 * there; the calls are not. Same split as projects, users and enquiries.
 */

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unit_amount_minor: number;
}

export interface InvoiceCreateBody {
  project_id: string;
  due_at: string;
  line_items: InvoiceLineItemInput[];
  customer_id?: string;
  currency?: string;
  notes?: string;
}

// Parameter type matches `listProjects`: `usePaginatedList` passes
// `FilterValue`, which includes boolean.
export const listInvoices = (params: Record<string, string | number | boolean | undefined>) =>
  fetchPage<Invoice>('/admin/invoices', params);

export const getInvoice = (id: string) => apiFetch<InvoiceDetail>(`/admin/invoices/${id}`);

export const createInvoice = (body: InvoiceCreateBody) =>
  apiFetch<InvoiceDetail>('/admin/invoices', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** Separate from creation so the number is only burned when it is really sent. */
export const issueInvoice = (id: string) =>
  apiFetch<InvoiceDetail>(`/admin/invoices/${id}/issue`, { method: 'POST' });

export const voidInvoice = (id: string) =>
  apiFetch<InvoiceDetail>(`/admin/invoices/${id}/void`, { method: 'POST' });

/** Bank transfer, cash or other. Card payments arrive from the gateway. */
export const recordPayment = (
  invoiceId: string,
  body: { amount_minor: number; method: PaymentMethod; reference?: string },
) =>
  apiFetch<Payment>(`/admin/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** Admin-only server-side: the control that makes creator self-billing safe. */
export const confirmPayment = (paymentId: string) =>
  apiFetch<Payment>(`/admin/payments/${paymentId}/confirm`, { method: 'POST' });

export const refundPayment = (paymentId: string, body: { amount_minor: number; reason: string }) =>
  apiFetch<Refund>(`/admin/payments/${paymentId}/refunds`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const confirmRefund = (refundId: string) =>
  apiFetch<Refund>(`/admin/refunds/${refundId}/confirm`, { method: 'POST' });

/**
 * Every payment received, with the invoice and people it belongs to.
 *
 * Payment-centric rather than invoice-centric because that is what the payments
 * screen shows: one row per movement of money, not one per document.
 */
export const listPayments = (params: Record<string, string | number | boolean | undefined>) =>
  fetchPage<PaymentRow>('/admin/payments', params);

/**
 * Where an invoice's PDF lives.
 *
 * A URL rather than a fetch: the browser streams the file, names it from the
 * response's Content-Disposition and offers to save it. Pulling the bytes
 * into JavaScript first would mean holding the document in memory to hand it
 * straight back to the browser.
 */
export const invoicePdfUrl = (invoiceId: string) => apiUrl(`/admin/invoices/${invoiceId}/pdf`);

/**
 * Money the gateway holds against a customer and against no invoice.
 *
 * Not a payment, and kept out of `listPayments` for that reason: a row here
 * has settled nothing, belongs to no invoice, and must never be totalled in
 * with money that has. `customer_name` is null when the gateway customer
 * matches no account — a real case, not a failed lookup.
 */
export interface UnmatchedFunds {
  id: string;
  amount_minor: number;
  currency: string;
  received_at: string;
  gateway_customer_reference: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  handled_at: string | null;
  note: string | null;
}

export const listUnmatchedFunds = (
  params: Record<string, string | number | boolean | undefined>,
) => fetchPage<UnmatchedFunds>('/admin/unmatched-funds', params);

/**
 * Record that somebody looked into it.
 *
 * Says nothing about where the money went — nothing in this console can move
 * it. The gateway applies a credit itself once a matching payment exists, so
 * this is a note on a row, and the copy around the button has to say so.
 */
export const markFundsHandled = (id: string, note: string) =>
  apiFetch<UnmatchedFunds>(`/admin/unmatched-funds/${id}/handled`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
