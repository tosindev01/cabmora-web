import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Variant = 'gold' | 'light' | 'outlineLight' | 'outlineDark';
type Size = 'sm' | 'md' | 'lg';

// NOTE: these classes mirror the designer's inline button markup exactly.
// `justify-center` was added during extraction and has been removed — it
// centred labels inside full-width buttons on mobile, which the original did
// not do. Any change here silently restyles every CTA in the app, so diff
// against design-source/creator-portal before editing.
const BASE =
  'group inline-flex items-center gap-3 text-[11.5px] tracking-[0.18em] uppercase cursor-pointer';

const VARIANTS: Record<Variant, string> = {
  // Solid variants transition colour only; outlines also transition their
  // border, hence transition-all. The designer used 400ms on gold, 300ms
  // elsewhere.
  gold: 'bg-gold text-ink font-semibold hover:bg-canvas transition-colors duration-400',
  light: 'bg-canvas text-ink font-semibold hover:bg-gold transition-colors duration-300',
  outlineLight:
    'border border-canvas/25 text-canvas font-medium hover:border-canvas/55 hover:bg-canvas/5 transition-all duration-300',
  outlineDark:
    'border border-ink/15 text-ink font-medium hover:border-ink hover:bg-ink hover:text-canvas transition-all duration-300',
};

const SIZES: Record<Size, string> = {
  sm: 'px-7 py-[13px]',
  md: 'px-8 py-[15px]',
  lg: 'px-10 py-[17px]',
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Append the animated arrow used on primary CTAs. */
  withArrow?: boolean;
  /** Render as a react-router Link. */
  to?: string;
  /** Render as an anchor. */
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
}

/**
 * The single call-to-action primitive. Renders a Link, an anchor, or a
 * button depending on which navigation prop is supplied, so every CTA in the
 * app shares one set of variants instead of re-declaring utility soup.
 */
export function Button({
  children,
  variant = 'gold',
  size = 'md',
  withArrow = false,
  to,
  href,
  type = 'button',
  onClick,
  className = '',
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
