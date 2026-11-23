import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { FadeIn, SectionHeading } from '@cabmora/ui';

import { CountUp } from '@/features/marketing/components';
import {
  ABOUT_EYEBROW,
  ABOUT_FIGURES,
  ABOUT_GALLERY,
  ABOUT_PARAGRAPHS,
  ABOUT_SERVICES,
  ABOUT_SIGNOFF,
  ABOUT_TITLE,
} from '@/features/marketing/data';
import { Footer, Navigation } from '@/shared/site';

/**
 * Who Cabmora are.
 *
 * A page rather than the `#about` band on the homepage, which is where the
 * nav used to land: the copy runs to four paragraphs, five services and four
 * figures, and a homepage section carrying all of it would push everything
 * below it out of reach.
 *
 * All the words live in `data/about.ts`. None of them are ours.
 */

/** Sets the phrases Cabmora emboldened, without splitting them by hand. */
function Emphasised({ text, emphasis = [] }: { text: string; emphasis?: string[] }) {
  if (emphasis.length === 0) return <>{text}</>;

  // One pass, longest phrase first, so a short phrase nested inside a longer
  // one cannot break the longer one apart.
  const pattern = new RegExp(
    `(${[...emphasis]
      .sort((a, b) => b.length - a.length)
      .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})`,
  );

  return (
    <>
      {text.split(pattern).map((part, i) =>
        emphasis.includes(part) ? (
          <strong key={i} className="font-medium text-ink">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-hidden">
      {/* Light: this page opens on the warm canvas, and the nav's default
          dark-hero styling would render white text and a white logo on it. */}
      <Navigation theme="light" />

      {/* Opening */}
      <section className="pt-36 pb-20 lg:pb-28 px-6 lg:px-14">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.18em] uppercase text-ink/45 hover:text-gold transition-colors mb-10"
          >
            <ArrowLeft size={13} /> Back
          </Link>

          <FadeIn direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold" />
              <span className="text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium">
                {ABOUT_EYEBROW}
              </span>
            </div>
            <h1 className="font-serif text-[clamp(30px,4.6vw,56px)] leading-[1.12] text-ink font-normal max-w-[18ch]">
              {ABOUT_TITLE}
            </h1>
          </FadeIn>

          <div className="mt-12 space-y-7 max-w-[68ch]">
            {ABOUT_PARAGRAPHS.map((paragraph, i) => (
              <FadeIn key={paragraph.text.slice(0, 40)} delay={80 + i * 60}>
                <p className="text-ink/62 text-[16.5px] font-light leading-[1.85]">
                  <Emphasised text={paragraph.text} emphasis={paragraph.emphasis} />
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Photographs. A studio's About page with no picture on it was asking
          the reader to take the whole thing on the strength of the prose. */}
      <section className="px-6 lg:px-14 pb-24 lg:pb-32">
        <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-3 lg:gap-5">
          {ABOUT_GALLERY.map((photo, i) => (
            <FadeIn key={photo.slug} delay={i * 110}>
              {/* The middle frame sits lower, so three portraits in a row read
                  as a composition rather than as a filmstrip. */}
              <div className={`overflow-hidden bg-stone ${i === 1 ? 'lg:mt-14' : ''}`}>
                <img
                  src={`/portfolio/work/${photo.slug}.jpg`}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover aspect-[3/4]"
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-24 lg:py-32 px-6 lg:px-14 border-t border-ink/6">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn direction="left">
            <SectionHeading eyebrow="Our Services">
              What we
              <br />
              <em>make</em>
            </SectionHeading>
          </FadeIn>

          <ul className="mt-16 border-t border-ink/8">
            {/* `FadeIn` renders a div, so it goes inside the `li` rather than
                replacing it — a div as a direct child of a ul is invalid, and
                it takes the list semantics away from a screen reader. */}
            {ABOUT_SERVICES.map((service, i) => (
              <li key={service.label} className="border-b border-ink/8">
                <FadeIn delay={60 + i * 60}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-2 md:gap-10 py-7">
                    <h3 className="font-serif text-[21px] lg:text-[24px] text-ink font-normal leading-tight">
                      {service.label}
                    </h3>
                    <p className="text-ink/55 text-[17px] font-light leading-[1.8]">
                      {service.description}
                    </p>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Figures */}
      <section className="py-24 lg:py-32 px-6 lg:px-14 bg-sand">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn direction="left">
            <SectionHeading eyebrow="In Numbers">
              The work
              <br />
              <em>so far</em>
            </SectionHeading>
          </FadeIn>

          <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {ABOUT_FIGURES.map((item, i) => (
              <FadeIn key={item.label} delay={60 + i * 70}>
                {/* `break-words` because one of these is a word rather than a
                    number and "International" is long enough to overflow a
                    quarter-width column on a phone. */}
                <dd className="font-serif text-[clamp(30px,4vw,52px)] text-ink font-normal leading-none break-words">
                  <CountUp figure={item.figure} />
                </dd>
                <dt className="text-[12.5px] tracking-[0.2em] uppercase text-ink/45 mt-4">
                  {item.label}
                </dt>
              </FadeIn>
            ))}
          </dl>

          <FadeIn delay={340}>
            <p className="mt-20 font-serif text-[22px] lg:text-[26px] text-ink/70 font-normal italic">
              {ABOUT_SIGNOFF}
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
