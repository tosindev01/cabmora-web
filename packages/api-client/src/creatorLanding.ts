import { apiFetch } from './client';

export type LandingThemePreset =
  | 'noir-gold'
  | 'ivory-editorial'
  | 'forest-luxe'
  | 'midnight-flow'
  | 'sand-minimal';

export type LandingAccentToken = 'gold' | 'forest' | 'flow-sky' | 'ink';
export type LandingHeadingFont = 'serif' | 'sans';
export type LandingHeroLayout = 'cinematic-full' | 'split-editorial' | 'minimal-centered';

export interface LandingStatItem {
  value: string;
  label: string;
}

export interface LandingServicePackage {
  id: string;
  title: string;
  tagline: string;
  price_label: string;
  duration: string;
  deliverables: string[];
  featured: boolean;
}

export interface LandingTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  project_type: string;
  rating: number;
}

export interface LandingFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LandingSectionsVisibility {
  hero: boolean;
  stats: boolean;
  about: boolean;
  gallery: boolean;
  services: boolean;
  testimonials: boolean;
  faq: boolean;
  booking: boolean;
}

export interface LandingConfigDto {
  theme_preset: LandingThemePreset;
  accent_token: LandingAccentToken;
  heading_font: LandingHeadingFont;
  hero_layout: LandingHeroLayout;
  hero_eyebrow: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_video_url: string;
  availability_badge: string;
  accepting_bookings: boolean;
  about_eyebrow: string;
  about_heading: string;
  about_rich_text: string;
  about_pull_quote: string;
  stats: LandingStatItem[];
  services: LandingServicePackage[];
  testimonials: LandingTestimonial[];
  faqs: LandingFaqItem[];
  sections_visibility: LandingSectionsVisibility;
  booking_heading: string;
  booking_subtext: string;
}

export interface CreatorPortfolioItemDto {
  id: string;
  creator_id?: string;
  title: string;
  subtitle: string;
  category: string;
  media_type: 'photo' | 'video';
  media_url: string;
  video_url?: string | null;
  description: string;
  client_name: string;
  location: string;
  shoot_year: string;
  aspect_ratio: 'portrait' | 'landscape' | 'square' | 'cinema';
  featured: boolean;
  sort_order: number;
  gallery_images: string[];
  created_at?: string;
}

export interface CreatorBookingRequestDto {
  id: string;
  creator_slug: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  company_or_brand: string;
  service_title: string;
  event_type: string;
  preferred_date: string;
  location: string;
  budget_range: string;
  project_brief: string;
  status: 'new' | 'contacted' | 'booked' | 'archived';
  created_at: string;
}

export interface CreatorBookingSubmission {
  client_name: string;
  client_email: string;
  client_phone?: string;
  company_or_brand?: string;
  service_title?: string;
  event_type: string;
  preferred_date?: string;
  location?: string;
  budget_range?: string;
  project_brief: string;
}

export interface CreatorStudioProfileDto {
  user_id?: string;
  slug: string;
  is_published: boolean;
  studio_name: string;
  legal_name: string;
  specialization: string;
  categories: string[];
  bio: string;
  experience_years: number;
  team_size: string;
  currency: string;
  day_rate: number;
  tax_id: string;
  cover_url: string;
  avatar_url?: string | null;
  primary_email: string;
  secondary_email: string;
  phone: string;
  allow_sms_alerts: boolean;
  address: string;
  city: string;
  country: string;
  timezone: string;
  socials: {
    instagram: string;
    behance: string;
    vimeo: string;
    youtube: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  landing_config: LandingConfigDto;
  portfolio_items: CreatorPortfolioItemDto[];
  updated_at?: string;
}

export function getMyCreatorProfile() {
  return apiFetch<CreatorStudioProfileDto>('/creators/me/profile');
}

export function updateMyCreatorProfile(payload: CreatorStudioProfileDto) {
  return apiFetch<CreatorStudioProfileDto>('/creators/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getPublicCreatorProfile(slug: string) {
  return apiFetch<CreatorStudioProfileDto>(`/creators/public/${encodeURIComponent(slug)}`);
}

export function submitCreatorBooking(slug: string, payload: CreatorBookingSubmission) {
  return apiFetch<CreatorBookingRequestDto>(
    `/creators/public/${encodeURIComponent(slug)}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function listMyCreatorBookings() {
  return apiFetch<CreatorBookingRequestDto[]>('/creators/me/bookings');
}

export function updateMyCreatorBookingStatus(
  bookingId: string,
  status: CreatorBookingRequestDto['status'],
) {
  return apiFetch<CreatorBookingRequestDto>(
    `/creators/me/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
}

