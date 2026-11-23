import { useEffect, useState } from 'react';
import { FadeIn } from '@cabmora/ui';

import { listPublicReviews } from '@/features/marketing/api';
import { HOMEPAGE_FIGURES } from '@/features/marketing/data/figures';

/**
 * The figures band: the studio's own numbers, plus the one that is measured.
 *
 * This counted the platform for a while. It was honest and unusable — a new
 * database answered "1 Client Served" under a headline about years of work,
 * because everything shot before this platform existed is not in it. The
 * count was true and the impression it gave was false.
 *
 * So the first three come from `HOMEPAGE_FIGURES`, which are claims Clement
 * stands behind rather than measurements, and the rating stays counted: it is
 * averaged from published client ratings and withheld below three of them,
 * the same threshold the testimonials use. An average of one is not an
 * average.
 */

interface Tile {
  figure: string;
  label: string;
}

export function Stats() {
  const [tiles, setTiles] = useState<Tile[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    listPublicReviews(50)
      .then((reviews) => {
        if (cancelled) return;
        const next: Tile[] = [...HOMEPAGE_FIGURES];

        /* Held back below three reviews, the same threshold the testimonials
           use. An average of one is not an average, and "5.0 ★" off a single
           rating is the kind of claim that invites a closer look. */
        if (reviews.length >= 3) {
          const average = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
          next.push({ figure: `${average.toFixed(1)} ★`, label: 'Client Rating' });
        }

        setTiles(next);
      })
      // The written figures still stand if the ratings call fails — they do
      // not depend on it, and a band of numbers is not worth an error message
      // on a marketing homepage.
      .catch(() => !cancelled && setTiles([...HOMEPAGE_FIGURES]));

    return () => {
      cancelled = true;
    };
  }, []);

  // Null while loading, empty when there is nothing worth showing. Either way
  // the section does not reserve space it may never fill.
  if (!tiles || tiles.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 border-b border-ink/6">
      <FadeIn className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div
          /* Columns follow the count, so two real figures do not sit in a
             four-column grid with two empty cells. */
          className={`grid grid-cols-2 gap-10 lg:gap-0 lg:divide-x lg:divide-ink/8 ${
            tiles.length >= 4
              ? 'lg:grid-cols-4'
              : tiles.length === 3
                ? 'lg:grid-cols-3'
                : 'lg:grid-cols-2'
          }`}
        >
          {tiles.map((item) => (
            <div key={item.label} className="lg:px-14 first:pl-0 last:pr-0 flex flex-col">
              <span className="font-serif text-[52px] lg:text-[68px] text-ink font-normal leading-none mb-3 tracking-tight">
                {item.figure}
              </span>
              <span className="text-[11.5px] tracking-[0.2em] uppercase text-ink/38 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
