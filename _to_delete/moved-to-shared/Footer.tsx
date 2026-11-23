import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { FOOTER_COLUMNS, FOOTER_LEGAL, FOOTER_SOCIALS } from '@/features/marketing/data';

export function Footer() {
  return (
    <footer className="bg-noir-deep border-t border-canvas/4">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 pt-16 lg:pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <img src={LogoWhite} alt="Cabmora" className="h-[54px] w-auto object-contain" />
            </div>
            <p className="text-canvas/28 text-[13.5px] leading-[1.78] max-w-[260px] mb-8">
              Premium photography and videography for life's most meaningful moments — beautifully
              captured, forever preserved.
            </p>
            <div className="flex gap-6">
              {FOOTER_SOCIALS.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[10px] tracking-[0.16em] uppercase text-canvas/25 hover:text-gold transition-colors duration-300 font-medium"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[9.5px] tracking-[0.28em] uppercase text-canvas/25 mb-6 font-medium">
                {col.title}
              </div>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-canvas/42 hover:text-canvas/80 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-canvas/5 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-canvas/18">
            © {new Date().getFullYear()} Cabmora Ltd. All rights reserved.
          </span>
          <div className="flex gap-8">
            {FOOTER_LEGAL.map((l) => (
              <a
                key={l}
                href="#"
                className="text-[11px] text-canvas/18 hover:text-canvas/45 transition-colors duration-200"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
