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
  dark: 'w-[280px] bg-panel-900 border-r border-canvas/5',
};

/** Page surface behind the content column. */
export const PAGE_SURFACE: Record<PortalVariant, string> = {
  light: 'bg-canvas text-ink',
  dark: 'bg-noir text-canvas',
};

/** Left margin that clears the fixed sidebar. Must match SIDEBAR_CHROME width. */
export const CONTENT_OFFSET: Record<PortalVariant, string> = {
  light: 'lg:ml-[260px]',
  dark: 'lg:ml-[280px]',
};
