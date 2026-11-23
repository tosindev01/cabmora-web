import { FadeIn, SectionHeading } from '@cabmora/ui';
import { PRIMARY_SERVICES, SECONDARY_SERVICES } from '@/features/marketing/data';

export function Services() {
  return (
    <section id="services" className="py-28 lg:py-44 bg-slate">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20">
          <SectionHeading eyebrow="What We Create" tone="dark">
            Services for
            <br />
            <em>Every Moment</em>
          </SectionHeading>
        </FadeIn>

        {/* Two hero service tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px mb-px bg-canvas/10">
          {PRIMARY_SERVICES.map((s, i) => (
            <FadeIn key={s.label} delay={i * 100}>
              <div className="group relative bg-slate-deep p-12 lg:p-16 cursor-pointer hover:bg-slate-hover transition-colors duration-500 border border-canvas/5 h-full">
                {/* No 01 / 02. Numbering two tiles implies an order that
                    does not exist — photography and videography are not steps
                    — and it was the faintest thing on the card, which is a
                    fair sign of how much it was contributing. */}
                <div className="mb-12">
                  <s.icon className="text-gold" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-[clamp(32px,4vw,52px)] text-canvas font-normal leading-tight mb-4">
                  {s.label}
                </h3>
                {/* "Explore →" used to sit here, revealed on hover and
                    linked to nothing — an invitation the card could not
                    honour, and invisible on every phone besides. */}
                <p className="text-canvas/38 leading-[1.75] text-[17px] max-w-sm">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Four compact tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-canvas/10">
          {SECONDARY_SERVICES.map((s, i) => (
            <FadeIn key={s.label} delay={i * 70}>
              <div className="group bg-slate-deep p-8 lg:p-10 cursor-pointer hover:bg-slate-hover transition-colors duration-500 border border-canvas/5 h-full">
                <s.icon className="text-gold mb-8" size={21} strokeWidth={1.5} />
                <h3 className="font-serif text-[22px] lg:text-[27px] text-canvas font-normal mb-3">
                  {s.label}
                </h3>
                <p className="text-canvas/32 text-[13px] leading-[1.72]">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
