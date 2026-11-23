import { useEffect, useMemo, useRef, useState } from 'react';

import { WORK, type WorkCategory, type WorkItem } from '@/features/marketing/data';

/**
 * Alt text by category, not per photograph.
 *
 * A screen reader needs to know what kind of image this is; it does not need an
 * invented description of who is in it. Saying "father and son" about a couple
 * is worse than saying nothing, and a sighted visitor has the same information
 * either way.
 */
const CATEGORY_ALT: Record<WorkCategory, string> = {
  weddings: 'Wedding photography by Cabmora',
  graduations: 'Graduation photography by Cabmora',
  portraits: 'Portrait photography by Cabmora',
  events: 'Event photography by Cabmora',
  corporate: 'Corporate event photography by Cabmora',
};

const CATEGORIES: { id: WorkCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'weddings', label: 'Weddings' },
  { id: 'graduations', label: 'Graduations' },
  { id: 'portraits', label: 'Portraits' },
  { id: 'events', label: 'Events' },
  { id: 'corporate', label: 'Corporate' },
];

/**
 * A photograph that arrives rather than appears.
 *
 * The 20px blur seed is painted immediately from a data URI, so there is never
 * a grey rectangle — the real file cross-fades over it once decoded. `width`
 * and `height` are set so the browser reserves the right space and the column
 * never reflows underneath the reader's cursor.
 *
 * Fading is driven by the image's own `load`, not a timer: a fast connection
 * gets no artificial delay and a slow one is never cut off mid-fade.
 */
function Photo({ item, onOpen }: { item: WorkItem; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // An image already in cache can finish decoding before React attaches the
  // handler, which would strand it at zero opacity forever.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${CATEGORY_ALT[item.category]}`}
      className="group relative block w-full mb-2.5 sm:mb-4 overflow-hidden bg-noir cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <img
        src={item.blur}
        alt=""
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-700 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        ref={ref}
        src={`/portfolio/work/${item.slug}.jpg`}
        alt={CATEGORY_ALT[item.category]}
        width={item.width}
        height={item.height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`relative w-full h-auto transition-[opacity,transform] duration-[900ms] ease-out motion-safe:group-hover:scale-[1.04] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Always on below `sm`, hover-only above it. A phone has no hover, so
          the caption simply never appeared there — and a photograph with no
          label is one a visitor cannot place. */}
      {/* The scrim went with the caption: with nothing written on it, a
          dark wash over every tile just dulled the photographs. */}
      <span className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/10 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />
      {/* The shoot's title on hover, and nothing else.
      
          The category used to sit here too — a column of WEDDINGS /
          PORTRAITS repeating down the page, over the work it was labelling.
          The chips above the grid are where a visitor goes looking for a
          category, and stamping it on every tile only repeats the button
          they pressed to get there. Hidden below `sm` as well, where there
          is no hover to reveal it with. */}
      <span className="hidden sm:block absolute left-0 right-0 bottom-0 p-3 sm:p-5 text-left sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-500">
        {item.title && (
          <span className="block font-serif text-[14px] sm:text-[19px] text-canvas leading-tight mt-1">
            {item.title}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * The portfolio itself.
 *
 * CSS multi-column rather than a grid: thirty-two of the thirty-three source
 * photographs are portrait, and a fixed grid would crop every one of them to a
 * square. Columns let each frame keep its own proportions, which is the whole
 * point of showing a photographer's work.
 *
 * Two columns on a phone, not one. A single column of portrait frames at full
 * width makes each photograph about 500px tall, so thirty-three of them become
 * a quarter-mile of scrolling with one picture visible at a time — a strip
 * rather than a gallery. Two columns shows six at once and reads as a body of
 * work, which is what somebody who tapped "Explore Our Work" came for.
 */
export function WorkGrid() {
  const [active, setActive] = useState<WorkCategory | 'all'>('all');
  const [lightbox, setLightbox] = useState<WorkItem | null>(null);

  const shown = useMemo(
    () => (active === 'all' ? WORK : WORK.filter((item) => item.category === active)),
    [active],
  );

  // Escape closes; the body must not scroll behind the overlay.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [lightbox]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12">
        {CATEGORIES.map((category) => {
          const on = active === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              aria-pressed={on}
              className={`px-3.5 py-2 sm:px-5 sm:py-2.5 text-[11.5px] sm:text-[12.5px] tracking-[0.14em] sm:tracking-[0.2em] uppercase font-medium transition-all duration-300 cursor-pointer border ${
                on
                  ? 'bg-gold text-ink border-gold'
                  : 'text-canvas/55 border-canvas/15 hover:text-canvas hover:border-canvas/40'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* `key` on the container remounts the columns when the filter changes, so
          the new set fades in as a set rather than shuffling in place. */}
      <div
        key={active}
        className="columns-2 lg:columns-3 gap-2.5 sm:gap-4 motion-safe:animate-[cab-fade-in_600ms_ease-out]"
      >
        {shown.map((item) => (
          <Photo key={item.slug} item={item} onOpen={() => setLightbox(item)} />
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={CATEGORY_ALT[lightbox.category]}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-noir-deep/95 backdrop-blur-sm flex items-center justify-center p-6 motion-safe:animate-[cab-fade-in_250ms_ease-out]"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-6 right-6 text-canvas/60 hover:text-canvas text-[13px] tracking-[0.2em] uppercase cursor-pointer"
          >
            Close
          </button>
          <figure className="max-h-full flex flex-col items-center gap-4">
            <img
              src={`/portfolio/work/${lightbox.slug}.jpg`}
              alt={CATEGORY_ALT[lightbox.category]}
              className="max-h-[80vh] w-auto object-contain"
            />
            {/* No category here. Opening a photograph is the point at which
                somebody wants to look at it, and WEDDINGS under a wedding
                photograph is the caption adding least — it is still on the
                `alt` and the dialog's label, where a screen reader needs it
                and the eye is not competing with it. The title stays when
                there is one, because it names this shoot rather than the
                drawer it came from. */}
            {lightbox.title && (
              <figcaption className="font-serif text-[20px] text-canvas text-center">
                {lightbox.title}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
