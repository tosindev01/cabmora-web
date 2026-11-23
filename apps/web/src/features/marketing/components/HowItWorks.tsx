import { ArrowRight } from 'lucide-react';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { PROCESS_STEPS } from '@/features/marketing/data';

export function HowItWorks() {
  return (
    <section className="py-28 lg:py-44 bg-sand">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 lg:gap-32">
          {/* Left — label + title */}
          <FadeIn direction="left" className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="The Process"
              headingClassName="font-serif text-[clamp(40px,5.5vw,72px)] leading-[0.9] mb-8"
            >
              How it
              <br />
              <em>all unfolds</em>
            </SectionHeading>
            <p className="text-ink/45 leading-[1.75] text-[17px] max-w-xs">
              Six thoughtful steps that transform an initial enquiry into a lifelong archive of
              beautiful memories.
            </p>
          </FadeIn>

          {/* Right — steps */}
          <div>
            {PROCESS_STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 60} direction="right">
                <div className="group flex items-start gap-6 lg:gap-10 py-8 lg:py-10 border-b border-ink/7 last:border-0 cursor-default">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full border border-ink/12 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/6 transition-all duration-400 mt-1">
                    <span className="text-[11.5px] tracking-[0.24em] text-ink/35 group-hover:text-gold transition-colors duration-400 font-medium">
                      {step.num}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-[24px] lg:text-[30px] text-ink font-normal mb-3">
                      {step.title}
                    </h3>
                    <p className="text-ink/45 text-[15px] lg:text-[17px] leading-[1.72]">
                      {step.desc}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="flex-shrink-0 text-gold mt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
