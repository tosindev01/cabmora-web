import {
  ClientPortal,
  CreatorPlatform,
  FeaturedStories,
  Hero,
  LatestStories,
  Services,
  Stats,
  Testimonials,
  WhyCabmora,
} from '@/features/marketing/components';
import { Footer, Navigation } from '@/shared/site';

/**
 * The public marketing landing page. Pure composition — every section is a
 * self-contained feature component; this file only defines their order.
 */
export default function LandingPage() {
  return (
    <div className="bg-canvas text-ink overflow-x-hidden">
      <Navigation />
      <Hero />
      <FeaturedStories />
      <Services />
      {/* Pricing is hidden at the client's request — packages are quoted
          per enquiry rather than published. `Pricing` and `PRICING_PLANS` are
          kept intact so this is one line to restore, not a rebuild. */}
      <WhyCabmora />
      <ClientPortal />
      <CreatorPlatform />
      {/* Beside the quotes rather than under the hero. The numbers and
          what clients said are the same argument, and splitting them put
          the proof before anybody had seen the work. */}
      <Stats />
      <Testimonials />
      <LatestStories />
      <Footer />
    </div>
  );
}
