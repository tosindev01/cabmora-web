import { apiFetch } from './client';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTaskDto {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
}

export type CallStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';

export interface ProjectCallDto {
  id: string;
  project_id: string;
  project_title: string;
  requester_id: string;
  requester_name: string;
  recipient_id: string;
  recipient_name: string;
  title: string;
  notes: string;
  proposed_at: string;
  duration_minutes: number;
  status: CallStatus;
  meeting_room_id: string | null;
  meeting_url: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface BriefingActionItemDto {
  kind: 'revision' | 'task' | 'deadline' | 'call' | 'comment';
  title: string;
  subtitle: string;
  project_id: string;
  project_title: string;
  url: string;
  priority: 'urgent' | 'high' | 'normal';
}

export interface CreatorReferralEntryDto {
  id: string;
  referred_name: string;
  referred_email: string;
  role: 'creator' | 'client';
  status: 'Invited' | 'Joined Studio' | 'First Project Booked' | 'Reward Paid';
  date: string;
  reward_amount: number;
  bonus_storage_gb: number;
}

export interface CreatorReferralSummaryDto {
  referral_code: string;
  referral_link: string;
  tier: string;
  next_tier: string;
  tier_progress_percent: number;
  total_earnings: number;
  pending_payouts: number;
  bonus_storage_gb: number;
  conversion_rate: number;
  referrals: CreatorReferralEntryDto[];
}

export interface AiGeneratedInvoiceApiDto {
  id: string;
  client: string;
  client_email: string;
  project: string;
  issued: string;
  due: string;
  amount: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  status: 'Paid' | 'Outstanding' | 'Overdue';
  notes: string;
  generated_by_ai: boolean;
  line_items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface ScreenSecurityStatusDto {
  session_token: string;
  locked: boolean;
  violation_count: number;
  reason: string | null;
  triggered_at: string | null;
}

export interface ClientBriefingDto {
  headline: string;
  summary_text: string;
  active_projects_count: number;
  photos_ready_count: number;
  pending_approvals_count: number;
  upcoming_calls_count: number;
  next_project_title: string;
  next_project_venue: string;
  venue_distance_km: number;
  venue_travel_time: string;
  deadline_iso: string;
  deadline_warning: string;
  action_items: BriefingActionItemDto[];
}

export interface CommunityCommentDto {
  id: string;
  author_name: string;
  author_role: 'creator' | 'client';
  author_avatar: string;
  text: string;
  created_at: string;
}

export interface CommunityPostDto {
  id: string;
  project_id: string;
  project_title: string;
  project_type: string;
  client_name: string;
  location: string;
  venue_distance_km: number;
  completed_date: string;
  deliverables_summary: string;
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_specialization: string;
  creator_avatar: string;
  caption: string;
  media_urls: string[];
  likes_count: number;
  liked_by_me: boolean;
  comments: CommunityCommentDto[];
  created_at: string;
}

export interface CommunityFollowerDto {
  id: string;
  name: string;
  handle: string;
  role: 'creator' | 'client';
  specialization: string;
  avatar: string;
  followed_at: string;
  auto_followed_via_like: boolean;
}

export interface CommunityCollaborationRequestDto {
  id: string;
  post_id: string;
  project_title: string;
  requester_name: string;
  requester_role: 'creator' | 'client';
  requester_avatar: string;
  target_creator_id: string;
  target_creator_name: string;
  proposed_role: string;
  proposed_date: string;
  budget_or_split: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  direction: 'incoming' | 'outgoing';
  created_at: string;
}

export interface CommunityFeedDto {
  posts: CommunityPostDto[];
  followers: CommunityFollowerDto[];
  followers_count: number;
  collaborations: CommunityCollaborationRequestDto[];
  auto_followed_creator_ids: string[];
}

export interface CreatorBriefingDto {
  headline: string;
  summary_text: string;
  projects_in_progress: number;
  pending_tasks_count: number;
  revision_requests_count: number;
  unread_comments_count: number;
  upcoming_deadlines_count: number;
  pending_calls_count: number;
  action_items: BriefingActionItemDto[];
  referrals_summary?: CreatorReferralSummaryDto | null;
}

export interface ProjectCommentDto {
  id: string;
  project_id: string;
  asset_id: string | null;
  parent_id: string | null;
  point_x: number | null;
  point_y: number | null;
  author_id: string;
  author_name: string;
  author_avatar_url?: string | null;
  author_role?: string | null;
  body: string;
  kind: 'comment' | 'amendment';
  resolved: boolean;
  needs_action: boolean;
  created_at: string;
}

export function listProjectTasks(projectId: string) {
  return apiFetch<ProjectTaskDto[]>(`/projects/${encodeURIComponent(projectId)}/tasks`);
}

export function createProjectTask(
  projectId: string,
  payload: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_at?: string | null;
  },
) {
  return apiFetch<ProjectTaskDto>(`/projects/${encodeURIComponent(projectId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProjectTask(
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_at?: string | null;
  },
) {
  return apiFetch<ProjectTaskDto>(`/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProjectTask(taskId: string) {
  return apiFetch<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}

export function listMyCalls() {
  return apiFetch<ProjectCallDto[]>('/calls');
}

export function listProjectCalls(projectId: string) {
  return apiFetch<ProjectCallDto[]>(`/projects/${encodeURIComponent(projectId)}/calls`);
}

export function requestProjectCall(
  projectId: string,
  payload: {
    title: string;
    proposed_at: string;
    duration_minutes?: number;
    notes?: string;
  },
) {
  return apiFetch<ProjectCallDto>(`/projects/${encodeURIComponent(projectId)}/calls`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function respondToProjectCall(
  callId: string,
  payload: {
    action: 'accept' | 'decline' | 'cancel' | 'complete' | 'reschedule';
    proposed_at?: string;
  },
) {
  return apiFetch<ProjectCallDto>(`/calls/${encodeURIComponent(callId)}/respond`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCreatorBriefing() {
  return apiFetch<CreatorBriefingDto>('/creators/me/briefing');
}

export interface BriefingChatResponseDto {
  reply: string;
  suggested_links: BriefingActionItemDto[];
  generated_invoice?: AiGeneratedInvoiceApiDto | null;
  images?: { url: string; caption: string; tag: string }[];
}

export function chatCreatorBriefing(message: string, images: string[] = []) {
  return apiFetch<BriefingChatResponseDto>('/creators/me/briefing/chat', {
    method: 'POST',
    body: JSON.stringify({ message, images }),
  });
}

export function createAiGeneratedInvoice(payload: {
  client_name: string;
  client_email: string;
  project_title: string;
  amount: number;
  include_drone?: boolean;
  include_rehearsal?: boolean;
  custom_description?: string;
}) {
  return apiFetch<AiGeneratedInvoiceApiDto>('/creators/me/invoices/ai-generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listAiGeneratedInvoices() {
  return apiFetch<AiGeneratedInvoiceApiDto[]>('/creators/me/invoices/ai');
}

export function getMyCreatorReferrals() {
  return apiFetch<CreatorReferralSummaryDto>('/creators/me/referrals');
}

export function inviteCreatorReferral(payload: {
  name: string;
  email: string;
  role: 'creator' | 'client';
  personal_note?: string;
}) {
  return apiFetch<CreatorReferralSummaryDto>('/creators/me/referrals/invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function recordScreenSecurityViolation(payload: {
  event_type:
    | 'screenshot_shortcut'
    | 'focus_loss'
    | 'qr_camera_trap'
    | 'context_menu'
    | 'camera_detected';
  route: string;
  details?: string;
  session_token: string;
}) {
  return apiFetch<ScreenSecurityStatusDto>('/security/screen-violation', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function triggerOpticalQrCameraTrap(sessionToken: string) {
  return apiFetch<ScreenSecurityStatusDto>(
    `/security/camera-trap/${encodeURIComponent(sessionToken)}`,
  );
}

export function getOpticalQrCameraTrapStatus(sessionToken: string) {
  return apiFetch<ScreenSecurityStatusDto>(
    `/security/camera-trap/${encodeURIComponent(sessionToken)}/status`,
  );
}

export function resetOpticalQrCameraTrap(sessionToken: string) {
  return apiFetch<ScreenSecurityStatusDto>(
    `/security/camera-trap/${encodeURIComponent(sessionToken)}/reset`,
    { method: 'POST' },
  );
}

export function getClientBriefing() {
  return apiFetch<ClientBriefingDto>('/clients/me/briefing');
}

export function chatClientBriefing(message: string, images: string[] = []) {
  return apiFetch<BriefingChatResponseDto>('/clients/me/briefing/chat', {
    method: 'POST',
    body: JSON.stringify({ message, images }),
  });
}

export function getCommunityFeed() {
  return apiFetch<CommunityFeedDto>('/community/feed');
}

export function shareCompletedJobToCommunity(payload: {
  project_id: string;
  project_title: string;
  project_type?: string;
  client_name?: string;
  location?: string;
  deliverables_summary?: string;
  caption: string;
  media_urls?: string[];
}) {
  return apiFetch<CommunityFeedDto>('/community/posts/share-completed-job', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function toggleLikeCommunityPost(postId: string) {
  return apiFetch<CommunityFeedDto>(`/community/posts/${encodeURIComponent(postId)}/like`, {
    method: 'POST',
  });
}

export function commentOnCommunityPost(
  postId: string,
  payload: { text: string; author_role?: 'creator' | 'client' },
) {
  return apiFetch<CommunityFeedDto>(`/community/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestCommunityCollaboration(payload: {
  post_id: string;
  project_title: string;
  target_creator_id: string;
  target_creator_name: string;
  proposed_role: string;
  proposed_date: string;
  budget_or_split: string;
  message: string;
  requester_role?: 'creator' | 'client';
}) {
  return apiFetch<CommunityFeedDto>('/community/collaborations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function respondCommunityCollaboration(
  collabId: string,
  action: 'accept' | 'decline',
) {
  return apiFetch<CommunityFeedDto>(
    `/community/collaborations/${encodeURIComponent(collabId)}/respond`,
    {
      method: 'POST',
      body: JSON.stringify({ action }),
    },
  );
}

export function listProjectComments(projectId: string) {
  return apiFetch<ProjectCommentDto[]>(`/projects/${encodeURIComponent(projectId)}/comments`);
}

export function addProjectComment(
  projectId: string,
  payload: {
    body: string;
    asset_id?: string | null;
    parent_id?: string | null;
    point_x?: number | null;
    point_y?: number | null;
    kind?: 'comment' | 'amendment';
  },
) {
  return apiFetch<ProjectCommentDto>(`/projects/${encodeURIComponent(projectId)}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resolveComment(commentId: string) {
  return apiFetch<ProjectCommentDto>(`/comments/${encodeURIComponent(commentId)}/resolve`, {
    method: 'POST',
  });
}

export function reopenComment(commentId: string) {
  return apiFetch<ProjectCommentDto>(`/comments/${encodeURIComponent(commentId)}/reopen`, {
    method: 'POST',
  });
}
