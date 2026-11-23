import { useEffect, useRef, type RefObject } from 'react';

import type { SwipeDirection } from './swipe';

/** Trackpad travel that counts as one flick.
 *
 * Higher than the touch threshold because a trackpad reports accumulated
 * scroll distance, not finger distance: a short two-finger flick already
 * reports a couple of hundred pixels. */
const WHEEL_SWIPE_MIN = 80;

/** How long without a wheel event ends a flick.
 *
 * A trackpad answers one physical movement with a burst of events that decay
 * over a few hundred milliseconds. Momentum is why a flick has to be latched
 * rather than integrated — otherwise one movement steps ten photographs. */
const SETTLE_MS = 220;

interface WheelGestures {
  /** A two-finger sideways flick, when `canFlick` allows it. */
  onSwipe?: (direction: SwipeDirection) => void;
  /** False while a sideways scroll means something else, such as looking
   *  across an image that is already zoomed in. */
  canFlick?: boolean;
  /** A trackpad pinch, which the platform reports as ctrl+wheel. */
  onZoom?: (x: number, y: number, deltaY: number) => void;
}

/**
 * Trackpad gestures over a viewer — the laptop forms of swipe and pinch.
 *
 * A touchscreen swipe is a pointer gesture; its trackpad equivalent is not.
 * The platform reports two fingers sideways as horizontal `wheel` deltas, so
 * none of the pointer handling sees it — which is why it used to fall through
 * to the browser, where a two-finger sideways flick means *go back*. Somebody
 * flicking to the next photograph was leaving the gallery altogether.
 *
 * Bound natively and non-passively on purpose. React registers `wheel` on its
 * root container as a passive listener, so `preventDefault()` inside an
 * `onWheel` prop cannot cancel anything — a browser-level page zoom or back
 * gesture goes ahead regardless. Owning the event here is what makes
 * cancelling it actually work.
 */
export function useWheelSwipe(
  frame: RefObject<HTMLElement | null>,
  { onSwipe, canFlick = true, onZoom }: WheelGestures,
) {
  // Held in refs so the listener binds once: re-adding a non-passive wheel
  // listener on every render is how this becomes a scrolling cost.
  const latest = useRef({ onSwipe, canFlick, onZoom });
  latest.current = { onSwipe, canFlick, onZoom };

  useEffect(() => {
    const node = frame.current;
    if (!node) return;

    let travelled = 0;
    let spent = false;
    let settle: number | undefined;

    const onWheel = (event: WheelEvent) => {
      const { onSwipe: swipe, canFlick: allowed, onZoom: zoom } = latest.current;

      // A trackpad pinch arrives as ctrl+wheel. Unclaimed, the browser zooms
      // the entire page instead of the photograph.
      if (event.ctrlKey || event.metaKey) {
        if (!zoom) return;
        event.preventDefault();
        zoom(event.clientX, event.clientY, event.deltaY);
        return;
      }

      // Vertical wins ties: a page being scrolled must not change the
      // picture because the gesture drifted sideways.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

      // Consumed even when no flick will follow. While an image is zoomed a
      // sideways scroll is not a flick, but it must still not be the
      // browser's back gesture — abandoning the gallery mid-inspection is far
      // worse than a gesture that does nothing.
      event.preventDefault();
      if (!allowed || !swipe) return;

      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        travelled = 0;
        spent = false;
      }, SETTLE_MS);

      if (spent) return;
      travelled += event.deltaX;
      if (Math.abs(travelled) < WHEEL_SWIPE_MIN) return;
      spent = true;
      // Fingers moving left scroll content rightwards, the same physical
      // movement that drags the next one in on a touchscreen.
      swipe(travelled > 0 ? 'next' : 'previous');
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
      window.clearTimeout(settle);
    };
  }, [frame]);
}
