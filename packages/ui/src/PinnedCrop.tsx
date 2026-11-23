import type { Point } from './ZoomableImage';

/**
 * The part of a photograph a remark is about, shown beside the remark.
 *
 * This replaces a numbered marker drawn over the picture. A number answered
 * "which remark" but not "about what", and it did it by putting furniture on
 * top of the thing the client came to look at — on a phone, a 28px badge over
 * a face.
 *
 * No canvas and no server crop: the browser already has the photograph, so a
 * background image scaled up and positioned by percentage shows any region of
 * it. Percentage background-position aligns the same relative point of the
 * image with that point of the box, which is exactly the definition needed to
 * centre a pin — and it clamps at the edges on its own, so a pin in the
 * corner shows the corner rather than empty space.
 */
export function PinnedCrop({
  src,
  at,
  onClick,
  size = 40,
  zoom = 4,
}: {
  src: string;
  at: Point;
  /** Usually: take the photograph to this spot. */
  onClick?: () => void;
  size?: number;
  /** How far in. 4x is close enough to recognise a hand or a hem. */
  zoom?: number;
}) {
  const style = {
    width: size,
    height: size,
    backgroundImage: `url(${src})`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${at.x * 100}% ${at.y * 100}%`,
  };
  const className = 'shrink-0 rounded-lg border border-ink/15 bg-ink/5 bg-no-repeat shadow-sm';

  if (!onClick) return <span aria-hidden className={className} style={style} />;

  return (
    <button
      type="button"
      onClick={(event) => {
        // The row behind this one may have its own handler.
        event.stopPropagation();
        onClick();
      }}
      aria-label="Show this spot on the photograph"
      className={`${className} cursor-pointer transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
      style={style}
    />
  );
}
