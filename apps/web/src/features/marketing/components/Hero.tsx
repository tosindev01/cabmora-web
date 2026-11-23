import { useEffect, useState } from 'react';
import { Button } from '@cabmora/ui';

import { HeroSlideshow } from '@/features/marketing/components/HeroSlideshow';

export function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    /* `items-center`, not `items-start`.
    
       Pinned to the top, every pixel of viewport height past the content piled
       up underneath it: on a 1900px-tall display the headline, paragraph and
       buttons finished around halfway and the bottom 60% was empty photograph.
       Centred, the spare height is shared above and below, which reads as a
       composed frame rather than a gap.
    
       The top padding stays, because the header overlays this section and the
       eyebrow would otherwise sit under the logo. Keeping it alongside
       `items-center` also lands the block a little below true centre, which is
       where it wants to be optically under a dark header. */
    <section className="relative min-h-screen flex items-center pt-[156px] overflow-hidden bg-noir">
      {/* Cinematic background */}
      <div className="absolute inset-0 z-0">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/65 via-noir/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-14 pb-20 lg:pb-32">
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'none' : 'translateY(32px)',
            transition:
              'opacity 1.4s cubic-bezier(0.16,1,0.3,1) 400ms, transform 1.4s cubic-bezier(0.16,1,0.3,1) 400ms',
          }}
        >
          <div className="flex items-center gap-4 mb-12 lg:mb-14">
            <div
              className="h-px bg-gold"
              style={{
                width: loaded ? '32px' : '0px',
                transition: 'width 1s cubic-bezier(0.16,1,0.3,1) 600ms',
              }}
            />
            <span className="text-[12.5px] tracking-[0.3em] uppercase text-gold font-medium">
              Premium Photography &amp; Videography
            </span>
          </div>

          <h1 className="font-serif text-[clamp(44px,7.5vw,110px)] text-canvas font-normal leading-[0.95] mb-10 lg:mb-12 max-w-5xl">
            Capture the Moment.
            <br />
            <em className="not-italic text-gold">Curate &amp; Share</em>
            <br />
            Forever.
          </h1>

          <p className="text-canvas/70 text-[19px] lg:text-[22px] max-w-[520px] mb-14 lg:mb-16 leading-[1.65] font-light">
            Cabmora transforms life's most meaningful moments into timeless visual stories. Our
            digital platform offers a seamless experience to review, collaborate, and deliver your
            private galleries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button to="/contact" variant="gold" withArrow>
              Book Consultation
            </Button>
            {/* The Work page, not the "Featured Stories" band lower down this
                one. Somebody clicking "Explore Our Work" wants the portfolio,
                and scrolling them to three photographs is not it. */}
            <Button to="/work" variant="outlineLight">
              Explore Our Work
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-10 right-14 hidden lg:flex flex-col items-center gap-4"
        style={{ opacity: loaded ? 0.4 : 0, transition: 'opacity 1s ease 1400ms' }}
      >
        <span className="text-[9px] tracking-[0.36em] uppercase text-canvas writing-vertical">
          Scroll
        </span>
        <div
          className="w-px bg-canvas/40"
          style={{
            height: loaded ? '60px' : '0px',
            transition: 'height 1.2s cubic-bezier(0.16,1,0.3,1) 1000ms',
          }}
        />
      </div>
    </section>
  );
}
