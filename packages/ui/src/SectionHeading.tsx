import type { ReactNode } from 'react';
import { EyebrowLabel } from './EyebrowLabel';

interface SectionHeadingProps {
  /** Gold micro-label above the title. */
  eyebrow: ReactNode;
  /** The headline. Pass `<em>` for the serif-italic accent and `<br />` for line breaks. */
  children: ReactNode;
  /** `light` = dark text for light backgrounds, `dark` = cream text for dark backgrounds. */
  tone?: 'light' | 'dark';
  centered?: boolean;
  className?: string;
  /** Override / extend the heading classes (e.g. a smaller clamp on dense sections). */
  headingClassName?: string;
}

/**
 * Eyebrow + serif display heading — the shared header used across every
 * marketing section. Data (the copy) is passed in; styling lives here.
 */
export function SectionHeading({
  eyebrow,
  children,
  tone = 'light',
  centered = false,
  className = '',
  headingClassName = 'font-serif text-[clamp(40px,6vw,84px)] leading-[0.9]',
}: SectionHeadingProps) {
  const color = tone === 'dark' ? 'text-canvas' : 'text-ink';
  return (
    <div className={`${centered ? 'flex flex-col items-center text-center' : ''} ${className}`}>
      <EyebrowLabel centered={centered}>{eyebrow}</EyebrowLabel>
      <h2 className={`${headingClassName} ${color}`}>{children}</h2>
    </div>
  );
}
