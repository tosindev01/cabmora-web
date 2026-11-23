import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  HelpCircle,
  Star,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { useAdmin } from '@/context/AdminContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminUser, logout, settings, enquiries, reviews } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingEnquiries = enquiries.filter((e) => e.status === 'New');
  const pendingReviews = reviews.filter((r) => r.status === 'Pending');
  const totalNotifs = pendingEnquiries.length + pendingReviews.length;

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Project Management', path: '/admin/projects', icon: FolderKanban },
    { label: 'Enquiry Management', path: '/admin/enquiries', icon: HelpCircle },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Payment Management', path: '/admin/payments', icon: CreditCard },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { label: 'Reporting Dashboard', path: '/admin/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-forest text-canvas transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl border-r border-canvas/10`}
      >
        {/* Brand Header */}
        <div className="py-6 px-6 flex items-center justify-between border-b border-canvas/10">
          <Link to="/admin/dashboard" className="flex items-center group min-w-0">
            <img
              src={LogoWhite}
              alt={settings.brandName || 'Cabmora Media'}
              className="h-10 sm:h-11 w-auto object-contain max-w-[200px] transition-opacity hover:opacity-90"
            />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-canvas/60 hover:text-canvas p-1 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-1.5">
          <div className="px-4 pb-2 text-[10px] tracking-[0.2em] uppercase font-bold text-canvas/35">
            Management Modules
          </div>

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-[13px] font-medium tracking-[0.03em] transition-all duration-200 group ${
                  isActive
                    ? 'bg-gold text-ink shadow-md font-semibold'
                    : 'text-canvas/70 hover:bg-canvas/8 hover:text-canvas'
                }`}
              >
                <Icon
                  size={19}
                  className={`transition-colors ${
                    isActive ? 'text-ink' : 'text-gold group-hover:text-canvas'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-ink/70" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-4 border-t border-canvas/10 bg-forest-dark">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-canvas/5 mb-3">
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className="w-9 h-9 rounded-full object-cover border border-gold"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-canvas truncate flex items-center gap-1">
                {adminUser.name}
                <ShieldCheck size={13} className="text-gold flex-shrink-0" />
              </div>
              <div className="text-[10px] text-canvas/50 truncate">{adminUser.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold tracking-[0.08em] uppercase text-red-300 bg-red-950/40 border border-red-900/40 hover:bg-red-900/60 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-[270px] min-w-0 transition-all duration-300">
        {/* Top Sticky Header */}
        <header className="h-20 bg-white border-b border-ink/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-ink hover:text-gold p-1.5 rounded-lg hover:bg-canvas"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-ink/50 font-bold hidden sm:inline-block">
                Cabmora Media Admin
              </span>
            </div>
          </div>

          {/* Right Header Bar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-full text-ink/70 hover:text-ink hover:bg-canvas transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {totalNotifs > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-gold text-ink text-[10px] font-bold rounded-full border-2 border-white">
                    {totalNotifs}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-ink/15 rounded-xl shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                    <span className="font-semibold text-[13px] text-ink">
                      Action Required Queue
                    </span>
                    <span className="text-[11px] bg-gold/20 text-ink font-bold px-2 py-0.5 rounded-full">
                      {totalNotifs} Pending
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                    {pendingEnquiries.map((e) => (
                      <Link
                        key={e.id}
                        to="/admin/enquiries"
                        onClick={() => setIsNotifOpen(false)}
                        className="block p-2.5 rounded-lg bg-canvas hover:bg-gold/10 transition-colors border border-ink/5"
                      >
                        <div className="flex justify-between items-center text-[12px] font-semibold text-ink">
                          <span>New Enquiry: {e.customerName}</span>
                          <span className="text-[10px] text-amber-700 font-bold uppercase">
                            New
                          </span>
                        </div>
                        <div className="text-[11px] text-ink/60 truncate">{e.serviceRequested}</div>
                      </Link>
                    ))}

                    {pendingReviews.map((r) => (
                      <Link
                        key={r.id}
                        to="/admin/reviews"
                        onClick={() => setIsNotifOpen(false)}
                        className="block p-2.5 rounded-lg bg-canvas hover:bg-gold/10 transition-colors border border-ink/5"
                      >
                        <div className="flex justify-between items-center text-[12px] font-semibold text-ink">
                          <span>Review Moderation: {r.reviewerName}</span>
                          <span className="text-[10px] text-amber-700 font-bold uppercase">
                            Pending
                          </span>
                        </div>
                        <div className="text-[11px] text-ink/60 truncate">"{r.comment}"</div>
                      </Link>
                    ))}

                    {totalNotifs === 0 && (
                      <div className="text-center py-6 text-[12px] text-ink/50 font-medium">
                        All queues clear! No pending actions required.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-ink/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.1em] bg-ink text-gold border border-gold/30 hidden sm:inline-block">
                SUPER ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
