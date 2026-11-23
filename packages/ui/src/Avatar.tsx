interface AvatarProps {
  /** Used for the initials and to pick the tint. */
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** Rendered instead of initials — for the in-house row, or a status glyph. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * A person, as initials on a tinted ground.
 *
 * Not a fallback for a missing photograph — `User` has no avatar field
 * anywhere, so this *is* what an account looks like. A stock portrait would be
 * worse than a monogram: inventing a face for a real client is a lie that
 * renders convincingly, and both the admin console and the client portal were
 * already doing exactly that with fixture URLs.
 *
 * The tint is derived from the name rather than chosen at random, so the same
 * person is always the same colour and a list of people stays scannable across
 * renders and reloads.
 *
 * In `packages/ui` because both apps need it: this panel in the console, and
 * `ClientPortalShell` in the web app, which hand-rolls the same monogram today.
 */
const TONES = [
  'bg-forest text-canvas',
  'bg-gold text-ink',
  'bg-slate text-canvas',
  'bg-noir text-canvas',
  'bg-forest-light text-canvas',
  'bg-stone text-ink',
] as const;

const SIZES = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-[13px]',
  lg: 'w-14 h-14 text-[17px]',
} as const;

export function Avatar({ name, size = 'md', children, className = '' }: AvatarProps) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?';

  // Deterministic: a re-render must not reshuffle the colours, and the same
  // name must look the same on every screen it appears on.
  const tone = TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length]!;

  return (
    <div
      aria-hidden
      className={`${SIZES[size]} ${tone} ${className} rounded-full flex items-center justify-center font-semibold tracking-[0.04em] flex-shrink-0 select-none`}
    >
      {children ?? initials}
    </div>
  );
}
