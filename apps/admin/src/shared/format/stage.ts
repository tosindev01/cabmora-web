import type { ProjectStage } from '@cabmora/api-client';

/**
 * How a project stage reads, and how its pill looks.
 *
 * In `shared/` because two features render stages — the projects screens and
 * the dashboard's overview table — and the rule is that if two features both
 * want something it is not a feature. It started in `features/projects/display`
 * and moved here the moment the dashboard needed it.
 *
 * `in_review` reads as "Client Review": the machine state is about permissions,
 * the label is about what is happening to somebody's photographs.
 */
export const STAGE_LABEL: Record<ProjectStage, string> = {
  draft: 'Draft',
  booked: 'Booked',
  shooting: 'Shooting',
  editing: 'Editing',
  in_review: 'Client Review',
  delivered: 'Delivered',
  closed: 'Closed',
};

export const STAGE_PILL: Record<ProjectStage, string> = {
  draft: 'bg-ink/10 text-ink/70',
  booked: 'bg-blue-50 text-blue-800',
  shooting: 'bg-purple-100 text-purple-900',
  editing: 'bg-amber-100 text-amber-900',
  in_review: 'bg-gold/25 text-ink',
  delivered: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-ink/15 text-ink/60',
};

/**
 * The pipeline in order, so "forward" has a meaning.
 *
 * `allowed_next_stages` comes back in enum order, which puts a backward move
 * first: a booked project may go to Shooting or back to Draft, and Draft
 * sorts earlier. A control that offered the first entry as its primary action
 * would send every booked project backwards.
 */
export const STAGE_ORDER: ProjectStage[] = [
  'draft',
  'booked',
  'shooting',
  'editing',
  'in_review',
  'delivered',
  'closed',
];

/** The next stage along, or null at the end of the line. */
export function nextStage(current: ProjectStage, allowed: ProjectStage[]): ProjectStage | null {
  const here = STAGE_ORDER.indexOf(current);
  return allowed.find((stage) => STAGE_ORDER.indexOf(stage) > here) ?? null;
}
