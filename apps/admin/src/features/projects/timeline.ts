/**
 * Project events, in English.
 *
 * The timeline rendered `event.kind.replaceAll('_', ' ')` followed by the raw
 * payload, so a stage change read `stage_changed` / `from: editing · to:
 * in_review` and a confirmed call read `scheduled_at: 2026-10-11T09:00:00+00:00
 * · provider: google_meet · moved: false`. That is a log, printed where a
 * history was meant to be, and it was getting worse every time an event kind
 * was added — which is what prompted this.
 *
 * In `display.ts`'s neighbourhood rather than in the page, because the
 * client's portal shows the same events and will want the same sentences —
 * said from their side, which is the one thing that will differ.
 */

import type { ProjectEvent } from '@cabmora/api-client';

import { STAGE_LABEL } from '@/shared/format';
import { formatMinor } from '@cabmora/ui';

export interface TimelineEntry {
  /** What happened. A sentence, not a key. */
  title: string;
  /** The part worth reading only if you care. Null when the title says it all. */
  detail: string | null;
}

/** Payload values arrive as unknown; nothing here may throw on a surprise. */
function text(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function count(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function stage(value: unknown): string | null {
  const key = text(value);
  return key && key in STAGE_LABEL ? STAGE_LABEL[key as keyof typeof STAGE_LABEL] : key;
}

/** Why a stage moved, where the use case recorded a reason. */
const STAGE_REASON: Record<string, string> = {
  'first upload': 'the first photographs were uploaded',
  'photographs released': 'photographs were shared with the client',
};

export function describeEvent(event: ProjectEvent): TimelineEntry {
  const payload = event.payload ?? {};

  switch (event.kind) {
    case 'created':
      return { title: 'Project created', detail: text(payload.title) };

    case 'stage_changed': {
      const to = stage(payload.to);
      const from = stage(payload.from);
      const why = text(payload.reason);
      return {
        title: to ? `Moved to ${to}` : 'Stage changed',
        detail: [
          from ? `From ${from}` : null,
          // Automatic moves say so. A stage that changed on its own looks
          // like somebody else's doing until the timeline admits it was the
          // system's.
          why ? `automatically, because ${STAGE_REASON[why] ?? why}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    }

    case 'gallery_released': {
      const photos = count(payload.count);
      return {
        title:
          photos === null
            ? 'Photographs shared with the client'
            : `${photos} photograph${photos === 1 ? '' : 's'} shared with the client`,
        detail: payload.notified
          ? 'They were emailed.'
          : 'Not emailed — they had just been told about this gallery.',
      };
    }

    case 'settings_changed': {
      const fields = Object.keys(payload);
      return {
        title: 'Delivery settings changed',
        detail: fields.length > 0 ? fields.map(readableField).join(', ') : null,
      };
    }

    case 'amendment_requested':
      return { title: 'The client asked for a change', detail: text(payload.body) };

    case 'approved':
      return { title: 'The client approved the work', detail: null };

    case 'payment_received': {
      const minor = count(payload.amount_minor);
      return {
        title: 'Payment received',
        detail: minor === null ? null : formatMinor(minor),
      };
    }

    default:
      // A kind added to the API before it was added here. Rendered the old
      // way rather than hidden: an event nobody can read still beats an
      // event nobody can see.
      return {
        title: event.kind.replaceAll('_', ' '),
        detail:
          Object.keys(payload).length > 0
            ? Object.entries(payload)
                .map(([key, value]) => `${key}: ${String(value)}`)
                .join(' · ')
            : null,
      };
  }
}

/** Setting names as the settings page writes them. */
const FIELD_LABEL: Record<string, string> = {
  watermark_policy: 'watermarking',
  release_mode: 'gallery release',
  require_approval_before_delivery: 'approval before delivery',
  require_payment_before_delivery: 'payment before delivery',
  price_minor: 'price',
  payment_method: 'payment method',
  event_date: 'event date',
  deadline: 'deadline',
};

function readableField(key: string): string {
  return FIELD_LABEL[key] ?? key.replaceAll('_', ' ');
}
