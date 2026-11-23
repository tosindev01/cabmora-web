import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Navigation, Footer } from '@/shared/site';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  /** ISO date this text last changed. Shown, because a policy without a date
   *  gives a reader no way to tell whether it covers what happened to them. */
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}

/**
 * The shell both legal pages share.
 *
 * Plain and narrow on purpose. These are read by somebody checking one
 * specific thing — usually what happens to their photographs, or when they
 * have to pay — and a measured column with real headings is what makes that
 * findable. No hero, no photography: the content is the point.
 */
export function LegalPage({ eyebrow, title, updated, intro, children }: LegalPageProps) {
  return (
    <div className="bg-canvas min-h-screen">
      <Navigation />

      <article className="pt-36 pb-24 px-6 lg:px-14 max-w-[760px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.18em] uppercase text-ink/50 hover:text-gold transition-colors mb-10"
        >
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-px bg-gold" />
          <span className="text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium">
            {eyebrow}
          </span>
        </div>

        <h1 className="font-serif text-[clamp(32px,5vw,52px)] leading-[1.1] text-ink font-normal">
          {title}
        </h1>

        <p className="text-[12px] tracking-[0.1em] uppercase text-ink/35 mt-5">
          Last updated{' '}
          {new Date(updated).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="text-ink/70 text-[16px] font-light leading-[1.85] mt-8">{intro}</div>

        <div className="mt-14 space-y-12">{children}</div>
      </article>

      <Footer />
    </div>
  );
}

/** One numbered section. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-[24px] text-ink font-normal mb-4">{heading}</h2>
      <div className="text-ink/70 text-[17px] font-light leading-[1.85] space-y-4">{children}</div>
    </section>
  );
}

/** A plain list, for the several places these pages enumerate things. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5 mt-1">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="text-gold mt-[9px] w-1 h-1 rounded-full bg-gold shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
