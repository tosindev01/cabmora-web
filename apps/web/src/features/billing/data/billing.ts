export type InvoiceStatus = 'Paid' | 'Outstanding' | 'Overdue';

export interface Invoice {
  id: string;
  client: string;
  project: string;
  issued: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  invoice: string;
}

export interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export const INVOICES: Invoice[] = [
  {
    id: 'INV-2025-042',
    client: 'Jane Smith',
    project: 'Smith & Wesson Wedding',
    issued: 'Sep 15, 2025',
    due: 'Oct 01, 2025',
    amount: 4250,
    status: 'Outstanding',
  },
  {
    id: 'INV-2025-041',
    client: 'Elena Rodriguez',
    project: "Elena's Editorial Shoot",
    issued: 'Aug 20, 2025',
    due: 'Sep 05, 2025',
    amount: 1200,
    status: 'Paid',
  },
  {
    id: 'INV-2025-040',
    client: 'TechCorp Inc.',
    project: 'Corporate Event - TechCorp',
    issued: 'Aug 10, 2025',
    due: 'Aug 25, 2025',
    amount: 3500,
    status: 'Overdue',
  },
  {
    id: 'INV-2025-039',
    client: 'Jane Smith',
    project: 'Smith & Wesson Wedding',
    issued: 'Jan 15, 2025',
    due: 'Jan 30, 2025',
    amount: 4250,
    status: 'Paid',
  },
];

export const PAYMENT_HISTORY: Payment[] = [
  {
    id: 'PAY-98234',
    date: 'Aug 22, 2025',
    amount: 1200,
    method: 'Visa ending in 4242',
    invoice: 'INV-2025-041',
  },
  {
    id: 'PAY-98233',
    date: 'Jan 18, 2025',
    amount: 4250,
    method: 'Bank Transfer',
    invoice: 'INV-2025-039',
  },
  {
    id: 'PAY-98232',
    date: 'Dec 10, 2024',
    amount: 850,
    method: 'Mastercard ending in 8812',
    invoice: 'INV-2024-112',
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '8812', expiry: '08/25', isDefault: false },
];

/** Badge colours keyed by status, so the page has no switch statement. */
export const INVOICE_STATUS_STYLE: Record<InvoiceStatus, string> = {
  Paid: 'bg-green-100 text-green-800',
  Outstanding: 'bg-blue-100 text-blue-800',
  Overdue: 'bg-red-100 text-red-800',
};
