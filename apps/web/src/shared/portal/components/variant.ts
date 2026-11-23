/**
 * The creator portal ships in two skins. Every difference between them lives
 * here so a page picks a side with one word instead of carrying its own copy
 * of the palette.
 *
 * Widths are deliberately literal in each string: Tailwind v4 reads class
 * names statically, so an interpolated `lg:ml-[${w}px]` would never generate.
 */
export type PortalVariant = 'light' | 'dark';

/** Sidebar column: width + surface. */
export const SIDEBAR_CHROME: Record<PortalVariant, string> = {
  light: 'w-[260px] bg-forest',
  dark: 'w-[280px] bg-forest border-r border-canvas/10',
};

/**
 * The collapsed rail, from `lg` up.
 *
 * Written out in full, including the `lg:` prefix, because Tailwind v4 scans
 * source text for class names: a string assembled as `lg:${width}` is never
 * seen by the scanner, the utility is never generated, and the column simply
 * does not narrow — with no error anywhere. Same reason the widths above are
 * literal.
 *
 * One width for both skins. A rail of 20px glyphs has nothing to do with the
 * 20px difference between the two expanded columns.
 */
export const SIDEBAR_COLLAPSED = 'lg:w-[76px]';

/** Page surface behind the content column. */
export const PAGE_SURFACE: Record<PortalVariant, string> = {
  light: 'bg-canvas text-ink',
  dark: 'bg-forest-dark text-canvas',
};

/** Left margin that clears the fixed sidebar. Must match SIDEBAR_CHROME width. */
export const CONTENT_OFFSET: Record<PortalVariant, string> = {
  light: 'lg:ml-[260px]',
  dark: 'lg:ml-[280px]',
};

/** The matching margin. Must stay in step with SIDEBAR_COLLAPSED. */
export const CONTENT_OFFSET_COLLAPSED = 'lg:ml-[76px]';
