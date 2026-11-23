import { ChevronDown } from 'lucide-react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'children'
> {
  children: ReactNode;
  /**
   * The look: colours, border, radius, typography, vertical padding, width.
   *
   * Deliberately not owned by this component. The screens genuinely differ —
   * a filter bar, a dense table row and a settings form are not the same
   * control at three sizes — and an opinionated default here would flatten
   * them and force every call site to fight it with overrides that may or may
   * not win the cascade.
   */
  className?: string;
  /** Horizontal room for the chevron. Match the left padding you set. */
  chevronInset?: 'sm' | 'md';
  /** Chevron colour, for dark surfaces. */
  chevronClassName?: string;
}

/**
 * A native select with a chevron we control.
 *
 * This exists for one reason. A native `<select>` draws its arrow *inside* the
 * right padding, so `px-3` leaves the text with room and the glyph flush
 * against the border — the right side visibly hugs the edge. No amount of
 * padding fixes it, because the browser owns that glyph.
 *
 * So: `appearance-none` removes the native arrow, and we place our own with
 * `pointer-events-none` so the whole control stays clickable. Everything else
 * — every bit of the design — stays with the caller.
 */
export function Select({
  className = '',
  chevronInset = 'md',
  chevronClassName = 'text-ink/40',
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select className={`appearance-none cursor-pointer ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        size={chevronInset === 'sm' ? 13 : 15}
        strokeWidth={2}
        className={`pointer-events-none absolute ${
          chevronInset === 'sm' ? 'right-2.5' : 'right-3'
        } top-1/2 -translate-y-1/2 ${chevronClassName}`}
      />
    </div>
  );
}
