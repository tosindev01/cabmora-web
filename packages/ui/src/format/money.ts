/**
 * Money, from the integer minor units the API sends.
 *
 * Shared by both apps: the console shows what a project is worth and the
 * portal shows the client what they owe, and those two figures must be
 * written the same way or one of them looks wrong.
 *
 * Divided only here, at the edge, so no arithmetic ever happens on a float.
 * Totals arrive already summed by the API; never add these values up in a
 * component.
 */
export function formatMinor(minor: number, currency = 'GBP'): string {
  return (minor / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
}
