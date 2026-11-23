import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import LogoDark from '@/assets/cabmora_logo_dark.svg';
import { homePathForRole, useAuth } from '@/shared/auth';
import { CrossEcosystemBanner } from '@/shared/site/CrossEcosystemBanner';
import { NAV_LINKS } from '@/shared/site/data';

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
  // Only the server can clear an HttpOnly cookie, so signing out is a request
  // rather than a local delete — see `useAuth`.
  const { user, logout } = useAuth();

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
      {/* The way across to Flow. Inside the header rather than floating above
          it so the two move together on scroll, and dismissible — somebody
          booking a wedding photographer does not need to be asked twice
          whether they are a creator. */}
      <CrossEcosystemBanner target="flow" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 flex items-center justify-between h-[100px]">
        <Link to="/" className="flex items-center flex-shrink-0 group">
          {/* One lockup, two colourways — not one file inverted, and no
              longer two different lockups either.
          
              Inverting flips every channel: the gold mark came out blue and
              the off-white wordmark near-black. Approximately right, and
              wrong in the brand's own colours.
          
              What replaced it was worse in a quieter way: a stacked SVG at
              70x82 for the dark hero and a landscape PNG at 455x280 for the
              light bar. At one height the landscape file rendered 117px wide
              against the stacked file's 61px, so the mark almost doubled and
              the whole row shifted the moment the bar turned white.
          
              `cabmora_logo_dark.svg` is the white file with its eight
              wordmark fills recoloured, leaving the gold alone. The blue is
              #4E6A80, sampled from the supplied dark artwork rather than
              guessed — the brand's wordmark is a slate blue, not the near
              black of our `ink` token. Same geometry both ways, so one height
              serves both and nothing moves on scroll. */}
          <img
            src={isLightText ? LogoWhite : LogoDark}
            alt="Cabmora"
            className="h-[60px] w-auto transition-opacity duration-300"
          />
        </Link>

        {/* Stepped, not a single value. 36px is snug for a brand that reads
            as premium, but widening it unconditionally pushes the right-hand
            cluster off at tablet width — where the row already has to hold
            Portal, Log out and Book Consultation. It opens up only when there
            is room for it. */}
        <nav className="hidden md:flex items-center gap-9 lg:gap-11 xl:gap-14">
          {NAV_LINKS.map(({ label, href }) => {
            const className = `text-[11.5px] tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:text-gold ${
              isLightText ? 'text-canvas/60' : 'text-ink/50'
            }`;
            // Routes, including the section links. They used to be plain
            // anchors so the browser would do the scrolling, but reaching a
            // section from another page then meant a full reload, and the
            // browser looks for the fragment while the app is still an empty
            // root — so it found nothing and left the reader at the top.
            // `ScrollToHash` scrolls once the section exists.
            return (
              <Link key={label} to={href} className={className}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                to={homePathForRole(user.role)}
                className={`text-[11.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 hover:text-gold ${
                  isLightText ? 'text-canvas' : 'text-ink'
                }`}
              >
                Portal
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                /* `whitespace-nowrap`: the wide letter-spacing makes "Log
                   out" wider than it looks, and at tablet width it broke onto
                   two lines beside single-line neighbours — measured 55x35
                   against a 17px line-height at 768px. */
                className={`whitespace-nowrap text-[11.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 hover:text-gold cursor-pointer ${
                  isLightText ? 'text-canvas/60' : 'text-ink/50'
                }`}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`text-[11.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 hover:text-gold ${
                isLightText ? 'text-canvas' : 'text-ink'
              }`}
            >
              Log in
            </Link>
          )}
          <Link
            to="/contact"
            className="text-[12.5px] tracking-[0.16em] uppercase font-semibold bg-gold text-ink px-7 py-[13px] hover:bg-gold-dark transition-colors duration-300"
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
          open ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
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
          {/* The same signed-in / signed-out cluster the desktop bar has.
              It was desktop-only, so on a phone there was no way into the
              portal at all — the one thing a returning client opens the site
              to do. */}
          {user ? (
            <>
              <Link
                to={homePathForRole(user.role)}
                onClick={() => setOpen(false)}
                className="text-[12px] tracking-[0.18em] uppercase text-ink hover:text-gold"
              >
                Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                className="text-[12px] tracking-[0.18em] uppercase text-ink/50 hover:text-gold text-left cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-[12px] tracking-[0.18em] uppercase text-ink hover:text-gold"
            >
              Log in
            </Link>
          )}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 text-[12.5px] tracking-[0.16em] uppercase font-semibold bg-gold text-ink px-6 py-4 text-left"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </header>
  );
}
