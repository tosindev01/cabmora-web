import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { PRICING_PLANS } from '@/features/marketing/data';

export function Pricing() {
  return (
    <section id="packages" className="py-28 lg:py-44 bg-sand">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20">
          <SectionHeading eyebrow="Investment" centered className="mb-6">
            Curated
            <br />
            <em>Collections</em>
          </SectionHeading>
          <p className="text-ink/45 text-[17px] leading-[1.75] max-w-md text-center mx-auto">
            Transparent pricing for uncompromising quality. Choose a foundation and let us tailor it
            perfectly to your event.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PRICING_PLANS.map((plan, i) => (
            <FadeIn
              key={plan.name}
              delay={i * 100}
              className="bg-canvas p-10 lg:p-14 border border-ink/5 flex flex-col hover:border-gold/40 transition-colors duration-500"
            >
              <h3 className="font-serif text-[24px] lg:text-[28px] text-ink font-normal mb-2">
                {plan.name}
              </h3>
              <p className="text-ink/45 text-[13.5px] leading-[1.6] mb-8 min-h-[44px]">
                {plan.desc}
              </p>
              <div className="text-[28px] text-ink mb-10 pb-10 border-b border-ink/10">
                {plan.price}
              </div>

              <ul className="space-y-5 flex-1 mb-12">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={14} className="text-gold mt-1 flex-shrink-0" />
                    <span className="text-ink/60 text-[15px]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* The enquiry form is the only place an enquiry can be made,
                  so every plan's button goes there. */}
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 text-[11.5px] tracking-[0.22em] uppercase text-ink border border-ink/15 py-4 hover:border-ink hover:bg-ink hover:text-canvas transition-all duration-300 font-medium"
              >
                Inquire Now
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
