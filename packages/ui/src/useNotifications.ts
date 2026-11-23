import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The bell's data, for both apps.
 *
 * The transport is injected rather than imported. This package is the design
 * system and knows nothing about HTTP — the same reason `ReportIssueDialog`
 * takes an `onSubmit` — but the *behaviour* (poll the count, load the feed when
 * it opens, clear on open, keep the badge honest) is identical in the console
 * and the portal, and a hook duplicated in two apps is a hook that drifts.
 */

export interface BellNotification {
  id: string;
  topic: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationTransport {
  list: (params?: { limit?: number }) => Promise<{
    items: BellNotification[];
    unread: number;
  }>;
  count: () => Promise<number>;
  markRead: (ids?: string[]) => Promise<{ marked: number; unread: number }>;
}

/**
 * How often the badge re-checks.
 *
 * Polling, not a socket. The API is stateless behind a cookie and Railway's
 * proxy, so a websocket would mean a connection per open tab for a number that
 * changes a handful of times a day. Sixty seconds is well inside how long
 * somebody takes to notice a bell, and one cheap indexed count a minute per
 * signed-in tab is a cost worth naming rather than hiding.
 */
const POLL_MS = 60_000;

/** One screenful. The dropdown is for "what needs me", not an archive. */
const PAGE = 20;

export function useNotifications(transport: NotificationTransport) {
  const [items, setItems] = useState<BellNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // The transport is rebuilt on every render by most callers (an object
  // literal of module functions), so depending on it directly would restart
  // the poll every render. A ref pins it without pretending it is stable.
  const api = useRef(transport);
  api.current = transport;

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await api.current.count());
      setFailed(false);
    } catch {
      // Silent. A bell that shows an error banner because one poll missed is
      // noisier than the notifications it is reporting.
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let live = true;
    const tick = () => {
      if (live) void refreshCount();
    };
    tick();
    const timer = window.setInterval(tick, POLL_MS);
    // Catch up the moment the tab comes back rather than waiting out the
    // interval — a laptop reopened after lunch should not show a stale badge.
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      live = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshCount]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const feed = await api.current.list({ limit: PAGE });
      setItems(feed.items);
      setUnread(feed.unread);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    // Optimistic, and then reconciled. The badge dropping the instant it is
    // tapped is what makes the control feel like it worked; the server's own
    // number replaces the guess a moment later.
    const previous = items;
    // A real timestamp, not a 'now' sentinel: `read_at` is typed as an ISO
    // string and anything that renders it would get `Invalid Date`.
    const stamp = new Date().toISOString();
    setItems((current) => current.map((each) => ({ ...each, read_at: each.read_at ?? stamp })));
    setUnread(0);
    try {
      const result = await api.current.markRead();
      setUnread(result.unread);
    } catch {
      setItems(previous);
      void refreshCount();
    }
  }, [items, refreshCount]);

  const markOneRead = useCallback(
    async (id: string) => {
      const already = items.find((each) => each.id === id)?.read_at;
      if (already) return;
      const stamp = new Date().toISOString();
      setItems((current) =>
        current.map((each) => (each.id === id ? { ...each, read_at: stamp } : each)),
      );
      setUnread((current) => Math.max(0, current - 1));
      try {
        const result = await api.current.markRead([id]);
        setUnread(result.unread);
      } catch {
        void refreshCount();
      }
    },
    [items, refreshCount],
  );

  return { items, unread, loading, failed, load, markAllRead, markOneRead };
}
