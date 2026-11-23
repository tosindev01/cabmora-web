import { useState } from 'react';
import {
  DollarSign,
  Search,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { useAdmin, Transaction } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Modal } from '@cabmora/ui';

export default function AdminPaymentManagementPage() {
  const { transactions, issueRefund } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  const totalGross = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const refundedAmount = transactions
    .filter((t) => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.gateway.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Payment & Invoice Management
            </h1>
            <p className="text-ink/60 text-[14px]">
              Display platform transactions, client invoices, gateway payouts, issue refunds, and
              review financial summaries.
            </p>
          </div>
        </div>

        {/* Revenue Summaries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Cleared Revenue Volume
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-ink">
              ${totalGross.toLocaleString()}
            </div>
            <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-2 pt-2 border-t border-ink/5">
              <CheckCircle2 size={14} /> Processed via Stripe & PayPal
            </div>
          </div>

          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Pending Invoices / Wire
              </span>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Clock size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-amber-700">
              ${pendingAmount.toLocaleString()}
            </div>
            <div className="text-[12px] text-amber-700 mt-2 pt-2 border-t border-ink/5">
              Awaiting client bank transfer clearance
            </div>
          </div>

          <div className="bg-white p-6 border border-ink/10 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink/50">
                Total Refunded Volume
              </span>
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                <RotateCcw size={20} />
              </div>
            </div>
            <div className="font-sans text-[32px] font-medium text-ink">
              ${refundedAmount.toLocaleString()}
            </div>
            <div className="text-[12px] text-ink/50 mt-2 pt-2 border-t border-ink/5">
              Admin approved client refunds
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer name, or gateway..."
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/50">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-canvas border border-ink/15 px-3 py-2 text-[12px] font-medium outline-none focus:border-gold rounded-lg"
            >
              <option value="All">All Transactions ({transactions.length})</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[10px] font-bold">
                  <th className="py-4 px-5">Invoice ID</th>
                  <th className="py-4 px-4">Client Name</th>
                  <th className="py-4 px-4">Assigned Creator</th>
                  <th className="py-4 px-4">Gateway</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-canvas transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-ink">{t.invoiceId}</td>
                    <td className="py-4 px-4 font-semibold text-ink">{t.customerName}</td>
                    <td className="py-4 px-4 text-ink/70">{t.creatorName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded bg-canvas border border-ink/10 text-[11px] font-semibold text-ink">
                        {t.gateway}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[14px] text-ink">
                      ${t.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          t.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : t.status === 'Pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-ink/60 text-[12px]">{t.date}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(t)}
                          className="px-2.5 py-1 text-[11px] font-semibold border border-ink/15 rounded hover:bg-canvas flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={13} /> View Invoice
                        </button>

                        {t.status === 'Paid' && (
                          <button
                            onClick={() => {
                              if (
                                confirm(`Issue refund of $${t.amount} for invoice ${t.invoiceId}?`)
                              ) {
                                issueRefund(t.id);
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-purple-100 text-purple-900 hover:bg-purple-200 rounded transition-colors cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      {selectedInvoice && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setSelectedInvoice(null))();
          }}
          size="sm"
          title={<>{selectedInvoice.invoiceId}</>}
          description="INVOICE STATEMENT"
        >
          <div className="space-y-4 text-[13px]">
            <div className="p-4 bg-canvas border border-ink/10 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-ink/60">Billed To:</span>
                <strong className="text-ink">{selectedInvoice.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Creator Service:</span>
                <strong className="text-ink">{selectedInvoice.creatorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Payment Gateway:</span>
                <strong className="text-ink">{selectedInvoice.gateway}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Payment Date:</span>
                <strong className="text-ink">{selectedInvoice.date}</strong>
              </div>
            </div>

            <div className="p-4 border border-ink/10 rounded-lg space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-ink/50">
                Itemized Line Item
              </div>
              <div className="flex justify-between font-medium text-ink">
                <span>{selectedInvoice.description}</span>
                <span>${selectedInvoice.amount.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-ink/10 flex justify-between font-sans text-[18px]">
                <span>Total Amount</span>
                <span className="font-bold text-ink">
                  ${selectedInvoice.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => alert(`Downloading PDF Invoice for ${selectedInvoice.invoiceId}...`)}
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
