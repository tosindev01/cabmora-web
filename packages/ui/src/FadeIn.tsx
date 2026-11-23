import { useEffect, useRef, useState, type ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right' | 'none';

const OFFSETS: Record<Direction, string> = {
  up: 'translateY(48px)',
  left: 'translateX(-48px)',
  right: 'translateX(48px)',
  none: 'none',
};

interface FadeInProps {
  children: ReactNode;
  /** Delay in milliseconds before the transition starts. */
  delay?: number;
  /** Direction the element travels from as it fades in. */
  direction?: Direction;
  className?: string;
}

/**
 * Reveals its children with a soft fade + slide the first time they scroll
 * into view. Pure presentation — no dependencies beyond the browser
 * IntersectionObserver.
 */
export function FadeIn({ children, delay = 0, direction = 'up', className = '' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : OFFSETS[direction],
        transition: `opacity 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
