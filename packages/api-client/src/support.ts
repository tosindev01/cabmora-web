import { apiFetch } from './client';
import { buildQuery } from './pagination';

/** Reporting a problem with the platform, and the console inbox that receives it. */

export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  summary: string;
  detail: string;
  page_path: string | null;
  status: IssueStatus;
  created_at: string;
  resolved_at?: string | null;
  resolution?: string | null;
}

/** The inbox row — who sent it, which a reporter never learns about others. */
export interface AdminIssue extends Issue {
  reporter_name: string;
  reporter_email: string;
}

export function reportIssue(input: {
  summary: string;
  detail: string;
  page_path?: string;
}) {
  return apiFetch<Issue>('/issues', { method: 'POST', body: JSON.stringify(input) });
}

/** What the caller has reported. Scoped server-side to them. */
export function listMyIssues() {
  return apiFetch<Issue[]>('/issues');
}

export function listIssues(params: { status?: IssueStatus; limit?: number } = {}) {
  return apiFetch<AdminIssue[]>(`/admin/issues${buildQuery(params)}`);
}

export function updateIssue(id: string, status: IssueStatus, resolution?: string) {
  return apiFetch<Issue>(`/admin/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resolution }),
  });
}
