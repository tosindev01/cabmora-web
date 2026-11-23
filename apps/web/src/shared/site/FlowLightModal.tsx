import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Film, HardDrive, X } from 'lucide-react';

import { Modal } from '@cabmora/ui';

import LogoWhite from '@/assets/cabmora_white_logo.svg';

interface FlowLightModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The card that introduces Flow to somebody arriving at the split entry.
 *
 * The designer's version was a hand-rolled `fixed inset-0` overlay: no
 * `role="dialog"`, no focus trap, no focus restored on close, and Escape
 * wired up by hand. `Modal` supplies all of that. `layout="fullscreen"` with
 * `chrome="none"` is the same combination the gallery lightbox uses — it
 * paints no surface of its own, so the white card below is exactly the card
 * that was designed rather than one sitting on a second panel.
 */
export function FlowLightModal({ open, onClose }: FlowLightModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      layout="fullscreen"
      chrome="none"
      title="Cabmora Flow for visual artists"
      hideTitle
    >
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-[500px] bg-white text-gray-900 rounded-3xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-200/90 p-7 sm:p-9 my-auto">
          {/* Top-Right Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Modal Body */}
          <div className="space-y-6">
            {/* Eyebrow & Brand */}
            <div className="flex items-center gap-2.5 text-[12.5px] tracking-[0.2em] uppercase font-semibold text-gold-deep">
              <img
                src={LogoWhite}
                alt="Cabmora Logo"
                className="h-4.5 w-auto object-contain invert brightness-0 opacity-90"
              />
              <span className="border-l border-gray-300 pl-2">Cabmora Flow</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 font-normal">For Visual Artists</span>
            </div>

            {/* Catchy Headline that is easy for anyone to understand */}
            <div className="space-y-2">
              <h2 className="font-serif text-[clamp(28px,3.5vw,36px)] font-normal text-gray-900 leading-[1.18] tracking-tight">
                A delivery experience made for creators.
              </h2>

              {/* Plain-English, lay-friendly introduction */}
              <p className="text-[15.5px] text-gray-600 leading-relaxed font-light">
                Cabmora Flow is our dedicated studio platform built for photographers and
                filmmakers. Deliver true 4K client galleries, safeguard master RAW footage, and
                receive milestone payments with zero commission, all under your own brand.
              </p>
            </div>

            {/* Simple, jargon-free 3-point creator highlights */}
            <div className="py-3 border-y border-gray-100 grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1.5">
                <div className="w-10 h-10 mx-auto rounded-lg bg-gray-50 border border-gray-100 text-gold-deep flex items-center justify-center">
                  <Film size={18} />
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">
                  4K Galleries
                </p>
                <p className="text-[12px] text-gray-500 font-light">Crystal-clear video</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-10 h-10 mx-auto rounded-lg bg-gray-50 border border-gray-100 text-gold-deep flex items-center justify-center">
                  <HardDrive size={18} />
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">
                  Safe Backup
                </p>
                <p className="text-[12px] text-gray-500 font-light">Secure original files</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-10 h-10 mx-auto rounded-lg bg-gray-50 border border-gray-100 text-gold-deep flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">Keep 100%</p>
                <p className="text-[12px] text-gray-500 font-light">Zero commission fees</p>
              </div>
            </div>

            {/* Single Primary Action Button with Cabmora Media editorial style */}
            <div className="pt-2">
              <Link
                to="/flow"
                onClick={onClose}
                className="w-full py-4 px-8 bg-gold text-ink hover:bg-canvas border border-transparent hover:border-gray-200 font-semibold text-[13px] tracking-[0.18em] uppercase transition-colors duration-300 flex items-center justify-center gap-3 shadow-sm group cursor-pointer"
              >
                <span>Explore Flow Platform</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Micro Reassurance */}
            <div className="text-center text-[13.5px] text-gray-500 font-light">
              Free 14-day trial · No credit card required
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
