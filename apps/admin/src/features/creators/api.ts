import { apiFetch, fetchPage } from '@cabmora/api-client';

export type ApplicationStatus = 'pending' | 'approved' | 'declined';

/** A studio's application, as the review queue sees it. */
export interface CreatorApplication {
  id: string;
  studio_name: string;
  applicant_name: string;
  email: string;
  portfolio_url: string | null;
  discipline: string;
  annual_volume: string;
  storage_needs: string;
  bottleneck: string;
  plan: string;
  status: ApplicationStatus;
  decision_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /** The creator account approving this produced. */
  created_user_id: string | null;
  created_at: string;
}

export interface ApprovalResult {
  application: CreatorApplication;
  /** Only returned outside deployment — a link that sets a password does not
   *  belong in a production response. Null in deployment, and the studio gets
   *  it by email instead. */
  setup_url: string | null;
}

export const listCreatorApplications = (
  params: Record<string, string | number | boolean | undefined>,
) => fetchPage<CreatorApplication>('/admin/creator-applications', params);

/** Approve a studio: creates their creator account and emails them a link. */
export const approveApplication = (id: string) =>
  apiFetch<ApprovalResult>(`/admin/creator-applications/${id}/approve`, {
    method: 'POST',
  });

/** Decline. The note is for us — the email the studio receives is the same
 *  whatever is written here. */
export const declineApplication = (id: string, note?: string) =>
  apiFetch<CreatorApplication>(`/admin/creator-applications/${id}/decline`, {
    method: 'POST',
    body: JSON.stringify({ note: note || null }),
  });
