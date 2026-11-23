import type { ReactNode } from 'react';

interface EyebrowLabelProps {
  children: ReactNode;
  /** Center the label + rule (used by full-width CTA sections). */
  centered?: boolean;
  className?: string;
}

/**
 * The gold rule + uppercase micro-label that precedes every section heading.
 */
export function EyebrowLabel({ children, centered = false, className = '' }: EyebrowLabelProps) {
  return (
    <div
      className={`flex items-center gap-4 mb-6 ${centered ? 'justify-center' : ''} ${className}`}
    >
      <div className="w-8 h-px bg-gold" />
      <span className="text-[12.5px] tracking-[0.3em] uppercase text-gold font-medium">
        {children}
      </span>
    </div>
  );
}
