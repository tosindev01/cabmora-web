import { Link } from 'react-router-dom';

import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { FOOTER_COLUMNS, FOOTER_LEGAL, FOOTER_SOCIALS, type FooterLink } from '@/shared/site/data';

/** External destinations leave the app; everything else is a route. */
const isExternal = (to: string) =>
  to.startsWith('mailto:') || to.startsWith('tel:') || to.startsWith('http');

/**
 * One footer destination, rendered as whatever it actually is.
 *
 * A route gets `<Link>` so it does not reload the app, an address or phone
 * number gets a plain `<a>`, and a line with nowhere to go gets no anchor at
 * all — an `<a>` with no destination is announced as a link and then does
 * nothing, which is worse than plain text.
 */
function FooterDestination({ link, className }: { link: FooterLink; className: string }) {
  if (link.to === null) {
    return <span className={className}>{link.label}</span>;
  }
  if (isExternal(link.to)) {
    return (
      <a
        href={link.to}
        className={className}
        {...(link.to.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-noir-deep border-t border-canvas/4">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 pt-16 lg:pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <img src={LogoWhite} alt="Cabmora" className="h-[68px] w-auto object-contain" />
            </div>
            <p className="text-canvas/50 text-[15.5px] leading-[1.75] max-w-[300px] mb-8">
              Premium photography and videography for life's most meaningful moments. Beautifully
              captured, forever preserved.
            </p>
            <div className="flex gap-6">
              {FOOTER_SOCIALS.map((social) => (
                <FooterDestination
                  key={social.label}
                  link={social}
                  className="text-[11.5px] tracking-[0.16em] uppercase text-canvas/25 hover:text-gold transition-colors duration-300 font-medium"
                />
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11.5px] tracking-[0.24em] uppercase text-canvas/25 mb-6 font-medium">
                {col.title}
              </div>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterDestination
                      link={link}
                      className="text-[13px] text-canvas/42 hover:text-canvas/80 transition-colors duration-200"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-canvas/5 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="text-[12.5px] text-canvas/30">
            © {new Date().getFullYear()} Cabmora Ltd. All rights reserved.
          </span>
          <div className="flex gap-8">
            {FOOTER_LEGAL.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[12.5px] text-canvas/30 hover:text-canvas/45 transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
