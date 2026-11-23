import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import {
  FEATURED_HERO_IMAGES,
  FEATURED_MAIN_STORY,
  FEATURED_SIDE_STORIES,
  FEATURED_WIDE_STORY,
} from '@/features/marketing/data';

export function FeaturedStories() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % FEATURED_HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="work" className="py-28 lg:py-44">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 lg:mb-24">
          <FadeIn direction="left">
            <SectionHeading eyebrow="Selected Work">
              Featured
              <br />
              <em>Stories</em>
            </SectionHeading>
          </FadeIn>
          <FadeIn direction="right" delay={100} className="lg:max-w-xs lg:pb-2">
            <p className="text-ink/48 leading-[1.75] text-[17px] mb-6">
              Every frame we deliver carries the weight of a real moment, crafted with intention,
              soul and an eye for the extraordinary.
            </p>
            {/* The "see more": the full portfolio lives on its own page. Styling
                is unchanged — only the element, so it is a real link. */}
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.16em] uppercase text-ink border-b border-ink/18 pb-1 hover:border-gold hover:text-gold transition-colors duration-300 font-medium"
            >
              View All Stories <ArrowRight size={11} />
            </Link>
          </FadeIn>
        </div>

        {/* Asymmetric 3:2 split */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 mb-5">
          {/* Hero story slideshow */}
          <FadeIn
            direction="left"
            className="relative overflow-hidden group bg-stone aspect-[3/4] lg:aspect-auto lg:min-h-[680px]"
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentIdx}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                src={FEATURED_HERO_IMAGES[currentIdx]}
                alt="Featured story"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 z-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[12px] lg:text-[14px] tracking-[0.26em] uppercase text-gold font-medium">
                  {FEATURED_MAIN_STORY.kicker}
                </span>
                <span className="text-canvas/28 text-xs">·</span>
                <span className="text-[12px] lg:text-[14px] tracking-[0.14em] text-canvas/60">
                  {FEATURED_MAIN_STORY.location}
                </span>
              </div>
              <h3 className="font-serif text-[clamp(28px,4.4vw,64px)] text-canvas font-normal leading-[1.0] mb-3">
                {FEATURED_MAIN_STORY.title}
              </h3>
              {/* No "View Story" button. There is no story page behind it —
                  it was a button with no handler, so every click did nothing.
                  "View All Stories" above goes to /work, which is real. */}
              <p className="text-canvas/65 text-[16px] lg:text-[18px] font-light">
                {FEATURED_MAIN_STORY.caption}
              </p>
            </div>
          </FadeIn>

          {/* Side stack */}
          <div className="flex flex-col gap-5">
            {FEATURED_SIDE_STORIES.map((story, i) => (
              <FadeIn
                key={story.title}
                direction="right"
                delay={100 + i * 80}
                className="relative overflow-hidden group bg-stone flex-1 aspect-[4/3]"
              >
                <img
                  src={story.img}
                  alt={story.alt}
                  style={story.focal ? { objectPosition: story.focal } : undefined}
                  onError={(e) => {
                    // Client photography is dropped into `public/portfolio/` by
                    // hand; fall back rather than show a broken image if it is
                    // not there. Clearing the handler first stops a loop when
                    // the fallback itself fails.
                    const img = e.currentTarget;
                    if (!story.fallbackImg || img.src.endsWith(story.fallbackImg)) return;
                    img.onerror = null;
                    img.src = story.fallbackImg;
                  }}
                  className="w-full h-full object-cover object-center transition-transform duration-[1800ms] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <span className="text-[11.5px] lg:text-[13px] tracking-[0.24em] uppercase text-gold font-medium block mb-2.5">
                    {story.kicker}
                  </span>
                  <h3 className="font-serif text-[26px] lg:text-[40px] text-canvas font-normal leading-tight">
                    {story.title}
                  </h3>
                  <p className="text-canvas/60 text-[14px] lg:text-[16px] mt-2 font-light">
                    {story.meta}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Wide landscape strip */}
        <FadeIn
          delay={80}
          className="relative overflow-hidden group bg-stone aspect-[21/9] min-h-[220px]"
        >
          <img
            src={FEATURED_WIDE_STORY.img}
            alt={FEATURED_WIDE_STORY.alt}
            className="w-full h-full object-cover object-top transition-transform duration-[1800ms] group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/75 via-noir/20 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-10 lg:px-16">
              <span className="text-[11.5px] lg:text-[13px] tracking-[0.24em] uppercase text-gold font-medium block mb-3.5">
                {FEATURED_WIDE_STORY.kicker}
              </span>
              <h3 className="font-serif text-[32px] lg:text-[58px] text-canvas font-normal leading-tight">
                {FEATURED_WIDE_STORY.title}
              </h3>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
