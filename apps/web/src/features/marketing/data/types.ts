import type { LucideIcon } from 'lucide-react';


export interface SideStory {
  img: string;
  /**
   * Shown if `img` fails to load. Client-supplied photography lives in
   * `public/portfolio/` and is dropped in by hand, so a card must survive the
   * file not being there yet rather than rendering a broken image.
   */
  fallbackImg?: string;
  /**
   * CSS `object-position` for this photo, when centring it crops badly. Cards
   * are landscape 4:3 and client photography is often portrait, so a centre
   * crop can cut heads off. Applied as an inline style rather than a Tailwind
   * class: v4 generates classes by static scan, so a value coming from data
   * would silently produce no CSS at all.
   */
  focal?: string;
  alt: string;
  kicker: string;
  title: string;
  meta: string;
}

/** The large slideshow panel that opens Featured Stories. */
export interface MainStory {
  kicker: string;
  /** Where it was shot, shown beside the kicker. */
  location: string;
  title: string;
  caption: string;
}

export interface WideStory {
  img: string;
  /** Crop centre, when the site-wide upward bias is wrong for this one.
   *  See shared/media/focal.ts. */
  focal?: string;
  alt: string;
  kicker: string;
  title: string;
}

export interface PrimaryService {
  icon: LucideIcon;
  label: string;
  desc: string;
  index: string;
}

export interface SecondaryService {
  icon: LucideIcon;
  label: string;
  desc: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  desc: string;
  features: string[];
}

export interface Reason {
  tag: string;
  title: string;
  body: string;
  img: string;
  /** Crop centre, when the site-wide upward bias is wrong for this one.
   *  See shared/media/focal.ts. */
  focal?: string;
  alt: string;
}

/** One of the nine things Cabmora Flow does. */
export interface CreatorFeature {
  label: string;
  description: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

export interface PortalFeature {
  icon: LucideIcon;
  label: string;
}

export interface PortalPhoto {
  id: string;
  status: 'approved' | 'favorite' | 'none';
}

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  avatar: string;
  isGoogle?: boolean;
}

export interface ContactDetail {
  label: string;
  value: string;
}

/** A category filter on the portfolio page. `all` is synthesised in the UI. */
export type WorkCategory = 'weddings' | 'graduations' | 'portraits' | 'events' | 'corporate';

export interface WorkItem {
  /** Filename stem under `public/portfolio/work/`. */
  slug: string;
  category: WorkCategory;
  /** Absent unless someone who was at the shoot supplies one. Never invented. */
  title?: string;
  /** Real pixel dimensions, so the browser reserves space before loading. */
  width: number;
  height: number;
  /** 20px inlined JPEG, cross-faded out when the real file arrives. */
  blur: string;
}
