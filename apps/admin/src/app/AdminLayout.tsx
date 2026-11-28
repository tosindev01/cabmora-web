import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  LayoutDashboard,
  Users,
  FolderKanban,
  HelpCircle,
  Star,
  Clapperboard,
  CreditCard,
  BarChart3,
  LogOut,
  LifeBuoy,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { useAdmin } from '@/shared/store';
import { NotificationPanel, PersonAvatar, useNotifications } from '@cabmora/ui';
import { notificationsApi } from '@cabmora/api-client';
import { ReportIssueButton } from '@/shared/support';
import { greet } from '@/shared/greeting';
import { canOpen, useAdminAuth } from '@/shared/auth';

/**
 * What the bell talks to.
 *
 * Module level, not inline: an object literal in the render body is a new
 * object every render, and the hook would have to defend against it.
 */
const BELL_TRANSPORT = {
  list: notificationsApi.listNotifications,
  count: notificationsApi.unreadCount,
  markRead: notificationsApi.markRead,
};

/**
 * Admin chrome, applied by the router as a layout route rather than imported
 * and wrapped by each screen.
 *
 * Every page used to `import AdminLayout` and wrap itself, which meant a
 * feature reached up into the app shell — backwards — and a new screen could
 * silently ship without the chrome. As a layout route it applies to whatever
 * the router nests inside it, and pages know nothing about it.
 */
export default function AdminLayout() {
  const { settings } = useAdmin();
  const { staff, signOut } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Built from the parts rather than by splitting the display name: a middle
  // name or a two-word surname would otherwise pick the wrong initials.
  const initials =
    [staff?.first_name, staff?.last_name]
      .filter((part): part is string => Boolean(part))
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?';

  // The bell's own data. The badge used to be `pendingEnquiries.length +
  // pendingReviews.length` — two things this layout happened to have loaded —
  // so a message, a booking or an invoice raised no badge at all.
  const bell = useNotifications(BELL_TRANSPORT);

  // Filtered by role: a coordinator gets the two sections the API will
  // actually serve them, not a sidebar of 403s.
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    // Directly under it: the same table, the other audience. Named for who is
    // on it rather than what it manages, because the question people bring to
    // it is "who at Cabmora can see this?".
    { label: 'Team', path: '/admin/team', icon: ShieldCheck },
    { label: 'Access Groups', path: '/admin/groups', icon: KeyRound },
    { label: 'Project Management', path: '/admin/projects', icon: FolderKanban },
    { label: 'Enquiry Management', path: '/admin/enquiries', icon: HelpCircle },
    // Sits above review moderation: an application is somebody waiting on us,
    // and a queue of people waiting belongs near the top of the list.
    {
      label: 'Creator Applications',
      path: '/admin/creator-applications',
      icon: Clapperboard,
    },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Payment Management', path: '/admin/payments', icon: CreditCard },
    { label: 'Reporting Dashboard', path: '/admin/reports', icon: BarChart3 },
    // Administrators only — `canOpen` lets an admin through any path, and
    // this one is deliberately absent from SECTION_PERMISSION, so no
    // coordinator sees it until it becomes a grantable section.
    { label: 'Reported Issues', path: '/admin/issues', icon: LifeBuoy },
  ].filter((item) => !staff || canOpen(staff, item.path));

  const handleLogout = async () => {
    // Server-side: only it can clear an HttpOnly cookie. `signOut` drops the
    // local state even if the request fails, so this always leaves the console.
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    /* `overflow-x-clip`, never `overflow-hidden`: an ancestor with
       `overflow: hidden` becomes the sticky containing block, and because it
       never scrolls, the sticky header below degrades to static and scrolls
       away — taking the only mobile menu button with it. */
    <div className="min-h-screen bg-canvas text-ink flex overflow-x-clip">
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
          <div className="px-4 pb-2 text-[11.5px] tracking-[0.2em] uppercase font-bold text-canvas/35">
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-[14.5px] font-medium tracking-[0.03em] transition-all duration-200 group ${
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
            <PersonAvatar
              src={staff?.avatar_url}
              initials={initials}
              size={36}
              className="border-gold"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-semibold text-canvas truncate flex items-center gap-1">
                {staff?.full_name ?? 'Administrator'}
                <ShieldCheck size={13} className="text-gold flex-shrink-0" />
              </div>
              <div className="text-[11.5px] text-canvas/50 truncate">{staff?.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold tracking-[0.08em] uppercase text-red-300 bg-red-950/40 border border-red-900/40 hover:bg-red-900/60 hover:text-white transition-colors duration-200 cursor-pointer"
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
            {/* The person, not the product. This read "Cabmora Media Admin"
                for everybody — the name of the software, in a spot where the
                reader already knows which software they are in. */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[15px] text-ink font-medium truncate">
                {greet(staff?.first_name)}
              </span>
            </div>
          </div>

          {/* Right Header Bar */}
          <div className="flex items-center gap-4">
            <ReportIssueButton />

            {/* The real feed, replacing a hand-rolled "Action Required Queue"
                that counted two things it happened to have loaded — pending
                enquiries and pending reviews — and silently knew nothing about
                messages, bookings, invoices or anything else. */}
            <NotificationPanel
              items={bell.items}
              unread={bell.unread}
              loading={bell.loading}
              failed={bell.failed}
              onOpen={bell.load}
              onMarkAllRead={bell.markAllRead}
              onSelect={(item) => {
                void bell.markOneRead(item.id);
                // The API guarantees a path, never an absolute URL, so this is
                // safe to hand straight to the router.
                if (item.url) navigate(item.url);
              }}
            />

            <div className="h-6 w-px bg-ink/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              {/* The role, not a flattering constant. A coordinator badged
                  "super admin" is told they can do things the API refuses. */}
              <span className="px-3 py-1 rounded-full text-[11.5px] uppercase font-bold tracking-[0.1em] bg-ink text-gold border border-gold/30 hidden sm:inline-block">
                {staff?.role === 'coordinator' ? 'Coordinator' : 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>
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
