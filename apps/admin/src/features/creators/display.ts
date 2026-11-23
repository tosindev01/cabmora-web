import type { ApplicationStatus } from '@/features/creators/api';

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  declined: 'Declined',
};

export const STATUS_PILL: Record<ApplicationStatus, string> = {
  pending: 'bg-gold/20 text-ink border border-gold/40',
  approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  declined: 'bg-ink/8 text-ink/50 border border-ink/10',
};

/** The form's option values are terse. These are what a reviewer reads. */
export const DISCIPLINE_LABEL: Record<string, string> = {
  wedding: 'Wedding cinematography',
  photography: 'Editorial photography',
  commercial: 'Commercial video & brand',
  drone: 'Aerial & drone',
  multicam: 'Multi-cam & event studio',
};

export const BOTTLENECK_LABEL: Record<string, string> = {
  storage_cost: 'Cloud storage costs',
  compression: '4K compression on Vimeo/YouTube',
  invoicing: 'Chasing transfers & invoicing',
  branding: 'No white-label client portal',
};

/** Falls back to the raw value rather than an empty cell: an option we have
 *  not seen is still information, and hiding it would hide a form change. */
export const readable = (map: Record<string, string>, value: string): string => map[value] ?? value;

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
