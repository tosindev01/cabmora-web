import { Menu, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { PortalVariant } from './variant';
import { DashboardThemeToggle, useDashboardTheme } from '@/shared/portal/theme';

const BAR: Record<PortalVariant, string> = {
  light: 'bg-white border-b border-ink/10',
  dark: 'bg-forest border-b border-canvas/10',
};

interface PortalTopbarProps {
  /** A node, not just a string — Project Details titles itself with the record. */
  title: ReactNode;
  /** Second line under the title, hidden on the narrowest screens. */
  subtitle?: string;
  /** Slot between the hamburger and the title — a back button, typically. */
  leading?: ReactNode;
  /** Optional glyph shown beside the title, as Storage and Media do. */
  icon?: LucideIcon;
  variant?: PortalVariant;
  /** Opens the off-canvas sidebar — comes from PortalShell's render prop. */
  onToggleSidebar: () => void;
  /** Right-hand cluster: search, filters, primary action, bell, avatar. */
  children?: ReactNode;
}

/**
 * The 80px bar every portal screen wears.
 *
 * Ten pages each carried this markup, including a hand-inlined 16-line
 * hamburger SVG that lucide already ships as `Menu`, and each wired its own
 * `setIsSidebarOpen` in the click handler.
 */
export function PortalTopbar({
  title,
  subtitle,
  leading,
  icon: Icon,
  variant: _variant,
  onToggleSidebar,
  children,
}: PortalTopbarProps) {
  const [theme] = useDashboardTheme();
  return (
    <header
      className={`h-20 flex items-center justify-between px-5 sm:px-6 lg:px-10 sticky top-0 z-30 gap-2 ${BAR[theme]}`}
    >
      {/* `min-w-0` on the row as well as the title. A flex child defaults to
          min-width:auto, so without it this side refuses to shrink below its
          content, the title never reaches its own `truncate`, and the cluster
          on the right is pushed off the screen — which is what happened to the
          avatar on every portal page at phone width. */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
        <button
          type="button"
          aria-label="Open navigation"
          className="lg:hidden opacity-70 hover:opacity-100 transition-opacity shrink-0"
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
        {leading}
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={22} className="text-gold" />}
          <div className="min-w-0">
            <h1 className="font-serif text-[22px] lg:text-[26px] truncate">{title}</h1>
            {subtitle && <p className="text-[12px] opacity-50 hidden sm:block">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Never squeezed, and tighter on a phone: these are the controls a
          cramped header must keep rather than the ones it may drop. */}
      <div className="flex items-center gap-3 lg:gap-5 shrink-0 ml-3">
        <DashboardThemeToggle />
        {children}
      </div>
    </header>
  );
}

/** Avatar button that opens the account area. */
export function PortalAvatar({ src, alt = 'Your profile' }: { src: string; alt?: string }) {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-current/10 cursor-pointer">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}
