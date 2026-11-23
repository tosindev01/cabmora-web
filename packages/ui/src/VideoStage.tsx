import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

import { swipeDirection, type SwipeDirection } from './swipe';
import { useWheelSwipe } from './useWheelSwipe';

/** The native control strip, which a flick must not cross.
 *
 * Dragging along the bottom of a film is how you scrub it, and a scrub is a
 * long horizontal drag — exactly the shape of a swipe. Anything starting in
 * this band belongs to the player, so the gesture is never even considered.
 * Generous because iOS draws a taller strip than a desktop browser does. */
const CONTROLS_BAND = 72;

interface VideoStageProps {
  src: string | undefined;
  /** Moving on to the next or previous item in the reel. */
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
}

/**
 * A film in a lightbox, flickable like a photograph beside it.
 *
 * `ZoomableImage` cannot stand in for this: a `<video>` is not an `<img>`, and
 * pinch-zooming a film is meaningless. But a reel mixes the two, so the
 * gesture has to carry across — a client swiping through their gallery should
 * not stop dead at the first clip. Both read `swipeDirection`, so the flick
 * needs the same travel either way.
 */
export function VideoStage({ src, onSwipe, className = '' }: VideoStageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(0);

  useWheelSwipe(frame, { onSwipe });

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current += 1;
    const rect = video.current?.getBoundingClientRect();
    const onControls = rect ? event.clientY > rect.bottom - CONTROLS_BAND : false;
    // A second finger, or a touch on the controls, is not a flick.
    swipeFrom.current =
      pointers.current === 1 && !onControls ? { x: event.clientX, y: event.clientY } : null;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current = Math.max(0, pointers.current - 1);
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from || !onSwipe) return;
    const direction = swipeDirection(from, { x: event.clientX, y: event.clientY });
    if (direction) onSwipe(direction);
  }

  return (
    <div
      ref={frame}
      className={`flex items-center justify-center ${className}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* No autoplay: a gallery of films opened on a phone would otherwise
          start pulling one the moment it appeared, and `preload="metadata"`
          exists precisely so opening a clip costs headers, not gigabytes. */}
      <video
        ref={video}
        src={src}
        controls
        playsInline
        preload="metadata"
        className="max-w-full max-h-full bg-black rounded shadow-2xl"
      />
    </div>
  );
}
