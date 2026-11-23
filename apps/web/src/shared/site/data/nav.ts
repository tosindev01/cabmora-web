/**
 * Public-site chrome data: the header links and the footer's columns.
 *
 * These sat in `features/marketing/data` alongside hero copy and pricing
 * plans, which meant every content page had to import from the marketing
 * feature to render a header — the one genuine feature-to-feature dependency
 * in the app. The header and footer are not marketing; they wrap the whole
 * public site.
 */

export interface NavLink {
  label: string;
  href: string;
}

/**
 * One footer link.
 *
 * `to` is null for a line that is information rather than a destination — the
 * studio's address. Everything else goes somewhere: every link in this footer
 * was `href="#"` until 2026-09-30, so the whole thing looked clickable and
 * none of it was.
 */
export interface FooterLink {
  label: string;
  /** A route, a `#` section of the landing page, a mailto/tel, or null. */
  to: string | null;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * Rooted at `/`, not bare fragments.
 *
 * A bare `#services` only means anything on the landing page; from /about or
 * /blog it pointed at a section that is not there and did nothing at all.
 * Rooting them at `/` makes them work from anywhere.
 */
export const NAV_LINKS: NavLink[] = [
  // The portfolio page, not the homepage's teaser. `/#work` scrolled to a
  // handful of featured stories with a "view all" link under them — so
  // somebody who clicked Work in the navigation, meaning "show me the work",
  // arrived at a sample and had to ask a second time.
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
  // `/#contact` pointed at nothing. No element on the landing page has that
  // id, so the link scrolled nowhere from anywhere — and there has been a
  // real contact page all along.
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Services',
    // All to the same section: there is no page per service, and six links to
    // six pages that do not exist is the problem this replaced.
    links: [
      { label: 'Wedding Photography', to: '/#services' },
      { label: 'Videography', to: '/#services' },
      { label: 'Corporate Events', to: '/#services' },
      { label: 'Drone Coverage', to: '/#services' },
      { label: 'Livestreaming', to: '/#services' },
      { label: 'Photo Albums', to: '/#services' },
    ],
  },
  {
    title: 'Explore',
    // "Packages & Pricing" removed with the pricing section — a footer link to
    // something the page no longer shows is worse than no link.
    links: [
      { label: 'Portfolio', to: '/work' },
      // Sign-in rather than the dashboard: a visitor reading the footer is not
      // signed in, and the guard would bounce them here anyway.
      { label: 'Client Portal', to: '/login' },
      { label: 'Journal', to: '/blog' },
      { label: 'About Cabmora', to: '/about' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'hello@cabmoramedia.com', to: 'mailto:hello@cabmoramedia.com' },
      { label: '+44 77 8010 5876', to: 'tel:+447780105876' },
      // Not a link: it is where we are, not somewhere to go.
      { label: 'Manchester, United Kingdom', to: null },
      { label: 'Book a Consultation', to: '/contact' },
    ],
  },
];

/**
 * The studio's own profiles, all under one handle.
 *
 * Kept as real URLs rather than labels: these were `href="#"`, which looks
 * like a link, reads as a link to a screen reader, and goes nowhere.
 */
export const FOOTER_SOCIALS: FooterLink[] = [
  { label: 'Instagram', to: 'https://instagram.com/cabmoramedia' },
  { label: 'Facebook', to: 'https://facebook.com/cabmoramedia' },
  { label: 'Pinterest', to: 'https://pinterest.com/cabmoramedia' },
];

/** The legal links in the footer bottom bar.
 *
 * No separate cookie policy: the platform sets one strictly-necessary
 * session cookie and nothing else, so a third page would be padding. What
 * there is to say about cookies is a section inside the privacy policy.
 */
export const FOOTER_LEGAL: { label: string; to: string }[] = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];
