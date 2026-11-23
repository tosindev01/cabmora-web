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
}

export function chatCreatorBriefing(message: string) {
  return apiFetch<BriefingChatResponseDto>('/creators/me/briefing/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
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
