import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Navigation, Footer } from '@/shared/site';
import { HowItWorks, WorkGrid } from '@/features/marketing/components';

/**
 * The full portfolio, reached from "View All Stories" on the landing page.
 *
 * Dark through the portfolio itself, unlike the rest of the public site:
 * photographs read better against `noir` than against the warm canvas, and
 * this is the one page where the pictures are the content rather than the
 * decoration. The process section below them is light, which is where the
 * page hands back to the rest of the site.
 */
export default function WorkPage() {
  return (
    <div className="bg-noir min-h-screen">
      <Navigation />

      <header className="pt-36 pb-16 px-6 lg:px-14 max-w-[1400px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.18em] uppercase text-canvas/45 hover:text-gold transition-colors mb-10"
        >
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-px bg-gold" />
          <span className="text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium">
            Selected Work
          </span>
        </div>

        <h1 className="font-serif text-[clamp(38px,6vw,72px)] leading-[1.05] text-canvas font-normal max-w-[16ch]">
          Every frame, <span className="text-gold italic">a moment kept.</span>
        </h1>

        <p className="text-canvas/50 text-[17px] font-light leading-[1.8] mt-6 max-w-[52ch]">
          Weddings, graduations, portraits and the events in between, photographed across Manchester
          and beyond.
        </p>
      </header>

      <main className="px-6 lg:px-14 pb-28 max-w-[1400px] mx-auto">
        <WorkGrid />
      </main>

      {/* Moved here from the landing page. It answers the question somebody
          has *after* looking at the work — "so how would this go for me?" —
          and it brings its own `bg-sand`, so it reads as a light band closing
          a dark page rather than needing anything restyled. */}
      <HowItWorks />

      <Footer />
    </div>
  );
}
