import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import { swipeDirection, type SwipeDirection } from './swipe';
import { useWheelSwipe } from './useWheelSwipe';

interface SwipeAreaProps {
  onSwipe: (direction: SwipeDirection) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Flick-to-move-on around something with no gestures of its own.
 *
 * `ZoomableImage` and `VideoStage` each own their pointers already, because in
 * both cases a swipe has to be told apart from a gesture that means something
 * else — a pan, a scrub. This is for the plain case: a still image in a
 * viewer where a horizontal drag means nothing else at all.
 */
export function SwipeArea({ onSwipe, children, className = '' }: SwipeAreaProps) {
  const frame = useRef<HTMLDivElement>(null);
  const from = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(0);

  useWheelSwipe(frame, { onSwipe });

  return (
    <div
      ref={frame}
      className={className}
      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
        pointers.current += 1;
        // Two fingers is a pinch — the browser's own zoom, which must not
        // also turn the page.
        from.current = pointers.current === 1 ? { x: event.clientX, y: event.clientY } : null;
      }}
      onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
        pointers.current = Math.max(0, pointers.current - 1);
        const start = from.current;
        from.current = null;
        if (!start) return;
        const direction = swipeDirection(start, { x: event.clientX, y: event.clientY });
        if (direction) onSwipe(direction);
      }}
      onPointerCancel={() => {
        pointers.current = Math.max(0, pointers.current - 1);
        from.current = null;
      }}
    >
      {children}
    </div>
  );
}
