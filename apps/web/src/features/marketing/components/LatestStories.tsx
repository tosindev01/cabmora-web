import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { JOURNAL_POSTS, formatJournalDate } from '@/shared/journal';
import { focalStyle } from '@/shared/media';

export function LatestStories() {
  return (
    <section className="py-28 lg:py-44 bg-sand">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 lg:mb-20">
          <FadeIn direction="left">
            <SectionHeading eyebrow="Journal">
              Latest
              <br />
              <em>Stories</em>
            </SectionHeading>
          </FadeIn>
          <FadeIn direction="right" delay={80} className="lg:mb-2">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.16em] uppercase text-ink border-b border-ink/18 pb-1 hover:border-gold hover:text-gold transition-colors duration-300 font-medium"
            >
              Read All Articles <ArrowRight size={11} />
            </Link>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {JOURNAL_POSTS.map((a, i) => (
            <FadeIn key={a.id} delay={i * 80} className="group cursor-pointer">
              {/* The tile was already `group cursor-pointer` but nothing opened
                  it, and "Read More" was a plain div. Same markup, wrapped once
                  so the whole card is the link it already looked like. */}
              <Link to={`/blog/${a.id}`} className="block">
                <div className="overflow-hidden aspect-[4/3] bg-stone mb-6">
                  <img
                    src={a.img}
                    alt={a.alt}
                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.05]"
                    style={focalStyle(a.focal)}
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11.5px] tracking-[0.24em] uppercase text-gold font-medium">
                    {a.tag}
                  </span>
                  <span className="text-ink/18">—</span>
                  <span className="text-[11.5px] text-ink/35">
                    {formatJournalDate(a.published)}
                  </span>
                </div>
                <h3 className="font-serif text-[20px] lg:text-[22px] text-ink font-normal leading-[1.3] group-hover:text-ink/65 transition-colors duration-300">
                  {a.title}
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 text-[11.5px] tracking-[0.2em] uppercase text-ink/35 group-hover:text-gold transition-colors duration-300 font-medium">
                  Read More <ArrowRight size={9} />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
