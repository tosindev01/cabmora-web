import {
  ClientPortal,
  CreatorPlatform,
  FeaturedStories,
  FinalCTA,
  Hero,
  HowItWorks,
  LatestStories,
  Pricing,
  Services,
  Stats,
  Testimonials,
  WhyCabmora,
} from '@/features/marketing';
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
      <Stats />
      <FeaturedStories />
      <Services />
      <Pricing />
      <WhyCabmora />
      <HowItWorks />
      <ClientPortal />
      <CreatorPlatform />
      <Testimonials />
      <LatestStories />
      <FinalCTA />
      <Footer />
    </div>
  );
}
