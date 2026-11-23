import type { ProjectStage } from '@cabmora/api-client';

/**
 * The slices of their own project list a client can be shown.
 *
 * Here rather than inside either page because two screens have to agree on
 * them: the dashboard tile links to a slice, and the projects page renders
 * it. When the tile said "In progress: 3" and led to an unfiltered list of
 * nine, the tile read as broken — it was the same destination as the
 * "Projects" tile beside it.
 *
 * Keyed by a URL-safe slug, because the slice travels in the query string.
 * That is what makes the tile a real link: it can be opened in a new tab,
 * reloaded, bookmarked and backed out of, none of which a click handler
 * setting component state would survive.
 *
 * No React in here, so a test can import it without a DOM — see the
 * dependency rule in CLAUDE.md.
 */
export interface ProjectFilter {
  /** What appears in `?show=`. */
  slug: string;
  /** The tab label. */
  label: string;
  /** Shown as the page subtitle, so the list says what it is holding. */
  description: string;
  /** Null means everything, rather than a stage list covering every stage —
   *  a new stage must not quietly fall out of the "all" tab. */
  stages: ProjectStage[] | null;
}

/**
 * `draft` is absent deliberately: the API does not hand a client a project
 * until it leaves draft, so naming it here would describe a slice that can
 * never have anything in it.
 */
const IN_PROGRESS: ProjectStage[] = ['booked', 'shooting', 'editing', 'in_review'];

export const PROJECT_FILTERS: ProjectFilter[] = [
  {
    slug: 'all',
    label: 'All',
    description: 'Everything we are working on together',
    stages: null,
  },
  {
    slug: 'in-progress',
    label: 'In progress',
    description: 'Booked, being shot, or being edited',
    stages: IN_PROGRESS,
  },
  {
    slug: 'review',
    label: 'Waiting on you',
    description: 'Finished work that needs your approval',
    stages: ['in_review'],
  },
  {
    slug: 'delivered',
    label: 'Delivered',
    description: 'Signed off and handed over',
    stages: ['delivered', 'closed'],
  },
];

export const DEFAULT_FILTER = PROJECT_FILTERS[0];

/** The named slice, or everything — never undefined, so a hand-edited or
 *  stale `?show=` value shows the full list instead of an empty page. */
export function filterBySlug(slug: string | null): ProjectFilter {
  return PROJECT_FILTERS.find((f) => f.slug === slug) ?? DEFAULT_FILTER;
}

export function matchesFilter(stage: ProjectStage, filter: ProjectFilter): boolean {
  return filter.stages === null || filter.stages.includes(stage);
}
