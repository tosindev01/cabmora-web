import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

import {
  PinLayer,
  SpotlightLayer,
  TAP_ZOOM,
  ZoomableImage,
  type ZoomableHandle,
} from '@cabmora/ui';

interface PinnedPhotographProps {
  url: string;
  /** Where the client pointed, 0–1. Null for a remark about the whole frame. */
  point: { x: number; y: number } | null;
  caption: string;
}

/**
 * The photograph, with the spot the client meant picked out of it.
 *
 * This used to open zoomed into the pin. That answered "which pixels" and
 * threw away "where in the frame" — a tight crop of a sleeve does not tell
 * you it is the sleeve of the person at the edge of a group, and an editor
 * who cannot see the composition cannot judge the change being asked for.
 *
 * So the whole frame opens, dimmed except for the part in question, and the
 * close-up is a button away. The old behaviour was not wrong, it was just
 * the only option; both are worth having and only one can be the default.
 *
 * Without a pin it opens plainly — an older comment, or one about the
 * photograph as a whole, has no spot to light.
 */
export function PinnedPhotograph({ url, point, caption }: PinnedPhotographProps) {
  const zoomable = useRef<ZoomableHandle>(null);
  const [closeUp, setCloseUp] = useState(false);
  /** Real zoom, so the pin marker stays the size of a pin. */
  const [scale, setScale] = useState(1);

  // Depends on the coordinates rather than the object: the parent builds
  // `point` inline, so a new identity arrives on every one of its renders.
  const x = point?.x;
  const y = point?.y;

  // A fresh comment always opens on the whole frame, however the last one
  // was left.
  useEffect(() => setCloseUp(false), [url, x, y]);

  useEffect(() => {
    if (x == null || y == null) return;
    // After paint, so the frame has been measured — zooming against a
    // zero-width box puts the spot nowhere.
    const timer = window.setTimeout(
      () =>
        closeUp
          ? zoomable.current?.zoomTo({ x, y }, TAP_ZOOM)
          : zoomable.current?.zoomTo({ x: 0.5, y: 0.5 }, 1),
      60,
    );
    return () => window.clearTimeout(timer);
  }, [url, x, y, closeUp]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full h-[72vh] bg-black rounded-lg overflow-hidden">
        <ZoomableImage
          ref={zoomable}
          src={url}
          alt=""
          className="w-full h-full"
          onScaleChange={setScale}
        >
          {x != null && y != null && (
            <>
              {/* Dimmed first, marker on top, so the number sits inside the
                  lit circle rather than under the shroud. */}
              {!closeUp && <SpotlightLayer at={{ x, y }} />}
              <PinLayer
                pins={[{ id: 'it', x, y, label: 1, needsAction: true, resolved: false }]}
                scale={scale}
              />
            </>
          )}
        </ZoomableImage>

        {x != null && y != null && (
          <button
            type="button"
            onClick={() => setCloseUp((on) => !on)}
            aria-pressed={closeUp}
            className="absolute top-3 right-3 z-30 inline-flex items-center gap-2 text-[12px] font-medium px-3.5 py-2 rounded-full shadow-lg bg-canvas/90 hover:bg-canvas text-ink transition-colors"
          >
            {closeUp ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {closeUp ? 'Show the whole frame' : 'Look closely'}
          </button>
        )}
      </div>
      {/* The words beside the place, so an editor does not have to hold the
          sentence in their head while they look. */}
      <p className="text-[13.5px] text-canvas/85 leading-relaxed px-1">{caption}</p>
    </div>
  );
}
