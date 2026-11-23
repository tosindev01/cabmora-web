import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Folder, 
  Image as ImageIcon, 
  MessageSquare, 
  CreditCard,
  HardDrive,
  Plus,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

const INVOICES = [
  { id: "INV-2025-042", client: "Jane Smith", project: "Smith & Wesson Wedding", issued: "Sep 15, 2025", due: "Oct 01, 2025", amount: 4250, status: "Outstanding" },
  { id: "INV-2025-041", client: "Elena Rodriguez", project: "Elena's Editorial Shoot", issued: "Aug 20, 2025", due: "Sep 05, 2025", amount: 1200, status: "Paid" },
  { id: "INV-2025-040", client: "TechCorp Inc.", project: "Corporate Event - TechCorp", issued: "Aug 10, 2025", due: "Aug 25, 2025", amount: 3500, status: "Overdue" },
  { id: "INV-2025-039", client: "Jane Smith", project: "Smith & Wesson Wedding", issued: "Jan 15, 2025", due: "Jan 30, 2025", amount: 4250, status: "Paid" },
];

const PAYMENT_HISTORY = [
  { id: "PAY-98234", date: "Aug 22, 2025", amount: 1200, method: "Visa ending in 4242", invoice: "INV-2025-041" },
  { id: "PAY-98233", date: "Jan 18, 2025", amount: 4250, method: "Bank Transfer", invoice: "INV-2025-039" },
  { id: "PAY-98232", date: "Dec 10, 2024", amount: 850, method: "Mastercard ending in 8812", invoice: "INV-2024-112" },
];

const PAYMENT_METHODS = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
  { id: 2, type: "Mastercard", last4: "8812", expiry: "08/25", isDefault: false },
];

export default function BillingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Outstanding": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Paid": return <CheckCircle2 size={14} className="text-green-600" />;
      case "Outstanding": return <Clock size={14} className="text-blue-600" />;
      case "Overdue": return <AlertCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111] flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#001F1F] text-[#FAF9F6] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="h-20 flex items-center px-8 border-b border-[#FAF9F6]/10">
          <Link to="/">
            <img src={LogoWhite} alt="Cabmora Logo" className="h-8 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col gap-1.5">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <LayoutDashboard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Overview</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Folder size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Projects</span>
          </Link>
          <Link to="/galleries" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <ImageIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Galleries</span>
          </Link>
          <Link to="/messages" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <MessageSquare size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Messages</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors">
            <CreditCard size={20} className="text-[#C9A86A]" />
            <span className="text-[13px] font-medium tracking-[0.05em]">Billing</span>
          </Link>
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <HardDrive size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
        </div>

        <div className="p-4 border-t border-[#FAF9F6]/10">
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Settings size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Settings</span>
          </Link>
          <Link to="/" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-2">
            <LogOut size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Log out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[260px] min-w-0 transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#111]/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#111]/70 hover:text-[#111]"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="font-serif text-[22px] lg:text-[26px]">Billing & Payments</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-[#111]/60 hover:text-[#111] transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A86A] rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                2
              </span>
            </button>
            
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#111]/10 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="text-[12px] uppercase tracking-[0.15em] text-[#111]/50 mb-3 font-semibold">Outstanding Balance</div>
                <div className="font-serif text-[36px] leading-none mb-2">$7,750</div>
                <div className="text-[13px] text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>$3,500 overdue</span>
                </div>
              </div>
              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="text-[12px] uppercase tracking-[0.15em] text-[#111]/50 mb-3 font-semibold">Total Revenue (YTD)</div>
                <div className="font-serif text-[36px] leading-none mb-2">$42,500</div>
                <div className="text-[13px] text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>+15% from last year</span>
                </div>
              </div>
              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="text-[12px] uppercase tracking-[0.15em] text-[#111]/50 mb-3 font-semibold">Next Expected Payment</div>
                <div className="font-serif text-[36px] leading-none mb-2">$4,250</div>
                <div className="text-[13px] text-[#111]/60 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Due Oct 01, 2025</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Main Content (Invoices / History) */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-[#111]/10">
                  <button 
                    onClick={() => setActiveTab('invoices')}
                    className={`pb-4 text-[14px] font-medium transition-colors relative ${activeTab === 'invoices' ? 'text-[#111]' : 'text-[#111]/50 hover:text-[#111]'}`}
                  >
                    Invoices
                    {activeTab === 'invoices' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-[14px] font-medium transition-colors relative ${activeTab === 'history' ? 'text-[#111]' : 'text-[#111]/50 hover:text-[#111]'}`}
                  >
                    Payment History
                    {activeTab === 'history' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />
                    )}
                  </button>
                </div>

                {/* Invoices List */}
                {activeTab === 'invoices' && (
                  <div className="bg-white border border-[#111]/5 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#111]/5 flex items-center justify-between">
                      <h3 className="font-serif text-[20px]">All Invoices</h3>
                      <button className="flex items-center gap-2 bg-[#111] text-white px-4 py-2 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors shadow-sm">
                        <Plus size={14} />
                        Create Invoice
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#111]/5 text-[11px] uppercase tracking-[0.1em] text-[#111]/50">
                            <th className="p-4 font-semibold">Invoice Details</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {INVOICES.map((invoice) => (
                            <tr key={invoice.id} className="border-b border-[#111]/5 hover:bg-[#FAF9F6]/50 transition-colors group">
                              <td className="p-4">
                                <div className="font-medium text-[14px] mb-1">{invoice.client}</div>
                                <div className="text-[12px] text-[#111]/50 mb-0.5">{invoice.project}</div>
                                <div className="text-[11px] text-[#111]/40">#{invoice.id} • Due {invoice.due}</div>
                              </td>
                              <td className="p-4 font-medium text-[14px]">
                                ${invoice.amount.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${getStatusColor(invoice.status)}`}>
                                  {getStatusIcon(invoice.status)}
                                  {invoice.status}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-2">
                                  {invoice.status !== 'Paid' && (
                                    <button className="px-3 py-1.5 bg-[#111] text-white rounded-full text-[11px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors">
                                      Pay
                                    </button>
                                  )}
                                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#111]/50 hover:bg-[#111]/5 hover:text-[#111] transition-colors" title="Download PDF">
                                    <Download size={14} />
                                  </button>
                                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#111]/50 hover:bg-[#111]/5 hover:text-[#111] transition-colors">
                                    <MoreVertical size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {activeTab === 'history' && (
                  <div className="bg-white border border-[#111]/5 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#111]/5 flex items-center justify-between">
                      <h3 className="font-serif text-[20px]">Payment History</h3>
                      <button className="flex items-center gap-2 text-[#111]/60 hover:text-[#111] text-[13px] font-medium transition-colors">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#111]/5 text-[11px] uppercase tracking-[0.1em] text-[#111]/50">
                            <th className="p-4 font-semibold">Transaction</th>
                            <th className="p-4 font-semibold">Method</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PAYMENT_HISTORY.map((payment) => (
                            <tr key={payment.id} className="border-b border-[#111]/5 hover:bg-[#FAF9F6]/50 transition-colors">
                              <td className="p-4">
                                <div className="font-medium text-[14px] mb-1">{payment.id}</div>
                                <div className="text-[12px] text-[#111]/50">{payment.date} • Inv: {payment.invoice}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <CreditCard size={14} className="text-[#111]/40" />
                                  {payment.method}
                                </div>
                              </td>
                              <td className="p-4 font-medium text-[14px] text-green-600">
                                +${payment.amount.toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <button className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#111]/50 hover:bg-[#111]/5 hover:text-[#111] transition-colors" title="Download Receipt">
                                  <Download size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Active Storage Plan Card */}
                <div className="bg-white border border-[#111]/5 rounded-xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#111]/5 pb-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-[#C9A86A] font-bold">Active Cloud Vault</div>
                      <h3 className="font-serif text-[18px] text-[#111] mt-0.5">Pro Studio (2 TB)</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-[#111] text-[#FAF9F6] text-[10px] uppercase tracking-wider rounded-full font-bold">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] font-medium text-[#111]">
                      <span>450 GB Used</span>
                      <span className="text-[#111]/50">1,550 GB Available</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF9F6] border border-[#111]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9A86A] w-[22.5%]" />
                    </div>
                  </div>

                  <p className="text-[12px] text-[#111]/60 leading-relaxed">
                    Includes 1.5 TB Hot NVMe SSD + 500 GB Cold Archival Vault with 10Gbps CDN acceleration.
                  </p>

                  <Link 
                    to="/storage" 
                    className="w-full py-2.5 bg-[#111] text-white rounded-lg text-[12px] font-medium hover:bg-[#C9A86A] transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    <HardDrive size={15} /> Manage Storage & Upgrade Plans
                  </Link>
                </div>

                {/* Payment Methods */}
                <div className="bg-white border border-[#111]/5 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-[20px]">Payment Methods</h3>
                    <button className="text-[12px] text-[#C9A86A] font-medium tracking-[0.05em] hover:text-[#111] transition-colors">
                      Add New
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {PAYMENT_METHODS.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-[#111]/10 rounded-lg group hover:border-[#C9A86A] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-[#FAF9F6] border border-[#111]/10 rounded flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#111]/60">
                            {method.type}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[14px]">•••• {method.last4}</span>
                              {method.isDefault && (
                                <span className="px-2 py-0.5 bg-[#FAF9F6] text-[#111]/60 text-[10px] uppercase tracking-wider rounded-sm font-medium">Default</span>
                              )}
                            </div>
                            <div className="text-[12px] text-[#111]/50">Expires {method.expiry}</div>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#111]/30 group-hover:text-[#111]/60 hover:bg-[#111]/5 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Details */}
                <div className="bg-white border border-[#111]/5 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-[20px]">Billing Details</h3>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#111]/50 hover:bg-[#111]/5 hover:text-[#111] transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-[13px] text-[#111]/80">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.1em] text-[#111]/50 font-semibold mb-1">Business Name</div>
                      <div className="font-medium text-[14px] text-[#111]">Sarah Cabmora Photography</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.1em] text-[#111]/50 font-semibold mb-1">Tax ID</div>
                      <div>EU-123456789</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.1em] text-[#111]/50 font-semibold mb-1">Address</div>
                      <div>
                        123 Studio Lane<br />
                        Creative District<br />
                        London, E1 4LX<br />
                        United Kingdom
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
