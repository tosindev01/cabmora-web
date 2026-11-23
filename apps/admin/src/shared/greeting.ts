import { nameCase } from '@/shared/format';

/**
 * What the console says to whoever is signed in.
 *
 * The header used to read "Cabmora Media Admin" for everybody — which is the
 * name of the software, not a greeting, and told a coordinator nothing they
 * did not already know from the tab they were looking at.
 *
 * No React here: it is two strings and a clock, and a unit test should be able
 * to check the boundaries without a DOM.
 */

/** Local to whoever is reading it, which is the only sensible reference. */
export function partOfDay(now: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = now.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * "Good morning, Devon" — first name only.
 *
 * A surname in a greeting reads like a summons. Falls back to the time of day
 * alone rather than inventing a name or saying "Administrator": a greeting
 * addressed to nobody is better than one addressed to a job title.
 */
export function greet(firstName?: string | null, now: Date = new Date()): string {
  const opening = `Good ${partOfDay(now)}`;
  const name = firstName?.trim();
  return name ? `${opening}, ${nameCase(name)}` : opening;
}
