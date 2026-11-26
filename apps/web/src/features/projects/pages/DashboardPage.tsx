import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Folder,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  UploadCloud,
  FileText,
  TrendingUp,
  HardDrive,
  Users,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  CloudSun,
  PhoneIncoming,
  Bot,
  Check,
  X,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import {
  collaborationApi,
  type CreatorBriefingDto,
  type ProjectCallDto,
} from '@cabmora/api-client';
import { useAuth } from '@/shared/auth';
import { CreatorWelcomeModal } from '@/features/projects/components/CreatorWelcomeModal';
import { CreatorAiAssistantPanel } from '@/features/projects/components/CreatorAiAssistantPanel';
import {
  CLIENTS_OVERVIEW,
  PROJECTS,
  QUICK_ACTIONS,
  RECENT_ACTIVITIES,
} from '@/features/projects/data';
import {
  PROJECT_WEATHER_FORECASTS,
  STUDIO_WORKSPACE_EVENT,
  buildAiInvoiceDraft,
  ensureRichBriefing,
  getCreatorReferralSummary,
  getNewClientNotifications,
  getPendingMessages,
  getStudioCalls,
  saveStudioInvoice,
} from '@/shared/collaboration/studioWorkspaceStore';

const BRIEFING_SEEN_KEY = 'cabmora_creator_briefing_seen_v2';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeActivityTab, setActiveActivityTab] = useState('all');
  const [briefing, setBriefing] = useState<CreatorBriefingDto | null>(() =>
    ensureRichBriefing(null, user?.first_name),
  );
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [calls, setCalls] = useState<ProjectCallDto[]>(() => getStudioCalls());
  const [pendingMessages, setPendingMessages] = useState(() => getPendingMessages());
  const [newClients, setNewClients] = useState(() => getNewClientNotifications());
  const [referrals, setReferrals] = useState(() => getCreatorReferralSummary(user?.first_name));
  const [invoiceToast, setInvoiceToast] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    collaborationApi
      .getCreatorBriefing()
      .then((data) => {
        if (!active) return;
        setBriefing(ensureRichBriefing(data, user?.first_name));
        if (!window.sessionStorage.getItem(BRIEFING_SEEN_KEY)) {
          setIsWelcomeOpen(true);
          window.sessionStorage.setItem(BRIEFING_SEEN_KEY, '1');
        }
      })
      .catch(() => {
        if (!active) return;
        setBriefing(ensureRichBriefing(null, user?.first_name));
        if (!window.sessionStorage.getItem(BRIEFING_SEEN_KEY)) {
          setIsWelcomeOpen(true);
          window.sessionStorage.setItem(BRIEFING_SEEN_KEY, '1');
        }
      });

    collaborationApi
      .listMyCalls()
      .then((rows) => {
        if (active) setCalls(getStudioCalls(rows));
      })
      .catch(() => {
        if (active) setCalls(getStudioCalls());
      });

    const handleSync = () => {
      setCalls(getStudioCalls());
      setPendingMessages(getPendingMessages());
      setNewClients(getNewClientNotifications());
      setReferrals(getCreatorReferralSummary(user?.first_name));
    };
    window.addEventListener(STUDIO_WORKSPACE_EVENT, handleSync);

    return () => {
      active = false;
      window.removeEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    };
  }, [user?.first_name]);

  const weather = PROJECT_WEATHER_FORECASTS[0]!;
  const pendingCallsCount = Math.max(calls.filter((c) => c.status === 'pending').length, 2);
  const unreadMessagesCount = Math.max(pendingMessages.filter((m) => m.unread).length, 3);

  const handleQuickAiInvoice = () => {
    const target = newClients[0];
    const inv = buildAiInvoiceDraft({
      clientName: target?.clientName || 'Clara & Julian Mercer',
      clientEmail: target?.clientEmail || 'clara.mercer@ateliermercer.com',
      projectTitle: target?.projectTitle || 'Lake Como Destination Wedding',
      amount: target ? Math.round(target.packageAmount / 2) : 6250,
      includeDrone: true,
    });
    saveStudioInvoice(inv);
    setInvoiceToast(`AI generated Invoice ${inv.id} ($${inv.amount.toLocaleString()}) for ${inv.client}`);
    window.setTimeout(() => setInvoiceToast(null), 4000);
  };

  const filteredActivities =
    activeActivityTab === 'all'
      ? RECENT_ACTIVITIES
      : RECENT_ACTIVITIES.filter((a) => a.type === activeActivityTab);

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar title="Creator Studio Dashboard" onToggleSidebar={toggleSidebar}>
            <div className="hidden md:flex items-center relative">
              <Search size={18} className="absolute left-3 text-ink/40" />
              <input
                type="text"
                placeholder="Search projects or clients..."
                className="bg-canvas border border-ink/10 pl-10 pr-4 py-2 text-[13px] outline-none focus:border-gold transition-colors rounded-full w-[240px]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsWelcomeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gold/15 border border-gold/30 text-ink text-[12px] font-medium hover:border-gold transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-gold" />
              <span>Daily Briefing</span>
            </button>

            <PortalBell />

            <PortalAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
          </PortalTopbar>

          {/* Dashboard Content — Original Clean Centered 1200px Flow */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto space-y-10">
              {invoiceToast && (
                <div className="px-5 py-3 rounded-xl bg-forest text-canvas border border-gold/40 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 font-medium">
                    <Check size={15} className="text-gold" /> {invoiceToast}
                  </span>
                  <Link to="/billing" className="text-gold font-semibold hover:underline">
                    View in Billing →
                  </Link>
                </div>
              )}

              {/* 1. Welcome & Quick Actions */}
              <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-ink text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1">
                      <Sparkles size={12} className="text-gold" /> Partner Photographer &
                      Videographer
                    </span>
                  </div>
                  <h2 className="text-[28px] font-serif mb-1">
                    Welcome back, {user?.first_name ? user.first_name : 'Sarah Cabmora'}
                  </h2>
                  <p className="text-ink/60 text-[14px]">
                    Here is the real-time overview of your studio projects, clients, earnings, and
                    media storage.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <Link
                      key={idx}
                      to={action.to}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] transition-colors ${
                        idx === 0
                          ? 'bg-ink text-white hover:bg-gold'
                          : 'bg-white border border-ink/10 text-ink/70 hover:border-gold hover:text-ink'
                      }`}
                    >
                      <action.icon size={16} />
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 2. High-Level Creator Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                  to="/projects"
                  className="bg-white p-6 border border-ink/5 hover:border-gold hover:-translate-y-0.5 transition-all shadow-sm rounded-xl cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                      Active Projects
                    </span>
                    <Folder size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-medium">12</div>
                  <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> +3 this month
                  </div>
                </Link>

                <Link
                  to="/bookings"
                  className="bg-white p-6 border border-ink/5 hover:border-gold hover:-translate-y-0.5 transition-all shadow-sm rounded-xl cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                      Active Clients
                    </span>
                    <Users size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-medium">28</div>
                  <div className="text-[12px] text-ink/50 mt-1">
                    +{newClients.length} new bookings today
                  </div>
                </Link>

                <Link
                  to="/billing"
                  className="bg-white p-6 border border-ink/5 hover:border-gold hover:-translate-y-0.5 transition-all shadow-sm rounded-xl cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                      Total Revenue
                    </span>
                    <DollarSign size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-medium">$34,500</div>
                  <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> +18.4% vs last quarter
                  </div>
                </Link>

                <Link
                  to="/storage"
                  className="bg-white p-6 border border-ink/5 hover:border-gold hover:-translate-y-0.5 transition-all shadow-sm rounded-xl cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                      Storage Usage
                    </span>
                    <HardDrive size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-medium">450 GB</div>
                  <div className="text-[12px] text-ink/50 mt-1">22.5% of 2 TB Cloud Vault</div>
                </Link>
              </div>

              {/* 3. Clean 3-Card Studio Pulse Row (Weather, Calls & Bookings, Messages & Referrals) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Next Project Weather */}
                <div className="bg-white p-6 border border-ink/5 hover:border-gold transition-colors shadow-sm rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                        Next Shoot Forecast
                      </span>
                      <CloudSun size={18} className="text-gold" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[28px] font-medium">{weather.tempC}°C</span>
                      <span className="text-[13px] text-ink/70 font-medium">
                        {weather.condition}
                      </span>
                    </div>
                    <div className="text-[12px] text-ink/55 mt-1">
                      {weather.projectTitle} • {weather.location.split(',')[0]} ({weather.shootDate})
                    </div>
                  </div>
                  <div className="pt-3 border-t border-ink/5 flex items-center justify-between text-[11.5px] text-ink/60">
                    <span>Golden Hour: {weather.goldenHour}</span>
                    <span className="text-emerald-700 font-medium">{weather.droneStatus}</span>
                  </div>
                </div>

                {/* New Clients & Calls */}
                <div className="bg-white p-6 border border-ink/5 hover:border-gold transition-colors shadow-sm rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                        New Clients & Calls
                      </span>
                      <PhoneIncoming size={18} className="text-gold" />
                    </div>
                    <div className="font-serif text-[28px] font-medium">
                      {newClients.length} Bookings • {pendingCallsCount} Calls
                    </div>
                    <div className="text-[12px] text-ink/55 mt-1 truncate">
                      Latest: {newClients[0]?.clientName} ({newClients[0]?.projectTitle})
                    </div>
                  </div>
                  <div className="pt-3 border-t border-ink/5 flex items-center justify-between gap-2 text-[12px]">
                    <Link to="/bookings" className="text-ink/70 hover:text-gold font-medium">
                      View Bookings →
                    </Link>
                    <button
                      type="button"
                      onClick={handleQuickAiInvoice}
                      className="text-gold font-semibold hover:underline cursor-pointer"
                    >
                      + Generate Invoice
                    </button>
                  </div>
                </div>

                {/* Pending Messages & Referrals */}
                <div className="bg-white p-6 border border-ink/5 hover:border-gold transition-colors shadow-sm rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium">
                        Messages & Referrals
                      </span>
                      <MessageSquare size={18} className="text-gold" />
                    </div>
                    <div className="font-serif text-[28px] font-medium">
                      {unreadMessagesCount} Unread • ${referrals.total_earnings.toLocaleString()}
                    </div>
                    <div className="text-[12px] text-ink/55 mt-1 truncate">
                      VIP Code: <span className="font-mono text-ink">{referrals.referral_code}</span> (+{referrals.bonus_storage_gb} GB Vault)
                    </div>
                  </div>
                  <div className="pt-3 border-t border-ink/5 flex items-center justify-between gap-2 text-[12px]">
                    <Link to="/messages" className="text-ink/70 hover:text-gold font-medium">
                      Open Messages →
                    </Link>
                    <Link to="/referrals" className="text-gold font-semibold hover:underline">
                      Referrals Hub →
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Storage Usage Detailed Breakdown */}
              <div className="bg-white border border-ink/5 p-6 lg:p-8 rounded-xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-[22px]">Storage Vault Breakdown</h3>
                    <p className="text-[13px] text-ink/60">
                      High-speed SSD storage allocation across high-res RAWs, 4K videos, and client
                      delivery archives.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/storage"
                      className="border border-ink/15 text-ink px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:border-gold hover:bg-canvas transition-colors flex items-center gap-1.5"
                    >
                      <HardDrive size={15} className="text-gold" />
                      Manage Storage & Plans
                    </Link>
                    <Link
                      to="/upload"
                      className="bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors flex items-center gap-2"
                    >
                      <UploadCloud size={16} />
                      Upload More Assets
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[12px] font-medium">
                    <span className="text-ink/70">
                      450.0 GB used of 2,000 GB (1,550 GB Available)
                    </span>
                    <span className="text-gold font-semibold">22.5% Consumed</span>
                  </div>

                  <div className="w-full h-3 bg-canvas rounded-full overflow-hidden flex border border-ink/5">
                    <div
                      className="h-full bg-gold"
                      style={{ width: '14%' }}
                      title="RAW Photos: 280 GB"
                    />
                    <div
                      className="h-full bg-purple-600"
                      style={{ width: '7%' }}
                      title="4K ProRes Video: 140 GB"
                    />
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: '1.5%' }}
                      title="Delivery ZIPs: 30 GB"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                      <div>
                        <div className="text-[12px] font-medium">RAW Photography</div>
                        <div className="text-[11px] text-ink/50">280 GB (62.2%)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                      <div>
                        <div className="text-[12px] font-medium">4K ProRes Video</div>
                        <div className="text-[11px] text-ink/50">140 GB (31.1%)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div>
                        <div className="text-[12px] font-medium">Delivery Archives</div>
                        <div className="text-[11px] text-ink/50">30 GB (6.7%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Earnings Overview Panel */}
              <div className="bg-white border border-ink/5 p-6 lg:p-8 rounded-xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/5 pb-6">
                  <div>
                    <h3 className="font-serif text-[22px]">Earnings & Financial Overview</h3>
                    <p className="text-[13px] text-ink/60">
                      Summary of photography & videography bookings, paid invoices, and upcoming
                      payouts.
                    </p>
                  </div>
                  <Link
                    to="/billing"
                    className="text-[12px] text-gold font-medium tracking-[0.05em] hover:underline flex items-center gap-1"
                  >
                    View Full Billing History <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 border border-ink/10 rounded-xl bg-canvas">
                    <div className="text-[11px] uppercase tracking-[0.15em] text-ink/50 mb-1">
                      This Month Earnings
                    </div>
                    <div className="font-serif text-[28px] font-medium">$8,200</div>
                    <div className="text-[11px] text-ink/60 mt-1">
                      3 Projects Invoiced & Cleared
                    </div>
                  </div>

                  <div className="p-5 border border-ink/10 rounded-xl bg-canvas">
                    <div className="text-[11px] uppercase tracking-[0.15em] text-ink/50 mb-1">
                      Pending Payouts
                    </div>
                    <div className="font-serif text-[28px] font-medium text-amber-700">$2,400</div>
                    <div className="text-[11px] text-ink/60 mt-1">
                      Scheduled for release on Oct 30
                    </div>
                  </div>

                  <div className="p-5 border border-ink/10 rounded-xl bg-canvas">
                    <div className="text-[11px] uppercase tracking-[0.15em] text-ink/50 mb-1">
                      Revenue Stream Split
                    </div>
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

                <div className="space-y-2 pt-2">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-ink/50 font-medium">
                    Monthly Revenue Trajectory (2025)
                  </div>
                  <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
                    {[
                      { month: 'May', amount: '$4,200', height: '40%' },
                      { month: 'Jun', amount: '$5,800', height: '55%' },
                      { month: 'Jul', amount: '$6,900', height: '68%' },
                      { month: 'Aug', amount: '$7,400', height: '75%' },
                      { month: 'Sep', amount: '$9,100', height: '90%' },
                      { month: 'Oct', amount: '$8,200', height: '82%' },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[10px] text-ink/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.amount}
                        </div>
                        <div
                          className="w-full bg-ink/10 group-hover:bg-gold transition-colors rounded-t"
                          style={{ height: bar.height }}
                        />
                        <span className="text-[11px] text-ink/50">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Active Projects Grid & Clients Overview + Recent Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[22px]">Active Assigned Projects</h3>
                    <Link
                      to="/projects"
                      className="text-[12px] text-gold font-medium tracking-[0.05em] hover:underline flex items-center gap-1"
                    >
                      Manage Projects <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PROJECTS.map((project) => (
                      <Link
                        to={`/projects/${project.id}`}
                        key={project.id}
                        className="bg-white border border-ink/5 rounded-xl overflow-hidden group hover:shadow-md hover:border-gold transition-all duration-300 block cursor-pointer"
                      >
                        <div className="h-36 overflow-hidden relative">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.1em] font-medium rounded-full text-ink">
                            {project.status}
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <div>
                            <span className="text-[11px] text-gold uppercase font-semibold tracking-[0.08em] block">
                              {project.role}
                            </span>
                            <h4 className="font-medium text-[16px] group-hover:text-gold transition-colors truncate">
                              {project.name}
                            </h4>
                            <div className="text-[12px] text-ink/50">
                              Client: {project.client} • {project.date}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-ink/5">
                            <div className="flex items-center justify-between text-[11px] text-ink/60">
                              <span>Project Progress</span>
                              <span className="font-semibold">{project.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Clients Overview Table */}
                  <div className="bg-white border border-ink/5 p-6 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-[18px]">Client Relations Overview</h4>
                        <p className="text-[12px] text-ink/50">
                          Active client contracts, portal access status, and financial commitments.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead>
                          <tr className="border-b border-ink/10 text-ink/50 uppercase tracking-[0.08em] text-[10px]">
                            <th className="py-3 px-2">Client</th>
                            <th className="py-3 px-2">Assigned Project</th>
                            <th className="py-3 px-2">Total Billed</th>
                            <th className="py-3 px-2">Portal Access</th>
                            <th className="py-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                          {CLIENTS_OVERVIEW.map((client) => (
                            <tr key={client.id} className="hover:bg-canvas transition-colors">
                              <td className="py-3 px-2 font-medium">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={client.avatar}
                                    alt={client.name}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="font-medium text-ink">{client.name}</div>
                                    <div className="text-[10px] text-ink/40">{client.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-ink/70">{client.project}</td>
                              <td className="py-3 px-2 font-semibold text-ink">
                                {client.totalBilled}
                              </td>
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                                  {client.portalAccess}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <Link
                                  to="/messages"
                                  className="text-[11px] text-gold font-medium hover:underline"
                                >
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
                  <div className="bg-white border border-ink/5 p-6 rounded-xl shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-[22px]">Recent Activities</h3>
                    </div>

                    <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-ink/5">
                      {['all', 'gallery', 'message', 'payment'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveActivityTab(tab)}
                          className={`flex-1 py-1.5 text-[10px] uppercase tracking-[0.08em] font-medium rounded transition-colors cursor-pointer ${
                            activeActivityTab === tab
                              ? 'bg-ink text-white shadow-xs'
                              : 'text-ink/60 hover:text-ink'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-5">
                      {filteredActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-4 p-3 rounded-lg hover:bg-canvas transition-colors border-b border-ink/5 last:border-b-0"
                        >
                          <div className="mt-0.5 p-2 rounded-lg bg-canvas border border-ink/5 flex-shrink-0">
                            {activity.type === 'gallery' && (
                              <ImageIcon size={16} className="text-gold" />
                            )}
                            {activity.type === 'message' && (
                              <MessageSquare size={16} className="text-blue-600" />
                            )}
                            {activity.type === 'payment' && (
                              <CreditCard size={16} className="text-emerald-600" />
                            )}
                            {activity.type === 'inquiry' && (
                              <FileText size={16} className="text-purple-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-[13px] font-medium text-ink truncate">
                                {activity.title}
                              </h5>
                              <span className="text-[10px] text-ink/40 whitespace-nowrap">
                                {activity.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">
                              {activity.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/projects"
                      className="block w-full text-center py-3 border border-ink/10 text-[11px] tracking-[0.1em] uppercase font-semibold hover:border-gold hover:text-gold transition-colors rounded-lg"
                    >
                      View Project Logs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Single Right-Side AI Assistant Toggle Button & Right Popup Panel */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            {isAiDrawerOpen && (
              <div className="w-[calc(100vw-3rem)] sm:w-[400px] shadow-2xl rounded-2xl overflow-hidden border border-gold/40 cab-fade-in">
                <CreatorAiAssistantPanel
                  briefing={briefing}
                  compact
                  onInvoiceSaved={(inv) =>
                    setInvoiceToast(
                      `AI generated Invoice ${inv.id} ($${inv.amount.toLocaleString()}) for ${inv.client}`,
                    )
                  }
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsAiDrawerOpen((open) => !open)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest text-canvas border border-gold/50 shadow-xl hover:bg-gold hover:text-ink transition-all cursor-pointer font-semibold text-[13px]"
            >
              {isAiDrawerOpen ? (
                <>
                  <X size={16} />
                  <span>Close AI Assistant</span>
                </>
              ) : (
                <>
                  <Bot size={17} className="text-gold" />
                  <span>AI Assistant</span>
                </>
              )}
            </button>
          </div>

          {briefing && (
            <CreatorWelcomeModal
              briefing={briefing}
              open={isWelcomeOpen}
              onClose={() => setIsWelcomeOpen(false)}
            />
          )}
        </>
      )}
    </PortalShell>
  );
}
