import {
  Bell,
  CalendarCheck,
  Camera,
  CircleAlert,
  Image as ImageIcon,
  Inbox,
  MessageSquare,
  Receipt,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { BellNotification } from './useNotifications';

/**
 * The bell and what drops out of it.
 *
 * Presentational: it is handed rows and callbacks and does no fetching, so the
 * console and the portal share one panel rather than each growing their own.
 *
 * Mobile is the primary case, not a breakpoint afterthought — most of Cabmora's
 * users are on phones. An anchored 384px popover at 375px wide is clipped by
 * the viewport, so below `sm` this is a bottom sheet pinned to the bottom of
 * the screen with the rows at a thumb's reach, and only above `sm` does it
 * become the dropdown a desktop expects.
 */

const ICONS: Record<string, LucideIcon> = {
  enquiry: Inbox,
  booking: CalendarCheck,
  message: MessageSquare,
  invoice: Receipt,
  gallery: ImageIcon,
  project: Workflow,
  creator: Camera,
  support: CircleAlert,
};

/** Relative, and only as precise as it needs to be.
 *
 * "2 hours ago" is what somebody wants from a feed; a timestamp makes them do
 * the arithmetic. Past a week it switches to a date, because "23 days ago" is
 * harder to place than "14 Sept". */
function ago(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export interface NotificationPanelProps {
  items: BellNotification[];
  unread: number;
  loading?: boolean;
  /** One poll missed. Shown as a quiet line, never as an alarm. */
  failed?: boolean;
  /** Called when the panel opens, so the caller can load the feed. */
  onOpen: () => void;
  onMarkAllRead: () => void;
  /**
   * A row was chosen. The caller marks it read and routes — routing lives in
   * the app, because this package does not know which router it is inside.
   */
  onSelect: (notification: BellNotification) => void;
  /** `light` for the console and the client portal, `dark` for Flow's panels. */
  variant?: 'light' | 'dark';
}

/**
 * Every class here is a **literal**. Tailwind v4 reads class names statically
 * out of the source, so a name assembled at runtime — `divide.replace('divide-',
 * 'border-')` was the first draft of the `rule` entries below — compiles to
 * nothing at all and the border silently never appears. `rule` and `iconIdle`
 * are therefore spelled out rather than derived from `divide`.
 */
const SKIN = {
  light: {
    trigger: 'text-ink/70 hover:text-ink hover:bg-canvas',
    sheet: 'bg-white border-ink/15 text-ink',
    divide: 'divide-ink/10',
    rule: 'border-ink/10',
    muted: 'text-ink/50',
    hover: 'hover:bg-canvas',
    iconIdle: 'text-ink/40 bg-ink/5',
    badgeRing: 'border-white',
  },
  dark: {
    trigger: 'text-canvas/70 hover:text-canvas hover:bg-canvas/10',
    sheet: 'bg-panel-900 border-canvas/10 text-canvas',
    divide: 'divide-canvas/10',
    rule: 'border-canvas/10',
    muted: 'text-canvas/50',
    hover: 'hover:bg-canvas/5',
    iconIdle: 'text-canvas/40 bg-canvas/5',
    badgeRing: 'border-panel-900',
  },
} as const;

export function NotificationPanel({
  items,
  unread,
  loading = false,
  failed = false,
  onOpen,
  onMarkAllRead,
  onSelect,
  variant = 'light',
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const skin = SKIN[variant];

  const toggle = useCallback(() => {
    setOpen((was) => {
      if (!was) onOpen();
      return !was;
    });
  }, [onOpen]);

  // Close on an outside press and on Escape. `pointerdown` rather than `click`
  // so a tap that starts outside the sheet closes it without also activating
  // whatever is underneath.
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const esc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className={`relative p-2 rounded-full transition-colors cursor-pointer ${skin.trigger}`}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-ink text-[11px] font-bold rounded-full border-2 flex items-center justify-center ${skin.badgeRing}`}
          >
            {/* Capped, because a three-digit badge stops being a number and
                starts being a shape. */}
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* The sheet's scrim, phones only. Without it a bottom sheet floats
              over a page that still looks interactive. */}
          <div
            className="sm:hidden fixed inset-0 bg-ink/40 z-40"
            onPointerDown={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Notifications"
            className={`
              fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t max-h-[75vh]
              sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-3 sm:w-96
              sm:rounded-xl sm:border sm:max-h-[32rem] sm:shadow-2xl
              flex flex-col overflow-hidden ${skin.sheet}
            `}
          >
            <header
              className={`flex items-center justify-between px-4 py-3 border-b ${skin.rule} shrink-0`}
            >
              <span className="font-semibold text-[14.5px]">
                Notifications
                {unread > 0 && (
                  <span className={`ml-2 font-normal ${skin.muted}`}>{unread} new</span>
                )}
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[12.5px] text-gold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </header>

            <div className={`overflow-y-auto overscroll-contain divide-y ${skin.divide}`}>
              {loading && items.length === 0 && (
                <p className={`px-4 py-8 text-center text-[13px] ${skin.muted}`}>Loading…</p>
              )}

              {!loading && items.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Bell size={28} className={`mx-auto mb-3 ${skin.muted}`} />
                  <p className="text-[13.5px] font-medium">Nothing waiting</p>
                  <p className={`text-[12.5px] mt-1 ${skin.muted}`}>
                    Enquiries, messages and bookings will land here.
                  </p>
                </div>
              )}

              {items.map((item) => {
                const Icon = ICONS[item.topic] ?? Bell;
                const isUnread = item.read_at === null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    className={`w-full text-left flex gap-3 px-4 py-3.5 transition-colors cursor-pointer ${skin.hover} ${
                      isUnread ? '' : 'opacity-60'
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isUnread ? 'bg-gold/20 text-gold' : skin.iconIdle
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    {/* `min-w-0` so the title can reach its own line clamp
                        instead of forcing the row wider than the sheet. */}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span
                          className={`text-[13.5px] leading-snug ${isUnread ? 'font-semibold' : ''}`}
                        >
                          {item.title}
                        </span>
                        {isUnread && (
                          <span
                            className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-gold"
                            aria-hidden
                          />
                        )}
                      </span>
                      {item.body && (
                        <span className={`block mt-0.5 text-[12.5px] line-clamp-2 ${skin.muted}`}>
                          {item.body}
                        </span>
                      )}
                      <span className={`block mt-1 text-[11.5px] ${skin.muted}`}>
                        {ago(item.created_at)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {failed && (
              <p className={`px-4 py-2 text-[11.5px] border-t shrink-0 ${skin.muted} ${skin.rule}`}>
                Could not reach the server, so this list may be out of date.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
