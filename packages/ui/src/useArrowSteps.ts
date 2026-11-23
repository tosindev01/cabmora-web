import { useEffect, useRef } from 'react';

/**
 * The left and right arrow keys, for moving through an open viewer.
 *
 * The keyboard half of the swipe. A flick is the only way to move on a phone
 * and no way at all on a keyboard, and this product commits to WCAG 2.2 AA —
 * so every viewer that can be flicked answers the arrows too, and carries
 * visible buttons besides.
 *
 * @param active Whether a viewer is open. Bound to the window, so an inactive
 *   viewer must not be listening — two open at once would both step.
 * @param step Moves by one, wrapping. Read through a ref, so a viewer whose
 *   list changes underneath it still steps through the current one.
 */
export function useArrowSteps(active: boolean, step: (by: 1 | -1) => void) {
  const latest = useRef(step);
  latest.current = step;

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      // Not while something is being written. A viewer can hold a comment
      // box, and moving the caret through a sentence must not also move the
      // photograph the sentence is about.
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      latest.current(event.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}
