import { useEffect, useState } from 'react';

/**
 * How much of the screen the on-screen keyboard is covering, in pixels.
 *
 * A full-screen overlay is positioned against the **layout** viewport, and on
 * iOS that does not shrink when the keyboard opens — so anything pinned to the
 * bottom of it, such as the comment box in the gallery, ends up behind the
 * keyboard. The client could type and not see a word of it.
 *
 * `100dvh` does not fix this: dynamic viewport units track the browser's own
 * retracting chrome, not the keyboard. The only thing that knows is the
 * visual viewport, so that is what this reads.
 *
 * Returns 0 everywhere it cannot tell — desktop, older browsers, and any
 * platform that resizes the layout viewport itself (Android does) and
 * therefore needs no correction.
 *
 * In this feature rather than `shared/` because only the gallery needs it so
 * far. It moves the day a second feature does.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const measure = () => {
      // What the layout viewport has that the visible one does not. The
      // offset matters too: iOS scrolls the visual viewport up rather than
      // resizing it, and ignoring that under-measures by exactly that much.
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      // Rounded and floored: sub-pixel noise on every scroll frame would
      // re-render the gallery continuously for no visible difference.
      setInset(Math.max(0, Math.round(covered)));
    };

    measure();
    viewport.addEventListener('resize', measure);
    viewport.addEventListener('scroll', measure);
    return () => {
      viewport.removeEventListener('resize', measure);
      viewport.removeEventListener('scroll', measure);
    };
  }, []);

  return inset;
}
