import { ImageOff, Maximize2 } from 'lucide-react';

interface PinnedThumbnailProps {
  url?: string | null;
  filename?: string;
  /** Where the client pointed, 0–1. Absent for a remark about the whole frame. */
  point?: { x: number; y: number } | null;
  onOpen?: () => void;
}

/**
 * The frame being talked about, with the spot marked.
 *
 * "Make it warmer" is unreadable on its own — this view exists so somebody can
 * act — and "the shadow here is heavy" is worse, because *here* is the half of
 * the sentence that was missing until pins existed.
 *
 * At 64px the dot is a hint rather than a precise indication, which is why the
 * whole thing is a button: the editor opens it and zooms to the actual point.
 */
export function PinnedThumbnail({ url, filename, point, onOpen }: PinnedThumbnailProps) {
  const body = (
    <>
      {url ? (
        <img src={url} alt={filename ?? ''} className="w-full h-full object-cover" />
      ) : (
        <ImageOff size={16} className="text-ink/25" />
      )}

      {point && url && (
        <span
          aria-hidden
          className="absolute w-3 h-3 rounded-full bg-gold ring-2 ring-white shadow"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      )}

      {url && onOpen && (
        <span className="absolute inset-0 bg-ink/0 hover:bg-ink/35 transition-colors grid place-items-center opacity-0 hover:opacity-100">
          <Maximize2 size={14} className="text-white" />
        </span>
      )}
    </>
  );

  const shell =
    'relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-canvas border border-ink/10 grid place-items-center';

  if (!url || !onOpen) return <div className={shell}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={point ? `Open the photograph at the marked spot` : 'Open the photograph'}
      className={`${shell} cursor-pointer`}
    >
      {body}
    </button>
  );
}
