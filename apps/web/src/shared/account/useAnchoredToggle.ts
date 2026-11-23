import { useLayoutEffect, useRef } from 'react';

/**
 * Keep the header you tapped where it is across an accordion toggle.
 *
 * Reported from an iPad in landscape: "opening Profile jumps the page to the
 * bottom". The cause is not Profile and not iPadOS — it is that a single-open
 * accordion changes the document's height on every toggle, and nothing was
 * managing the scroll offset.
 *
 * Settings has ten sections and opens Profile by default, which is ~450px of
 * avatar and fields. Scroll down to Help & Support, tap it, and Profile closes
 * *above the viewport*: the document shrinks by 450px under you. If your offset
 * is now past the new maximum the browser clamps it, and clamping lands you at
 * the end of the page. Landscape is where it bites because the viewport is only
 * 768px tall, so the remaining document is short enough for the clamp to apply
 * — in portrait there is usually enough page left that it does not.
 *
 * The fix is to measure the tapped element before the change and correct the
 * drift after it. `useLayoutEffect`, not `requestAnimationFrame`: the DOM has
 * its new height but the browser has not painted, so the correction happens in
 * the same frame and there is nothing to see.
 *
 * Returns the function to call with the element being toggled, immediately
 * before the state change.
 */
export function useAnchoredToggle(value: unknown) {
  const element = useRef<HTMLElement | null>(null);
  const wasAt = useRef(0);

  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const drift = node.getBoundingClientRect().top - wasAt.current;
    // `!== 0` rather than a tolerance: sub-pixel drift is real on a scaled
    // viewport, and correcting it is harmless.
    if (drift !== 0) window.scrollBy(0, drift);
    // Cleared so a re-render for any other reason does not move the page.
    element.current = null;
  }, [value]);

  return function anchor(node: HTMLElement | null) {
    element.current = node;
    wasAt.current = node?.getBoundingClientRect().top ?? 0;
  };
}
