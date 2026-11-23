import { Camera } from 'lucide-react';
import { Button, FadeIn, SectionHeading } from '@cabmora/ui';
import {
  CREATOR_CLOSING_BODY,
  CREATOR_CLOSING_TITLE,
  CREATOR_FEATURES,
  CREATOR_FEATURES_HEADING,
  CREATOR_INTRO,
  CREATOR_RHYTHM,
  CREATOR_SIGNOFF,
  CREATOR_TITLE,
} from '@/features/marketing/data';

/**
 * Cabmora Flow, on the homepage.
 *
 * The band used to be one two-column row: a dashboard mockup beside a
 * headline, a paragraph and five ticks. Cabmora's own copy is nine features
 * with a description each plus a closing, which will not fit in a narrow
 * column beside a picture — so the pitch stays in the row and the nine move
 * below it as a grid, full width.
 */
export function CreatorPlatform() {
  return (
    <section id="creators" className="py-28 lg:py-44 bg-noir-deep overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-50" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Visual column */}
          <FadeIn direction="left" className="relative order-2 lg:order-1">
            <div className="bg-panel border border-canvas/10 rounded-xl p-8 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center">
                  <span className="text-[10px] font-bold tracking-widest text-ink">LOGO</span>
                </div>
              </div>
              <h3 className="font-serif text-[20px] text-canvas mb-8 font-light tracking-wide">
                Studio Dashboard
              </h3>
              <div className="space-y-6">
                <div className="bg-canvas/5 rounded-lg p-5 border border-canvas/5 flex justify-between items-center">
                  <div>
                    <div className="text-[12px] text-canvas/40 mb-1">Active Galleries</div>
                    <div className="text-[24px] text-canvas">24</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <Camera size={16} />
                  </div>
                </div>
                <div className="bg-canvas/5 rounded-lg p-5 border border-canvas/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[13px] text-canvas">Harrison Wedding</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      Approved
                    </span>
                  </div>
                  <div className="h-1 bg-canvas/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-full" />
                  </div>
                </div>
                <div className="bg-canvas/5 rounded-lg p-5 border border-canvas/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[13px] text-canvas">Miller Engagement</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      Awaiting Review
                    </span>
                  </div>
                  <div className="h-1 bg-canvas/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Text column */}
          <FadeIn direction="right" className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="For Independent Creators"
              tone="dark"
              headingClassName="font-serif text-[clamp(34px,4.4vw,58px)] leading-[1.02] mb-8 whitespace-pre-line"
            >
              {CREATOR_TITLE}
            </SectionHeading>
            <div className="space-y-5 mb-10 max-w-[460px]">
              {CREATOR_INTRO.map((paragraph) => (
                <p key={paragraph} className="text-canvas/48 text-[17px] leading-[1.75]">
                  {paragraph}
                </p>
              ))}
            </div>
            <Button to="/signup" variant="light" withArrow>
              Join as a Creator
            </Button>
          </FadeIn>
        </div>

        {/* The nine. Three columns on a desktop, two on a tablet, one on a
            phone — nine cards in a single column is a scroll, not a list. */}
        <div className="mt-28 lg:mt-36">
          <FadeIn>
            <h3 className="font-serif text-[clamp(28px,3.2vw,44px)] text-canvas font-normal leading-[1.2] max-w-[22ch] mb-14 lg:mb-16">
              {CREATOR_FEATURES_HEADING}
            </h3>
          </FadeIn>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-canvas/10 border border-canvas/10">
            {CREATOR_FEATURES.map((feature, i) => (
              <FadeIn key={feature.label} delay={(i % 3) * 70} className="bg-noir-deep h-full">
                <div className="p-8 lg:p-10 h-full">
                  <dt className="font-serif text-[21px] lg:text-[25px] text-canvas font-normal mb-3.5">
                    {feature.label}
                  </dt>
                  <dd className="text-canvas/55 text-[15px] lg:text-[16.5px] leading-[1.72]">
                    {feature.description}
                  </dd>
                </div>
              </FadeIn>
            ))}
          </dl>
        </div>

        {/* Closing */}
        <FadeIn delay={120}>
          <div className="mt-24 lg:mt-32 border-t border-canvas/10 pt-16 max-w-[760px]">
            <h3 className="font-serif text-[clamp(28px,3.4vw,46px)] text-canvas font-normal leading-[1.18] mb-6">
              {CREATOR_CLOSING_TITLE}
            </h3>
            <p className="text-canvas/48 text-[17px] leading-[1.78] mb-10">
              {CREATOR_CLOSING_BODY}
            </p>
            <p className="font-serif text-[26px] lg:text-[32px] text-gold font-normal">
              {CREATOR_RHYTHM}
            </p>
            <p className="mt-5 text-canvas/55 text-[15px] lg:text-[16px] tracking-[0.06em]">
              Cabmora Flow — {CREATOR_SIGNOFF}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
