import {
  CalendarCheck,
  CreditCard,
  ExternalLink,
  Folder,
  HardDrive,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
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
  { label: 'Cabmora AI', to: '/ai', icon: Sparkles },
  { label: 'Messages', to: '/messages', icon: MessageSquare },
  { label: 'Billing', to: '/billing', icon: CreditCard },
  { label: 'Storage Vault', to: '/storage', icon: HardDrive },
  { label: 'Creator Profile', to: '/profile', icon: User },
];

/**
 * The customer portal sidebar.
 *
 * Not the creator list with entries removed: a client has no Storage Vault, no
 * Media Library of their own and no Creator Profile, and greying those out
 * advertises features that are not theirs.
 */
export const CLIENT_NAV: PortalNavItem[] = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/client/projects', icon: Folder },
  { label: 'Media', to: '/client/media', icon: ImageIcon },
  { label: 'Messages', to: '/client/messages', icon: MessageSquare },
  { label: 'Billing', to: '/client/billing', icon: CreditCard },
  { label: 'Settings', to: '/client/settings', icon: Settings },
];

/**
 * The way back to the creator studio.
 *
 * Shown only to a creator or admin who is viewing the client side — see
 * `ClientPortalShell`. A customer never gets this, and `/dashboard` and its
 * siblings are role-gated in app/router.tsx to match: a link without the
 * guard bounces, and a guard without the link strands anyone crossing over.
 */
export const CLIENT_NAV_SECONDARY: PortalNavItem[] = [
  { label: 'Creator Studio', to: '/dashboard', icon: ExternalLink },
];

/** Client footer — their settings live on their own route. */
export const CLIENT_NAV_FOOTER: PortalNavItem[] = [
  /* The consultation form, which is where booking a call actually happens.
  
     This pointed at `/client/bookings`, a route that does not exist — so the
     catch-all sent a signed-in client to the marketing homepage, out of their
     own portal, with no indication anything had gone wrong. There is no
     booking screen inside the portal to send them to instead, and the
     enquiry form already carries the slot picker. */
  { label: 'Book a call', to: '/contact', icon: CalendarCheck },
];

/** Pinned to the bottom of the scrolling nav column. */
export const PORTAL_NAV_SECONDARY: PortalNavItem[] = [
  { label: 'View as Client', to: '/client/dashboard', icon: ExternalLink },
];

/**
 * Rendered in the sidebar footer, below a divider.
 *
 * "Log out" is deliberately NOT here. It was `{ to: '/' }`, which rendered a
 * <Link> — so it navigated home and left the session cookie completely intact:
 * you were still signed in, and clicking any portal link proved it. Only the
 * server can clear an HttpOnly cookie, so signing out is a request, not a
 * destination. It is a real button in PortalSidebar instead.
 */
export const PORTAL_NAV_FOOTER: PortalNavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
];
