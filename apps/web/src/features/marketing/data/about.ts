/**
 * The About page, as written by Cabmora.
 *
 * Data rather than JSX because it is the client's copy, not the developer's:
 * it changes on their say-so, and a change should be one edit in one file
 * rather than a hunt through markup. Supplied 2026-09-30.
 */

export interface AboutService {
  label: string;
  description: string;
}

export interface AboutPhoto {
  /** Filename stem under `public/portfolio/work/`. */
  slug: string;
  alt: string;
  width: number;
  height: number;
}

export interface AboutFigure {
  /** The number, or a word where there is no number. */
  figure: string;
  label: string;
}

export const ABOUT_EYEBROW = 'About Cabmora Media';

export const ABOUT_TITLE =
  'International wedding filmmakers, photographers & creative storytellers.';

/**
 * The opening. Each entry is one paragraph.
 *
 * `emphasis` marks the run of words set in the darker weight — the phrases
 * Cabmora emboldened in their own copy, kept rather than flattened, because
 * what a studio chooses to stress is part of what it is saying.
 */
export const ABOUT_PARAGRAPHS: { text: string; emphasis?: string[] }[] = [
  {
    text: 'At Cabmora Media, we believe every story deserves more than just coverage. It deserves to be captured with creativity, emotion and purpose.',
    emphasis: ['Cabmora Media'],
  },
  {
    text: 'We are an international creative media company specialising in wedding and event filmmaking, photography, corporate content, product films, documentaries, podcasts and digital media production. From the UK to destinations around the world, we create visual stories that people can experience, remember and share.',
    emphasis: [
      'wedding and event filmmaking, photography, corporate content, product films, documentaries, podcasts and digital media production',
    ],
  },
  {
    text: 'Every client and every project is different, which is why we take a personalised approach to our work. Whether you are planning a wedding, launching a brand, hosting an event or telling an important story, we combine cinematic visuals, documentary storytelling and modern creative techniques to bring your vision to life.',
    emphasis: ['cinematic visuals, documentary storytelling and modern creative techniques'],
  },
  {
    text: 'From intimate celebrations to large-scale productions, our goal is simple: to create content that does not just capture a moment, but makes you feel it again.',
    emphasis: [
      'to create content that does not just capture a moment, but makes you feel it again.',
    ],
  },
];

/**
 * Three of Cabmora's own photographs, between the opening and the services.
 *
 * The page carried no picture at all — four sections of type on a company
 * whose product is images. These are from `public/portfolio/work/`, chosen to
 * span what the copy claims (a wedding, a studio portrait, an event) rather
 * than for subject, and deliberately not the ones already on the homepage
 * hero or in "Why clients choose us".
 *
 * `width`/`height` are the real dimensions, so the browser reserves the space
 * before the file arrives. Alt text describes what is visible and no more —
 * nobody here knows who these people are, which is also why `work.ts` carries
 * no captions.
 */
export const ABOUT_GALLERY: AboutPhoto[] = [
  {
    slug: 'img-2852',
    alt: 'A couple in bridal lace and black tie at golden hour',
    width: 784,
    height: 1168,
  },
  {
    slug: 'img-1941',
    alt: 'A couple in green and gold traditional dress, photographed in studio',
    width: 787,
    height: 1400,
  },
  {
    slug: 'img-2936',
    alt: 'A graduate in cap and gown beneath a brick archway',
    width: 787,
    height: 1400,
  },
];

export const ABOUT_SERVICES: AboutService[] = [
  {
    label: 'Weddings & Events',
    description: 'Cinematic wedding films, photography and event coverage.',
  },
  {
    label: 'Corporate & Brand Content',
    description: 'Professional films, promotional videos and visual content for businesses.',
  },
  {
    label: 'Product & Commercial Films',
    description: 'Creative product photography and video designed to showcase your brand.',
  },
  {
    label: 'Podcasts & Digital Content',
    description: 'Production, filming and creative content for digital platforms.',
  },
  {
    label: 'Documentaries & Storytelling',
    description: 'Authentic visual storytelling that connects people with meaningful stories.',
  },
];

/**
 * The figures, exactly as Cabmora supplied them on 2026-09-30.
 *
 * Two of these disagree with the homepage, which says 8 years and 200+ events
 * against 12+ years and 453+ projects here, and "310+ countries reached"
 * exceeds the number of countries there are. Both were raised before this page
 * was built; they are reproduced as given rather than quietly corrected,
 * because the numbers are Cabmora's claim to make, not ours.
 */
export const ABOUT_FIGURES: AboutFigure[] = [
  { figure: '12+', label: 'Years of creative experience' },
  { figure: '453+', label: 'Projects & productions' },
  { figure: '310+', label: 'Countries reached' },
  { figure: 'International', label: 'UK & worldwide' },
];

export const ABOUT_SIGNOFF = 'Every frame tells a story.';
