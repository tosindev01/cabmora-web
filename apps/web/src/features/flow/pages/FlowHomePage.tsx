import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  HardDrive,
  Layers,
  Film,
  CreditCard,
  ChevronRight,
  Star,
  Shield,
  Play,
  X,
  Bell,
  Eye,
  Plus,
  Send,
  Globe,
  Lock,
  RotateCw,
  ChevronLeft,
  Share2,
  BookOpen,
} from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { CrossEcosystemBanner } from '@/shared/site';

// Refined Concentric Lens Ring Motif
function ConcentricRings({
  className = '',
  size = 260,
  stroke = 'var(--color-gold)',
  opacity = 0.25,
}: {
  className?: string;
  size?: number;
  stroke?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle
          cx="100"
          cy="100"
          r="14"
          stroke={stroke}
          strokeWidth="1.2"
          strokeOpacity={opacity * 1.5}
        />
        <circle
          cx="100"
          cy="100"
          r="30"
          stroke={stroke}
          strokeWidth="1.1"
          strokeOpacity={opacity * 1.2}
        />
        <circle
          cx="100"
          cy="100"
          r="48"
          stroke={stroke}
          strokeWidth="1.0"
          strokeOpacity={opacity}
        />
        <circle
          cx="100"
          cy="100"
          r="68"
          stroke={stroke}
          strokeWidth="0.9"
          strokeOpacity={opacity * 0.8}
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke={stroke}
          strokeWidth="0.8"
          strokeOpacity={opacity * 0.6}
        />
        <circle
          cx="100"
          cy="100"
          r="112"
          stroke={stroke}
          strokeWidth="0.7"
          strokeOpacity={opacity * 0.4}
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  );
}

// Organic Aperture Accent Shape
function OrganicApertureShape({
  className = '',
  color = 'var(--color-gold)',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M60 0C68 28 92 52 120 60C92 68 68 92 60 120C52 92 28 68 0 60C28 52 52 28 60 0Z"
        fill={color}
      />
    </svg>
  );
}

export default function FlowHomePage() {
  const [activeStoryVideo, setActiveStoryVideo] = useState<{
    title: string;
    client: string;
    quote: string;
    image: string;
  } | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [homeBillingCycle, setHomeBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const homePlans = [
    {
      id: 'starter',
      name: 'Starter Studio',
      badge: 'Solo Creators',
      monthlyPrice: 24,
      annualPrice: 19,
      storage: '500 GB Master Vault',
      description: 'Ideal for solo wedding photographers and boutique film creators.',
      features: [
        'Up to 5 active client projects',
        'Lossless 4K cinema video streaming',
        'PIN-protected client proofing galleries',
        'Lossless original RAW & master downloads',
        'Personal onboarding support',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Studio',
      badge: 'Most Beloved by Studios',
      monthlyPrice: 59,
      annualPrice: 49,
      storage: '2.5 TB Active + 10 TB Archive',
      description: 'Engineered for active destination cinematographers and editorial studios.',
      features: [
        'Unlimited active client projects',
        'White-label delivery under your custom domain',
        'Digital wedding contracts & e-signatures',
        'Scheduled milestone deposits (Stripe)',
        'Cinema-grade 4K 10-bit streaming pipeline',
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'Studio Collective',
      badge: 'Production Houses',
      monthlyPrice: 119,
      annualPrice: 99,
      storage: '10 TB Active + 50 TB Archive',
      description: 'Ample storage and collaboration for multi-camera production crews.',
      features: [
        'Everything in Pro Studio',
        'Unlimited team seats & second shooters',
        'Multi-camera original footage archiving',
        'Dedicated high-speed delivery bandwidth',
        'Direct concierge creator phone support',
      ],
      popular: false,
    },
  ];

  // Curated Creators / Featured Studios for the Grid
  const creators = [
    {
      name: 'Elena Rostova',
      role: 'Lake Como Wedding Cinema',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=700&fit=crop',
      badge: 'Cinematographer',
    },
    {
      name: 'Marcus Thorne',
      role: 'Vogue & Editorial Photography',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop',
      badge: 'Lead Director',
    },
    {
      name: 'Aria & Julien',
      role: 'Parisian Fine-Art Studio',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=700&fit=crop',
      badge: 'Film Duo',
    },
    {
      name: 'Devon Vance',
      role: 'Commercial & Auto Director',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=700&fit=crop',
      badge: 'Commercial',
    },
    {
      name: 'Kemi Adebayo',
      role: 'Luxury Destination Weddings',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=700&fit=crop',
      badge: 'Cinematographer',
    },
    {
      name: 'Soren Lindqvist',
      role: 'Nordic Cinematic Mountain',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=700&fit=crop',
      badge: 'Documentary',
    },
    {
      name: 'Maya Lin',
      role: 'Architectural & Editorial',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=700&fit=crop',
      badge: 'Fine Art',
    },
    {
      name: 'Dante Rossi',
      role: 'Amalfi Coast Wedding Cinema',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=700&fit=crop',
      badge: 'Super 8 & 4K',
    },
  ];

  // Studio Guild Avatars
  const guildMembers = [
    {
      name: 'Ifeoma',
      studio: 'Lagos & London',
      avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop',
    },
    {
      name: 'Sandro',
      studio: 'Florence',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    },
    {
      name: 'Vanessa',
      studio: 'New York',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
    },
    {
      name: 'Matteo',
      studio: 'Milan',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
    },
    {
      name: 'Chloe',
      studio: 'Paris',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    },
    {
      name: 'Lucas',
      studio: 'Zurich',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    },
    {
      name: 'Nia',
      studio: 'Cotswolds',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    },
  ];

  // Video Reveal Stories
  const videoStories = [
    {
      id: 1,
      title: 'Villa Balbiano Heirloom Reveal',
      creator: 'Elena Rostova • Lake Como',
      quote:
        '“The couple streamed the 4K film on their OLED TV. They cried happy tears through the entire ceremony edit.”',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
      duration: '14 min Feature',
    },
    {
      id: 2,
      title: 'Parisian 35mm & 4K Teaser',
      creator: 'Aria & Julien • Paris',
      quote:
        '“Delivered 900 high-res photos and the 60-second teaser. The bride shared it to Instagram within 2 minutes.”',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
      duration: 'Teaser + 940 RAWs',
    },
    {
      id: 3,
      title: 'Amalfi Sunset Coastline Film',
      creator: 'Dante Rossi • Amalfi',
      quote:
        '“Contract was e-signed, deposit paid via Stripe, and master footage safely archived before our flight home.”',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop',
      duration: 'Master Vault 4K',
    },
  ];

  return (
    <div className="min-h-screen bg-flow-navy text-canvas font-sans overflow-x-hidden selection:bg-gold selection:text-flow-navy">
      {/* ─────────────────────────────────────────────
          STREAMLINED HEADER (Features & Plans Navigation)
      ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
        {/* Banner cross-linking to Cabmora Media / Studio */}
        <CrossEcosystemBanner target="media" />

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Brand Logo with Flow Tag */}
          <Link to="/flow" className="flex items-center gap-2.5 group">
            <img
              src={LogoWhite}
              alt="Cabmora Logo"
              className="h-6 sm:h-7 w-auto object-contain invert brightness-0 opacity-95 group-hover:opacity-100 transition-opacity"
            />
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <span className="text-[12px] sm:text-[13px] tracking-[0.24em] font-semibold text-gold-deep uppercase font-mono">
                FLOW
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/flow/login"
              className="text-[12.5px] sm:text-[13.5px] tracking-[0.14em] uppercase font-semibold text-gray-800 hover:text-gold-deep transition-colors duration-300"
            >
              Sign in
            </Link>

            <Link
              to="/flow/apply"
              className="text-[12px] sm:text-[13.5px] tracking-[0.16em] uppercase font-semibold bg-gold text-ink px-4 sm:px-7 py-2 sm:py-[13px] hover:bg-canvas hover:text-ink transition-colors duration-300 inline-block shadow-sm shrink-0"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          LUMINOUS ATELIER HERO SECTION (Crisp White Background)
      ───────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-32 px-4 sm:px-6 lg:px-12 overflow-hidden bg-white text-gray-900 border-b border-gray-200/80">
        {/* Soft Ambient Champagne Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-[540px] h-[340px] bg-gold/8 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gold/6 blur-[90px] pointer-events-none" />

        {/* Concentric Lens Ring Background Motif */}
        <div className="absolute -top-10 right-1/4 opacity-20 pointer-events-none">
          <ConcentricRings size={320} stroke="var(--color-gold-deep)" opacity={0.25} />
        </div>

        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Column: Eyebrow, Stacked Headline, Subtitle, Dual Simple CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            {/* Catchy Studio Kicker Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/90 border border-gray-200 shadow-2xs text-[13px] sm:text-[14px] font-medium text-gray-800">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gold-deep" />
              <span className="tracking-wide font-semibold">The Client Atelier</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-600 font-normal">Photographers &amp; Filmmakers</span>
            </div>

            {/* Bold, Catchy Headline with Fluid Mobile Typography */}
            <h1 className="font-serif text-[clamp(32px,6.8vw,78px)] font-normal text-gray-950 leading-[1.12] tracking-tight">
              Better client delivery,
              <br />
              <span className="italic font-serif text-gold-deep">Bigger studio bookings.</span>
            </h1>

            {/* Crisp Subtitle */}
            <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-[540px] leading-relaxed font-light">
              Deliver true 4K HDR client films, protect your master RAW files in high-speed cloud
              vaults, and collect automated milestone payments with zero commission.
            </p>

            {/* Dual CTA Row - responsive stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
              <Link
                to="/flow/apply"
                className="group inline-flex items-center justify-center gap-3 bg-gold text-ink px-6 sm:px-8 py-[14px] sm:py-[15px] text-[13px] sm:text-[13.5px] tracking-[0.16em] uppercase font-semibold hover:bg-ink hover:text-canvas transition-colors duration-400 shadow-sm w-full sm:w-auto text-center"
              >
                <span>Get started</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <button
                onClick={() =>
                  setActiveStoryVideo({
                    title: 'Lake Como Heirloom 4K Feature',
                    client: 'Elena Rostova Studio • Villa Balbiano',
                    quote:
                      '“The couple streamed their full 4K film on their living room TV without a single compression artifact.”',
                    image:
                      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=700&fit=crop',
                  })
                }
                className="inline-flex items-center justify-center gap-3 border border-gray-300 text-gray-900 px-6 sm:px-8 py-[14px] sm:py-[15px] text-[13px] sm:text-[13.5px] tracking-[0.16em] uppercase font-medium hover:border-gray-900 hover:bg-gray-900/5 transition-all duration-300 cursor-pointer w-full sm:w-auto text-center"
              >
                <Play size={13} className="fill-gold-deep text-gold-deep" />
                <span>Watch demo</span>
              </button>
            </div>

            {/* Micro reassurance */}
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-[13px] sm:text-[14px] text-gray-600 font-light">
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Your custom domain</span>
            </div>
          </div>

          {/* Right Column: Photorealistic Smartphone Showcase (Web App on Mobile) */}
          <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center select-none w-full">
            {/* Mobile-only clean proof chips row (never overlapping phone) */}
            <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 mb-3.5 w-full">
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/90 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Globe size={12} className="text-gold-deep" />
                <span className="text-[11.5px] font-bold text-gray-900">Web App on Mobile</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/90 shadow-2xs flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check size={11} />
                </div>
                <span className="text-[11.5px] font-bold text-gray-900">
                  Milestone Paid · £4,500
                </span>
              </div>
            </div>

            {/* Desktop-only Floating Badges */}
            {/* Top-Left Floating Mobile Web App Indicator */}
            <div className="hidden lg:flex absolute -top-5 left-0 sm:left-2 z-30 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/90 shadow-lg items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Globe size={13} className="text-gold-deep" />
              <span className="text-[12.5px] font-bold text-gray-900">Web App on Mobile</span>
              <span className="text-gray-300">·</span>
              <span className="text-[11.5px] font-mono text-gray-600">Active Web Tab</span>
            </div>

            {/* Top-Right Floating Milestone Chip */}
            <div className="hidden lg:flex absolute -top-4 right-0 sm:right-4 z-30 bg-white/95 backdrop-blur-md p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xl items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Check size={16} />
              </div>
              <div className="text-left">
                <p className="text-[13.5px] font-bold text-gray-900 leading-tight">
                  Milestone Paid
                </p>
                <p className="text-[12px] text-gray-600">£4,500.00 via Stripe · 0% fee</p>
              </div>
            </div>

            {/* Bottom-Left Floating Quote Chip */}
            <div className="hidden lg:block absolute -bottom-6 left-0 sm:left-4 z-30 bg-white/95 backdrop-blur-md p-4 px-5 rounded-2xl border border-gray-200 shadow-xl max-w-[290px] text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-1 text-gold-deep mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-current" />
                ))}
              </div>
              <p className="text-[13px] text-gray-800 leading-snug font-light italic">
                “Streaming in 4K on our TV had us both in tears.”
              </p>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                Sophie &amp; David · Lake Como
              </p>
            </div>

            {/* Realistic Ambient Ground Shadow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/40 blur-2xl rounded-full pointer-events-none" />

            {/* Responsive Photorealistic iPhone Hardware Wrapper */}
            <div className="relative w-[285px] sm:w-[335px] md:w-[355px] h-[585px] sm:h-[640px] md:h-[680px] rounded-[48px] sm:rounded-[54px] p-[8px] sm:p-[10px] bg-gradient-to-b from-flow-400 via-flow-600 to-flow-500 shadow-[0_30px_80px_-15px_rgba(10,20,35,0.45),0_10px_25px_-5px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.15)_inset] mx-auto">
              {/* Outer Metallic Chamfer Highlight */}
              <div className="absolute inset-0 rounded-[48px] sm:rounded-[54px] border border-white/20 pointer-events-none" />

              {/* Hardware Side Buttons */}
              {/* Left Side: Action Button */}
              <div className="absolute -left-[5px] top-[95px] sm:top-[108px] w-[5px] h-[22px] sm:h-[26px] bg-flow-500 rounded-l-[2px] border-y border-l border-flow-300 shadow-sm" />
              {/* Left Side: Volume Up */}
              <div className="absolute -left-[5px] top-[130px] sm:top-[148px] w-[5px] h-[42px] sm:h-[50px] bg-flow-500 rounded-l-[2px] border-y border-l border-flow-300 shadow-sm" />
              {/* Left Side: Volume Down */}
              <div className="absolute -left-[5px] top-[182px] sm:top-[210px] w-[5px] h-[42px] sm:h-[50px] bg-flow-500 rounded-l-[2px] border-y border-l border-flow-300 shadow-sm" />
              {/* Right Side: Power / Siri Button */}
              <div className="absolute -right-[5px] top-[140px] sm:top-[160px] w-[5px] h-[58px] sm:h-[68px] bg-flow-500 rounded-r-[2px] border-y border-r border-flow-300 shadow-sm" />

              {/* Antenna Line Breaks on Metal Chassis */}
              <div className="absolute -left-[1px] top-[65px] sm:top-[75px] w-[2px] h-[5px] bg-flow-700" />
              <div className="absolute -right-[1px] top-[65px] sm:top-[75px] w-[2px] h-[5px] bg-flow-700" />
              <div className="absolute -left-[1px] bottom-[65px] sm:bottom-[75px] w-[2px] h-[5px] bg-flow-700" />
              <div className="absolute -right-[1px] bottom-[65px] sm:bottom-[75px] w-[2px] h-[5px] bg-flow-700" />

              {/* Inner OLED Glass Bezel */}
              <div className="relative w-full h-full bg-black rounded-[40px] sm:rounded-[44px] p-[2.5px] shadow-inner overflow-hidden flex flex-col">
                {/* Phone Glass Specular Reflection Highlight (Physical Depth) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] rounded-[40px] sm:rounded-[42px] z-30" />

                {/* Mobile Browser Top Address Bar (Just like opening a website on mobile) */}
                <div className="w-full bg-white border-b border-gray-200/90 px-3 py-2 flex items-center gap-2 shadow-2xs rounded-t-[38px] sm:rounded-t-[41px] z-20">
                  <span className="text-[10px] sm:text-[11px] font-serif font-bold text-gray-400 px-0.5 select-none">
                    aA
                  </span>
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-gray-100/90 border border-gray-200/80 text-gray-800">
                    <Lock size={11} className="text-emerald-600 shrink-0" />
                    <span className="text-[11px] sm:text-[12px] font-mono font-medium text-gray-900 tracking-tight">
                      www.cabmora.com/
                    </span>
                  </div>
                  <RotateCw size={11} className="text-gray-400 shrink-0 cursor-pointer" />
                </div>

                {/* Screen Display Content */}
                <div className="w-full flex-1 bg-canvas text-gray-900 rounded-b-[38px] sm:rounded-b-[41px] overflow-hidden flex flex-col justify-between p-2.5 sm:p-3.5 pt-3 sm:pt-4 font-sans relative">
                  {/* Creator Profile Header */}
                  <div className="flex items-center justify-between px-1 mb-2 z-10">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                        alt="Elena Rostova"
                        className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover border border-gray-300"
                      />
                      <div>
                        <p className="text-[11.5px] sm:text-[12.5px] font-bold text-gray-900 leading-tight">
                          Hi Elena
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                          @elenarostova
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="px-1.5 sm:px-2 py-0.5 rounded-full bg-flow-navy text-gold text-[9.5px] sm:text-[10.5px] font-semibold flex items-center gap-1 shadow-2xs">
                        <span>★ Pro Studio</span>
                      </div>
                      <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 relative">
                        <Bell size={10} />
                        <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-gold" />
                      </div>
                    </div>
                  </div>

                  {/* Studio Balance Card */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-gray-200/90 shadow-xs mb-1.5 sm:mb-2 z-10">
                    <div className="flex items-center justify-between text-gray-500 text-[10.5px] sm:text-[11.5px] mb-0.5 sm:mb-1">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <span>🇬🇧 Studio Payouts</span>
                        <span className="text-[9px]">▼</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                      >
                        <Eye size={12} />
                      </button>
                    </div>

                    <div className="font-serif text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">
                      {balanceVisible ? '£14,850.50' : '••••••••'}
                    </div>

                    {/* Dot Indicator */}
                    <div className="flex justify-center gap-1 mb-1.5 sm:mb-2">
                      <span className="w-2.5 sm:w-3 h-1 rounded-full bg-gray-800" />
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-[11px] font-semibold">
                      <div className="py-1 sm:py-1.5 px-0.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center gap-1 text-gray-800 transition-colors">
                        <Plus size={10} className="text-gold-deep" />
                        <span>Gallery</span>
                      </div>
                      <div className="py-1 sm:py-1.5 px-0.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center gap-1 text-gray-800 transition-colors">
                        <Send size={9} className="text-gold-deep" />
                        <span>Invoice</span>
                      </div>
                      <div className="py-1 sm:py-1.5 px-0.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center gap-1 text-gray-800 transition-colors">
                        <Layers size={9} className="text-gold-deep" />
                        <span>Portals</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Client Galleries */}
                  <div className="flex-1 overflow-hidden min-h-0 z-10">
                    <div className="flex items-center justify-between text-xs mb-1 sm:mb-1.5 px-1">
                      <span className="font-bold text-gray-900 text-[11px] sm:text-[12px]">
                        Your client galleries
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                        See all (14)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {/* Gallery 1 */}
                      <div className="p-1 sm:p-1.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs space-y-0.5 sm:space-y-1">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                          <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop"
                            alt="Villa Balbiano"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 right-1 text-[8.5px] sm:text-[9px] font-bold bg-black/60 text-white px-1 sm:px-1.5 py-0.5 rounded backdrop-blur-xs">
                            4K
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-900 truncate leading-tight">
                          Villa Balbiano
                        </p>
                        <p className="text-[9.5px] sm:text-[10.5px] text-gold-deep font-semibold">
                          £7,200 • Ready
                        </p>
                      </div>

                      {/* Gallery 2 */}
                      <div className="p-1 sm:p-1.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs space-y-0.5 sm:space-y-1">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                          <img
                            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop"
                            alt="Paris 2025"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 right-1 text-[8.5px] sm:text-[9px] font-bold bg-emerald-600 text-white px-1 sm:px-1.5 py-0.5 rounded">
                            Paid
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-900 truncate leading-tight">
                          Parisian 35mm
                        </p>
                        <p className="text-[9.5px] sm:text-[10.5px] text-gold-deep font-semibold">
                          £4,500 • Paid
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Safari Bottom Navigation Bar & Home Indicator */}
                  <div className="mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-gray-200/80 flex flex-col gap-0.5 sm:gap-1 z-20">
                    <div className="flex items-center justify-between px-1.5 sm:px-2 text-gray-600">
                      <button
                        type="button"
                        className="p-0.5 sm:p-1 hover:text-gray-950 transition-colors"
                        title="Back"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 sm:p-1 hover:text-gray-950 opacity-40 cursor-default"
                        title="Forward"
                      >
                        <ChevronRight size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 sm:p-1 hover:text-gray-950 transition-colors"
                        title="Share / Add to Home Screen"
                      >
                        <Share2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 sm:p-1 hover:text-gray-950 transition-colors"
                        title="Bookmarks"
                      >
                        <BookOpen size={12} />
                      </button>
                      {/* Tab Switcher Button with Active Tab Badge */}
                      <div
                        className="w-4 sm:w-4.5 h-4 sm:h-4.5 rounded-xs border-2 border-gray-800 text-[9px] sm:text-[9.5px] font-bold text-gray-900 flex items-center justify-center font-mono"
                        title="Web Tabs (2 Open)"
                      >
                        2
                      </div>
                    </div>

                    {/* Apple Home Indicator Bar */}
                    <div className="w-24 sm:w-28 h-1 bg-gray-900/80 rounded-full mx-auto mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. ORIGIN STORY ("It all started behind the lens")
      ───────────────────────────────────────────── */}
      <section
        id="about"
        className="py-24 px-6 lg:px-12 bg-flow-850 border-t border-white/8 relative overflow-hidden"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Big Headline & Atmospheric Image with Overlapping Concentric Rings */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[13px] tracking-[0.25em] uppercase text-gold font-semibold block mb-2">
                  The Genesis • Established 2024
                </span>
                <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-normal text-canvas leading-[1.1]">
                  It all started <br />
                  <span className="italic text-gold">behind the lens</span>
                </h2>
              </div>

              {/* Photo with Concentric Rings Motif Over Corner */}
              <div className="relative rounded-2xl overflow-hidden border border-white/12 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&h=750&fit=crop"
                  alt="Director reviewing camera monitor"
                  className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-flow-850/80 via-transparent to-transparent" />

                {/* Overlapping Concentric Radar Motif in Corner */}
                <div className="absolute -bottom-10 -right-10">
                  <ConcentricRings size={180} stroke="var(--color-gold)" opacity={0.45} />
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[13px] tracking-[0.2em] uppercase font-semibold text-gold">
                    Shot on Location • Lake Como, Italy
                  </p>
                  <p className="text-[15px] text-white/90 font-light">
                    Where the need for a true high-bitrate heirloom delivery pipeline became
                    undeniable.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Narrative */}
            <div className="lg:col-span-6 space-y-6 text-canvas/85 text-[16px] sm:text-[17px] leading-relaxed font-light">
              <p>
                In the early years of our own film and photography productions, we repeatedly
                watched stunning 10-bit cinema films and high-resolution medium format stills get
                reduced to compressed, artifact-riddled previews on corporate cloud folders.
              </p>

              <p>
                Generic file drives offered no client emotion. Vimeo links expired without warning.
                High-net-worth couples were forced into awkward zip extractions, while photographers
                had to send uncomfortable email follow-ups chasing milestone deposits.
              </p>

              <div className="p-5 rounded-xl bg-white/6 border border-gold/30">
                <p className="text-white font-medium text-[16px] leading-relaxed">
                  <strong className="text-gold">
                    Conceived by working artists for working artists:
                  </strong>{' '}
                  Cabmora Flow was born to transform file delivery into a gallery-worthy heirloom
                  ceremony that matches the prestige of your commissions.
                </p>
              </div>

              <p>
                Today, Cabmora Flow is trusted by luxury wedding filmmakers, commercial directors,
                and fine-art photographers across the globe. From automated milestone billing to
                white-label 4K streaming under your own studio domain, every detail is engineered to
                honor your craft.
              </p>

              <div className="pt-2">
                <Link
                  to="/flow/apply"
                  className="inline-flex items-center gap-2 text-[13.5px] tracking-[0.18em] uppercase font-bold text-gold hover:text-white transition-colors"
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. OUR MISSION & VISION (Warm Ivory Atelier Contrast Section with Organic Stamp Badges)
      ───────────────────────────────────────────── */}
      <section id="philosophy" className="py-24 px-6 lg:px-12 bg-canvas text-flow-800">
        <div className="max-w-[1240px] mx-auto space-y-20">
          {/* Block 1: Our Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[13px] tracking-[0.25em] uppercase text-gold font-bold block">
                Studio Philosophy
              </span>
              <h2 className="font-serif text-[clamp(32px,3.8vw,48px)] font-normal text-flow-800 leading-tight">
                Our Mission
              </h2>
              <p className="text-gray-600 text-[16px] sm:text-[17px] leading-relaxed font-light">
                To empower visual storytellers with heirloom client portals that elevate perceived
                value, eliminate compression artifacts, and cultivate effortless, repeat
                high-net-worth referrals for life.
              </p>
            </div>

            <div className="lg:col-span-7 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&h=600&fit=crop"
                  alt="Wedding couple emotional heirloom moment"
                  className="w-full h-[320px] sm:h-[380px] object-cover"
                />

                {/* Circular Stamp Badge "DELIVER." */}
                <div className="absolute bottom-6 left-6 w-24 h-24 rounded-full bg-flow-900 text-gold border-2 border-gold flex items-center justify-center font-bold tracking-widest text-[13px] shadow-2xl">
                  <span>DELIVER.</span>
                </div>

                {/* Decorative Aperture Shape in Corner */}
                <div className="absolute top-4 right-4 w-16 h-16 opacity-85">
                  <OrganicApertureShape color="var(--color-gold)" />
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Our Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&h=600&fit=crop"
                  alt="Bride and groom sunset portrait"
                  className="w-full h-[320px] sm:h-[380px] object-cover"
                />

                {/* Organic Aperture Shape on left corner */}
                <div className="absolute top-4 left-4 w-14 h-14 opacity-85">
                  <OrganicApertureShape color="var(--color-flow-navy-light)" />
                </div>

                {/* Concentric rings graphic overlay on bottom right */}
                <div className="absolute -bottom-8 -right-8">
                  <ConcentricRings
                    size={160}
                    stroke="var(--color-flow-navy-light)"
                    opacity={0.35}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <span className="text-[13px] tracking-[0.25em] uppercase text-gold font-bold block">
                The Long Horizon
              </span>
              <h2 className="font-serif text-[clamp(32px,3.8vw,48px)] font-normal text-flow-800 leading-tight">
                Our Vision
              </h2>
              <p className="text-gray-600 text-[16px] sm:text-[17px] leading-relaxed font-light">
                We envision an industry where independent artists retain 100% of their creative
                identity and archive security, never beholden to tech giants, never reduced to
                generic link drops, and always celebrated as true luxury ateliers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. KEY FEATURES (Cabmora Deep Slate Full-Width Feature Band)
      ───────────────────────────────────────────── */}
      <section
        id="features"
        className="py-20 px-6 lg:px-12 bg-gradient-to-r from-flow-800 via-flow-navy-deep to-flow-800 border-y border-gold/20 relative overflow-hidden"
      >
        {/* Subtle decorative wave / contour lines in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path
              d="M0,100 C150,180 350,20 500,100 C650,180 850,20 1000,100 L1000,300 L0,300 Z"
              fill="var(--color-gold)"
            />
          </svg>
        </div>

        <div className="max-w-[1240px] mx-auto relative z-10 text-center">
          <h2 className="font-serif text-[clamp(28px,3.5vw,44px)] font-normal text-white leading-tight mb-2">
            The Studio Standard
          </h2>
          <p className="text-flow-sky text-[15px] tracking-wide max-w-md mx-auto mb-12 font-light">
            At Cabmora Flow, we set the benchmark for luxury delivery excellence:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            {/* Value 1 */}
            <div className="p-6 rounded-2xl bg-white/6 border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Film size={22} />
              </div>
              <h3 className="font-serif text-lg text-white font-medium mb-1">Heirloom 4K</h3>
              <p className="text-[14px] text-canvas/80 leading-relaxed font-light">
                High-bitrate streaming with zero compression artifacts on cinema lenses.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-6 rounded-2xl bg-white/6 border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <HardDrive size={22} />
              </div>
              <h3 className="font-serif text-lg text-white font-medium mb-1">Safe Vault</h3>
              <p className="text-[14px] text-canvas/80 leading-relaxed font-light">
                Permanent dual-region master RAW cloud backup for entire wedding seasons.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-6 rounded-2xl bg-white/6 border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={22} />
              </div>
              <h3 className="font-serif text-lg text-white font-medium mb-1">Milestones</h3>
              <p className="text-[14px] text-canvas/80 leading-relaxed font-light">
                Digital contract e-signing and automated retainer deposit milestones.
              </p>
            </div>

            {/* Value 4 */}
            <div className="p-6 rounded-2xl bg-white/6 border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield size={22} />
              </div>
              <h3 className="font-serif text-lg text-white font-medium mb-1">White-Label</h3>
              <p className="text-[14px] text-canvas/80 leading-relaxed font-light">
                Custom studio domains, bespoke typography, and zero third-party software tags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. MEET THE CREATORS / FEATURED STUDIOS (2x4 Grid with Pill Name Tags)
      ───────────────────────────────────────────── */}
      <section id="creators" className="py-24 px-6 lg:px-12 bg-flow-900 text-canvas">
        <div className="max-w-[1300px] mx-auto">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-[13px] tracking-[0.25em] uppercase text-gold font-bold block mb-2">
                The Creative Collective
              </span>
              <h2 className="font-serif text-[clamp(34px,4.5vw,56px)] font-normal text-white leading-tight">
                Meet <span className="text-gold italic">the Creators</span>
              </h2>
            </div>
            <p className="text-[15.5px] sm:text-[16.5px] text-canvas/75 max-w-md font-light leading-relaxed">
              Meet our distinguished international network of cinematographers, directors of
              photography, and fine-art photographers delivering on Flow.
            </p>
          </div>

          {/* 8 Creator Cards (2 Rows of 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <div
                key={creator.name}
                className="group relative rounded-2xl overflow-hidden bg-flow-800 border border-white/10 hover:border-gold/50 transition-all duration-400 shadow-xl"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-flow-900 via-transparent to-transparent opacity-85" />
                </div>

                {/* Bottom Pill Tag */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="px-3.5 py-2.5 rounded-xl bg-flow-navy-light/95 backdrop-blur-md border border-flow-sky/25 text-center shadow-lg group-hover:bg-gold group-hover:border-gold transition-colors duration-300">
                    <p className="text-[14.5px] font-semibold text-white group-hover:text-flow-900 transition-colors">
                      {creator.name}
                    </p>
                    <p className="text-[12px] uppercase tracking-wider text-flow-sky group-hover:text-flow-900/80 transition-colors">
                      {creator.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          6. OUR STUDIO GUILD (Circular Avatar Strip)
      ───────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-canvas text-flow-800 border-y border-gray-200">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[13px] tracking-[0.25em] uppercase text-gold font-bold block mb-1">
                Advisory Circle
              </span>
              <h2 className="font-serif text-[clamp(28px,3.5vw,44px)] font-normal text-gray-900">
                Our Studio <span className="text-gold">Guild</span>
              </h2>
            </div>
            <p className="text-[15px] text-gray-600 max-w-sm font-light leading-relaxed">
              Renowned directors, colorists, and fine-art photographers who actively support and
              guide our development roadmap.
            </p>
          </div>

          {/* Row of Circular Avatars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 justify-center">
            {guildMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-gold via-gray-300 to-flow-navy-light mb-3 group-hover:scale-108 transition-transform duration-300 shadow-md">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-gray-200 text-[13px] font-semibold text-gray-800 shadow-2xs group-hover:bg-gold group-hover:text-black transition-colors">
                  {member.name}
                </div>
                <span className="text-[12px] text-gray-500 mt-1 uppercase tracking-wider font-light">
                  {member.studio}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          7. CLIENT REVEAL STORIES (3 Video Cards with Play Buttons)
      ───────────────────────────────────────────── */}
      <section id="stories" className="py-24 px-6 lg:px-12 bg-flow-800 text-white">
        <div className="max-w-[1280px] mx-auto text-center mb-16">
          <span className="text-[13px] tracking-[0.3em] uppercase text-gold font-semibold block mb-2">
            Heirloom Experiences
          </span>
          <h2 className="font-serif text-[clamp(30px,4vw,50px)] font-normal text-white max-w-2xl mx-auto leading-tight">
            Empowered by Cabmora Flow: <br />
            <span className="italic text-gold">Hear their gallery stories</span>
          </h2>
        </div>

        {/* 3 Widescreen Video Cards */}
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoStories.map((story) => (
            <div
              key={story.id}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-flow-900 border border-white/10 hover:border-gold/50 transition-all duration-300 shadow-2xl flex flex-col"
              onClick={() =>
                setActiveStoryVideo({
                  title: story.title,
                  client: story.creator,
                  quote: story.quote,
                  image: story.image,
                })
              }
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-flow-900/40 group-hover:bg-flow-900/20 transition-colors" />

                {/* Big Circular Play Button in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-300">
                    <Play size={20} className="ml-1 fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[12px] font-mono text-white/90">
                  {story.duration}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg text-white font-medium group-hover:text-gold transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-[13px] uppercase tracking-wider text-gold/80 font-medium">
                    {story.creator}
                  </p>
                </div>
                <p className="text-[14px] text-white/80 italic font-light leading-relaxed">
                  {story.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          STUDIO PLANS (Toned-Down Luminous Atelier Grid)
      ───────────────────────────────────────────── */}
      <section
        id="plans"
        className="py-24 px-6 lg:px-12 bg-white text-gray-900 border-t border-gray-200/80"
      >
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span className="text-[13px] tracking-[0.28em] uppercase text-gold-deep font-bold block mb-2">
              Studio Membership
            </span>
            <h2 className="font-serif text-[clamp(32px,4.5vw,52px)] font-normal text-gray-950 leading-tight mb-4">
              Honest studio plans built to support your craft.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
              Every plan includes a 14-day fully-featured trial. No storage lock-ins, zero hidden
              fees, and no credit card required to begin.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full border border-gray-200 bg-gray-50 mt-8 shadow-2xs">
              <button
                onClick={() => setHomeBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-[13.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  homeBillingCycle === 'monthly'
                    ? 'bg-flow-navy text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setHomeBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-full text-[13.5px] uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  homeBillingCycle === 'annual'
                    ? 'bg-flow-navy text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[12.5px] px-2.5 py-0.5 rounded-full bg-gold-deep text-white font-mono font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Tier Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {homePlans.map((plan) => {
              const price = homeBillingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white border-2 border-gold-deep shadow-[0_16px_50px_rgba(201,168,106,0.22)] lg:-translate-y-2 z-10'
                      : 'bg-white border border-gray-200 shadow-xs hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[13px] font-bold tracking-[0.18em] uppercase bg-gold-deep text-white shadow-xs">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-2xl text-gray-950">{plan.name}</h3>
                      {!plan.popular && (
                        <span className="text-[13px] font-mono tracking-wider uppercase text-gray-500 font-semibold">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[15.5px] text-gray-600 min-h-[38px] mb-6 font-light leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6 text-[14px] font-mono font-medium bg-sand text-gold-deep border border-gold-tint">
                      <HardDrive size={15} />
                      <span>{plan.storage}</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-gray-200">
                      <span className="font-serif text-[42px] leading-none text-gray-950 font-normal">
                        £{price}
                      </span>
                      <span className="text-[14.5px] text-gray-500 uppercase tracking-wider">
                        / month {homeBillingCycle === 'annual' && '(billed annually)'}
                      </span>
                    </div>

                    <div className="space-y-3.5 mb-8">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-[15px] font-light">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              plan.popular
                                ? 'bg-gold-deep/15 text-gold-deep'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <Check size={12} strokeWidth={2.5} />
                          </div>
                          <span className="text-gray-700">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/flow/apply?plan=${plan.id}`}
                      className={`w-full py-4 text-center text-[13.5px] tracking-[0.16em] uppercase font-semibold transition-all duration-300 block shadow-sm ${
                        plan.popular
                          ? 'bg-gold text-ink hover:bg-flow-navy hover:text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gold hover:text-ink border border-gray-300/80'
                      }`}
                    >
                      Get started
                    </Link>
                    <p className="text-center text-[13.5px] text-gray-500 mt-2.5 font-light">
                      14-day free trial • Cancel anytime
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep link to full plans breakdown & vault capacity */}
          <div className="text-center">
            <Link
              to="/flow/pricing"
              className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wider text-gold-deep hover:text-gray-950 transition-colors"
            >
              <span>Explore full plan matrix, safe storage archives &amp; FAQ</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          8. FOUNDER SPOTLIGHT ("Meet Marcus: The Founder")
      ───────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas text-flow-800">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[11px] tracking-[0.25em] uppercase text-gold font-bold block mb-2">
                  Behind The Vision
                </span>
                <h2 className="font-serif text-[clamp(32px,4vw,50px)] font-normal text-gray-900 leading-tight">
                  Meet Marcus: <br />
                  <span className="text-gold italic">The Founder</span>
                </h2>
              </div>

              <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed font-light">
                Marcus Thorne is a Senior Director of Photography with over a decade behind cinema
                rigs on destination wedding assignments across Europe and North America. Having
                worked with discerning high-net-worth clients, he saw firsthand how standard cloud
                software ruined the emotional climax of a film delivery.
              </p>

              <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed font-light">
                Committed to restoring pride and financial clarity to independent visual artists,
                Marcus led the creation of Cabmora Flow: combining lossless video streaming
                pipelines with white-label client portals and automated milestone contracts.
              </p>

              <div className="p-4 rounded-xl bg-white border border-gray-200 text-[14.5px] text-gray-700 italic">
                “Our work is art. The moment our couples open their final gallery should make their
                hearts stop—not make them deal with broken zip files.”
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=900&fit=crop"
                  alt="Marcus Thorne - Founder"
                  className="w-full h-[440px] sm:h-[500px] object-cover"
                />

                {/* Circular Stamp Badge: "ATELIER." */}
                <div className="absolute bottom-6 right-6 w-24 h-24 rounded-full bg-flow-900 text-gold border-2 border-gold flex items-center justify-center font-bold tracking-widest text-[13px] shadow-2xl">
                  <span>ATELIER.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          9. CONCENTRIC RING DARK CTA BANNER ("Don't run your creative studio alone")
      ───────────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-12 bg-flow-900 text-white text-center relative overflow-hidden">
        {/* Radiating Concentric Ripple Rings behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
          <ConcentricRings size={650} stroke="var(--color-gold)" opacity={0.35} />
        </div>

        <div className="max-w-[850px] mx-auto relative z-10 space-y-6">
          <h2 className="font-serif text-[clamp(34px,5vw,64px)] font-normal text-white leading-tight">
            Don't deliver your masterpiece <br />
            <span className="italic text-gold">on a generic cloud drive</span>
          </h2>

          <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed font-light">
            We are empowering independent cinematographers and photographers to elevate their client
            experience, command higher rates, and protect their masters forever.
          </p>

          <div className="pt-4">
            <Link
              to="/flow/apply"
              className="group inline-flex items-center gap-3 bg-gold text-ink px-10 py-[17px] text-[13.5px] tracking-[0.16em] uppercase font-semibold hover:bg-canvas transition-colors duration-400 shadow-xl"
            >
              <span>Apply for Flow Studio</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          10. SECONDARY SUPPORT / COMMISSION BAR (Dual CTA)
      ───────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-12 bg-flow-850 border-t border-white/8 text-center">
        <div className="max-w-[800px] mx-auto space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Looking to commission Cabmora for your celebration?
          </h3>
          <p className="text-[16px] text-white/80 font-light max-w-md mx-auto leading-relaxed">
            Our luxury production team captures exclusive destination weddings and editorial
            commercial campaigns worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/flow/pricing"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/20 text-[13.5px] tracking-[0.16em] uppercase font-semibold text-white hover:bg-white/10 transition-colors shadow-sm"
            >
              Plans
            </Link>
            <Link
              to="/media"
              className="w-full sm:w-auto px-8 py-3.5 bg-gold text-flow-900 text-[13.5px] tracking-[0.16em] uppercase font-bold hover:bg-canvas transition-colors shadow-sm"
            >
              Cabmora Media
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          11. ATMOSPHERIC LOCATION FOOTER HERO WITH FLOATING REACTION BUBBLES
      ───────────────────────────────────────────── */}
      <section className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&h=700&fit=crop"
          alt="Creators and wedding guests on location"
          className="w-full h-full object-cover filter grayscale contrast-125 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-flow-900 via-black/40 to-transparent" />

        {/* Floating Bubble: Left */}
        <div className="absolute bottom-16 left-8 sm:left-16 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-flow-navy-light border border-flow-sky/40 text-white text-[13px] sm:text-[14.5px] font-semibold shadow-2xl">
          <span>“Delivered 800 RAW selects in 4 minutes flat!”</span>
          <div className="absolute -top-1.5 left-8 w-3 h-3 bg-flow-navy-light border-t border-l border-flow-sky/40 rotate-45" />
        </div>

        {/* Floating Bubble: Right */}
        <div className="absolute bottom-24 right-8 sm:right-16 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold text-flow-900 text-[13px] sm:text-[14.5px] font-bold shadow-2xl">
          <span>“Our studio booking rate doubled on Flow!”</span>
          <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-gold rotate-45" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          12. ATELIER FOOTER
      ───────────────────────────────────────────── */}
      <footer className="bg-flow-900 border-t border-white/8 py-16 px-6 lg:px-12 text-canvas">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <img src={LogoWhite} alt="Cabmora Logo" className="h-6 w-auto" />
                <span className="text-[13px] font-mono tracking-widest text-gold font-semibold">
                  FLOW
                </span>
              </div>
              <p className="text-[14.5px] text-white/70 max-w-sm font-light leading-relaxed">
                The premier client delivery and master archiving suite for luxury wedding filmmakers
                and fine-art photographers.
              </p>
              <div className="text-[13.5px] text-white/50">London • Milan • New York • Global</div>
            </div>

            {/* Col 2 */}
            <div>
              <p className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold mb-4">
                Platform
              </p>
              <ul className="space-y-2.5 text-[14.5px] text-white/75 font-light">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    The Genesis
                  </a>
                </li>
                <li>
                  <a href="#standard" className="hover:text-white transition-colors">
                    Studio Standard
                  </a>
                </li>
                <li>
                  <Link to="/flow/pricing" className="hover:text-white transition-colors">
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Creator Workspace
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <p className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold mb-4">
                The Collective
              </p>
              <ul className="space-y-2.5 text-[14.5px] text-white/75 font-light">
                <li>
                  <a href="#creators" className="hover:text-white transition-colors">
                    Featured Studios
                  </a>
                </li>
                <li>
                  <a href="#stories" className="hover:text-white transition-colors">
                    Reveal Stories
                  </a>
                </li>
                <li>
                  <Link to="/flow/apply" className="hover:text-white transition-colors">
                    Apply for Guild
                  </Link>
                </li>
                <li>
                  <Link to="/flow/login" className="hover:text-white transition-colors">
                    Creator Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <p className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold mb-4">
                Atelier Agency
              </p>
              <ul className="space-y-2.5 text-[14.5px] text-white/75 font-light">
                <li>
                  <Link to="/media" className="hover:text-white transition-colors">
                    Cabmora Media
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Commission Us
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white transition-colors">
                    Journal &amp; Stories
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Support Concierge
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between text-[14px] text-white/50 gap-4">
            <p>© {new Date().getFullYear()} Cabmora Flow Atelier. All rights reserved.</p>
            {/* These were all `href="#"` — three links that read as links to a
                screen reader and went nowhere. "Security Vault" is dropped
                rather than pointed somewhere arbitrary: there is no such page,
                and what it would have said lives in the privacy policy. */}
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Atelier
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Story Modal */}
      {activeStoryVideo && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveStoryVideo(null)}
        >
          <div
            className="relative w-full max-w-[800px] bg-flow-850 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-flow-900 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-white font-medium">
                  {activeStoryVideo.title}
                </h3>
                <p className="text-[13px] text-gold">{activeStoryVideo.client}</p>
              </div>
              <button
                onClick={() => setActiveStoryVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              <img
                src={activeStoryVideo.image}
                alt={activeStoryVideo.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gold text-black flex items-center justify-center mb-4 shadow-xl">
                  <Play size={24} className="ml-1 fill-current" />
                </div>
                <p className="text-white text-base max-w-md italic mb-2">
                  {activeStoryVideo.quote}
                </p>
                <span className="text-[12.5px] uppercase tracking-widest text-gold">
                  4K Cinema Playback Emulated
                </span>
              </div>
            </div>

            <div className="p-4 bg-flow-900 text-center border-t border-white/10 flex items-center justify-between text-[13.5px]">
              <span className="text-white/70">Lossless 10-bit color grade preserved</span>
              <Link
                to="/flow/apply"
                onClick={() => setActiveStoryVideo(null)}
                className="text-gold font-bold hover:underline"
              >
                Get started →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
