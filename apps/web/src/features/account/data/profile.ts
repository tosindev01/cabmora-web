import {
  creatorLandingApi,
  type CreatorBookingRequestDto,
  type CreatorBookingSubmission,
  type CreatorPortfolioItemDto,
  type CreatorStudioProfileDto,
  type LandingAccentToken,
  type LandingConfigDto,
  type LandingFaqItem,
  type LandingHeadingFont,
  type LandingHeroLayout,
  type LandingSectionsVisibility,
  type LandingServicePackage,
  type LandingStatItem,
  type LandingTestimonial,
  type LandingThemePreset,
} from '@cabmora/api-client';

export type {
  CreatorBookingRequestDto,
  CreatorBookingSubmission,
  CreatorPortfolioItemDto,
  CreatorStudioProfileDto,
  LandingAccentToken,
  LandingConfigDto,
  LandingFaqItem,
  LandingHeadingFont,
  LandingHeroLayout,
  LandingSectionsVisibility,
  LandingServicePackage,
  LandingStatItem,
  LandingTestimonial,
  LandingThemePreset,
};

export interface SocialLinks {
  instagram: string;
  behance: string;
  vimeo: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  website: string;
}

export interface BusinessDetails {
  studioName: string;
  legalName: string;
  handle: string;
  specialization: string;
  categories: string[];
  bio: string;
  experienceYears: number;
  teamSize: string;
  currency: string;
  dayRate: number;
  taxId: string;
}

export interface ContactDetails {
  primaryEmail: string;
  secondaryEmail: string;
  phone: string;
  allowSmsAlerts: boolean;
  address: string;
  city: string;
  country: string;
  timezone: string;
}

export interface ThemePresetDefinition {
  id: LandingThemePreset;
  name: string;
  subtitle: string;
  badge: string;
  pageBg: string;
  altSectionBg: string;
  cardBg: string;
  cardBorder: string;
  navBg: string;
  primaryText: string;
  mutedText: string;
  subtleText: string;
  inputBg: string;
  inputBorder: string;
  swatchBgClass: string;
  swatchAccentClass: string;
  isDark: boolean;
}

export const LANDING_THEME_PRESETS: Record<LandingThemePreset, ThemePresetDefinition> = {
  'noir-gold': {
    id: 'noir-gold',
    name: 'Cabmora Noir & Gold',
    subtitle: 'Signature dark cinema surface with warm gold accents',
    badge: 'Signature Default',
    pageBg: 'bg-noir text-canvas',
    altSectionBg: 'bg-panel-900',
    cardBg: 'bg-panel-800/90',
    cardBorder: 'border-canvas/10',
    navBg: 'bg-noir/85 border-canvas/10',
    primaryText: 'text-canvas',
    mutedText: 'text-canvas/70',
    subtleText: 'text-canvas/45',
    inputBg: 'bg-panel-900 text-canvas',
    inputBorder: 'border-canvas/15 focus:border-gold',
    swatchBgClass: 'bg-noir',
    swatchAccentClass: 'bg-gold',
    isDark: true,
  },
  'ivory-editorial': {
    id: 'ivory-editorial',
    name: 'Ivory Gallery Editorial',
    subtitle: 'Warm off-white museum canvas with crisp ink typography',
    badge: 'Fine Art Print',
    pageBg: 'bg-canvas text-ink',
    altSectionBg: 'bg-sand',
    cardBg: 'bg-white',
    cardBorder: 'border-ink/10',
    navBg: 'bg-canvas/90 border-ink/10',
    primaryText: 'text-ink',
    mutedText: 'text-ink/70',
    subtleText: 'text-ink/45',
    inputBg: 'bg-white text-ink',
    inputBorder: 'border-ink/15 focus:border-gold-deep',
    swatchBgClass: 'bg-canvas',
    swatchAccentClass: 'bg-ink',
    isDark: false,
  },
  'forest-luxe': {
    id: 'forest-luxe',
    name: 'Botanical Forest & Gold',
    subtitle: 'Deep studio teal paired with champagne gold highlights',
    badge: 'Studio Heritage',
    pageBg: 'bg-forest-dark text-canvas',
    altSectionBg: 'bg-forest',
    cardBg: 'bg-forest-light/45',
    cardBorder: 'border-gold/20',
    navBg: 'bg-forest-dark/90 border-gold/15',
    primaryText: 'text-canvas',
    mutedText: 'text-canvas/75',
    subtleText: 'text-canvas/50',
    inputBg: 'bg-forest-dark text-canvas',
    inputBorder: 'border-gold/20 focus:border-gold',
    swatchBgClass: 'bg-forest',
    swatchAccentClass: 'bg-gold',
    isDark: true,
  },
  'midnight-flow': {
    id: 'midnight-flow',
    name: 'Midnight Flow Cinema',
    subtitle: 'Anamorphic deep navy with cool sky & gold edge lighting',
    badge: 'Motion & Film',
    pageBg: 'bg-flow-950 text-canvas',
    altSectionBg: 'bg-flow-900',
    cardBg: 'bg-flow-800/90',
    cardBorder: 'border-flow-600/60',
    navBg: 'bg-flow-950/85 border-flow-700',
    primaryText: 'text-canvas',
    mutedText: 'text-flow-300',
    subtleText: 'text-flow-400',
    inputBg: 'bg-flow-900 text-canvas',
    inputBorder: 'border-flow-600 focus:border-flow-sky',
    swatchBgClass: 'bg-flow-900',
    swatchAccentClass: 'bg-flow-sky',
    isDark: true,
  },
  'sand-minimal': {
    id: 'sand-minimal',
    name: 'Parchment & Bronze',
    subtitle: 'Sunlit Mediterranean parchment with warm bronze contrast',
    badge: 'Destination & Wedding',
    pageBg: 'bg-parchment text-ink',
    altSectionBg: 'bg-sand',
    cardBg: 'bg-canvas',
    cardBorder: 'border-gold-deep/20',
    navBg: 'bg-parchment/90 border-gold-deep/15',
    primaryText: 'text-ink',
    mutedText: 'text-ink/75',
    subtleText: 'text-ink/50',
    inputBg: 'bg-canvas text-ink',
    inputBorder: 'border-gold-deep/25 focus:border-gold-deep',
    swatchBgClass: 'bg-parchment',
    swatchAccentClass: 'bg-gold-deep',
    isDark: false,
  },
};

export interface AccentTokenDefinition {
  id: LandingAccentToken;
  label: string;
  buttonClass: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
  swatchClass: string;
}

export const LANDING_ACCENT_TOKENS: Record<LandingAccentToken, AccentTokenDefinition> = {
  gold: {
    id: 'gold',
    label: 'Cabmora Gold',
    buttonClass: 'bg-gold text-ink hover:bg-gold-dark',
    badgeClass: 'bg-gold/15 text-gold border-gold/30',
    textClass: 'text-gold',
    borderClass: 'border-gold',
    swatchClass: 'bg-gold',
  },
  forest: {
    id: 'forest',
    label: 'Deep Forest Teal',
    buttonClass: 'bg-forest-light text-canvas hover:bg-forest',
    badgeClass: 'bg-forest-light/25 text-gold-tint border-gold/30',
    textClass: 'text-gold-tint',
    borderClass: 'border-forest-light',
    swatchClass: 'bg-forest-light',
  },
  'flow-sky': {
    id: 'flow-sky',
    label: 'Cinema Sky Blue',
    buttonClass: 'bg-flow-sky text-flow-950 hover:bg-gold',
    badgeClass: 'bg-flow-sky/15 text-flow-sky border-flow-sky/30',
    textClass: 'text-flow-sky',
    borderClass: 'border-flow-sky',
    swatchClass: 'bg-flow-sky',
  },
  ink: {
    id: 'ink',
    label: 'Editorial Monochrome',
    buttonClass: 'bg-ink text-canvas hover:bg-gold hover:text-ink',
    badgeClass: 'bg-ink/10 text-gold-deep border-ink/20',
    textClass: 'text-gold-deep',
    borderClass: 'border-ink',
    swatchClass: 'bg-ink',
  },
};

export const DEFAULT_LANDING_CONFIG: LandingConfigDto = {
  theme_preset: 'noir-gold',
  accent_token: 'gold',
  heading_font: 'serif',
  hero_layout: 'cinematic-full',
  hero_eyebrow: 'EDITORIAL & FINE ART COMMERCIAL PRODUCTION',
  hero_headline: 'Crafting Timeless *Visual Narratives* for Iconic Brands & Modern Romantics.',
  hero_subheadline:
    '<p>From high-fashion editorial campaigns in <strong>London &amp; New York</strong> to intimate architectural and destination films — every frame is composed with cinematic precision, medium-format depth, and bespoke color science.</p>',
  hero_cta_primary: 'Commission a Shoot',
  hero_cta_secondary: 'Explore Gallery',
  hero_video_url:
    'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-model-in-a-studio-34487-large.mp4',
  availability_badge: '',
  accepting_bookings: true,
  about_eyebrow: 'ABOUT US',
  about_heading: 'Where Editorial Discipline Meets Atmospheric Storytelling',
  about_rich_text:
    '<h3>Our Creative Philosophy</h3><p>We believe photography and motion direction should feel tactile, deliberate, and enduring. Rather than chasing fleeting visual trends, our studio combines <strong>medium-format digital and 35mm analog film</strong> workflows with cinema-grade lighting.</p><blockquote>“Light is not merely illumination — it is the architecture of emotion and memory.”</blockquote><p>Every commission includes private cloud proofing via <em>Cabmora Studio Vault</em>, frame-accurate retouching notes, and archival-grade delivery in full uncompressed resolution.</p><ul><li><strong>Bespoke Art Direction:</strong> Moodboards, location scouting &amp; styling consultation.</li><li><strong>Hybrid Still + Motion:</strong> Coordinated photography and 4K ProRes cinema reels.</li><li><strong>Private Client Portal:</strong> Watermarked proofing, frame-pinned feedback &amp; instant licensing.</li></ul>',
  about_pull_quote:
    'Light is the architecture of emotion — we sculpt every frame to outlive the moment.',
  stats: [
    { value: '8+', label: 'Years Directing' },
    { value: '180+', label: 'Global Commissions' },
    { value: '4K', label: 'Cinema & Medium Format' },
    { value: '100%', label: 'Private Cloud Delivery' },
  ],
  services: [
    {
      id: 'svc-editorial',
      title: 'Commercial & Editorial Campaign',
      tagline: 'Full-scale production for fashion houses, luxury hospitality & design labels.',
      price_label: 'From $4,500',
      duration: 'Full Day (10 Hours)',
      deliverables: [
        'Creative direction & lighting treatment',
        '80+ master-retouched high-res stills',
        '60-second 4K vertical & cinema campaign cut',
        'Commercial usage & global print license',
      ],
      featured: true,
    },
    {
      id: 'svc-wedding',
      title: 'Destination Wedding & Weekend Story',
      tagline: 'Unobtrusive editorial coverage across rehearsal dinner, ceremony & after-party.',
      price_label: 'From $6,800',
      duration: '2 Days • 2 Lead Creatives',
      deliverables: [
        '600+ curated & color-graded fine art stills',
        '35mm analog film rolls included',
        '8-minute cinematic narrative film + teaser',
        'Private Cabmora proofing vault for guests',
      ],
      featured: false,
    },
    {
      id: 'svc-portrait',
      title: 'Executive & Artist Portrait Session',
      tagline: 'Studio or architectural on-location portraiture with bespoke lighting.',
      price_label: 'From $1,800',
      duration: 'Half Day (4 Hours)',
      deliverables: [
        'Up to 4 wardrobe & set looks',
        '25 master-retouched editorial portraits',
        '48-hour express private proofing gallery',
        'Press & publication licensing',
      ],
      featured: false,
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      quote:
        'Working with Cabmora Creative Studios transformed our seasonal campaign. The lighting, pacing, and seamless proofing gallery made approval across three continents effortless.',
      author: 'Elena Rostova',
      role: 'Creative Director, Maison Verve Paris',
      project_type: 'Autumn/Winter Editorial Campaign',
      rating: 5,
    },
    {
      id: 'test-2',
      quote:
        'Every single photograph from our Lake Como weekend looks like a frame from an Italian cinema classic. Our families were blown away by the private gallery.',
      author: 'Julian & Clara Vance',
      role: 'Private Clients • Lake Como',
      project_type: 'Destination Wedding Stills & Film',
      rating: 5,
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'How does the booking and commission process work?',
      answer:
        'Submit your project details using the booking form below. Within 24 hours, we schedule a discovery call, prepare a tailored treatment & proposal, and secure your dates with a 30% retainer via your private Cabmora client portal.',
    },
    {
      id: 'faq-2',
      question: 'How and when are galleries and films delivered?',
      answer:
        'Preview selects arrive within 72 hours of wrap. Full galleries and cinema edits are delivered in your private Cabmora Vault within 2–4 weeks, complete with pin-point revision comments and one-click masters download.',
    },
    {
      id: 'faq-3',
      question: 'Are you available for international travel?',
      answer:
        'Yes — our team regularly produces shoots between New York, London, Paris, Lagos, and Milan, with streamlined travel logistics built into destination packages.',
    },
  ],
  sections_visibility: {
    hero: true,
    stats: true,
    about: true,
    gallery: true,
    services: true,
    testimonials: true,
    faq: true,
    booking: true,
  },
  booking_heading: 'Commission Your Next Visual Story',
  booking_subtext:
    'Share your dates, location, and creative vision below. Direct inquiries go straight to our studio producer for availability confirmation within 24 hours.',
};

export const DEFAULT_PORTFOLIO_ITEMS: CreatorPortfolioItemDto[] = [
  {
    id: 'work-milan-editorial',
    title: 'Nocturne in Milan — Autumn Editorial',
    subtitle: 'Medium-format fashion story shot on location at Villa Necchi',
    category: 'Editorial',
    media_type: 'photo',
    media_url:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&auto=format&fit=crop&q=80',
    video_url: null,
    description:
      'A study in shadow, tailored wool, and late-afternoon Lombardy light. Shot on medium format with custom tungsten fill for Maison Aurelia’s AW collection.',
    client_name: 'Maison Aurelia',
    location: 'Milan, Italy',
    shoot_year: '2026',
    aspect_ratio: 'portrait',
    featured: true,
    sort_order: 1,
    gallery_images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'work-como-cinema',
    title: 'Villa Balbiano — Cinema & Stills',
    subtitle: 'Three-day destination celebration on Lake Como',
    category: 'Wedding',
    media_type: 'video',
    media_url:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&auto=format&fit=crop&q=80',
    video_url:
      'https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-in-a-forest-41240-large.mp4',
    description:
      'Hybrid 4K anamorphic motion and 35mm Kodak Portra stills capturing a three-day gathering on the western shore of Lake Como.',
    client_name: 'Julian & Clara',
    location: 'Lake Como, Italy',
    shoot_year: '2026',
    aspect_ratio: 'cinema',
    featured: true,
    sort_order: 2,
    gallery_images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'work-kyoto-arch',
    title: 'Monolith & Glass — Architectural Study',
    subtitle: 'Brutalist concrete and warm travertine interiors',
    category: 'Architecture',
    media_type: 'photo',
    media_url:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80',
    video_url: null,
    description:
      'Natural dawn-to-dusk light progression across a private residence designed by Studio Kengo.',
    client_name: 'Studio Kengo',
    location: 'Kyoto & Tokyo',
    shoot_year: '2025',
    aspect_ratio: 'landscape',
    featured: true,
    sort_order: 3,
    gallery_images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'work-geneva-film',
    title: 'Sovereign Horology — Commercial Film',
    subtitle: 'Macro high-speed motion & key visuals for Geneva launch',
    category: 'Commercial',
    media_type: 'video',
    media_url:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&auto=format&fit=crop&q=80',
    video_url:
      'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-model-in-a-studio-34487-large.mp4',
    description:
      'Precision macro cinematography and probe-lens sequences highlighting hand-finished mechanical calibres.',
    client_name: 'Atelier Valmont',
    location: 'Geneva, Switzerland',
    shoot_year: '2026',
    aspect_ratio: 'square',
    featured: false,
    sort_order: 4,
    gallery_images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'work-ny-portraits',
    title: 'Velvet & Brass — Artist Portraits',
    subtitle: 'Intimate studio portraits of contemporary composers',
    category: 'Portrait',
    media_type: 'photo',
    media_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1400&auto=format&fit=crop&q=80',
    video_url: null,
    description:
      'Chiaroscuro single-source portraiture captured in our New York daylight loft.',
    client_name: 'Philharmonic Press',
    location: 'New York, NY',
    shoot_year: '2026',
    aspect_ratio: 'portrait',
    featured: false,
    sort_order: 5,
    gallery_images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'work-desert-motion',
    title: 'Desert Mirage — High Desert Motion Reel',
    subtitle: 'Aerial & Steadicam campaign across Utah salt flats',
    category: 'Film & Motion',
    media_type: 'video',
    media_url:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&auto=format&fit=crop&q=80',
    video_url:
      'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    description: 'Inspire 3 RAW aerials paired with Steadicam tracking shots at golden hour.',
    client_name: 'Solstice Athletics',
    location: 'Bonneville, UT',
    shoot_year: '2025',
    aspect_ratio: 'landscape',
    featured: true,
    sort_order: 6,
    gallery_images: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&auto=format&fit=crop&q=80',
    ],
  },
];

export const DEFAULT_STUDIO_PROFILE: CreatorStudioProfileDto = {
  slug: 'sarah-cabmora',
  is_published: true,
  studio_name: 'Cabmora Creative Studios',
  legal_name: 'Cabmora Visual Arts LLC',
  specialization: 'Editorial & Fine Art Commercial Photography',
  categories: ['Editorial Photography', '4K Video Reels', 'Wedding Proofing', 'Drone Aerials'],
  bio: 'Passionate visual artist specializing in high-fashion editorial spreads, commercial branding campaigns, and atmospheric cinematic storytelling across London & New York.',
  experience_years: 8,
  team_size: '2 - 5 Creatives',
  currency: 'USD ($)',
  day_rate: 2500,
  tax_id: 'US-94820193-TX',
  cover_url:
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&h=600&fit=crop',
  avatar_url:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  primary_email: 'sarah@cabmora.com',
  secondary_email: 'studio.inquiries@cabmora.com',
  phone: '+1 (555) 382-9012',
  allow_sms_alerts: true,
  address: '450 Fashion Avenue, Suite 1200',
  city: 'New York, NY 10001',
  country: 'United States',
  timezone: 'UTC-05:00 (Eastern Time)',
  socials: {
    instagram: '@sarah.cabmora',
    behance: 'behance.net/sarahcabmora',
    vimeo: 'vimeo.com/cabmorastudios',
    youtube: 'youtube.com/@cabmoravisuals',
    linkedin: 'linkedin.com/in/sarah-cabmora',
    twitter: '@cabmorastudio',
    website: 'https://cabmorastudios.com',
  },
  landing_config: DEFAULT_LANDING_CONFIG,
  portfolio_items: DEFAULT_PORTFOLIO_ITEMS,
};

export const DEFAULT_BOOKING_REQUESTS: CreatorBookingRequestDto[] = [
  {
    id: 'bk-101',
    creator_slug: 'sarah-cabmora',
    client_name: 'Amara Okafor',
    client_email: 'amara@atelierlara.com',
    client_phone: '+44 20 7946 0192',
    company_or_brand: 'Atelier Lara London',
    service_title: 'Commercial & Editorial Campaign',
    event_type: 'Editorial / Commercial',
    preferred_date: '2026-12-14',
    location: 'Mayfair, London',
    budget_range: '$5,000 – $10,000',
    project_brief:
      'Looking for a 2-day editorial campaign shoot (stills + 4K motion) for our Resort 2027 capsule collection.',
    status: 'new',
    created_at: '2026-11-10T14:30:00Z',
  },
  {
    id: 'bk-102',
    creator_slug: 'sarah-cabmora',
    client_name: 'Marcus & Elena Sterling',
    client_email: 'm.sterling@sterlingventures.io',
    client_phone: '+1 (212) 555-0148',
    company_or_brand: 'Private Commission',
    service_title: 'Destination Wedding & Weekend Story',
    event_type: 'Destination Wedding',
    preferred_date: '2027-05-22',
    location: 'Amalfi Coast, Italy',
    budget_range: '$10,000+',
    project_brief:
      'Two-day celebration at Villa Cimbrone in Ravello. Interested in both 35mm analog stills and a full narrative film.',
    status: 'contacted',
    created_at: '2026-11-08T09:15:00Z',
  },
];

const LOCAL_PROFILE_STORAGE_KEY = 'cabmora_creator_studio_profile_v1';
const LOCAL_BOOKINGS_STORAGE_KEY = 'cabmora_creator_studio_bookings_v1';

function readLocalProfile(): CreatorStudioProfileDto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreatorStudioProfileDto;
    return {
      ...DEFAULT_STUDIO_PROFILE,
      ...parsed,
      landing_config: {
        ...DEFAULT_LANDING_CONFIG,
        ...(parsed.landing_config ?? {}),
        sections_visibility: {
          ...DEFAULT_LANDING_CONFIG.sections_visibility,
          ...(parsed.landing_config?.sections_visibility ?? {}),
        },
      },
      portfolio_items:
        Array.isArray(parsed.portfolio_items) && parsed.portfolio_items.length > 0
          ? parsed.portfolio_items
          : DEFAULT_PORTFOLIO_ITEMS,
    };
  } catch {
    return null;
  }
}

function writeLocalProfile(profile: CreatorStudioProfileDto): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

function readLocalBookings(): CreatorBookingRequestDto[] {
  if (typeof window === 'undefined') return DEFAULT_BOOKING_REQUESTS;
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_BOOKING_REQUESTS;
    const parsed = JSON.parse(raw) as CreatorBookingRequestDto[];
    return Array.isArray(parsed) ? parsed : DEFAULT_BOOKING_REQUESTS;
  } catch {
    return DEFAULT_BOOKING_REQUESTS;
  }
}

function writeLocalBookings(bookings: CreatorBookingRequestDto[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore storage quota errors
  }
}

export async function loadCreatorStudioProfile(): Promise<{
  profile: CreatorStudioProfileDto;
  source: 'api' | 'local';
}> {
  try {
    const remote = await creatorLandingApi.getMyCreatorProfile();
    writeLocalProfile(remote);
    return { profile: remote, source: 'api' };
  } catch {
    const cached = readLocalProfile() ?? DEFAULT_STUDIO_PROFILE;
    return { profile: cached, source: 'local' };
  }
}

export async function saveCreatorStudioProfile(profile: CreatorStudioProfileDto): Promise<{
  profile: CreatorStudioProfileDto;
  syncedWithApi: boolean;
}> {
  writeLocalProfile(profile);
  try {
    const saved = await creatorLandingApi.updateMyCreatorProfile(profile);
    writeLocalProfile(saved);
    return { profile: saved, syncedWithApi: true };
  } catch {
    return { profile, syncedWithApi: false };
  }
}

export async function loadPublicCreatorStudioProfile(
  slug: string,
): Promise<CreatorStudioProfileDto> {
  try {
    const remote = await creatorLandingApi.getPublicCreatorProfile(slug);
    return remote;
  } catch {
    const local = readLocalProfile() ?? DEFAULT_STUDIO_PROFILE;
    return {
      ...local,
      slug: slug || local.slug,
    };
  }
}

export async function submitPublicCreatorBooking(
  slug: string,
  submission: CreatorBookingSubmission,
): Promise<CreatorBookingRequestDto> {
  try {
    const created = await creatorLandingApi.submitCreatorBooking(slug, submission);
    const existing = readLocalBookings();
    writeLocalBookings([created, ...existing.filter((b) => b.id !== created.id)]);
    return created;
  } catch {
    const fallbackBooking: CreatorBookingRequestDto = {
      id: `bk-${Date.now()}`,
      creator_slug: slug,
      client_name: submission.client_name,
      client_email: submission.client_email,
      client_phone: submission.client_phone ?? '',
      company_or_brand: submission.company_or_brand ?? '',
      service_title: submission.service_title ?? 'Custom Commission',
      event_type: submission.event_type,
      preferred_date: submission.preferred_date ?? '',
      location: submission.location ?? '',
      budget_range: submission.budget_range ?? '',
      project_brief: submission.project_brief,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    const existing = readLocalBookings();
    writeLocalBookings([fallbackBooking, ...existing]);
    return fallbackBooking;
  }
}

export async function loadCreatorBookings(): Promise<CreatorBookingRequestDto[]> {
  try {
    const remote = await creatorLandingApi.listMyCreatorBookings();
    writeLocalBookings(remote);
    return remote;
  } catch {
    return readLocalBookings();
  }
}

export async function updateCreatorBookingStatus(
  bookingId: string,
  status: CreatorBookingRequestDto['status'],
): Promise<CreatorBookingRequestDto[]> {
  const existing = readLocalBookings();
  const updatedLocal = existing.map((item) =>
    item.id === bookingId ? { ...item, status } : item,
  );
  writeLocalBookings(updatedLocal);
  try {
    await creatorLandingApi.updateMyCreatorBookingStatus(bookingId, status);
  } catch {
    // Local update already persisted
  }
  return updatedLocal;
}
