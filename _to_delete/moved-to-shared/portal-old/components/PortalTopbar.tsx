import { Bell, Menu, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { PortalVariant } from './variant';

const BAR: Record<PortalVariant, string> = {
  light: 'bg-white border-b border-ink/10',
  dark: 'bg-panel-900 border-b border-canvas/5',
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
  variant = 'light',
  onToggleSidebar,
  children,
}: PortalTopbarProps) {
  return (
    <header
      className={`h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 ${BAR[variant]}`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation"
          className="lg:hidden opacity-70 hover:opacity-100 transition-opacity"
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

      {children && <div className="flex items-center gap-6">{children}</div>}
    </header>
  );
}

/** Bell with unread badge — the right-hand cluster most portal pages share. */
export function PortalNotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button
      type="button"
      aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
      className="relative opacity-60 hover:opacity-100 transition-opacity"
    >
      <Bell size={22} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
          {count}
        </span>
      )}
    </button>
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
