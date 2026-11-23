import {
  Building2,
  Calendar,
  Camera,
  Check,
  Clock,
  Heart,
  MessageSquare,
  Radio,
  Shield,
  Video,
  Wind,
} from 'lucide-react';
import type {
  ContactDetail,
  CreatorFeature,
  PortalFeature,
  PortalPhoto,
  PricingPlan,
  PrimaryService,
  ProcessStep,
  Reason,
  SecondaryService,
  MainStory,
  SideStory,
  Testimonial,
  WideStory,
} from './types';

// STATS was four invented figures — 500+ Happy Clients, 8 Years of
// Excellence, 200+ Events Covered and a 4.9 Google Rating asserted with no
// Google integration behind it. The homepage band now counts what is real:
// GET /api/v1/stats for clients and events, published reviews for the
// rating. See components/Stats.tsx.

export const FEATURED_HERO_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1764499892443-90404cde4cdc?w=1200&h=1500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1680884150120-c944d0143401?w=1200&h=1500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1770301312795-abdc6deee5a8?w=1200&h=1500&fit=crop&auto=format',
];

/**
 * Client-supplied photography is served from `apps/web/public/portfolio/`, not
 * imported from `src/assets/`. A missing file in `assets/` fails the Vite build;
 * a missing file in `public/` only 404s, and `fallbackImg` catches that — so a
 * photo that has not been dropped in yet can never block a deploy.
 *
 * Cards render 4:3 with `object-cover`, so supply ~1400x1050 or wider. Files
 * here are not content-hashed: replacing one in place needs a hard refresh.
 */
/**
 * The hero panel. Lived inline in the component until its strings started
 * changing; it sits here with its siblings so the next copy change is one
 * file, not a hunt through JSX.
 */
export const FEATURED_MAIN_STORY: MainStory = {
  kicker: 'Wedding',
  location: 'Birmingham',
  title: 'Elena & Marco',
  caption: 'Seaside ceremony at the golden hour',
};

export const FEATURED_SIDE_STORIES: SideStory[] = [
  {
    img: '/portfolio/sofia-and-james.jpg',
    fallbackImg:
      'https://images.unsplash.com/photo-1680884150120-c944d0143401?w=900&h=680&fit=crop&auto=format',
    // Portrait 1200x1800 in a 4:3 card: centring cuts the top of the groom's
    // head, so bias the crop upwards.
    focal: 'center 25%',
    alt: 'Bride and groom smiling at each other beneath a rose-covered arch outside a chapel',
    kicker: 'Wedding Film',
    title: 'Sofia & James',
    meta: 'Leeds, Summer 2024',
  },
  {
    img: 'https://images.unsplash.com/photo-1768508950719-4d76978fdf44?w=900&h=680&fit=crop&auto=format',
    alt: 'Elegant formal dinner with floral centerpieces and candlelight',
    kicker: 'Corporate Event',
    title: 'Radiance Gala 2024',
    meta: '500-guest awards ceremony, London',
  },
];

export const FEATURED_WIDE_STORY: WideStory = {
  img: 'https://images.unsplash.com/photo-1770301312795-abdc6deee5a8?w=1800&h=700&fit=crop&auto=format',
  alt: 'Bride and groom holding hands at dusk, silhouetted against the sky',
  kicker: 'Portrait Session',
  title: 'Amara & Daniel',
};

export const PRIMARY_SERVICES: PrimaryService[] = [
  {
    icon: Camera,
    label: 'Photography',
    desc: 'Timeless, editorial images that capture every nuance of emotion, from a stolen glance to a sweeping landscape.',
    index: '01',
  },
  {
    icon: Video,
    label: 'Videography',
    desc: 'Cinematic films that play back the feeling of your event, not just the sequence of events.',
    index: '02',
  },
];

export const SECONDARY_SERVICES: SecondaryService[] = [
  {
    icon: Building2,
    label: 'Corporate',
    desc: 'Brand imagery that communicates professionalism and personality in equal measure.',
  },
  {
    icon: Calendar,
    label: 'Events',
    desc: 'Multi-photographer coordination so no angle, no emotion, goes uncaptured.',
  },
  {
    icon: Wind,
    label: 'Drone',
    desc: 'Breathtaking aerial perspectives that transform the familiar into the extraordinary.',
  },
  {
    icon: Radio,
    label: 'Livestream',
    desc: 'Broadcast your moments in real time to guests near and far, beautifully produced.',
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Essential',
    price: 'From £2,500',
    desc: 'Perfect for intimate gatherings and focused storytelling coverage.',
    features: [
      '8 Hours Coverage',
      'Single Photographer',
      'Edited High-Res Images',
      'Private Cabmora Gallery',
    ],
  },
  {
    name: 'Comprehensive',
    price: 'From £4,800',
    desc: 'Our most popular offering for complete documentary and cinematic storytelling.',
    features: [
      '10 Hours Coverage',
      'Photo & Video Team',
      'Highlight Film (5 mins)',
      'Drone Aerial Footage',
      'Priority Delivery',
    ],
  },
  {
    name: 'Cinematic',
    price: 'Custom',
    desc: 'Multi-day coverage and dedicated editorial curation for lavish celebrations.',
    features: [
      'Multi-day Coverage',
      'Lead Photographer & Videographer',
      'Full Feature Film',
      'Express Same-Week Preview',
      'Fine Art Heirloom Album',
    ],
  },
];

/**
 * The intro to "Why clients choose us" — Cabmora's own words, supplied by Ayo.
 *
 * Two paragraphs rather than one string: the section sets them as separate
 * blocks and a `\n` inside a `<p>` collapses to a space.
 */
export const WHY_INTRO: string[] = [
  'At Cabmora Media, we believe great content is more than just taking photos or recording videos. It is about understanding your story, capturing the moments that matter and creating something you will be proud to share.',
  'Our clients choose us because we combine creativity, professionalism and attention to detail with a personal approach. Whether it is a wedding, celebration, corporate event, product, podcast or brand campaign, we take the time to understand what you need and deliver visuals that reflect your vision.',
];

/** The line that introduces the six rows below it. */
export const WHY_EXPECTATIONS = 'What you can expect from us';

/**
 * The six reasons, in Cabmora's own copy.
 *
 * `title` and `body` are Ayo's text unaltered. `tag` is the small gold eyebrow
 * above each one and is a single word lifted from the intro paragraph —
 * "creativity, professionalism and attention to detail with a personal
 * approach" — rather than a claim nobody wrote.
 *
 * The photographs are Cabmora's own, from `public/portfolio/work/`. They were
 * stock from Unsplash until now, which is a poor thing to illustrate "visuals
 * that reflect your vision" with. The four the hero slideshow already cycles
 * are deliberately not reused here — they sit on the same page.
 *
 * Alt text describes only what is visible. Nobody here knows who these people
 * are or what was being marked, and `work.ts` refuses to caption them for the
 * same reason.
 */
export const REASONS: Reason[] = [
  {
    tag: 'Creativity',
    title: 'Creative & Cinematic\nQuality',
    body: 'We approach every project with creativity and purpose, creating visuals that feel polished, engaging and memorable.',
    img: '/portfolio/work/img-2856.jpg',
    alt: 'A couple in wedding dress and black tie beneath a floral arch',
  },
  {
    tag: 'Professionalism',
    title: 'Professional\nService',
    body: 'From your first enquiry to final delivery, we keep the process clear, organised and professional.',
    img: '/portfolio/work/img-2884.jpg',
    alt: 'A speaker presenting to a seated audience in a meeting room',
  },
  {
    tag: 'Personal Approach',
    title: 'Tailored\nto You',
    body: 'No two projects are the same. We listen to what you want and build our approach around your event, brand or story.',
    img: '/portfolio/work/img-2935.jpg',
    alt: 'A graduate in cap and gown beneath a brick archway',
  },
  {
    tag: 'Detail',
    title: 'Attention\nto Detail',
    body: 'We focus on the moments, expressions and details that can easily be missed, making sure your final photos and videos tell the complete story.',
    img: '/portfolio/work/img-2855.jpg',
    alt: 'A couple in bridal lace and black tie, photographed close',
  },
  {
    tag: 'Delivery',
    title: 'Reliable\nDelivery',
    body: 'We take deadlines seriously and keep you informed throughout the production process.',
    img: '/portfolio/work/img-2940.jpg',
    alt: 'Two graduates in cap and gown holding bouquets',
  },
  {
    tag: 'Trust',
    title: 'A Team You\nCan Trust',
    body: 'We work closely with our clients, making the experience comfortable and straightforward while delivering work we are proud to put our name on.',
    img: '/portfolio/work/dsc08758.jpg',
    alt: 'A guest photographed in close-up at an outdoor event',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    num: '01',
    title: 'Enquiry',
    desc: 'Reach out via our form or book a discovery call. Tell us about your event and what you envision.',
  },
  {
    num: '02',
    title: 'Consultation',
    desc: 'We meet, in person or virtually, to understand your story, your preferences and every detail that matters.',
  },
  {
    num: '03',
    title: 'Coverage',
    desc: 'On the day, our team is present but invisible, capturing every authentic moment as it unfolds.',
  },
  {
    num: '04',
    title: 'Review Online',
    desc: 'Access your private Cabmora gallery through your client portal and begin browsing at your leisure.',
  },
  {
    num: '05',
    title: 'Approval',
    desc: 'Select your favorites, leave comments for our editors, and approve your curated final collection.',
  },
  {
    num: '06',
    title: 'Delivery',
    desc: 'Receive your beautifully edited images and cinematic films, securely delivered and stored forever.',
  },
];

export const PORTAL_FEATURES: PortalFeature[] = [
  { icon: Shield, label: 'Private, password-protected gallery' },
  { icon: Heart, label: 'Mark favorites and leave comments' },
  { icon: MessageSquare, label: 'Direct communication with your editor' },
  { icon: Clock, label: 'Real-time delivery progress tracking' },
  { icon: Check, label: 'Approve your collection in one click' },
];

export const PORTAL_PHOTOS: PortalPhoto[] = [
  { id: 'photo-1770301312385-7a4ba2f12147', status: 'approved' },
  { id: 'photo-1762799585109-fd61a1aef92a', status: 'favorite' },
  { id: 'photo-1770301312795-abdc6deee5a8', status: 'none' },
  { id: 'photo-1782787540837-5a43b126073e', status: 'none' },
  { id: 'photo-1680884150120-c944d0143401', status: 'approved' },
  { id: 'photo-1764499892443-90404cde4cdc', status: 'none' },
  { id: 'photo-1782787541129-94c8ce50e09c', status: 'favorite' },
  { id: 'photo-1770301312392-d03cc3dede90', status: 'none' },
];

/**
 * Cabmora Flow, in Cabmora's own words. Supplied 2026-10-03.
 *
 * This replaced a five-line feature list written here rather than by the
 * client. British spellings ("organised", "favourite", "white labelled") are
 * theirs and are left alone.
 */
export const CREATOR_TITLE = 'Your work. Your business.\nOne powerful platform.';

export const CREATOR_INTRO: string[] = [
  'Cabmora Flow is built for photographers, filmmakers and creative professionals who want to manage their entire business from one place.',
  'From creating invoices and managing payments to delivering projects, managing staff and communicating with clients, Cabmora Flow gives you everything you need to run your creative business professionally and efficiently.',
];

export const CREATOR_FEATURES_HEADING = 'Everything you need to run your creative business';

export const CREATOR_FEATURES: CreatorFeature[] = [
  {
    label: 'Professional Invoicing',
    description: 'Create and send professional invoices to your clients quickly and easily.',
  },
  {
    label: 'Payment Management',
    description:
      'Track payments, outstanding balances and payment history from one central dashboard.',
  },
  {
    label: 'Client Management',
    description:
      'Keep your clients, projects, communications and deliverables organised in one place.',
  },
  {
    label: 'Secure Media Delivery',
    description:
      'Deliver high resolution photos and videos through secure, professional galleries.',
  },
  {
    label: 'Your Brand, Your Identity',
    description:
      'Use Cabmora Flow under your own brand with a fully white labelled client experience.',
  },
  {
    label: 'Staff Management',
    description:
      'Manage your team, assign responsibilities and keep everyone connected across your projects.',
  },
  {
    label: 'Client Selection',
    description:
      'Allow clients to review their galleries, select their favourite images and provide feedback.',
  },
  {
    label: 'Cabmora Flow AI',
    description:
      'Work smarter with AI powered assistance that helps you interact with clients, manage tasks and streamline your everyday workflow.',
  },
  {
    label: 'Complete Project Management',
    description:
      'From the first client enquiry to final delivery, keep your projects organised and under control.',
  },
];

export const CREATOR_CLOSING_TITLE = 'Built for creators. Designed for business.';

export const CREATOR_CLOSING_BODY =
  'Whether you are an independent photographer, filmmaker, creative professional or growing production company, Cabmora Flow gives you the tools to manage your clients, team, payments and projects all in one place.';

/** The four-beat line, then the sign-off under the product name. */
export const CREATOR_RHYTHM = 'Create. Manage. Deliver. Grow.';

export const CREATOR_SIGNOFF = 'Powering the business behind your creativity.';

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Cabmora didn't just photograph our wedding — they understood what it meant to us. Every single image made us cry in the most beautiful way possible.",
    name: 'Priya & Arjun Sharma',
    role: 'Wedding · Mumbai',
    avatar:
      'https://images.unsplash.com/photo-1677083969185-ae09e0881828?w=80&h=80&fit=crop&auto=format',
  },
  {
    text: 'The corporate event coverage exceeded every expectation. Professional, discreet, and the turnaround was extraordinary. They are now our permanent partner.',
    name: 'Daniel Okonkwo',
    role: 'CEO · Radiance Group, London',
    avatar:
      'https://images.unsplash.com/photo-1576280314550-773c50583407?w=80&h=80&fit=crop&auto=format',
  },
  {
    text: 'The client portal changed everything. Being able to browse, comment, and approve from my phone felt like the future of photography — and it made me feel completely cared for.',
    name: 'Sarah Mitchell',
    role: 'Engagement Session · Edinburgh',
    avatar:
      'https://images.unsplash.com/photo-1677083969591-fa83c49e123b?w=80&h=80&fit=crop&auto=format',
    isGoogle: true,
  },
];

export const CONTACT_DETAILS: ContactDetail[] = [
  { label: 'Email', value: 'hello@cabmoramedia.com' },
  { label: 'Phone', value: '+44 77 8010 5876' },
  { label: 'Based in', value: 'Manchester, United Kingdom' },
];
