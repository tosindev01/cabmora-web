import { apiFetch } from '@cabmora/api-client';

/** What the application form sends. Mirrors the API's request shape. */
export interface CreatorApplicationBody {
  studio_name: string;
  applicant_name: string;
  email: string;
  portfolio_url?: string;
  discipline: string;
  annual_volume: string;
  storage_needs: string;
  bottleneck: string;
  plan: string;
}

/** What comes back. Deliberately thin — an applicant is told their
 *  application exists and nothing about who will read it. */
export interface CreatorApplicationReceipt {
  id: string;
  studio_name: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

/**
 * Apply to join Flow.
 *
 * Public: no session, because the whole point is that a studio who has never
 * heard of us can ask. Applying twice from the same address returns the first
 * application rather than creating a second, so a double-click is harmless.
 */
export const applyToFlow = (body: CreatorApplicationBody) =>
  apiFetch<CreatorApplicationReceipt>('/creators/apply', {
    method: 'POST',
    body: JSON.stringify(body),
  });
