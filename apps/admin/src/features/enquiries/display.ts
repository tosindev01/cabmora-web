import type { EnquiryStatus, UrgencyBand } from '@/features/enquiries/api';

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  consultation_booked: 'Consultation booked',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

export const STATUS_PILL: Record<EnquiryStatus, string> = {
  new: 'bg-blue-50 text-blue-800 border border-blue-200',
  contacted: 'bg-purple-50 text-purple-800 border border-purple-200',
  consultation_booked: 'bg-gold/20 text-ink border border-gold/40',
  quoted: 'bg-amber-50 text-amber-900 border border-amber-200',
  won: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  lost: 'bg-ink/8 text-ink/50 border border-ink/10',
};

/** Human wording for the timeline. Event kinds are snake_case identifiers. */
export const EVENT_LABEL: Record<string, string> = {
  received: 'Enquiry received',
  assigned: 'Assigned',
  status_changed: 'Status changed',
  note_added: 'Note',
  consultation_booked: 'Consultation booked',
  consultation_cancelled: 'Consultation cancelled',
  won: 'Won — project created',
  lost: 'Marked lost',
};

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Budget, from integer minor units.
 *
 * Stored as pence so it can be summed and reported on; divided only here, at
 * the edge, so no arithmetic ever happens on a float.
 */
export function formatBudget(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  const money = (minor: number) =>
    (minor / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    });
  if (min !== null && max !== null) {
    return min === max ? money(min) : `${money(min)} – ${money(max)}`;
  }
  return min !== null ? `From ${money(min)}` : `Up to ${money(max!)}`;
}

// `guessNameParts` was removed on 2026-09-30. The enquiry form now collects
// the two parts separately, so the conversion modal prefills what the person
// actually typed instead of splitting "Mary Jane Watson" in the wrong place
// and asking an admin to notice.

/* ── Triage bands ───────────────────────────────────────────────────────
   The band itself comes from the API; only its wording and colour live here.

   The order matters and is declared once: `passed` first because it is the only
   band that represents a mistake rather than work, and `undated` last because
   "we do not know when this is" is the weakest claim on anybody's attention —
   not the strongest, which is where a naive ascending sort on a nullable date
   would put it. */
export const BAND_ORDER: UrgencyBand[] = [
  'passed',
  'this_week',
  'this_month',
  'this_quarter',
  'later',
  'undated',
];

export const BAND_LABEL: Record<UrgencyBand, string> = {
  passed: 'Event has passed',
  this_week: 'Within a week',
  this_month: 'Within a month',
  this_quarter: 'Next three months',
  later: 'Later in the year',
  undated: 'No date given',
};

/** What the heading says when a band is worth explaining. */
export const BAND_NOTE: Record<UrgencyBand, string | null> = {
  passed: 'Still open after the date — close it or correct the date',
  this_week: null,
  this_month: null,
  this_quarter: null,
  later: null,
  // Says what to do, and sorts by the thing that is actually knowable. The
  // public form only started asking in October 2026, so this band holds every
  // lead taken before that — ordering them oldest-first makes the one that has
  // been ignored longest the one at the top.
  undated: 'Longest waiting first — ask for the date, or set it on the lead',
};

export const BAND_RULE: Record<UrgencyBand, string> = {
  passed: 'border-l-red-500',
  this_week: 'border-l-amber-500',
  this_month: 'border-l-gold',
  this_quarter: 'border-l-ink/25',
  later: 'border-l-ink/15',
  undated: 'border-l-ink/10',
};

/**
 * "in 9 days", "today", "6 days ago".
 *
 * From the server's day count rather than recomputed from the date in the
 * browser: a reader in another timezone would otherwise see a different number
 * from the one the band was decided against, and a row labelled "within a week"
 * saying "in 8 days" is the kind of small lie that costs trust in the whole
 * table.
 */
export function formatDaysUntil(days: number | null | undefined): string {
  if (typeof days !== 'number' || !Number.isFinite(days)) return '';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  // "passed", spelled out. Plain "6 days ago" reads as though the *enquiry*
  // came in six days ago, which is the other number on this table — and the
  // two mean opposite things about whether anybody still has work to do.
  if (days === -1) return 'passed yesterday';
  if (days < 0) return `passed ${Math.abs(days)} days ago`;
  return `in ${days} days`;
}

/**
 * "waiting 9 days", "arrived today".
 *
 * The column that carries the undated rows. Before this the table printed an
 * em-dash for the date and another for the countdown on every lead without an
 * event date — which was almost all of them, so eleven rows said nothing at
 * all. How long somebody has been waiting for a reply is always knowable.
 */
export function formatWaiting(days: number | null | undefined): string {
  // Guarded, because it printed "waiting undefined days" across every row of
  // the live console the first time it shipped. The field was absent — an API
  // serving older code — and a formatter that interpolates whatever it is
  // handed turns a stale backend into eleven lines of visible nonsense. A
  // number formatter should degrade to saying nothing, not to saying
  // "undefined".
  if (typeof days !== 'number' || !Number.isFinite(days)) return '';
  if (days <= 0) return 'arrived today';
  if (days === 1) return 'waiting 1 day';
  return `waiting ${days} days`;
}
