import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import LogoWhite from '@/assets/cabmora_white_logo.svg';
import {
  PORTAL_NAV,
  PORTAL_NAV_FOOTER,
  PORTAL_NAV_SECONDARY,
  type PortalNavItem,
} from '@/shared/portal/data';
import { useAuth } from '@/shared/auth';
import type { PortalVariant } from './variant';
import { SIDEBAR_CHROME, SIDEBAR_COLLAPSED } from './variant';

const BASE =
  'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-[13px] font-medium tracking-[0.05em]';
const IDLE = 'text-canvas/60 hover:bg-canvas/5 hover:text-canvas';
const ACTIVE = 'bg-canvas/10 text-canvas';

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: PortalNavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const { icon: Icon, label, to } = item;
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      /* `title` for a mouse, the label itself for a screen reader. Hiding the
         text with `sr-only` rather than dropping it keeps the link named — an
         icon-only link with no accessible name is announced as its URL. */
      title={collapsed ? label : undefined}
      className={`${BASE} ${active ? ACTIVE : IDLE} ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon size={20} className={active ? 'text-gold' : undefined} />
      <span className={collapsed ? 'sr-only' : undefined}>{label}</span>
    </Link>
  );
}

interface PortalSidebarProps {
  open: boolean;
  variant: PortalVariant;
  /** Icons only, on desktop. Ignored below `lg`, where the column is
   *  off-canvas and a narrow rail would save nothing. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** Main nav. Defaults to the creator portal's list. */
  items?: PortalNavItem[];
  /** Pinned to the bottom of the scrolling column. */
  secondary?: PortalNavItem[];
  /** Footer list, above sign-out. */
  footer?: PortalNavItem[];
}

/**
 * Creator portal navigation.
 *
 * Active state is derived from the current route rather than passed in by each
 * page — that was the reason ten near-identical copies of this markup existed,
 * each differing only in which link carried the highlight.
 *
 * The copies had also drifted apart: Billing was missing "Creator Profile" and
 * "View as Client" and called the media screen "Galleries", Project Details had
 * lost "Storage Vault", and seven of the ten pointed "Overview" at `/` — the
 * marketing landing page — instead of `/dashboard`. PORTAL_NAV is now the only
 * list, so that class of drift cannot come back.
 *
 * `variant` covers the only real difference between the two chrome styles:
 * the light screens use a 260px deep-teal column, the dark ones a 280px panel
 * column with a hairline border. Both are off-canvas below `lg` — the dark
 * pages previously dropped their nav entirely under `md:flex`, leaving mobile
 * users with no way to leave the screen.
 */
export function PortalSidebar({
  open,
  variant,
  collapsed = false,
  onToggleCollapsed,
  items = PORTAL_NAV,
  secondary = PORTAL_NAV_SECONDARY,
  footer = PORTAL_NAV_FOOTER,
}: PortalSidebarProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <aside
      aria-label="Portal navigation"
      /* The collapsed width applies from `lg` only: below it the column is
         off-canvas and full width, so a rail would just be a smaller drawer.
         `transition-all`, not `transition-transform` — the width changes too. */
      className={`fixed inset-y-0 left-0 z-40 ${SIDEBAR_CHROME[variant]} ${
        collapsed ? SIDEBAR_COLLAPSED : ''
      } text-canvas flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div
        className={`h-20 flex items-center border-b border-canvas/10 ${
          collapsed ? 'lg:px-0 lg:justify-center px-8' : 'px-8 justify-between gap-3'
        }`}
      >
        <Link to="/" className={collapsed ? 'lg:hidden' : undefined}>
          <img src={LogoWhite} alt="Cabmora" className="h-8 w-auto object-contain" />
        </Link>
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand the menu' : 'Collapse the menu'}
            /* Desktop only: below `lg` the column is a drawer with its own
               close control, and a collapse button there would do nothing a
               reader could see. */
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg text-canvas/50 hover:text-canvas hover:bg-canvas/8 transition-colors shrink-0"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col gap-1.5">
        {items.map((item) => (
          <NavLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
        ))}
        <div className="mt-auto flex flex-col gap-1.5">
          {secondary.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-canvas/10 flex flex-col gap-2">
        {footer.map((item) => (
          <NavLink key={item.label} item={item} active={false} collapsed={collapsed} />
        ))}
        {/* A button, not a link: the session lives in an HttpOnly cookie that
            only the server can clear, so this has to be a request. */}
        <button
          type="button"
          onClick={() => void logout()}
          title={collapsed ? 'Log out' : undefined}
          className={`${BASE} ${IDLE} w-full cursor-pointer ${
            collapsed ? 'justify-center px-0' : 'text-left'
          }`}
        >
          <LogOut size={20} />
          <span className={collapsed ? 'sr-only' : undefined}>Log out</span>
        </button>
      </div>
    </aside>
  );
}
