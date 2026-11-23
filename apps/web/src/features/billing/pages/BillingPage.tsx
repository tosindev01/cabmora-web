import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  HardDrive,
  MoreVertical,
  Plus,
  Settings,
} from 'lucide-react';

import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import {
  INVOICES,
  INVOICE_STATUS_STYLE,
  PAYMENT_HISTORY,
  PAYMENT_METHODS,
  type InvoiceStatus,
} from '@/features/billing/data';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';

const STATUS_ICON: Record<InvoiceStatus, ReactElement> = {
  Paid: <CheckCircle2 size={14} className="text-green-600" />,
  Outstanding: <Clock size={14} className="text-blue-600" />,
  Overdue: <AlertCircle size={14} className="text-red-600" />,
};

type BillingTab = 'invoices' | 'history';

const TABS: { id: BillingTab; label: string }[] = [
  { id: 'invoices', label: 'Invoices' },
  { id: 'history', label: 'Payment History' },
];

const CARD = 'bg-white border border-ink/5 rounded-xl shadow-sm';
const TABLE_HEAD =
  'bg-canvas border-b border-ink/5 text-[11px] uppercase tracking-[0.1em] text-ink/50';
const ICON_BUTTON =
  'w-8 h-8 rounded-full flex items-center justify-center text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>('invoices');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar title="Billing & Payments" onToggleSidebar={toggleSidebar}>
            <PortalBell />
            <PortalAvatar src={AVATAR} />
          </PortalTopbar>

          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto space-y-8">
              {/* Overview stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Outstanding Balance" value="$7,750">
                  <span className="text-red-600 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    $3,500 overdue
                  </span>
                </StatCard>
                <StatCard label="Total Revenue (YTD)" value="$42,500">
                  <span className="text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    +15% from last year
                  </span>
                </StatCard>
                <StatCard label="Next Expected Payment" value="$4,250">
                  <span className="text-ink/60 flex items-center gap-1.5">
                    <Clock size={14} />
                    Due Oct 01, 2025
                  </span>
                </StatCard>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-6 border-b border-ink/10">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-selected={activeTab === tab.id}
                        className={`pb-4 text-[14px] font-medium transition-colors relative ${
                          activeTab === tab.id ? 'text-ink' : 'text-ink/50 hover:text-ink'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'invoices' && (
                    <section className={`${CARD} overflow-hidden`}>
                      <div className="p-6 border-b border-ink/5 flex items-center justify-between">
                        <h3 className="font-serif text-[20px]">All Invoices</h3>
                        <button
                          type="button"
                          className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors shadow-sm"
                        >
                          <Plus size={14} />
                          Create Invoice
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={TABLE_HEAD}>
                              <th className="p-4 font-semibold">Invoice Details</th>
                              <th className="p-4 font-semibold">Amount</th>
                              <th className="p-4 font-semibold">Status</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {INVOICES.map((invoice) => (
                              <tr
                                key={invoice.id}
                                className="border-b border-ink/5 hover:bg-canvas/50 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="font-medium text-[14px] mb-1">
                                    {invoice.client}
                                  </div>
                                  <div className="text-[12px] text-ink/50 mb-0.5">
                                    {invoice.project}
                                  </div>
                                  <div className="text-[11px] text-ink/40">
                                    #{invoice.id} • Due {invoice.due}
                                  </div>
                                </td>
                                <td className="p-4 font-medium text-[14px]">
                                  ${invoice.amount.toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${INVOICE_STATUS_STYLE[invoice.status]}`}
                                  >
                                    {STATUS_ICON[invoice.status]}
                                    {invoice.status}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-end gap-2">
                                    {invoice.status !== 'Paid' && (
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 bg-ink text-white rounded-full text-[11px] font-medium tracking-[0.05em] hover:bg-gold transition-colors"
                                      >
                                        Pay
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className={ICON_BUTTON}
                                      title="Download PDF"
                                    >
                                      <Download size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className={ICON_BUTTON}
                                      aria-label="More actions"
                                    >
                                      <MoreVertical size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {activeTab === 'history' && (
                    <section className={`${CARD} overflow-hidden`}>
                      <div className="p-6 border-b border-ink/5 flex items-center justify-between">
                        <h3 className="font-serif text-[20px]">Payment History</h3>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-ink/60 hover:text-ink text-[13px] font-medium transition-colors"
                        >
                          <Download size={14} />
                          Export
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={TABLE_HEAD}>
                              <th className="p-4 font-semibold">Transaction</th>
                              <th className="p-4 font-semibold">Method</th>
                              <th className="p-4 font-semibold">Amount</th>
                              <th className="p-4 font-semibold text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PAYMENT_HISTORY.map((payment) => (
                              <tr
                                key={payment.id}
                                className="border-b border-ink/5 hover:bg-canvas/50 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="font-medium text-[14px] mb-1">{payment.id}</div>
                                  <div className="text-[12px] text-ink/50">
                                    {payment.date} • Inv: {payment.invoice}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-[13px]">
                                    <CreditCard size={14} className="text-ink/40" />
                                    {payment.method}
                                  </div>
                                </td>
                                <td className="p-4 font-medium text-[14px] text-green-600">
                                  +${payment.amount.toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    type="button"
                                    className={`inline-flex ${ICON_BUTTON}`}
                                    title="Download Receipt"
                                  >
                                    <Download size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <section className={`${CARD} p-6 space-y-4`}>
                    <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.1em] text-gold font-bold">
                          Active Cloud Vault
                        </div>
                        <h3 className="font-serif text-[18px] text-ink mt-0.5">
                          Pro Studio (2 TB)
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-ink text-canvas text-[10px] uppercase tracking-wider rounded-full font-bold">
                        Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[12px] font-medium text-ink">
                        <span>450 GB Used</span>
                        <span className="text-ink/50">1,550 GB Available</span>
                      </div>
                      <div className="w-full h-2 bg-canvas border border-ink/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold w-[22.5%]" />
                      </div>
                    </div>

                    <p className="text-[12px] text-ink/60 leading-relaxed">
                      Includes 1.5 TB Hot NVMe SSD + 500 GB Cold Archival Vault with 10Gbps CDN
                      acceleration.
                    </p>

                    <Link
                      to="/storage"
                      className="w-full py-2.5 bg-ink text-white rounded-lg text-[12px] font-medium hover:bg-gold transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <HardDrive size={15} /> Manage Storage & Upgrade Plans
                    </Link>
                  </section>

                  <section className={`${CARD} p-6`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-[20px]">Payment Methods</h3>
                      <button
                        type="button"
                        className="text-[12px] text-gold font-medium tracking-[0.05em] hover:text-ink transition-colors"
                      >
                        Add New
                      </button>
                    </div>

                    <div className="space-y-4">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border border-ink/10 rounded-lg group hover:border-gold transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-canvas border border-ink/10 rounded flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-ink/60">
                              {method.type}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[14px]">•••• {method.last4}</span>
                                {method.isDefault && (
                                  <span className="px-2 py-0.5 bg-canvas text-ink/60 text-[10px] uppercase tracking-wider rounded-sm font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-[12px] text-ink/50">Expires {method.expiry}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label={`Manage card ending ${method.last4}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-ink/30 group-hover:text-ink/60 hover:bg-ink/5 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={`${CARD} p-6`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-[20px]">Billing Details</h3>
                      <button
                        type="button"
                        className={ICON_BUTTON}
                        aria-label="Edit billing details"
                      >
                        <Settings size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 text-[13px] text-ink/80">
                      <Field label="Business Name">
                        <span className="font-medium text-[14px] text-ink">
                          Sarah Cabmora Photography
                        </span>
                      </Field>
                      <Field label="Tax ID">EU-123456789</Field>
                      <Field label="Address">
                        123 Studio Lane
                        <br />
                        Creative District
                        <br />
                        London, E1 4LX
                        <br />
                        United Kingdom
                      </Field>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </PortalShell>
  );
}

function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white p-6 border border-ink/5 shadow-sm rounded-xl">
      <div className="text-[12px] uppercase tracking-[0.15em] text-ink/50 mb-3 font-semibold">
        {label}
      </div>
      <div className="font-serif text-[36px] leading-none mb-2">{value}</div>
      <div className="text-[13px]">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.1em] text-ink/50 font-semibold mb-1">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
