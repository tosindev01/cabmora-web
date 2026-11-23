/**
 * Somebody's picture, with their initials standing in when there is none.
 *
 * Initials rather than a silhouette, for the reason `AvatarField` gives: a
 * generic outline tells the reader nothing about whose account they are
 * looking at, and a console is mostly rows of people.
 *
 * `avatar_url` is signed and expires in about fifteen minutes, so it is
 * rendered from whatever the latest response carried. A stale one simply
 * fails to load, which is why `onError` falls back to the initials rather
 * than leaving a broken image where a face should be.
 */
import { useEffect, useState } from 'react';

export function PersonAvatar({
  src,
  initials,
  size = 40,
  className = '',
}: {
  src?: string | null;
  initials: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // A new link is a new chance. Without this, one expired URL would keep the
  // fallback showing for as long as the component stayed mounted.
  useEffect(() => setFailed(false), [src]);

  const shell = `rounded-full border border-gold/40 bg-gold/15 text-ink flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden ${className}`;

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={shell}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      alt=""
      aria-hidden
      src={src}
      onError={() => setFailed(true)}
      className={`${shell} object-cover`}
      style={{ width: size, height: size }}
    />
  );
}
