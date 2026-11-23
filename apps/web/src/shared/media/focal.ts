/**
 * Where a cropped photograph should centre.
 *
 * Cabmora's portfolio is **24 portrait images out of 26** — it is portrait
 * photography, shot on a portrait sensor, of people. Much of the marketing site
 * shows it in landscape frames: 4:3 cards, a full-bleed hero. `object-cover`
 * fills the frame and discards the overflow, and the default `object-position:
 * center` discards it evenly top and bottom.
 *
 * For a 787x1400 photograph in a wide hero that is around 840px thrown away,
 * 420px of it off the top — and in portrait photography of people the top of
 * the frame is the head. Reported as "image head being cut off (multiple
 * images)", and it was multiple images because it was never one image's fault.
 *
 * So the default for this site is biased upward, not centred. 30% keeps a head
 * in frame across every portfolio image measured: faces sit between 11% and 50%
 * of the height, clustering around 30-37%.
 *
 * Override it per image where a photograph needs something else — a wide group
 * shot, or a subject deliberately low in frame. `SideStory.focal` and the hero
 * slides already do.
 */
export const PORTRAIT_BIAS = 'center 30%';

/**
 * Applied as an **inline style**, never a Tailwind class.
 *
 * Tailwind v4 generates classes by scanning source statically, so a value that
 * arrives from data produces no CSS at all and the crop silently stays centred
 * — the trap described in CLAUDE.md §5. `style={focalStyle(item.focal)}` cannot
 * fail that way.
 */
export function focalStyle(focal?: string | null) {
  return { objectPosition: focal || PORTRAIT_BIAS };
}
