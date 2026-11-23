import {
  CreditCard,
  ExternalLink,
  Folder,
  HardDrive,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface PortalNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for the creator portal sidebar.
 *
 * Previously this list was hand-written as ~50 lines of JSX inside each of the
 * ten portal pages, which meant adding a screen required editing all of them.
 */
export const PORTAL_NAV: PortalNavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: Folder },
  { label: 'Media Library', to: '/galleries', icon: ImageIcon },
  { label: 'Messages', to: '/messages', icon: MessageSquare },
  { label: 'Billing', to: '/billing', icon: CreditCard },
  { label: 'Storage Vault', to: '/storage', icon: HardDrive },
  { label: 'Creator Profile', to: '/profile', icon: User },
];

/** Pinned to the bottom of the scrolling nav column. */
export const PORTAL_NAV_SECONDARY: PortalNavItem[] = [
  { label: 'View as Client', to: '/client/dashboard', icon: ExternalLink },
];

/** Rendered in the sidebar footer, below a divider. */
export const PORTAL_NAV_FOOTER: PortalNavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Log out', to: '/', icon: LogOut },
];
