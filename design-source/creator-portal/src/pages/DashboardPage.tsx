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
  Plus,
  UploadCloud,
  FileText,
  Clock,
  TrendingUp,
  HardDrive,
  User,
  Users,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

const RECENT_ACTIVITIES = [
  { id: 1, title: "Wedding Gallery Uploaded", time: "2 hours ago", type: "gallery", status: "completed", detail: "850 RAW photos added to Smith & Wesson album" },
  { id: 2, title: "Client Feedback Received", time: "5 hours ago", type: "message", status: "unread", detail: "Jane Smith commented on Tuscany Highlight Reel" },
  { id: 3, title: "Invoice Paid - Smith Wedding", time: "1 day ago", type: "payment", status: "completed", detail: "$4,250 received via Stripe" },
  { id: 4, title: "New Project Inquiry", time: "2 days ago", type: "inquiry", status: "pending", detail: "Editorial shoot inquiry for Paris Fashion Week" },
  { id: 5, title: "4K ProRes Drone Reel Backed Up", time: "3 days ago", type: "gallery", status: "completed", detail: "62 GB sync completed to Cloud Storage" },
];

const PROJECTS = [
  { id: 1, name: "Smith & Wesson Wedding", client: "Jane Smith", role: "Lead Photographer & Videographer", date: "Oct 12, 2025", status: "In Progress", progress: 65, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop" },
  { id: 2, name: "Elena's Editorial Shoot", client: "Elena Vance", role: "Creative Director", date: "Nov 04, 2025", status: "Review", progress: 90, image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop" },
  { id: 3, name: "Corporate Event - TechCorp", client: "David Miller", role: "Lead Videographer", date: "Dec 15, 2025", status: "Planning", progress: 20, image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop" },
];

const CLIENTS_OVERVIEW = [
  { id: 1, name: "Jane Smith", email: "jane.smith@example.com", project: "Smith & Wesson Wedding", totalBilled: "$8,500", status: "Active", portalAccess: "Granted", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { id: 2, name: "Elena Vance", email: "elena@vancemodels.com", project: "Elena's Editorial Shoot", totalBilled: "$4,200", status: "Review", portalAccess: "Granted", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" },
  { id: 3, name: "David Miller", email: "david.m@techcorp.io", project: "TechCorp Summit 2025", totalBilled: "$6,800", status: "Contract Signed", portalAccess: "Pending", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: 4, name: "Sarah & Mark Johnson", email: "johnson.family@gmail.com", project: "Johnson Family Portraits", totalBilled: "$2,400", status: "Delivered", portalAccess: "Granted", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop" },
];

const QUICK_ACTIONS = [
  { icon: Plus, label: "New Project", to: "/projects" },
  { icon: UploadCloud, label: "Upload Media", to: "/upload" },
  { icon: ImageIcon, label: "Media Library", to: "/galleries" },
  { icon: FileText, label: "Create Invoice", to: "/billing" },
];

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeActivityTab, setActiveActivityTab] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredActivities = activeActivityTab === "all" 
    ? RECENT_ACTIVITIES 
    : RECENT_ACTIVITIES.filter(a => a.type === activeActivityTab);

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
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors">
            <LayoutDashboard size={20} className="text-[#C9A86A]" />
            <span className="text-[13px] font-medium tracking-[0.05em]">Overview</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Folder size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Projects</span>
          </Link>
          <Link to="/galleries" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <ImageIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Media Library</span>
          </Link>
          <Link to="/messages" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <MessageSquare size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Messages</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <CreditCard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Billing</span>
          </Link>
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <HardDrive size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <User size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Creator Profile</span>
          </Link>
          <Link to="/client/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">View as Client</span>
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
            <h1 className="font-serif text-[22px] lg:text-[26px]">Creator Studio Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center relative">
              <Search size={18} className="absolute left-3 text-[#111]/40" />
              <input 
                type="text" 
                placeholder="Search projects or clients..."
                className="bg-[#FAF9F6] border border-[#111]/10 pl-10 pr-4 py-2 text-[13px] outline-none focus:border-[#C9A86A] transition-colors rounded-full w-[240px]"
              />
            </div>
            
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
          
          <div className="max-w-[1200px] mx-auto space-y-10">
            
            {/* Welcome & Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9A86A]/20 text-[#111] text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1">
                    <Sparkles size={12} className="text-[#C9A86A]" /> Partner Photographer & Videographer
                  </span>
                </div>
                <h2 className="text-[28px] font-serif mb-1">Welcome back, Sarah Cabmora</h2>
                <p className="text-[#111]/60 text-[14px]">Here is the real-time overview of your studio projects, clients, earnings, and media storage.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {QUICK_ACTIONS.map((action, idx) => (
                  <Link 
                    key={idx}
                    to={action.to}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] transition-colors ${
                      idx === 0 
                      ? 'bg-[#111] text-white hover:bg-[#C9A86A]' 
                      : 'bg-white border border-[#111]/10 text-[#111]/70 hover:border-[#C9A86A] hover:text-[#111]'
                    }`}
                  >
                    <action.icon size={16} />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* High-Level Creator Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#111]/50 font-medium">Active Projects</span>
                  <Folder size={18} className="text-[#C9A86A]" />
                </div>
                <div className="font-serif text-[32px] font-medium">12</div>
                <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp size={14} /> +3 this month
                </div>
              </div>

              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#111]/50 font-medium">Active Clients</span>
                  <Users size={18} className="text-[#C9A86A]" />
                </div>
                <div className="font-serif text-[32px] font-medium">28</div>
                <div className="text-[12px] text-[#111]/50 mt-1">
                  98% Client Satisfaction Rate
                </div>
              </div>

              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#111]/50 font-medium">Total Revenue</span>
                  <DollarSign size={18} className="text-[#C9A86A]" />
                </div>
                <div className="font-serif text-[32px] font-medium">$34,500</div>
                <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp size={14} /> +18.4% vs last quarter
                </div>
              </div>

              <div className="bg-white p-6 border border-[#111]/5 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#111]/50 font-medium">Storage Usage</span>
                  <HardDrive size={18} className="text-[#C9A86A]" />
                </div>
                <div className="font-serif text-[32px] font-medium">450 GB</div>
                <div className="text-[12px] text-[#111]/50 mt-1">
                  22.5% of 2 TB Cloud Vault
                </div>
              </div>
            </div>

            {/* Storage Usage Detailed Breakdown */}
            <div className="bg-white border border-[#111]/5 p-6 lg:p-8 rounded-xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-[22px]">Storage Vault Breakdown</h3>
                  <p className="text-[13px] text-[#111]/60">High-speed SSD storage allocation across high-res RAWs, 4K videos, and client delivery archives.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/storage" className="border border-[#111]/15 text-[#111] px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:border-[#C9A86A] hover:bg-[#FAF9F6] transition-colors flex items-center gap-1.5">
                    <HardDrive size={15} className="text-[#C9A86A]" />
                    Manage Storage & Plans
                  </Link>
                  <Link to="/upload" className="bg-[#111] text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors flex items-center gap-2">
                    <UploadCloud size={16} />
                    Upload More Assets
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[12px] font-medium">
                  <span className="text-[#111]/70">450.0 GB used of 2,000 GB (1,550 GB Available)</span>
                  <span className="text-[#C9A86A] font-semibold">22.5% Consumed</span>
                </div>

                {/* Multi-segmented Progress Bar */}
                <div className="w-full h-3 bg-[#FAF9F6] rounded-full overflow-hidden flex border border-[#111]/5">
                  <div className="h-full bg-[#C9A86A]" style={{ width: "14%" }} title="RAW Photos: 280 GB" />
                  <div className="h-full bg-purple-600" style={{ width: "7%" }} title="4K ProRes Video: 140 GB" />
                  <div className="h-full bg-blue-500" style={{ width: "1.5%" }} title="Delivery ZIPs: 30 GB" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-[#C9A86A]" />
                    <div>
                      <div className="text-[12px] font-medium">RAW Photography</div>
                      <div className="text-[11px] text-[#111]/50">280 GB (62.2%)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                    <div>
                      <div className="text-[12px] font-medium">4K ProRes Video</div>
                      <div className="text-[11px] text-[#111]/50">140 GB (31.1%)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <div className="text-[12px] font-medium">Delivery Archives</div>
                      <div className="text-[11px] text-[#111]/50">30 GB (6.7%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Overview Panel */}
            <div className="bg-white border border-[#111]/5 p-6 lg:p-8 rounded-xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#111]/5 pb-6">
                <div>
                  <h3 className="font-serif text-[22px]">Earnings & Financial Overview</h3>
                  <p className="text-[13px] text-[#111]/60">Summary of photography & videography bookings, paid invoices, and upcoming payouts.</p>
                </div>
                <Link to="/billing" className="text-[12px] text-[#C9A86A] font-medium tracking-[0.05em] hover:underline flex items-center gap-1">
                  View Full Billing History <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-[#111]/10 rounded-xl bg-[#FAF9F6]">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-[#111]/50 mb-1">This Month Earnings</div>
                  <div className="font-serif text-[28px] font-medium">$8,200</div>
                  <div className="text-[11px] text-[#111]/60 mt-1">3 Projects Invoiced & Cleared</div>
                </div>

                <div className="p-5 border border-[#111]/10 rounded-xl bg-[#FAF9F6]">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-[#111]/50 mb-1">Pending Payouts</div>
                  <div className="font-serif text-[28px] font-medium text-amber-700">$2,400</div>
                  <div className="text-[11px] text-[#111]/60 mt-1">Scheduled for release on Oct 30</div>
                </div>

                <div className="p-5 border border-[#111]/10 rounded-xl bg-[#FAF9F6]">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-[#111]/50 mb-1">Revenue Stream Split</div>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[11px]">
                      <span>Photography Services</span>
                      <span className="font-semibold">55% ($18,975)</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Videography & Drone</span>
                      <span className="font-semibold">35% ($12,075)</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Albums & Digital Downloads</span>
                      <span className="font-semibold">10% ($3,450)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Bar Visual */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] uppercase tracking-[0.15em] text-[#111]/50 font-medium">Monthly Revenue Trajectory (2025)</div>
                <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
                  {[
                    { month: "May", amount: "$4,200", height: "40%" },
                    { month: "Jun", amount: "$5,800", height: "55%" },
                    { month: "Jul", amount: "$6,900", height: "68%" },
                    { month: "Aug", amount: "$7,400", height: "75%" },
                    { month: "Sep", amount: "$9,100", height: "90%" },
                    { month: "Oct", amount: "$8,200", height: "82%" },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] text-[#111]/60 opacity-0 group-hover:opacity-100 transition-opacity">{bar.amount}</div>
                      <div 
                        className="w-full bg-[#111]/10 group-hover:bg-[#C9A86A] transition-colors rounded-t"
                        style={{ height: bar.height }}
                      />
                      <span className="text-[11px] text-[#111]/50">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Projects Grid & Clients Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Projects Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-[22px]">Active Assigned Projects</h3>
                  <Link to="/projects" className="text-[12px] text-[#C9A86A] font-medium tracking-[0.05em] hover:underline flex items-center gap-1">
                    Manage Projects <ChevronRight size={14} />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PROJECTS.map(project => (
                    <Link to={`/projects/${project.id}`} key={project.id} className="bg-white border border-[#111]/5 rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300 block">
                      <div className="h-36 overflow-hidden relative">
                        <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.1em] font-medium rounded-full text-[#111]">
                          {project.status}
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[11px] text-[#C9A86A] uppercase font-semibold tracking-[0.08em] block">{project.role}</span>
                          <h4 className="font-medium text-[16px] group-hover:text-[#C9A86A] transition-colors truncate">{project.name}</h4>
                          <div className="text-[12px] text-[#111]/50">Client: {project.client} • {project.date}</div>
                        </div>
                        
                        <div className="space-y-1.5 pt-2 border-t border-[#111]/5">
                          <div className="flex items-center justify-between text-[11px] text-[#111]/60">
                            <span>Project Progress</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#FAF9F6] rounded-full overflow-hidden">
                            <div className="h-full bg-[#C9A86A]" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Clients Overview Table/Cards */}
                <div className="bg-white border border-[#111]/5 p-6 rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-[18px]">Client Relations Overview</h4>
                      <p className="text-[12px] text-[#111]/50">Active client contracts, portal access status, and financial commitments.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-[#111]/10 text-[#111]/50 uppercase tracking-[0.08em] text-[10px]">
                          <th className="py-3 px-2">Client</th>
                          <th className="py-3 px-2">Assigned Project</th>
                          <th className="py-3 px-2">Total Billed</th>
                          <th className="py-3 px-2">Portal Access</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#111]/5">
                        {CLIENTS_OVERVIEW.map(client => (
                          <tr key={client.id} className="hover:bg-[#FAF9F6] transition-colors">
                            <td className="py-3 px-2 font-medium">
                              <div className="flex items-center gap-2.5">
                                <img src={client.avatar} alt={client.name} className="w-7 h-7 rounded-full object-cover" />
                                <div>
                                  <div className="font-medium text-[#111]">{client.name}</div>
                                  <div className="text-[10px] text-[#111]/40">{client.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-[#111]/70">{client.project}</td>
                            <td className="py-3 px-2 font-semibold text-[#111]">{client.totalBilled}</td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                                {client.portalAccess}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Link to="/messages" className="text-[11px] text-[#C9A86A] font-medium hover:underline">
                                Message
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed with Tabs */}
              <div className="space-y-6">
                <div className="bg-white border border-[#111]/5 p-6 rounded-xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[22px]">Recent Activities</h3>
                  </div>

                  {/* Activity Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-lg border border-[#111]/5">
                    {["all", "gallery", "message", "payment"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveActivityTab(tab)}
                        className={`flex-1 py-1.5 text-[10px] uppercase tracking-[0.08em] font-medium rounded transition-colors ${
                          activeActivityTab === tab 
                            ? "bg-[#111] text-white shadow-xs" 
                            : "text-[#111]/60 hover:text-[#111]"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-5">
                    {filteredActivities.map(activity => (
                      <div key={activity.id} className="flex gap-4 p-3 rounded-lg hover:bg-[#FAF9F6] transition-colors border-b border-[#111]/5 last:border-b-0">
                        <div className="mt-0.5 p-2 rounded-lg bg-[#FAF9F6] border border-[#111]/5 flex-shrink-0">
                          {activity.type === 'gallery' && <ImageIcon size={16} className="text-[#C9A86A]" />}
                          {activity.type === 'message' && <MessageSquare size={16} className="text-blue-600" />}
                          {activity.type === 'payment' && <CreditCard size={16} className="text-emerald-600" />}
                          {activity.type === 'inquiry' && <FileText size={16} className="text-purple-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-[13px] font-medium text-[#111] truncate">{activity.title}</h5>
                            <span className="text-[10px] text-[#111]/40 whitespace-nowrap">{activity.time}</span>
                          </div>
                          <p className="text-[11px] text-[#111]/60 mt-0.5 leading-snug">{activity.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/projects" className="block w-full text-center py-3 border border-[#111]/10 text-[11px] tracking-[0.1em] uppercase font-semibold hover:border-[#C9A86A] hover:text-[#C9A86A] transition-colors rounded-lg">
                    View Project Logs
                  </Link>
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
