import { notificationsApi } from '@cabmora/api-client';
import { NotificationPanel, useNotifications } from '@cabmora/ui';
import { useNavigate } from 'react-router-dom';

import type { PortalVariant } from './variant';

/**
 * The portal's bell, connected.
 *
 * It replaces `PortalNotificationBell`, which was decorative: every one of the
 * seven pages that used it passed `count={2}`, the badge was therefore always
 * "2", and the button had no click handler at all. A control that reports a
 * number nobody set and does nothing when pressed is worse than no control.
 *
 * The panel and the data hook are shared with the admin console — see
 * `@cabmora/ui`. Only the routing differs, and that is this file's whole job.
 */

/**
 * Module level, so the hook sees one stable object rather than a fresh literal
 * on every render of whichever page is wearing the topbar.
 */
const TRANSPORT = {
  list: notificationsApi.listNotifications,
  count: notificationsApi.unreadCount,
  markRead: notificationsApi.markRead,
};

export function PortalBell({ variant = 'light' }: { variant?: PortalVariant }) {
  const navigate = useNavigate();
  const bell = useNotifications(TRANSPORT);

  return (
    <NotificationPanel
      items={bell.items}
      unread={bell.unread}
      loading={bell.loading}
      failed={bell.failed}
      onOpen={bell.load}
      onMarkAllRead={bell.markAllRead}
      onSelect={(item) => {
        void bell.markOneRead(item.id);
        // The API refuses anything that is not a path, so this cannot send
        // somebody to another origin.
        if (item.url) navigate(item.url);
      }}
      variant={variant}
    />
  );
}
