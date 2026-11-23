import { apiFetch, fetchPage } from '@cabmora/api-client';

export type ReviewStatus = 'pending' | 'published' | 'hidden';

/** A client's rating, as the moderation queue sees it. */
export interface Review {
  id: string;
  project_id: string;
  project_title: string | null;
  client_name: string | null;
  /** Admin side only — never reaches the public endpoint. */
  client_email: string | null;
  stars: number;
  words: string;
  /** Whether the client offered these words for publication. An admin may
   *  hide anything but can only publish what was offered, so this decides
   *  whether the publish control appears at all. */
  may_publish: boolean;
  status: ReviewStatus;
  moderated_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export const listReviews = (params: Record<string, string | number | boolean | undefined>) =>
  fetchPage<Review>('/admin/reviews', params);

export const publishReview = (id: string) =>
  apiFetch<Review>(`/admin/reviews/${id}/publish`, { method: 'POST' });

/** Takes it down, or declines to put it up. There is no delete: a removed
 *  review is a client's words destroyed by the business they are about. */
export const hideReview = (id: string) =>
  apiFetch<Review>(`/admin/reviews/${id}/hide`, { method: 'POST' });

/**
 * Remove a review for good.
 *
 * The heavier of the two controls. `hideReview` keeps what somebody wrote and
 * stops showing it; this destroys it, and is for a review that should never
 * have existed rather than one you disagree with.
 */
export const deleteReview = (id: string) =>
  apiFetch<void>(`/admin/reviews/${id}`, { method: 'DELETE' });
