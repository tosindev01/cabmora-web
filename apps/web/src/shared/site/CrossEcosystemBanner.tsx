import { useState, useEffect, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

interface CrossEcosystemBannerProps {
  target: 'flow' | 'media';
  className?: string;
}

export function CrossEcosystemBanner({ target, className = '' }: CrossEcosystemBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check session storage so users can dismiss if desired
    try {
      const isDismissed = sessionStorage.getItem(`cabmora_banner_dismissed_${target}`);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [target]);

  const handleDismiss = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(`cabmora_banner_dismissed_${target}`, 'true');
    } catch {
      // ignore
    }
  };

  const handleOpenModal = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-flow-modal'));
  };

  if (!isVisible) return null;

  if (target === 'flow') {
    // Banner on Cabmora (Media) pointing users to Cabmora Flow
    return (
      <aside
        aria-label="Cabmora Flow announcement"
        className={`w-full bg-flow-900 text-canvas border-b border-gold/25 relative z-[60] text-[15px] transition-all duration-300 ${className}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Main content link */}
          <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Authentic Brand Emblem Pill tag with modal trigger */}
            <button
              type="button"
              onClick={handleOpenModal}
              title="Preview Cabmora Flow Overview"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-[12.5px] font-mono tracking-[0.2em] font-bold uppercase shrink-0 hover:bg-gold/25 transition-all cursor-pointer"
            >
              <img
                src={LogoWhite}
                alt="Cabmora Emblem"
                className="h-4 w-auto object-contain brightness-0 invert opacity-95"
              />
              <span className="border-l border-gold/40 pl-1.5 text-gold">FLOW</span>
            </button>

            {/* Banner text */}
            <Link
              to="/flow"
              className="truncate text-[14.5px] sm:text-[15.5px] tracking-wide text-canvas/90 hover:text-white transition-colors flex-1"
              title="Explore Cabmora Flow Studio Platform"
            >
              <span className="hidden md:inline font-light text-canvas/70">
                Are you a creator?{' '}
              </span>
              <span className="font-semibold text-white">Cabmora Flow</span>
              <span className="hidden sm:inline text-canvas/85">
                {' '}
                : manage multiple clients, create invoices &amp; deliver 4K galleries.
              </span>
              <span className="sm:hidden text-canvas/85">
                {' '}
                : manage clients, invoice &amp; deliver 4K galleries.
              </span>
            </Link>

            {/* Quick overview button that opens modal */}
            <button
              type="button"
              onClick={handleOpenModal}
              className="hidden lg:inline-flex items-center text-[13px] uppercase tracking-[0.16em] text-gold hover:text-canvas border-b border-gold/40 hover:border-white pb-0.5 transition-colors cursor-pointer shrink-0 font-medium"
            >
              Quick Overview
            </button>

            {/* Action pill - matching Cabmora Media gold editorial button */}
            <Link
              to="/flow"
              className="shrink-0 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] font-semibold bg-gold text-ink hover:bg-canvas px-4 sm:px-5 py-2 transition-colors duration-300 shadow-sm"
            >
              <span>Visit Flow</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Dismiss announcement"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    );
  }

  // Banner on Cabmora Flow pointing users to Cabmora Media / Studio
  return (
    <aside
      aria-label="Cabmora Media announcement"
      className={`w-full bg-flow-900 text-canvas border-b border-canvas/15 relative z-[60] text-[15px] transition-all duration-300 ${className}`}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Main content link */}
        <Link
          to="/"
          className="flex-1 flex items-center gap-3 sm:gap-4 group min-w-0"
          title="Visit Cabmora Photography &amp; Cinematography Studio"
        >
          {/* Authentic Brand Emblem Pill tag */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-canvas text-[12.5px] font-mono tracking-[0.2em] font-bold uppercase shrink-0">
            <img
              src={LogoWhite}
              alt="Cabmora Logo"
              className="h-4 w-auto object-contain opacity-95"
            />
            <span className="border-l border-white/20 pl-1.5 text-canvas">STUDIO</span>
          </span>

          {/* Banner text */}
          <div className="truncate text-[14px] sm:text-[15px] tracking-wide text-canvas/90 group-hover:text-white transition-colors">
            <span className="hidden md:inline font-light text-canvas/70">
              Main Photography &amp; Film Studio{' '}
            </span>
            <span className="hidden sm:inline text-canvas/80 text-[13px]">
              : award-winning wedding &amp; private film commissions.
            </span>
          </div>

          {/* Action pill - matching Cabmora Media gold editorial button */}
          <span className="shrink-0 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] font-semibold bg-gold text-ink group-hover:bg-canvas px-4 sm:px-5 py-2 transition-colors duration-300 shadow-sm">
            <span>Visit Cabmora</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </Link>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          title="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
