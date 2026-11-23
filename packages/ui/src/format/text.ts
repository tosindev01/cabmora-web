/**
 * Capitalisation for text people typed.
 *
 * Forms arrive however somebody felt at the time — "taiwo playerone",
 * "dsdsd", "wedding photography" — and a screen full of lowercase reads as
 * broken rather than as faithful. These fix the display and nothing else: the
 * database keeps exactly what was entered, because a name is somebody's to
 * spell and the audit trail should show what they sent.
 *
 * In the shared package rather than in one app's `shared/` because both the
 * console and the portal render the same strings — the same project title is
 * a row in the admin list and a card on the client's dashboard — and two
 * copies of a display rule is two copies that drift.
 */

/**
 * First letter up, everything else untouched.
 *
 * For titles, descriptions and anything that is a sentence rather than a
 * name. "iPhone launch film" keeps its small i in the middle; only the
 * opening character moves.
 */
export function sentenceCase(value: string): string {
  const text = value.trim();
  if (!text) return text;
  return text[0]!.toUpperCase() + text.slice(1);
}

/**
 * Every word's first letter up, the rest left exactly as typed.
 *
 * For names. Lower-casing the remainder first would be the obvious
 * implementation and would flatten "McDonald" to "Mcdonald" and "O'Brien" to
 * "O'brien" — so it does not. Somebody who writes their name in a particular
 * way keeps it.
 */
export function nameCase(value: string): string {
  return value.split(' ').filter(Boolean).map(sentenceCase).join(' ');
}
