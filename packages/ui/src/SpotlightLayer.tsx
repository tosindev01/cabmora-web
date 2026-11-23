import type { Point } from './ZoomableImage';

interface SpotlightLayerProps {
  /** The spot the client pointed at, 0–1 across the frame. */
  at: Point;
  /** The lit circle's diameter, as a share of the frame's height. */
  size?: number;
  /** How far everything else is taken down, 0–1. */
  dim?: number;
}

/**
 * The whole photograph, with one part picked out.
 *
 * The alternative was opening zoomed into the spot, which answers "where" by
 * throwing away "where in the frame" — an editor given a tight crop of a
 * sleeve cannot see that it is the sleeve of the person at the edge of a
 * group. This keeps the composition on screen and still leaves no doubt
 * which part is being talked about.
 *
 * Positioned in percentages, like `PinLayer`, so it rides the image through
 * pan and zoom with no arithmetic here. It deliberately does *not*
 * counter-scale: this marks a region of the photograph, not a point on the
 * screen, so it should grow with the thing it is circling.
 */
export function SpotlightLayer({ at, size = 0.26, dim = 0.66 }: SpotlightLayerProps) {
  return (
    <div
      aria-hidden
      /* `pointer-events-none` matters more than it looks: this covers the
         entire frame via its own shadow, and without it nothing underneath
         could be tapped, panned or pinched at all. */
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${at.x * 100}%`,
        top: `${at.y * 100}%`,
        height: `${size * 100}%`,
        // Height drives it and the ratio makes it round, so the circle stays
        // a circle whatever shape the frame happens to be.
        aspectRatio: '1',
        transform: 'translate(-50%, -50%)',
        // Both the rim and the shroud in one declaration, because they are
        // one property: Tailwind's `ring-*` is also a box-shadow, so an
        // inline `boxShadow` beside it would simply erase the ring.
        boxShadow: [
          'inset 0 0 0 2px var(--color-gold)',
          `0 0 0 9999px color-mix(in srgb, var(--color-noir-deep) ${Math.round(dim * 100)}%, transparent)`,
        ].join(', '),
      }}
    >
      {/* A slow pulse to catch the eye on open. Honoured only where motion is
          welcome — a looping animation is exactly what `prefers-reduced-motion`
          exists to turn off. */}
      <span className="absolute inset-0 rounded-full border-2 border-gold/70 animate-ping motion-reduce:animate-none" />
    </div>
  );
}
