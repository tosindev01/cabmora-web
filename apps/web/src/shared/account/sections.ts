import {
  Bell,
  CreditCard,
  Globe,
  HardDrive,
  HelpCircle,
  KeyRound,
  LogOut,
  PoundSterling,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

/**
 * The ten things Settings is meant to cover, per Cabmora's own list.
 *
 * `state` is here so the page can say what is true. A section that is not
 * built yet says so rather than rendering controls that silently do nothing —
 * the 2FA toggle already on `/profile` flips a local boolean and announces
 * "2FA authentication activated!", which is worse than having no toggle, and
 * this list exists partly so that cannot happen again as the rest lands.
 *
 * No React in here: this is a table, not a component.
 */
export type SectionState =
  /** Built and wired to the API. */
  | 'ready'
  /** Lives on its own page; this is a signpost to it. */
  | 'elsewhere'
  /** Not built. Shown, named, and honest about it. */
  | 'planned';

/**
 * Who a section is for.
 *
 * Not every item on the list applies to every account. Storage is something a
 * creator buys; a customer has none, and `/storage` is role-gated to creators,
 * so offering it to a customer is a link that bounces them. "Subscription"
 * likewise: a creator has a plan, a customer has invoices.
 */
export type Audience = 'all' | 'creator' | 'customer';

export interface SettingsSection {
  id: string;
  audience: Audience;
  label: string;
  description: string;
  icon: LucideIcon;
  state: SectionState;
  /** Where it lives, for `elsewhere`. A pair when the two sides each have
   *  their own screen. */
  to?: string | { customer: string; creator: string };
  /** Why it is not here yet, for `planned`. Shown to the reader. */
  note?: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'profile',
    audience: 'all',
    label: 'Profile',
    description: 'Your picture, name, email address and phone number.',
    icon: UserRound,
    state: 'ready',
  },
  {
    id: 'password',
    audience: 'all',
    label: 'Change Password',
    description: 'Update the password you sign in with.',
    icon: KeyRound,
    state: 'ready',
  },
  {
    id: 'currency',
    audience: 'all',
    label: 'Preferred Currency',
    description: 'The currency used for invoices, payments and pricing.',
    icon: PoundSterling,
    state: 'ready',
  },
  {
    id: 'notifications',
    audience: 'all',
    label: 'Notifications',
    description: 'Which emails you receive about payments, invoices, bookings and messages.',
    icon: Bell,
    state: 'ready',
  },
  {
    id: 'storage',
    audience: 'creator',
    label: 'Storage Usage',
    description: 'What you are using, what is left, and what is taking up the most space.',
    icon: HardDrive,
    state: 'elsewhere',
    to: '/storage',
  },
  {
    id: 'locale',
    audience: 'all',
    label: 'Language & Time Zone',
    description: 'Your language, date format and time zone.',
    icon: Globe,
    state: 'ready',
  },
  /* No "Privacy & Security" row.
  
     It listed two-factor authentication and signed-in devices as planned,
     which was honest about the state and still wrong to show: a reader
     scanning their settings for how protected they are learns that the
     answer is "less than you might assume", and can do nothing about it.
     Neither can be built on a stateless session anyway — there is nothing to
     list as a device and nothing to revoke — so this returns when server-side
     sessions do, not before. Changing the password is on this list and is the
     protection that actually exists. */
  {
    id: 'billing',
    audience: 'all',
    label: 'Subscription & Billing',
    description: 'Your invoices, what is settled and what is outstanding.',
    icon: CreditCard,
    state: 'elsewhere',
    // Each side has its own billing screen, and `/billing` is role-gated to
    // creators — sending a customer there bounces them to the landing page.
    to: { customer: '/client/billing', creator: '/billing' },
  },
  {
    id: 'help',
    audience: 'all',
    label: 'Help & Support',
    description: 'Guides, and a way to reach us.',
    icon: HelpCircle,
    state: 'elsewhere',
    to: '/help',
  },
  {
    id: 'logout',
    audience: 'all',
    label: 'Log Out',
    description: 'End this session on this device.',
    icon: LogOut,
    state: 'ready',
  },
];

/** The sections this account should see, in order. */
export function sectionsFor(audience: Exclude<Audience, 'all'>): SettingsSection[] {
  return SETTINGS_SECTIONS.filter(
    (section) => section.audience === 'all' || section.audience === audience,
  );
}

/** Resolve a section's destination for one side of the product. */
export function destinationFor(
  section: SettingsSection,
  audience: Exclude<Audience, 'all'>,
): string | undefined {
  if (typeof section.to === 'string' || section.to === undefined) return section.to;
  return section.to[audience];
}
