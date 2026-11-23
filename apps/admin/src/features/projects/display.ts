import type { ReleaseMode, WatermarkPolicy } from '@/features/projects/api';
import { STAGE_LABEL, STAGE_PILL } from '@/shared/format';

// Re-exported so this feature's modules keep importing from their own feature.
// The definitions live in shared/ because the dashboard renders stages too.
export { STAGE_LABEL, STAGE_PILL };

/**
 * Presentation for a project. Shared so the list and the settings page cannot
 * drift into describing the same project two different ways.
 */

/**
 * Accents used instead of a photograph.
 *
 * There is no media slice, so there is no thumbnail — and a stock image would
 * imply this project has delivered work that does not exist. These are used at
 * two small sizes (a 3px edge and a 36px monogram chip) rather than as a cover
 * block: enough to tell projects apart in a grid, not so much that decoration
 * becomes the biggest thing on the card.
 *
 * Literal strings on purpose: Tailwind v4 reads class names statically, so an
 * interpolated gradient would never be generated. Same reason as
 * `shared/portal/components/variant.ts` in apps/web.
 */
const ACCENTS = [
  'bg-gradient-to-br from-forest to-forest-light',
  'bg-gradient-to-br from-slate-deep to-slate-hover',
  'bg-gradient-to-br from-noir to-panel-800',
  'bg-gradient-to-br from-gold-dark to-gold',
  'bg-gradient-to-br from-forest-dark to-slate',
] as const;

/** Stable per project, so a card keeps the same accent between renders. */
export function accentFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length]!;
}

/** Two letters from the title, for the monogram chip. */
export function projectMonogram(title: string): string {
  const words = title.split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Plain English for the delivery settings — field names are not copy. */
export const WATERMARK_LABEL: Record<WatermarkPolicy, string> = {
  always: 'Always watermark previews',
  until_paid: 'Watermark until the job is paid for',
  never: 'Never watermark',
};

export const WATERMARK_HELP: Record<WatermarkPolicy, string> = {
  always: 'Every preview carries a watermark, including after delivery.',
  until_paid: 'Watermarks come off automatically once the invoice is settled in full.',
  never: 'Previews are shown clean. Use only where the work is already paid for.',
};

/**
 * What the client actually experiences under each choice.
 *
 * Written from their side rather than ours. "Always watermark previews" says
 * what the system does; "they never receive a clean file, even after paying"
 * says what it means, which is the thing somebody choosing needs to know.
 */
export const WATERMARK_EFFECT: Record<WatermarkPolicy, string> = {
  always:
    'They only ever see marked copies. Even after approving and paying, the originals are not handed over through the portal — you deliver them some other way.',
  until_paid:
    'They review marked copies, and the moment the invoice is settled the originals replace them automatically. Nobody has to remember to switch anything, and nothing finished leaves before it is paid for. A project with no invoice counts as unpaid.',
  never:
    'They see the originals from the first release. Right for work already paid for; wrong for anything you have not been paid for yet.',
};

/**
 * The same setting, said at the moment of sharing rather than while choosing.
 *
 * Kept beside `WATERMARK_EFFECT` rather than in the dialog that uses it: there
 * are now four records keyed by this enum, and the only defence against them
 * contradicting each other is that somebody editing one can see the rest.
 *
 * Present tense, because by the time this is read the admin has decided and is
 * about to do it.
 */
export const WATERMARK_ON_SHARE: Record<WatermarkPolicy, string> = {
  always: 'They see watermarked copies, and keep seeing them however the project ends.',
  until_paid:
    'They see watermarked copies. The originals replace them automatically once the invoice is settled in full.',
  never: 'They are handed the original files, unmarked, from the moment you share.',
};

export const RELEASE_EFFECT: Record<ReleaseMode, string> = {
  selective:
    'Nothing appears until you release it. Good for a long edit where you want to show the ceremony before the reception is finished.',
  all_at_once:
    'The first photograph you release makes every photograph on the project visible. Simpler, and harder to undo by accident.',
};

export const RELEASE_LABEL: Record<ReleaseMode, string> = {
  selective: 'Release galleries one at a time',
  all_at_once: 'Release everything together',
};

export const RELEASE_HELP: Record<ReleaseMode, string> = {
  selective: 'You choose which galleries the client can see, and when.',
  all_at_once: 'Releasing any gallery makes the whole project visible to the client.',
};
