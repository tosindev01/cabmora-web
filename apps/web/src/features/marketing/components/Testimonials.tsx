import { Star } from 'lucide-react';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { usePublicReviews } from '@/features/marketing/hooks/usePublicReviews';

/** "September 2026" — the month, not the day. A dated testimonial reads as
 *  evidence; a precise timestamp reads as a database record. */
function when(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Initials, because a real review carries no photograph and putting a
 *  stranger's stock face next to somebody's words is the thing this section
 *  was doing wrong. */
function initials(name: string | null): string {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .join('')
    .slice(0, 2);
}

export function Testimonials() {
  const reviews = usePublicReviews(3);

  /* Nothing to show — because none have been published yet, or because the
     API could not be reached — means the section is not rendered at all. It
     previously held three invented quotes and a "4.9 across 500+ clients"
     line that was nobody's rating. An absent section is honest; a fabricated
     one is not, and it is the kind of thing a client notices. */
  if (!reviews || reviews.length === 0) return null;

  const average = reviews.reduce((total, review) => total + review.stars, 0) / reviews.length;

  return (
    <section className="py-28 lg:py-44">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20">
          <SectionHeading eyebrow="What Clients Say">
            Stories from
            <br />
            <em>those we served</em>
          </SectionHeading>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-ink/7 border-t border-ink/7 border-b">
          {reviews.map((review, i) => (
            <FadeIn
              key={`${review.name ?? 'client'}-${review.created_at}`}
              delay={i * 100}
              className="p-8 lg:p-12 flex flex-col"
            >
              {/* The stars they actually gave, not five every time. */}
              <div className="flex gap-1 mb-8" aria-label={`${review.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={11}
                    className={j < review.stars ? 'fill-gold text-gold' : 'text-ink/15'}
                  />
                ))}
              </div>

              <div
                className="font-serif text-[64px] text-gold/20 leading-none mb-2 -ml-1"
                aria-hidden
              >
                &ldquo;
              </div>

              <blockquote className="font-serif text-[20px] lg:text-[22px] text-ink font-normal leading-[1.48] flex-1 mb-10">
                {review.words}
              </blockquote>

              <div className="flex items-center gap-4 mt-auto">
                <div
                  aria-hidden
                  className="w-11 h-11 rounded-full bg-forest text-canvas flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                >
                  {initials(review.name)}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink">
                    {review.name ?? 'A Cabmora client'}
                  </div>
                  <div className="text-[13px] text-ink/50 mt-1">{when(review.created_at)}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* The real average, over the real count. Held back below three
            reviews: "5.0 from 1 client" is arithmetically true and reads as
            a boast about nothing. */}
        {reviews.length >= 3 && (
          <FadeIn delay={100} className="mt-10 flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  size={13}
                  className={j < Math.round(average) ? 'fill-gold text-gold' : 'text-ink/15'}
                />
              ))}
            </div>
            <span className="text-[13px] text-ink/45">
              <strong className="text-ink font-semibold">{average.toFixed(1)}</strong> from{' '}
              {reviews.length} client{reviews.length === 1 ? '' : 's'} who reviewed us
            </span>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
