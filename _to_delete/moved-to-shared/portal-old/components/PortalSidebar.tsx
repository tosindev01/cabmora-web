import { Link, useLocation } from 'react-router-dom';

import LogoWhite from '@/assets/cabmora_white_logo.svg';
import {
  PORTAL_NAV,
  PORTAL_NAV_FOOTER,
  PORTAL_NAV_SECONDARY,
  type PortalNavItem,
} from '@/shared/portal/data';
import type { PortalVariant } from './variant';
import { SIDEBAR_CHROME } from './variant';

const BASE =
  'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-[13px] font-medium tracking-[0.05em]';
const IDLE = 'text-canvas/60 hover:bg-canvas/5 hover:text-canvas';
const ACTIVE = 'bg-canvas/10 text-canvas';

function NavLink({ item, active }: { item: PortalNavItem; active: boolean }) {
  const { icon: Icon, label, to } = item;
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`${BASE} ${active ? ACTIVE : IDLE}`}
    >
      <Icon size={20} className={active ? 'text-gold' : undefined} />
      <span>{label}</span>
    </Link>
  );
}

interface PortalSidebarProps {
  open: boolean;
  variant: PortalVariant;
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
export function PortalSidebar({ open, variant }: PortalSidebarProps) {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <aside
      aria-label="Portal navigation"
      className={`fixed inset-y-0 left-0 z-40 ${SIDEBAR_CHROME[variant]} text-canvas flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-20 flex items-center px-8 border-b border-canvas/10">
        <Link to="/">
          <img src={LogoWhite} alt="Cabmora" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col gap-1.5">
        {PORTAL_NAV.map((item) => (
          <NavLink key={item.to} item={item} active={isActive(item.to)} />
        ))}
        <div className="mt-auto flex flex-col gap-1.5">
          {PORTAL_NAV_SECONDARY.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-canvas/10 flex flex-col gap-2">
        {PORTAL_NAV_FOOTER.map((item) => (
          <NavLink key={item.label} item={item} active={false} />
        ))}
      </div>
    </aside>
  );
}
