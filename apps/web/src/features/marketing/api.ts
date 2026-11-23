import { apiFetch } from '@cabmora/api-client';

/**
 * What the public site asks the API for.
 *
 * Reviews and the homepage figures. The rest of the marketing content is
 * still fixtures, deliberately: it is copy that happens to be data, and it
 * changes when somebody edits the site rather than when a customer does
 * something.
 */

export interface PublicReview {
  stars: number;
  words: string;
  /** First name and an initial. They agreed to be quoted, not indexed. */
  name: string | null;
  created_at: string;
}

/** Published *and* consented, both decided server-side. Empty when there is
 *  nothing, which the page shows as nothing. */
export function listPublicReviews(limit = 3) {
  return apiFetch<PublicReview[]>(`/reviews?limit=${limit}`);
}

/**
 * The counted figures for the homepage band.
 *
 * Every field is nullable, and null means the API will not stand behind a
 * number — the band omits that tile rather than printing a zero. These replace
 * "500+ Happy Clients / 8 Years / 200+ Events", which were invented.
 */
export interface PublicStats {
  clients_served: number | null;
  events_covered: number | null;
  years_active: number | null;
}

export function getPublicStats() {
  return apiFetch<PublicStats>('/stats');
}
