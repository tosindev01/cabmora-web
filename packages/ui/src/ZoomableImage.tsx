import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { swipeDirection, type SwipeDirection } from './swipe';
import { useWheelSwipe } from './useWheelSwipe';

/** Beyond this you magnify JPEG artefacts rather than detail: a preview is
 *  2048px on its long edge, which is about 5.25x native on a phone. */
const MAX_SCALE = 6;
const MIN_SCALE = 1;

/** Where a tap-to-zoom lands. Fixed rather than "fit the tapped region",
 *  which behaves differently on a 2MP phone snap and a 60MP medium-format
 *  file — and unpredictable is worse than imperfect. */
export const TAP_ZOOM = 3;

export interface Point {
  /** Fraction of the natural width, 0–1. */
  x: number;
  y: number;
}

export interface ZoomableHandle {
  /** Zoom to `scale` about an image point, easing rather than snapping — a
   *  view that jumps leaves the reader unsure what they are now looking at. */
  zoomTo: (point: Point, scale: number) => void;
  /** What sits under the middle of the frame, which is where a crosshair is. */
  centre: () => Point;
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** Called with a 0–1 point when the surface is tapped and not dragged. */
  onTap?: (point: Point) => void;
  /** Drawn over the image, positioned by the caller in percentages. */
  children?: React.ReactNode;
  /** Lets a parent read the current scale — to size pins against it. */
  onScaleChange?: (scale: number) => void;
  /**
   * A flick left or right, for moving between photographs.
   *
   * Only fires while the image sits at its natural size. Once it is zoomed a
   * horizontal drag *is* a pan — the thing the drag is for — and stealing it
   * to change photograph would make a zoomed image impossible to look across.
   */
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
}

interface View {
  scale: number;
  /** Translation in pixels, applied after the scale. */
  x: number;
  y: number;
}

const IDENTITY: View = { scale: 1, x: 0, y: 0 };

/**
 * A photograph you can pinch, pan and tap.
 *
 * The lightbox previously applied `transform: scale()` with no translation, so
 * zooming in showed you the middle of the picture and nothing else — the
 * corners were unreachable. That is fatal for pinning a comment, where the
 * whole point is to say *which part*.
 *
 * Pointer Events rather than touch handlers: one code path covers a finger, a
 * mouse and a trackpad, and `setPointerCapture` keeps a drag alive when the
 * finger leaves the element, which a `touchmove` listener on the node does not.
 *
 * Translation is clamped so the image cannot be flung off screen — at scale 1
 * there is nowhere to go, and at 6x you can reach every edge and no further.
 */
export const ZoomableImage = forwardRef<ZoomableHandle, ZoomableImageProps>(function ZoomableImage(
  { src, alt, onTap, children, onScaleChange, onSwipe, className = '' },
  handle,
) {
  const frame = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const [view, setView] = useState<View>(IDENTITY);
  /** The frame's own size, watched rather than measured on demand, because
   *  every coordinate below is a fraction of something derived from it. */
  const [frameSize, setFrameSize] = useState<{ w: number; h: number } | null>(null);
  /** The photograph's shape, which only it can tell us. */
  const [ratio, setRatio] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  /** Live pointers, by id. Two of them means a pinch. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; scale: number } | null>(null);
  /** Where a one-finger drag started, so its whole travel can be judged on
   *  release rather than from the last move event. */
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);

  /** Distinguishes a tap from a drag — a finger always moves a little. */
  const travelled = useRef(0);

  useEffect(() => {
    onScaleChange?.(view.scale);
  }, [view.scale, onScaleChange]);

  // A new photograph starts fitted, not wherever the last one was left, and
  // its shape is unknown again until it loads.
  useEffect(() => {
    setView(IDENTITY);
    setRatio(null);
  }, [src]);

  // A photograph already in the browser cache is `complete` before React
  // attaches its handler, so `onLoad` never fires and the shape is never
  // learned. The plate then falls back to the frame's own size and every
  // coordinate silently goes back to being a fraction of the frame — the
  // exact bug the plate exists to remove, reappearing only for images you
  // have already looked at once.
  useEffect(() => {
    const img = picture.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
  }, [src]);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setFrameSize((current) => {
        // Only when it genuinely moved. A fresh object every observation
        // re-renders, which re-sizes the plate, which the observer reports
        // again — and `contentRect` is fractional, so the loop never settles.
        // On screen that is a photograph and a crosshair that will not sit
        // still.
        if (current && Math.abs(current.w - width) < 0.5 && Math.abs(current.h - height) < 0.5) {
          return current;
        }
        return { w: width, h: height };
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * The rectangle the picture actually occupies inside the frame.
   *
   * This is the whole point of the exercise. A photograph is letterboxed into
   * a frame of a different shape, and everything that matters here — where a
   * pin was put, what a zoom should centre on, how far a pan may go — is a
   * fraction of the *picture*, never of the frame it is sitting in. Measuring
   * against the frame counts the empty bars as part of the photograph, so a
   * pin placed in a tall frame on a phone reappeared somewhere else entirely
   * in a wide one on a desktop.
   *
   * Before the image reports its shape the two are treated as the same, which
   * is the old behaviour and is right for exactly as long as we cannot do
   * better.
   */
  const plate = useMemo(() => {
    if (!frameSize) return null;
    if (!ratio) return frameSize;
    return frameSize.w / frameSize.h > ratio
      ? { w: frameSize.h * ratio, h: frameSize.h }
      : { w: frameSize.w, h: frameSize.w / ratio };
  }, [frameSize, ratio]);

  /** How far the image may be moved before its edge comes inside the frame. */
  const clamp = useCallback(
    (next: View): View => {
      if (!plate || !frameSize) return next;
      // Measured from the picture. A letterboxed photograph has less to give
      // than its frame does, and bounding by the frame let a pan drag empty
      // bars into view.
      const overflowX = Math.max(0, (plate.w * next.scale - frameSize.w) / 2);
      const overflowY = Math.max(0, (plate.h * next.scale - frameSize.h) / 2);
      return {
        scale: next.scale,
        x: Math.min(overflowX, Math.max(-overflowX, next.x)),
        y: Math.min(overflowY, Math.max(-overflowY, next.y)),
      };
    },
    [plate, frameSize],
  );

  /**
   * Zoom about a point, keeping what is under it under it.
   *
   * Without this the image appears to slide away as you zoom, because scaling
   * happens about the centre and the thing you were looking at is not there.
   */
  const zoomAbout = useCallback(
    (clientX: number, clientY: number, scale: number) => {
      const box = frame.current?.getBoundingClientRect();
      if (!box) return;
      const fromCentreX = clientX - (box.left + box.width / 2);
      const fromCentreY = clientY - (box.top + box.height / 2);
      setView((current) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
        const ratio = next / current.scale;
        return clamp({
          scale: next,
          x: fromCentreX - (fromCentreX - current.x) * ratio,
          y: fromCentreY - (fromCentreY - current.y) * ratio,
        });
      });
    },
    [clamp],
  );

  // Trackpad gestures: two fingers sideways to move on, pinch to zoom. The
  // flick is gated on the same condition as the touch swipe — zoomed in, a
  // sideways scroll is how you look across a photograph.
  useWheelSwipe(frame, {
    onSwipe,
    canFlick: view.scale <= 1,
    onZoom: (x, y, deltaY) => zoomAbout(x, y, view.scale * (deltaY < 0 ? 1.1 : 0.9)),
  });

  /** Screen coordinates → a fraction of the photograph, whatever the view. */
  const toImagePoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const box = frame.current?.getBoundingClientRect();
      if (!box || !plate) return null;
      // The frame's centre is also the picture's centre — the plate is
      // centred in it — so the offset is measured from there and divided by
      // the picture's size rather than the frame's.
      const fromCentreX = clientX - (box.left + box.width / 2);
      const fromCentreY = clientY - (box.top + box.height / 2);
      return {
        x: (fromCentreX - view.x) / (plate.w * view.scale) + 0.5,
        y: (fromCentreY - view.y) / (plate.h * view.scale) + 0.5,
      };
    },
    [view, plate],
  );

  useImperativeHandle(
    handle,
    () => ({
      zoomTo(point, scale) {
        if (!plate) return;
        // Put the requested image point in the middle of the frame at the new
        // scale. Solved directly rather than by zooming about the tap: after a
        // tap the finger has lifted, and the point we want centred is not
        // where the pointer was by the time this runs.
        setView(
          clamp({
            scale,
            x: -(point.x - 0.5) * plate.w * scale,
            y: -(point.y - 0.5) * plate.h * scale,
          }),
        );
      },
      centre() {
        if (!plate) return { x: 0.5, y: 0.5 };
        return {
          x: 0.5 - view.x / (plate.w * view.scale),
          y: 0.5 - view.y / (plate.h * view.scale),
        };
      },
    }),
    [clamp, view, plate],
  );

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    travelled.current = 0;
    // A second finger landing cancels the swipe: a pinch is not a flick.
    swipeFrom.current = pointers.current.size === 1 ? { x: event.clientX, y: event.clientY } : null;
    setDragging(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAbout(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        gesture.current.scale * (distance / gesture.current.distance),
      );
      travelled.current = Infinity; // a pinch is never a tap
      return;
    }

    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    travelled.current += Math.hypot(dx, dy);
    // Panning only means something once there is something off-screen.
    if (view.scale > 1) {
      setView((current) => clamp({ ...current, x: current.x + dx, y: current.y + dy }));
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) {
      setDragging(false);
      const from = swipeFrom.current;
      swipeFrom.current = null;

      if (from && onSwipe && view.scale <= 1) {
        const direction = swipeDirection(from, { x: event.clientX, y: event.clientY });
        if (direction) {
          onSwipe(direction);
          return;
        }
      }

      // Under ~8px of travel is a tap, not a drag. A finger never holds still.
      if (travelled.current < 8) {
        const point = toImagePoint(event.clientX, event.clientY);
        if (point && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) {
          onTap?.(point);
        }
      }
    }
  }

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden touch-none select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) =>
        zoomAbout(event.clientX, event.clientY, view.scale > 1 ? 1 : TAP_ZOOM)
      }
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          // Animated only when the gesture has ended, so a pinch tracks the
          // fingers exactly and a double-tap still eases.
          transition: dragging ? 'none' : 'transform 280ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Sized to the picture, so `children` — pins, spotlights — are
            positioned in percentages *of the photograph*. `object-contain`
            would letterbox inside this box and put the empty bars back into
            every percentage, which is the bug this exists to remove. */}
        <div
          className="relative"
          style={plate ? { width: plate.w, height: plate.h } : { width: '100%', height: '100%' }}
        >
          <img
            ref={picture}
            src={src}
            alt={alt}
            draggable={false}
            /* `object-contain` is a no-op once the plate is sized — the plate
               has the picture's own aspect — and a safety net for the frame
               or two before the observer has reported, where the box is still
               the frame's shape and an unconstrained image would stretch. */
            className="block w-full h-full object-contain"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setRatio(naturalWidth / naturalHeight);
              }
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
});
