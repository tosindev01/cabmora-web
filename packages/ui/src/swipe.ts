/** The flick-to-move-on gesture, in one place.
 *
 * Two surfaces need it and must agree: a photograph (inside `ZoomableImage`,
 * where it competes with panning) and a film (where it competes with the
 * native scrubber). Keeping the threshold in one module is what stops a
 * gesture feeling different depending on which kind of media you landed on.
 */

/** How far a flick has to travel to count as one.
 *
 * Comfortably past the drift of a thumb that meant to tap, and well inside
 * what a thumb covers on the narrowest phone this has to work on. */
export const SWIPE_MIN = 60;

export type SwipeDirection = 'next' | 'previous';

/** What a completed drag meant, or `null` if it meant nothing. */
export function swipeDirection(
  from: { x: number; y: number },
  to: { x: number; y: number },
): SwipeDirection | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Horizontal has to beat vertical clearly, or scrolling with a thumb that
  // drifts sideways would change the media underneath mid-scroll.
  if (Math.abs(dx) <= SWIPE_MIN || Math.abs(dx) <= Math.abs(dy) * 1.5) return null;
  // Dragging left pulls the next one in, the way a stack of prints moves
  // under your hand.
  return dx < 0 ? 'next' : 'previous';
}
