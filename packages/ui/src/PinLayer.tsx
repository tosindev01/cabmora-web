import type { Point } from './ZoomableImage';

export interface Pin extends Point {
  id: string;
  /** What the marker shows. Numbered in the order they were left. */
  label: number;
  /** An amendment is something somebody owes an answer to. */
  needsAction: boolean;
  resolved: boolean;
}

interface PinLayerProps {
  pins: Pin[];
  /** The current zoom, so markers stay the same size on screen. */
  scale: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * The markers, drawn over the photograph.
 *
 * Positioned in percentages so they ride the image through pan and zoom
 * without any arithmetic here — the transform on the parent moves them, and a
 * pin stays on the freckle it was left on.
 *
 * Counter-scaled, though. Without `scale(1 / scale)` a marker grows with the
 * photograph and at 6x covers the thing it is pointing at; with it, the dot
 * stays a constant size on screen while its *position* keeps tracking. That
 * is how every map pin behaves, and it is what people expect.
 */
export function PinLayer({ pins, scale, selectedId, onSelect }: PinLayerProps) {
  return (
    <>
      {pins.map((pin) => (
        <button
          key={pin.id}
          type="button"
          aria-label={`Comment ${pin.label}${pin.resolved ? ', resolved' : ''}`}
          aria-pressed={selectedId === pin.id}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(pin.id);
          }}
          className="absolute"
          style={{
            left: `${pin.x * 100}%`,
            top: `${pin.y * 100}%`,
            // The marker's own centre sits on the point, and the counter-scale
            // happens about that same centre.
            transform: `translate(-50%, -50%) scale(${1 / scale})`,
          }}
        >
          {/* 44px of transparent padding around a 28px dot: the tap target is
              what a finger needs, the dot is what the eye needs, and the
              photograph underneath stays visible. */}
          <span className="flex items-center justify-center w-11 h-11">
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shadow-lg ring-2 ring-white/90 transition-transform ${
                selectedId === pin.id ? 'scale-110' : ''
              } ${
                pin.resolved
                  ? 'bg-ink/45 text-white'
                  : pin.needsAction
                    ? 'bg-gold text-ink'
                    : 'bg-white text-ink'
              }`}
            >
              {pin.label}
            </span>
          </span>
        </button>
      ))}
    </>
  );
}
