// import { ArrowRight } from 'lucide-react';  // ← restore with the button below
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { REASONS, WHY_EXPECTATIONS, WHY_INTRO } from '@/features/marketing/data';
import { focalStyle } from '@/shared/media';

export function WhyCabmora() {
  return (
    <section id="about" className="py-28 lg:py-44 border-t border-ink/6">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20 max-w-2xl">
          <SectionHeading eyebrow="The Cabmora Way">
            Why clients
            <br />
            <em>choose us</em>
          </SectionHeading>
          {/* Set at the same size and colour as each row's body copy, so the
              introduction and the six answers below read as one voice. */}
          <div className="mt-8 space-y-5">
            {WHY_INTRO.map((paragraph) => (
              <p key={paragraph} className="text-ink/48 leading-[1.78] text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mb-4">
          <span className="text-[11.5px] lg:text-[12.5px] tracking-[0.26em] uppercase text-ink/50 font-medium">
            {WHY_EXPECTATIONS}
          </span>
        </FadeIn>

        <div>
          {REASONS.map((r, i) => (
            <FadeIn key={r.tag} delay={60}>
              <div
                /* `gap` on the row, rather than margins and padding on the
                   text column. The old version set `lg:mr-20` on even rows and
                   `lg:pl-0` on odd ones, so whenever the row reversed and the
                   photograph landed on the left there was no gap at all — the
                   image butted straight against the words. A gap on the flex
                   container cannot get this wrong, because it does not know or
                   care which way round the row is. */
                className={`flex flex-col lg:flex-row ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                } gap-10 lg:gap-20 border-t border-ink/6 py-16 lg:py-20 last:border-b last:border-ink/6`}
              >
                {/* Text */}
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[11.5px] lg:text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium block mb-5">
                    {r.tag}
                  </span>
                  <h3 className="font-serif text-[clamp(26px,3.5vw,44px)] text-ink font-normal leading-[1.12] mb-6 whitespace-pre-line">
                    {r.title}
                  </h3>
                  <p className="text-ink/48 leading-[1.78] text-[17px] max-w-[420px]">{r.body}</p>
                  {/* "Learn More" went nowhere — no handler, no destination — so
                      every row put a focusable control in the tab order that did
                      nothing. Commented out rather than deleted: it comes back as
                      soon as there is a page for it to open. Restore the
                      `ArrowRight` import at the top of this file with it.

                  <button className="mt-8 inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-ink border-b border-ink/16 pb-1 hover:border-gold hover:text-gold transition-colors duration-300 font-medium w-fit">
                    Learn More <ArrowRight size={10} />
                  </button>
                  */}
                </div>

                {/* Image */}
                <div className="flex-1 overflow-hidden bg-stone aspect-[4/3] lg:aspect-auto lg:max-h-[480px]">
                  {/* Biased up, not centred: these are portrait photographs
                      in a 4:3 frame and a centred crop takes the head off.
                      See shared/media/focal.ts. */}
                  <img
                    src={r.img}
                    alt={r.alt}
                    className="w-full h-full object-cover"
                    style={focalStyle(r.focal)}
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
