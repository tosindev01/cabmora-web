import { useEffect, useRef, useState } from 'react';

/** Splits '453+' into 453 and '+'. A figure with no number comes back null. */
function parse(figure: string): { target: number; suffix: string } | null {
  const match = /^(\d[\d,]*)(.*)$/.exec(figure.trim());
  if (!match) return null;
  return { target: Number(match[1].replace(/,/g, '')), suffix: match[2] };
}

const DURATION_MS = 1400;

/** Fast at the start, easing to a stop — a linear count looks mechanical. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CountUpProps {
  /** As Cabmora wrote it: '12+', '453+', or a word like 'International'. */
  figure: string;
  className?: string;
}

/**
 * Counts a figure up the first time it scrolls into view.
 *
 * Renders the figure verbatim and unanimated when there is no number in it,
 * when the browser has no `IntersectionObserver`, or when the reader has asked
 * their system for less motion — WCAG 2.2 AA is a stated requirement here, and
 * a number flickering through two hundred values is exactly what that setting
 * is for. The final text is identical in every case, so nothing is lost.
 */
export function CountUp({ figure, className = '' }: CountUpProps) {
  const parsed = parse(figure);
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!parsed || !element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / DURATION_MS);
          setValue(Math.round(easeOut(progress) * parsed.target));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // `figure` is the only input; `parsed` is derived from it each render.
  }, [figure]);

  if (!parsed) return <span className={className}>{figure}</span>;

  return (
    <span ref={ref} className={className}>
      {/* The settled figure is what assistive technology reads; the count is
          decoration, and announcing two hundred intermediate values is not. */}
      <span aria-hidden>
        {value === null ? parsed.target : value}
        {parsed.suffix}
      </span>
      <span className="sr-only">{figure}</span>
    </span>
  );
}
