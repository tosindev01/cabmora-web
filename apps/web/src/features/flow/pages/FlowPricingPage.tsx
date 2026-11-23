import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  HardDrive,
  ChevronRight,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Layers,
  FileCheck,
} from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { CrossEcosystemBanner } from '@/shared/site';

export default function FlowPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [themeMode, setThemeMode] = useState<'light' | 'softDark'>('light');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Studio',
      badge: 'Independent Creatives',
      description:
        'Ideal for solo wedding photographers and boutique film creators delivering up to 5 client weddings per month.',
      monthlyPrice: 24,
      annualPrice: 19,
      storage: '500 GB Master Vault',
      features: [
        'Up to 5 active client projects',
        'Lossless 4K cinema video streaming',
        'Private PIN-protected client galleries',
        'Lossless original RAW & master downloads',
        'Standard client proofing & favorites',
        'Direct email gallery invitations',
        'Personal creator onboarding support',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Studio',
      badge: 'Most Beloved by Studios',
      description:
        'Engineered for active destination wedding cinematographers and high-volume editorial studios.',
      monthlyPrice: 59,
      annualPrice: 49,
      storage: '2.5 TB Active + 10 TB Safe Archive',
      features: [
        'Unlimited active client projects',
        'White-label delivery under your custom domain',
        'Digital wedding contracts & e-signatures',
        'Scheduled milestone deposits (Stripe)',
        'Season photo & film master backup vault',
        'Cinema-grade 4K 10-bit streaming pipeline',
        'Custom client portal with your branding',
        'Direct priority support from our atelier team',
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'Studio Collective',
      badge: 'Production Houses',
      description:
        'Ample storage, multiple seats, and multi-camera archive pipelines for production crews and studio collectives.',
      monthlyPrice: 119,
      annualPrice: 99,
      storage: '10 TB Active + 50 TB Safe Archive',
      features: [
        'Everything in Pro Studio',
        'Unlimited team seats & second shooters',
        'Multi-camera original footage archiving',
        'Dedicated high-speed delivery bandwidth',
        'Custom client contracts & questionnaires',
        'Personal white-glove archive transfer support',
        'Direct concierge creator phone support',
      ],
      popular: false,
    },
  ];

  const isLight = themeMode === 'light';

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 selection:bg-gold selection:text-ink ${
        isLight ? 'bg-canvas text-gray-900' : 'bg-flow-800 text-canvas'
      }`}
    >
      {/* ─────────────────────────────────────────────
          STREAMLINED HEADER (Matches Flow Home Atelier)
      ───────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
          isLight ? 'bg-white/95 border-gray-200/80' : 'bg-flow-800/95 border-white/10'
        }`}
      >
        {/* Banner cross-linking to Cabmora Media / Studio */}
        <CrossEcosystemBanner target="media" />

        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/flow" className="flex items-center gap-2.5 group">
            <img
              src={LogoWhite}
              alt="Cabmora Logo"
              className={`h-7 w-auto object-contain transition-opacity group-hover:opacity-100 ${
                isLight ? 'invert brightness-0 opacity-90' : 'opacity-95'
              }`}
            />
            <div
              className={`flex items-center gap-2 pl-2.5 border-l ${
                isLight ? 'border-gray-300' : 'border-white/20'
              }`}
            >
              <span
                className={`text-[13px] tracking-[0.24em] font-semibold uppercase font-mono ${
                  isLight ? 'text-gold-deep' : 'text-gold'
                }`}
              >
                FLOW
              </span>
              <span className={isLight ? 'text-gray-300 font-light' : 'text-white/20 font-light'}>
                /
              </span>
              <span
                className={`text-[12.5px] tracking-[0.2em] font-medium uppercase font-mono ${
                  isLight ? 'text-gray-500' : 'text-white/50'
                }`}
              >
                PLANS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="flex items-center gap-6 sm:gap-8">
              <Link
                to="/flow#features"
                className={`text-[14px] font-semibold tracking-wider uppercase transition-colors ${
                  isLight ? 'text-gray-600 hover:text-gray-950' : 'text-white/70 hover:text-white'
                }`}
              >
                Features
              </Link>
              <Link
                to="/flow/pricing"
                className={`text-[14px] font-semibold tracking-wider uppercase border-b-2 pb-0.5 ${
                  isLight ? 'text-gold-deep border-gold-deep' : 'text-gold border-gold'
                }`}
              >
                Plans
              </Link>
            </nav>

            <div className="flex items-center gap-6">
              <Link
                to="/flow/login"
                className={`text-[13.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 ${
                  isLight ? 'text-gray-700 hover:text-gold-deep' : 'text-white/80 hover:text-gold'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/flow/apply"
                className="text-[13.5px] tracking-[0.16em] uppercase font-semibold bg-gold text-ink px-7 py-[13px] hover:bg-canvas hover:text-ink transition-colors duration-300 inline-block shadow-sm"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT CONTAINER
      ───────────────────────────────────────────── */}
      <main className="py-16 sm:py-20 px-6 max-w-[1240px] mx-auto">
        {/* Header Hero Section */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-4 text-[13.5px] font-semibold tracking-[0.2em] uppercase transition-colors"
            style={{
              backgroundColor: isLight ? 'var(--color-white)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isLight ? 'var(--color-mist)' : 'rgba(255, 255, 255, 0.12)',
              color: isLight ? 'var(--color-gold-deep)' : 'var(--color-gold)',
            }}
          >
            <Sparkles size={14} className="text-gold" />
            <span>Honest Studio Pricing</span>
          </div>

          <h1
            className={`font-serif text-[clamp(34px,4.5vw,56px)] font-normal leading-[1.1] mb-5 tracking-tight ${
              isLight ? 'text-gray-950' : 'text-white'
            }`}
          >
            Studio plans tailored for <br />
            <span className={isLight ? 'italic text-gold-deep' : 'italic text-gold'}>
              uncompromising visual artists.
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg leading-relaxed font-light max-w-[640px] mx-auto ${
              isLight ? 'text-gray-600' : 'text-white/70'
            }`}
          >
            Every plan includes a 14-day fully-featured trial. No storage lock-ins, zero surprise
            overage fees, and no credit card required to begin.
          </p>

          {/* Controls: Billing Cycle + Tone Down / Tone Up Theme Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {/* Monthly / Annual Toggle */}
            <div
              className={`inline-flex items-center gap-1.5 p-1.5 rounded-full border shadow-2xs ${
                isLight ? 'bg-white border-gray-200' : 'bg-flow-700 border-white/10'
              }`}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-[13.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? isLight
                      ? 'bg-flow-navy text-white shadow-xs'
                      : 'bg-gold text-ink shadow-xs'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-950'
                      : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-full text-[13.5px] uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'annual'
                    ? isLight
                      ? 'bg-flow-navy text-white shadow-xs'
                      : 'bg-gold text-ink shadow-xs'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-950'
                      : 'text-white/60 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span
                  className={`text-[12.5px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    billingCycle === 'annual'
                      ? isLight
                        ? 'bg-gold-deep text-white'
                        : 'bg-black/60 text-gold'
                      : isLight
                        ? 'bg-parchment text-gold-deep'
                        : 'bg-white/10 text-gold'
                  }`}
                >
                  Save 20%
                </span>
              </button>
            </div>

            {/* Atmosphere Tone Switcher: Light Atelier / Soft Obsidian */}
            <div
              className={`inline-flex items-center gap-1 p-1 rounded-full border ${
                isLight ? 'bg-gray-100/80 border-gray-200' : 'bg-flow-700 border-white/10'
              }`}
            >
              <button
                onClick={() => setThemeMode('light')}
                title="Luminous Light Atelier view"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Sun size={13} className={isLight ? 'text-gold-deep' : ''} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setThemeMode('softDark')}
                title="Toned-Down Soft Dark view"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  !isLight
                    ? 'bg-flow-600 text-white shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Moon size={13} className={!isLight ? 'text-gold' : ''} />
                <span>Soft Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            PRICING TIERS GRID
        ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
                  plan.popular
                    ? isLight
                      ? 'bg-white border-2 border-gold-deep shadow-[0_16px_50px_rgba(201,168,106,0.22)] lg:-translate-y-2 z-10'
                      : 'bg-flow-700 border-2 border-gold shadow-[0_16px_50px_rgba(201,168,106,0.18)] lg:-translate-y-2 z-10'
                    : isLight
                      ? 'bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 hover:shadow-md'
                      : 'bg-flow-800 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Pill Badge */}
                {plan.popular && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[13px] font-bold tracking-[0.18em] uppercase shadow-xs ${
                      isLight ? 'bg-gold-deep text-white' : 'bg-gold text-flow-900'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-serif text-2xl ${isLight ? 'text-gray-950' : 'text-white'}`}
                    >
                      {plan.name}
                    </h3>
                    {!plan.popular && (
                      <span
                        className={`text-[13px] font-mono tracking-wider uppercase font-semibold ${
                          isLight ? 'text-gray-500' : 'text-white/50'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[15.5px] min-h-[38px] mb-6 font-light leading-relaxed ${
                      isLight ? 'text-gray-600' : 'text-white/65'
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Storage Highlight Pill */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6 text-[14px] font-mono font-medium ${
                      isLight
                        ? 'bg-sand text-gold-deep border border-gold-tint'
                        : 'bg-flow-edge text-gold border border-gold/20'
                    }`}
                  >
                    <HardDrive size={15} />
                    <span>{plan.storage}</span>
                  </div>

                  {/* Price */}
                  <div
                    className={`flex items-baseline gap-2 mb-8 pb-6 border-b ${
                      isLight ? 'border-gray-200' : 'border-white/10'
                    }`}
                  >
                    <span
                      className={`font-serif text-[42px] leading-none font-normal ${
                        isLight ? 'text-gray-950' : 'text-white'
                      }`}
                    >
                      £{price}
                    </span>
                    <span
                      className={`text-[14.5px] uppercase tracking-wider ${
                        isLight ? 'text-gray-500' : 'text-white/50'
                      }`}
                    >
                      / month {billingCycle === 'annual' && '(billed annually)'}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-[15px] font-light">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular
                              ? isLight
                                ? 'bg-gold-deep/15 text-gold-deep'
                                : 'bg-gold/20 text-gold'
                              : isLight
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-white/10 text-white/80'
                          }`}
                        >
                          <Check size={12} strokeWidth={2.5} />
                        </div>
                        <span className={isLight ? 'text-gray-700' : 'text-white/80'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  <Link
                    to={`/flow/apply?plan=${plan.id}`}
                    className={`w-full py-4 text-center text-[13.5px] tracking-[0.16em] uppercase font-semibold transition-all duration-300 block shadow-sm ${
                      plan.popular
                        ? isLight
                          ? 'bg-gold text-ink hover:bg-flow-navy hover:text-white'
                          : 'bg-gold text-flow-900 hover:bg-white'
                        : isLight
                          ? 'bg-gray-100 text-gray-900 hover:bg-gold hover:text-ink border border-gray-300/80'
                          : 'bg-white/10 text-white hover:bg-gold hover:text-ink border border-white/20'
                    }`}
                  >
                    Get started
                  </Link>
                  <p
                    className={`text-center text-[13.5px] mt-3 font-light ${
                      isLight ? 'text-gray-500' : 'text-white/50'
                    }`}
                  >
                    14-day free trial • Cancel anytime
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────
            STORAGE VAULT ADD-ONS (Clean Toned Design)
        ───────────────────────────────────────────── */}
        <div
          className={`rounded-3xl p-8 sm:p-10 mb-14 border transition-colors ${
            isLight ? 'bg-white border-gray-200/90 shadow-xs' : 'bg-flow-800 border-white/10'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-sand text-gold-deep' : 'bg-flow-edge text-gold'
                }`}
              >
                <HardDrive size={22} />
              </div>
              <div>
                <h2
                  className={`font-serif text-2xl font-normal ${isLight ? 'text-gray-950' : 'text-white'}`}
                >
                  Need Additional Safe Archive Capacity?
                </h2>
                <p
                  className={`text-[14.5px] mt-1 font-light ${isLight ? 'text-gray-600' : 'text-white/70'}`}
                >
                  Add master archive packs at any time from your studio workspace. No lock-ins.
                </p>
              </div>
            </div>

            <Link
              to="/flow/apply"
              className={`inline-flex items-center gap-2 px-7 py-[13px] text-[13px] font-semibold tracking-[0.18em] uppercase transition-colors self-start md:self-auto shadow-sm ${
                isLight
                  ? 'bg-gold hover:bg-flow-navy text-ink hover:text-white'
                  : 'bg-gold hover:bg-white text-ink'
              }`}
            >
              <span>Custom Enterprise Vault</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isLight ? 'bg-gray-50/80 border-gray-200' : 'bg-flow-800 border-white/5'
              }`}
            >
              <span
                className={`uppercase font-mono block text-[12.5px] tracking-wider mb-1 font-semibold ${
                  isLight ? 'text-gray-600' : 'text-white/60'
                }`}
              >
                +1 TB Master Vault
              </span>
              <span
                className={`text-xl font-serif block ${isLight ? 'text-gray-950' : 'text-white'}`}
              >
                £12 <span className="text-xs font-sans text-gray-400 font-normal">/ month</span>
              </span>
              <p
                className={`text-[13.5px] mt-1.5 font-light ${isLight ? 'text-gray-600' : 'text-white/60'}`}
              >
                Perfect for current season active edits and lossless photo reels.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isLight ? 'bg-gray-50/80 border-gray-200' : 'bg-flow-800 border-white/5'
              }`}
            >
              <span
                className={`uppercase font-mono block text-[12.5px] tracking-wider mb-1 font-semibold ${
                  isLight ? 'text-gray-600' : 'text-white/60'
                }`}
              >
                +5 TB Safe Archive
              </span>
              <span
                className={`text-xl font-serif block ${isLight ? 'text-gray-950' : 'text-white'}`}
              >
                £18 <span className="text-xs font-sans text-gray-400 font-normal">/ month</span>
              </span>
              <p
                className={`text-[13.5px] mt-1.5 font-light ${isLight ? 'text-gray-600' : 'text-white/60'}`}
              >
                Full multi-season archival vault with dual-region redundancy.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isLight ? 'bg-gray-50/80 border-gray-200' : 'bg-flow-800 border-white/5'
              }`}
            >
              <span
                className={`uppercase font-mono block text-[12.5px] tracking-wider mb-1 font-semibold ${
                  isLight ? 'text-gray-600' : 'text-white/60'
                }`}
              >
                +20 TB Studio Collective
              </span>
              <span
                className={`text-xl font-serif block ${isLight ? 'text-gray-950' : 'text-white'}`}
              >
                £55 <span className="text-xs font-sans text-gray-400 font-normal">/ month</span>
              </span>
              <p
                className={`text-[13.5px] mt-1.5 font-light ${isLight ? 'text-gray-600' : 'text-white/60'}`}
              >
                Engineered for multi-camera production teams and cinema houses.
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            STUDIO PROMISE / ASSURANCE PILLARS
        ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center pt-4 pb-8">
          <div className="flex flex-col items-center p-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                isLight ? 'bg-sand text-gold-deep' : 'bg-flow-edge text-gold'
              }`}
            >
              <Shield size={18} />
            </div>
            <h4 className={`font-serif text-base mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Lossless Master Protection
            </h4>
            <p
              className={`text-[13.5px] font-light max-w-xs ${isLight ? 'text-gray-600' : 'text-white/70'}`}
            >
              Your original 4K cinema master grades and RAW stills are stored uncompressed forever.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                isLight ? 'bg-sand text-gold-deep' : 'bg-flow-edge text-gold'
              }`}
            >
              <Layers size={18} />
            </div>
            <h4 className={`font-serif text-base mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Zero Storage Overages
            </h4>
            <p
              className={`text-[13.5px] font-light max-w-xs ${isLight ? 'text-gray-600' : 'text-white/70'}`}
            >
              No automatic surprise billing. You will always be notified before reaching capacity.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                isLight ? 'bg-sand text-gold-deep' : 'bg-flow-edge text-gold'
              }`}
            >
              <FileCheck size={18} />
            </div>
            <h4 className={`font-serif text-base mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Integrated Client Contracts
            </h4>
            <p
              className={`text-[13.5px] font-light max-w-xs ${isLight ? 'text-gray-600' : 'text-white/70'}`}
            >
              Collect milestone deposits and e-signatures directly inside your delivery gallery.
            </p>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          FOOTER (Matching Clean Theme)
      ───────────────────────────────────────────── */}
      <footer
        className={`py-8 px-6 text-center text-[13.5px] border-t transition-colors ${
          isLight
            ? 'bg-white border-gray-200 text-gray-500'
            : 'bg-flow-850 border-white/5 text-white/50'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={LogoWhite}
              alt="Cabmora Logo"
              className={`h-4 w-auto ${isLight ? 'invert brightness-0 opacity-70' : 'opacity-70'}`}
            />
            <span>
              © {new Date().getFullYear()} Cabmora Flow • Built for wedding filmmakers and
              photographers.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/flow" className="hover:underline">
              Home
            </Link>
            <Link to="/flow#features" className="hover:underline">
              Features
            </Link>
            <Link to="/flow/apply" className="hover:underline">
              Apply for Guild
            </Link>
            <Link to="/flow/login" className="hover:underline">
              Creator Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
