import { apiFetch } from './client';
import { buildQuery } from './pagination';

/**
 * The bell, for both apps.
 *
 * One module rather than an admin copy and a client copy: the endpoints are the
 * same three and the API scopes every answer to whoever is signed in, so there
 * is nothing an admin variant would do differently.
 */

export type NotificationTopic =
  'enquiry' | 'booking' | 'message' | 'invoice' | 'gallery' | 'project' | 'creator' | 'support';

export interface AppNotification {
  id: string;
  topic: NotificationTopic;
  /** What happened, in a sentence that can be acted on. */
  title: string;
  /** The substance — a quoted message, an amount. Empty where there is none. */
  body: string;
  /**
   * A path on **this** app, never an absolute URL. Guaranteed by the API, which
   * refuses anything that is not a path, so it is safe to hand to a router.
   */
  url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFeed {
  items: AppNotification[];
  /** Across the whole feed, not just this page. */
  unread: number;
}

export function listNotifications(
  params: {
    topic?: NotificationTopic;
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  } = {},
) {
  return apiFetch<NotificationFeed>(`/notifications${buildQuery(params)}`);
}

/**
 * Just the number.
 *
 * Its own call because the badge sits in the topbar of every portal screen: a
 * count is one indexed query, a feed is rows and bodies nobody is looking at.
 */
export function unreadCount() {
  return apiFetch<number>('/notifications/unread-count');
}

export interface MarkReadResult {
  /** How many actually changed — 0 on a second click, not a polite lie. */
  marked: number;
  unread: number;
}

/**
 * Clear some, or all.
 *
 * Omitting `ids` clears everything. Passing an **empty array** clears nothing,
 * which is deliberate on both sides: a caller that accidentally computes an
 * empty selection must not wipe the feed.
 */
export function markRead(ids?: string[]) {
  return apiFetch<MarkReadResult>('/notifications/read', {
    method: 'POST',
    body: JSON.stringify(ids === undefined ? {} : { notification_ids: ids }),
  });
}
