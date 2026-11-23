import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { NAV_LINKS } from '@/features/marketing/data';

interface NavigationProps {
  /**
   * Which surface sits behind the nav at scroll position 0.
   *
   * `dark` (default) is the landing page: a dark hero, so the nav starts with
   * light text on a transparent background and flips to dark text once
   * scrolled past it.
   *
   * `light` is for content pages (blog, contact, help) that start on the warm
   * canvas background — light text would be invisible there, so the nav renders
   * in its dark-text state from the outset.
   */
  theme?: 'light' | 'dark';
}

export function Navigation({ theme = 'dark' }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Light text is only correct over an unscrolled dark hero.
  const isLightText = theme === 'dark' && !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${
        scrolled || theme === 'light'
          ? 'bg-canvas/96 backdrop-blur-md shadow-[0_1px_0_rgba(17,17,17,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 flex items-center justify-between h-[100px]">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src={LogoWhite}
            alt="Cabmora"
            className={`h-[60px] w-auto object-contain transition-all duration-300 ${isLightText ? '' : 'invert'}`}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-[11.5px] tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:text-gold ${
                isLightText ? 'text-canvas/60' : 'text-ink/50'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/login"
            className={`text-[11.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 hover:text-gold ${
              isLightText ? 'text-canvas' : 'text-ink'
            }`}
          >
            Log in
          </Link>
          <Link
            to="/contact"
            className="text-[11px] tracking-[0.18em] uppercase font-semibold bg-gold text-ink px-7 py-[13px] hover:bg-gold-dark transition-colors duration-300"
          >
            Book Consultation
          </Link>
        </div>

        <button
          className={`md:hidden transition-colors duration-300 ${isLightText ? 'text-canvas' : 'text-ink'}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          open ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0'
        } bg-canvas border-t border-ink/5`}
      >
        <div className="px-6 py-8 flex flex-col gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[12px] tracking-[0.18em] uppercase text-ink/50 hover:text-ink"
            >
              {label}
            </a>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 text-[11px] tracking-[0.18em] uppercase font-semibold bg-gold text-ink px-6 py-4 text-left"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </header>
  );
}
