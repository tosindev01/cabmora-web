import { useEffect, useState } from 'react';

/**
 * The hero background, as a slow cross-fade rather than one still.
 *
 * These are Cabmora's own photographs from the portfolio, which the hero
 * previously was not: it played a stock clip of somebody else's wedding,
 * standing in for work this studio had done.
 *
 * Chosen for darkness, not for subject. White type sits on top of these, and
 * the two gradients below only carry it so far — measured mean luminance runs
 * from 49 to 140 across the portfolio, and anything past about 120 starts to
 * swallow the headline. Every slide here is under 105.
 */
const SLIDES: { src: string; alt: string; focal: string }[] = [
  // `focal` is where the crop should centre, and it is not optional here.
  //
  // Three of these four are portrait — 787x1400 — and the hero is a wide
  // full-bleed frame. `object-cover` scales the photograph to fill the width
  // and throws away the overflow top and bottom, so on a tall viewport roughly
  // 840px disappears from a 1400px-tall source. Centred, that is 420px off the
  // top, and in portrait photography the top 400px is the head. Reported as
  // "image head being cut off", and the screenshot showed exactly that.
  //
  // The percentages are solved, and what they are solved *for* matters.
  //
  // The first attempt optimised to keep the top of the head in frame, which
  // sounds right and is not: it pushed the crop so far up that at 1440x988 the
  // visible slice of dsc08570 was source 95-634 against a face at 400-650, so
  // the hero showed a lot of hair and no chin. A clipped hairline is an
  // ordinary editorial crop; a clipped face is a mistake.
  //
  // So each value keeps the **whole face** inside the window, taken from the
  // middle of the feasible band rather than its edge — an edge value fails the
  // moment somebody opens a window shape nobody tested. Bands were computed
  // across seven frames from 390x844 to 1920x1080.
  //
  // Inline styles rather than Tailwind classes because v4 generates classes by
  // static scan: a value coming from data produces no CSS at all. The same
  // reason `SideStory.focal` is an inline style — see data/types.ts.
  //
  // Faces at 350-500 of 1400. Feasible 6-37%; the middle is comfortable.
  { src: '/portfolio/work/img-1916.jpg', alt: '', focal: 'center 21%' },
  // The only landscape of the four (1400x933). Centre crops it correctly.
  { src: '/portfolio/work/img-2883.jpg', alt: '', focal: 'center center' },
  // The slide in the report. Face at 400-650, feasible 22-42%. The original
  // centred crop cut her hair; 11% cut her chin. 32% holds both.
  { src: '/portfolio/work/dsc08570.jpg', alt: '', focal: 'center 32%' },
];

// img-1919.jpg was the fourth slide and has been removed rather than tuned.
// Its two faces stack across 200-700 of a 1400px frame — 36% of the height —
// and the solver found no feasible `object-position` at all: every value that
// held the lower face clipped the upper one at 1280x1000 and wider. A vertical
// two-person composition cannot survive a wide letterbox, and no crop setting
// changes that. Three slides that work beat four where one is always wrong.
//
// A fourth needs a photograph whose subject sits in a tighter vertical band, or
// a landscape one — and it has to stay under ~105 mean luminance for the
// headline, which rules out the only two landscape files in the portfolio.

/** Long enough to look at, short enough to notice it moves. */
const HOLD_MS = 6500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    // WCAG 2.2 AA is a stated requirement, not a preference. Somebody who has
    // asked their system for less motion gets one photograph and no cycling.
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setStill(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (still || SLIDES.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [still]);

  return (
    <>
      {SLIDES.map((slide, at) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          /* All of them mounted and decoded, one visible. A `src` swap would
             fetch on the first change and flash through the dark background
             underneath, which is the one thing a background must not do. */
          aria-hidden
          decoding="async"
          fetchPriority={at === 0 ? 'high' : 'low'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2200ms] ease-in-out"
          style={{ opacity: at === index ? 0.72 : 0, objectPosition: slide.focal }}
        />
      ))}
    </>
  );
}
