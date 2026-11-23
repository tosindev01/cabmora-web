import { useState, FormEvent } from 'react';
import {
  Camera,
  Film,
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
  Play,
  Check,
  CheckCircle2,
  Star,
  Calendar,
  Mail,
  Phone,
  Globe,
  Instagram,
  Youtube,
  Video,
  Share2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import {
  type CreatorStudioProfileDto,
  type CreatorPortfolioItemDto,
  type CreatorBookingSubmission,
  LANDING_THEME_PRESETS,
  LANDING_ACCENT_TOKENS,
  submitPublicCreatorBooking,
} from '@/features/account/data';
import { FormattedHeadline, RichTextDisplay } from '@/features/account/components/RichTextEditor';

interface CreatorLandingRendererProps {
  profile: CreatorStudioProfileDto;
  isPreview?: boolean;
  onClosePreview?: () => void;
}

export function CreatorLandingRenderer({
  profile,
  isPreview = false,
  onClosePreview,
}: CreatorLandingRendererProps) {
  const cfg = profile.landing_config;
  const theme = LANDING_THEME_PRESETS[cfg.theme_preset] ?? LANDING_THEME_PRESETS['noir-gold'];
  const accent = LANDING_ACCENT_TOKENS[cfg.accent_token] ?? LANDING_ACCENT_TOKENS.gold;
  const headingFontClass = cfg.heading_font === 'serif' ? 'font-serif' : 'font-sans tracking-tight';

  // Portfolio filtering state
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activePortfolioItem, setActivePortfolioItem] = useState<CreatorPortfolioItemDto | null>(
    null,
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(cfg.faqs[0]?.id ?? null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Booking form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyOrBrand, setCompanyOrBrand] = useState('');
  const [selectedService, setSelectedService] = useState(
    cfg.services.find((s) => s.featured)?.title ?? cfg.services[0]?.title ?? 'Custom Commission',
  );
  const [eventType, setEventType] = useState(profile.categories[0] ?? 'Editorial & Commercial');
  const [preferredDate, setPreferredDate] = useState('');
  const [shootLocation, setShootLocation] = useState(profile.city || '');
  const [budgetRange, setBudgetRange] = useState('$5,000 – $10,000');
  const [projectBrief, setProjectBrief] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);

  const allCategories = [
    'All',
    ...Array.from(new Set(profile.portfolio_items.map((item) => item.category).filter(Boolean))),
  ];

  const filteredPortfolio = profile.portfolio_items
    .filter((item) => {
      if (mediaFilter !== 'all' && item.media_type !== mediaFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);

  const handleSelectPackageForBooking = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    const el = document.getElementById('creator-booking-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSharePage = () => {
    const shareUrl = `${window.location.origin}/creators/${profile.slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2500);
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !projectBrief.trim()) return;
    setSubmittingBooking(true);
    try {
      const submission: CreatorBookingSubmission = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        company_or_brand: companyOrBrand.trim(),
        service_title: selectedService,
        event_type: eventType,
        preferred_date: preferredDate,
        location: shootLocation.trim(),
        budget_range: budgetRange,
        project_brief: projectBrief.trim(),
      };
      const created = await submitPublicCreatorBooking(profile.slug, submission);
      setBookingConfirmedId(created.id);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const openLightbox = (item: CreatorPortfolioItemDto) => {
    setActivePortfolioItem(item);
    setActiveSlideIndex(0);
  };

  const lightboxSlides = activePortfolioItem
    ? activePortfolioItem.gallery_images?.length > 0
      ? activePortfolioItem.gallery_images
      : [activePortfolioItem.media_url]
    : [];

  return (
    <div className={`min-h-screen font-sans selection:bg-gold selection:text-ink ${theme.pageBg}`}>
      {/* Preview Mode Top Banner */}
      {isPreview && (
        <div className="sticky top-0 z-50 bg-gold text-ink px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[12px] font-semibold shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles size={15} />
            <span>
              Live Interactive Landing Page Preview — Public URL:{' '}
              <strong className="underline">
                {window.location.origin}/creators/{profile.slug}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/creators/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-ink text-canvas hover:bg-noir transition-colors flex items-center gap-1.5"
            >
              <span>Open Live URL</span>
              <ArrowUpRight size={13} />
            </a>
            {onClosePreview && (
              <button
                type="button"
                onClick={onClosePreview}
                className="px-3 py-1 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink transition-colors flex items-center gap-1"
              >
                <X size={14} /> Close Preview
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticky Studio Navigation */}
      <header
        className={`sticky ${isPreview ? 'top-10' : 'top-0'} z-40 backdrop-blur-xl border-b transition-colors ${theme.navBg}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3.5 group">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.studio_name}
                className="w-11 h-11 rounded-xl object-cover border border-gold/40 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center font-serif font-bold text-gold text-[18px]">
                {profile.studio_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`${headingFontClass} text-[18px] font-bold tracking-tight`}>
                  {profile.studio_name}
                </span>
                <ShieldCheck size={16} className={accent.textClass} />
              </div>
              <span className={`text-[11px] block ${theme.subtleText}`}>{profile.city}</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium">
            {cfg.sections_visibility.gallery && (
              <a
                href="#portfolio-section"
                className={`${theme.mutedText} hover:${theme.primaryText} transition-colors`}
              >
                Gallery
              </a>
            )}
            {cfg.sections_visibility.about && (
              <a
                href="#manifesto-section"
                className={`${theme.mutedText} hover:${theme.primaryText} transition-colors`}
              >
                About us
              </a>
            )}
            {cfg.sections_visibility.services && (
              <a
                href="#packages-section"
                className={`${theme.mutedText} hover:${theme.primaryText} transition-colors`}
              >
                Packages & Rates
              </a>
            )}
            {cfg.sections_visibility.testimonials && (
              <a
                href="#reviews-section"
                className={`${theme.mutedText} hover:${theme.primaryText} transition-colors`}
              >
                Testimony
              </a>
            )}
            {cfg.sections_visibility.faq && (
              <a
                href="#faq-section"
                className={`${theme.mutedText} hover:${theme.primaryText} transition-colors`}
              >
                FAQ
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSharePage}
              className={`px-3.5 py-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} text-[12px] font-medium flex items-center gap-1.5 hover:border-gold/50 transition-colors`}
              title="Copy direct portfolio link"
            >
              {copiedShareUrl ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className={accent.textClass} />
                  <span className="hidden sm:inline">Share Page</span>
                </>
              )}
            </button>

            {cfg.sections_visibility.booking && (
              <a
                href="#creator-booking-section"
                className={`px-5 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all shadow-lg flex items-center gap-1.5 ${accent.buttonClass}`}
              >
                <span>{cfg.hero_cta_primary || 'Book a Shoot'}</span>
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {cfg.sections_visibility.hero && (
        <section id="top" className="relative overflow-hidden">
          {cfg.hero_layout === 'cinematic-full' && (
            <div className="relative min-h-[82vh] flex items-end pb-16 sm:pb-24 pt-28">
              <div className="absolute inset-0">
                <img
                  src={profile.cover_url}
                  alt={profile.studio_name}
                  className="w-full h-full object-cover scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/35" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
                <div className="max-w-3xl space-y-6 text-canvas">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-semibold bg-gold/20 text-gold border border-gold/30 backdrop-blur-md">
                      {cfg.hero_eyebrow}
                    </span>
                  </div>

                  <h1
                    className={`${headingFontClass} text-[38px] sm:text-[56px] lg:text-[66px] font-bold leading-[1.06] text-white`}
                  >
                    <FormattedHeadline text={cfg.hero_headline} accentTextClass="text-gold" />
                  </h1>

                  <div className="text-[16px] sm:text-[18px] text-canvas/85 max-w-2xl">
                    <RichTextDisplay html={cfg.hero_subheadline} isDark />
                  </div>

                  {/* Categories Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-canvas/90 text-[11.5px]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    {cfg.sections_visibility.booking && (
                      <a
                        href="#creator-booking-section"
                        className={`px-7 py-4 rounded-xl text-[13.5px] font-semibold transition-all shadow-xl flex items-center gap-2 ${accent.buttonClass}`}
                      >
                        <Calendar size={16} />
                        <span>{cfg.hero_cta_primary}</span>
                      </a>
                    )}
                    {cfg.sections_visibility.gallery && (
                      <a
                        href="#portfolio-section"
                        className="px-7 py-4 rounded-xl text-[13.5px] font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                      >
                        <span>{cfg.hero_cta_secondary}</span>
                      </a>
                    )}
                    {cfg.hero_video_url && (
                      <button
                        type="button"
                        onClick={() => setIsShowreelOpen(true)}
                        className="px-5 py-4 rounded-xl text-[13px] font-medium text-gold hover:text-white bg-noir/70 border border-gold/30 hover:border-gold transition-all flex items-center gap-2.5"
                      >
                        <span className="w-7 h-7 rounded-full bg-gold text-ink flex items-center justify-center">
                          <Play size={13} fill="currentColor" />
                        </span>
                        <span>Watch Showreel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {cfg.hero_layout === 'split-editorial' && (
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-semibold border ${accent.badgeClass}`}
                    >
                      {cfg.hero_eyebrow}
                    </span>
                  </div>

                  <h1
                    className={`${headingFontClass} text-[36px] sm:text-[52px] lg:text-[60px] font-bold leading-[1.08]`}
                  >
                    <FormattedHeadline
                      text={cfg.hero_headline}
                      accentTextClass={accent.textClass}
                    />
                  </h1>

                  <div className="text-[16px] sm:text-[17px] max-w-2xl">
                    <RichTextDisplay
                      html={cfg.hero_subheadline}
                      isDark={theme.isDark}
                      accentTextClass={accent.textClass}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    {cfg.sections_visibility.booking && (
                      <a
                        href="#creator-booking-section"
                        className={`px-7 py-4 rounded-xl text-[13.5px] font-semibold transition-all shadow-xl flex items-center gap-2 ${accent.buttonClass}`}
                      >
                        <Calendar size={16} />
                        <span>{cfg.hero_cta_primary}</span>
                      </a>
                    )}
                    {cfg.sections_visibility.gallery && (
                      <a
                        href="#portfolio-section"
                        className={`px-7 py-4 rounded-xl text-[13.5px] font-semibold border ${theme.cardBorder} ${theme.cardBg} hover:border-gold transition-all`}
                      >
                        {cfg.hero_cta_secondary}
                      </a>
                    )}
                    {cfg.hero_video_url && (
                      <button
                        type="button"
                        onClick={() => setIsShowreelOpen(true)}
                        className={`px-5 py-4 rounded-xl text-[13px] font-medium border ${theme.cardBorder} ${theme.cardBg} flex items-center gap-2.5`}
                      >
                        <Play size={14} className={accent.textClass} />
                        <span>Showreel</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden border border-gold/25 shadow-2xl aspect-[4/5] group">
                    <img
                      src={profile.cover_url}
                      alt={profile.studio_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-noir/80 backdrop-blur-md border border-white/15 text-canvas">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-semibold">
                        {profile.specialization}
                      </div>
                      <div className="font-serif text-[20px] font-bold text-white mt-0.5">
                        {profile.studio_name}
                      </div>
                      <div className="text-[12px] text-canvas/70 mt-1 flex items-center justify-between">
                        <span>{profile.city}</span>
                        <span className="text-gold font-semibold">
                          From ${profile.day_rate.toLocaleString()} / day
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cfg.hero_layout === 'minimal-centered' && (
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24 text-center space-y-8">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-semibold border ${accent.badgeClass}`}
                >
                  {cfg.hero_eyebrow}
                </span>
              </div>

              <h1
                className={`${headingFontClass} text-[36px] sm:text-[54px] lg:text-[64px] font-bold leading-[1.08] max-w-4xl mx-auto`}
              >
                <FormattedHeadline text={cfg.hero_headline} accentTextClass={accent.textClass} />
              </h1>

              <div className="text-[16px] sm:text-[18px] max-w-2xl mx-auto">
                <RichTextDisplay
                  html={cfg.hero_subheadline}
                  isDark={theme.isDark}
                  accentTextClass={accent.textClass}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {cfg.sections_visibility.booking && (
                  <a
                    href="#creator-booking-section"
                    className={`px-7 py-4 rounded-xl text-[13.5px] font-semibold transition-all shadow-xl flex items-center gap-2 ${accent.buttonClass}`}
                  >
                    <Calendar size={16} />
                    <span>{cfg.hero_cta_primary}</span>
                  </a>
                )}
                {cfg.sections_visibility.gallery && (
                  <a
                    href="#portfolio-section"
                    className={`px-7 py-4 rounded-xl text-[13.5px] font-semibold border ${theme.cardBorder} ${theme.cardBg} hover:border-gold transition-all`}
                  >
                    {cfg.hero_cta_secondary}
                  </a>
                )}
              </div>

              <div className="rounded-3xl overflow-hidden border border-gold/20 shadow-2xl aspect-[21/9] mt-8 relative">
                <img
                  src={profile.cover_url}
                  alt={profile.studio_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* STATS / STUDIO CREDENTIALS BAR */}
      {cfg.sections_visibility.stats && cfg.stats.length > 0 && (
        <section className={`border-y ${theme.cardBorder} ${theme.altSectionBg}`}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {cfg.stats.map((stat, idx) => (
                <div key={idx} className="text-center md:text-left space-y-1">
                  <div
                    className={`${headingFontClass} text-[32px] sm:text-[40px] font-bold ${accent.textClass}`}
                  >
                    {stat.value}
                  </div>
                  <div className={`text-[12px] uppercase tracking-[0.14em] ${theme.mutedText}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PORTFOLIO SHOWCASE: GALLERIES OF PHOTOS & VIDEOS */}
      {cfg.sections_visibility.gallery && (
        <section id="portfolio-section" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3">
                <span
                  className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
                >
                  GALLERY
                </span>
                <h2 className={`${headingFontClass} text-[32px] sm:text-[44px] font-bold`}>
                  Gallery
                </h2>
                <p className={`text-[14.5px] max-w-2xl ${theme.mutedText}`}>
                  Explore commissioned stills and motion productions. Select any work to open the
                  multi-frame gallery or 4K cinema reel.
                </p>
              </div>

              {/* Media Type + Category Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex p-1 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}
                >
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      mediaFilter === 'all' ? accent.buttonClass : theme.mutedText
                    }`}
                  >
                    All ({profile.portfolio_items.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('photo')}
                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                      mediaFilter === 'photo' ? accent.buttonClass : theme.mutedText
                    }`}
                  >
                    <Camera size={13} /> Stills
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('video')}
                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                      mediaFilter === 'video' ? accent.buttonClass : theme.mutedText
                    }`}
                  >
                    <Film size={13} /> Films
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all shrink-0 ${
                    categoryFilter === cat
                      ? `${accent.buttonClass} border-transparent shadow-md`
                      : `${theme.cardBg} ${theme.cardBorder} ${theme.mutedText}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredPortfolio.map((item) => {
                const heightClass =
                  item.aspect_ratio === 'portrait'
                    ? 'aspect-[4/5]'
                    : item.aspect_ratio === 'cinema'
                      ? 'aspect-[16/10]'
                      : item.aspect_ratio === 'square'
                        ? 'aspect-square'
                        : 'aspect-[4/3]';

                return (
                  <article
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden border ${theme.cardBorder} ${theme.cardBg} flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 shadow-xl`}
                  >
                    <div className={`relative w-full overflow-hidden ${heightClass}`}>
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[10.5px] uppercase tracking-wider font-semibold bg-noir/75 text-gold border border-gold/30 backdrop-blur-md">
                          {item.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-noir/75 text-canvas border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                          {item.media_type === 'video' ? (
                            <>
                              <Play size={11} className="text-gold" fill="currentColor" />
                              <span>4K Film</span>
                            </>
                          ) : (
                            <>
                              <Layers size={11} className="text-gold" />
                              <span>{Math.max(1, item.gallery_images?.length || 1)} Frames</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Center Play / View Cue — touch-accessible per §5b */}
                      <div className="absolute bottom-4 right-4 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity">
                        <span className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg">
                          {item.media_type === 'video' ? (
                            <Play size={16} fill="currentColor" />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </span>
                      </div>

                      {/* Bottom Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-16 text-white">
                        <h3 className={`${headingFontClass} text-[20px] font-bold leading-snug`}>
                          {item.title}
                        </h3>
                        <p className="text-[12px] text-canvas/75 line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between text-[12px] border-t border-canvas/5">
                      <span className={theme.mutedText}>
                        Client:{' '}
                        <strong className={theme.primaryText}>
                          {item.client_name || 'Private'}
                        </strong>
                      </span>
                      <span className={`flex items-center gap-1 ${theme.subtleText}`}>
                        <MapPin size={12} className={accent.textClass} />
                        {item.location} • {item.shoot_year}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* RICH TEXT STUDIO MANIFESTO / ABOUT SECTION */}
      {cfg.sections_visibility.about && (
        <section
          id="manifesto-section"
          className={`py-20 lg:py-28 border-y ${theme.cardBorder} ${theme.altSectionBg}`}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Creator Identity & Pull Quote */}
              <div className="lg:col-span-5 space-y-6">
                <span
                  className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
                >
                  {cfg.about_eyebrow === 'THE STUDIO MANIFESTO' || !cfg.about_eyebrow
                    ? 'ABOUT US'
                    : cfg.about_eyebrow}
                </span>
                <h2
                  className={`${headingFontClass} text-[32px] sm:text-[42px] font-bold leading-tight`}
                >
                  {cfg.about_heading}
                </h2>

                {cfg.about_pull_quote && (
                  <div
                    className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-3`}
                  >
                    <p
                      className={`font-serif italic text-[19px] leading-relaxed ${accent.textClass}`}
                    >
                      “{cfg.about_pull_quote}”
                    </p>
                    <div className={`text-[12px] font-medium ${theme.mutedText}`}>
                      — {profile.studio_name} • {profile.specialization}
                    </div>
                  </div>
                )}

                {/* Studio Quick Facts Card */}
                <div
                  className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}
                >
                  <div className="grid grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <span className={`text-[11px] uppercase tracking-wider block ${theme.subtleText}`}>
                        Base Location
                      </span>
                      <span className="font-semibold mt-0.5 block">{profile.city}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] uppercase tracking-wider block ${theme.subtleText}`}>
                        Standard Day Rate
                      </span>
                      <span className={`font-serif font-bold text-[16px] mt-0.5 block ${accent.textClass}`}>
                        ${profile.day_rate.toLocaleString()} {profile.currency.split(' ')[0]}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[11px] uppercase tracking-wider block ${theme.subtleText}`}>
                        Production Scale
                      </span>
                      <span className="font-semibold mt-0.5 block">{profile.team_size}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] uppercase tracking-wider block ${theme.subtleText}`}>
                        Experience
                      </span>
                      <span className="font-semibold mt-0.5 block">
                        {profile.experience_years}+ Years
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-3 border-t border-canvas/10 flex flex-wrap items-center gap-3 text-[12px]">
                    {profile.socials.instagram && (
                      <span
                        className={`px-3 py-1.5 rounded-lg border ${theme.cardBorder} flex items-center gap-1.5`}
                      >
                        <Instagram size={13} className={accent.textClass} />
                        {profile.socials.instagram}
                      </span>
                    )}
                    {profile.socials.vimeo && (
                      <span
                        className={`px-3 py-1.5 rounded-lg border ${theme.cardBorder} flex items-center gap-1.5`}
                      >
                        <Video size={13} className={accent.textClass} />
                        Vimeo
                      </span>
                    )}
                    {profile.socials.youtube && (
                      <span
                        className={`px-3 py-1.5 rounded-lg border ${theme.cardBorder} flex items-center gap-1.5`}
                      >
                        <Youtube size={13} className={accent.textClass} />
                        YouTube
                      </span>
                    )}
                    {profile.socials.website && (
                      <a
                        href={profile.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 rounded-lg border ${theme.cardBorder} flex items-center gap-1.5 hover:border-gold`}
                      >
                        <Globe size={13} className={accent.textClass} />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Rich Text Narrative */}
              <div
                className={`lg:col-span-7 p-7 sm:p-10 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-xl`}
              >
                <RichTextDisplay
                  html={cfg.about_rich_text}
                  isDark={theme.isDark}
                  accentTextClass={accent.textClass}
                  className="text-[15.5px]"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SERVICE PACKAGES & INVESTMENT TIERS */}
      {cfg.sections_visibility.services && cfg.services.length > 0 && (
        <section id="packages-section" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span
                className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
              >
                BESPOKE COMMISSIONS & PACKAGES
              </span>
              <h2 className={`${headingFontClass} text-[32px] sm:text-[44px] font-bold`}>
                Services & Production Packages
              </h2>
              <p className={`text-[14.5px] ${theme.mutedText}`}>
                Select a signature package below to pre-fill your commission application, or
                request a custom production quote.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {cfg.services.map((svc) => (
                <div
                  key={svc.id}
                  className={`rounded-3xl p-7 sm:p-8 border flex flex-col justify-between transition-all ${
                    svc.featured
                      ? `${theme.cardBg} border-gold shadow-2xl relative ring-1 ring-gold/40`
                      : `${theme.cardBg} ${theme.cardBorder}`
                  }`}
                >
                  {svc.featured && (
                    <span className="absolute -top-3.5 left-7 px-3.5 py-1 rounded-full text-[10.5px] uppercase tracking-wider font-bold bg-gold text-ink shadow">
                      Most Requested Package
                    </span>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <span className={`flex items-center gap-1.5 ${theme.mutedText}`}>
                        <Clock size={13} className={accent.textClass} />
                        {svc.duration}
                      </span>
                      <span className={`${headingFontClass} text-[22px] font-bold ${accent.textClass}`}>
                        {svc.price_label}
                      </span>
                    </div>

                    <div>
                      <h3 className={`${headingFontClass} text-[22px] font-bold`}>{svc.title}</h3>
                      <p className={`text-[13.5px] mt-2 leading-relaxed ${theme.mutedText}`}>
                        {svc.tagline}
                      </p>
                    </div>

                    <ul className="space-y-2.5 pt-2 border-t border-canvas/10 text-[13px]">
                      {svc.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={15} className={`mt-0.5 shrink-0 ${accent.textClass}`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackageForBooking(svc.title)}
                    className={`mt-8 w-full py-3.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
                      svc.featured
                        ? accent.buttonClass
                        : `border ${theme.cardBorder} hover:border-gold`
                    }`}
                  >
                    <span>Book {svc.title}</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLIENT TESTIMONIALS */}
      {cfg.sections_visibility.testimonials && cfg.testimonials.length > 0 && (
        <section
          id="reviews-section"
          className={`py-20 lg:py-24 border-t ${theme.cardBorder} ${theme.altSectionBg}`}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span
                className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
              >
                TESTIMONY
              </span>
              <h2 className={`${headingFontClass} text-[32px] sm:text-[40px] font-bold`}>
                Testimony
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cfg.testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`p-8 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} space-y-5 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gold">
                      {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                        <Star key={idx} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <span className={`text-[11px] px-3 py-1 rounded-full border ${accent.badgeClass}`}>
                      {t.project_type}
                    </span>
                  </div>

                  <p className="font-serif italic text-[18px] leading-relaxed">“{t.quote}”</p>

                  <div className="pt-2 border-t border-canvas/10">
                    <div className="font-semibold text-[14px]">{t.author}</div>
                    <div className={`text-[12px] ${theme.mutedText}`}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {cfg.sections_visibility.faq && cfg.faqs.length > 0 && (
        <section id="faq-section" className="py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span
                className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
              >
                PRODUCTION & DELIVERY FAQ
              </span>
              <h2 className={`${headingFontClass} text-[30px] sm:text-[38px] font-bold`}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {cfg.faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-[15px]"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${accent.textClass} ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className={`px-6 pb-6 text-[14px] leading-relaxed ${theme.mutedText}`}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CLIENT BOOKING & COMMISSION APPLICATION FORM */}
      {cfg.sections_visibility.booking && (
        <section
          id="creator-booking-section"
          className={`py-20 lg:py-28 border-t ${theme.cardBorder} ${theme.altSectionBg}`}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <span
                  className={`text-[11px] uppercase tracking-[0.18em] font-bold ${accent.textClass}`}
                >
                  DIRECT STUDIO BOOKING
                </span>
                <h2 className={`${headingFontClass} text-[32px] sm:text-[42px] font-bold leading-tight`}>
                  {cfg.booking_heading || 'Commission Your Next Visual Story'}
                </h2>
                <p className={`text-[14.5px] leading-relaxed ${theme.mutedText}`}>
                  {cfg.booking_subtext}
                </p>

                <div
                  className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4 text-[13px]`}
                >
                  <div className="flex items-center gap-3">
                    <Mail size={16} className={accent.textClass} />
                    <span>{profile.primary_email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className={accent.textClass} />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className={accent.textClass} />
                    <span>
                      {profile.address ? `${profile.address}, ` : ''}
                      {profile.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Interactive Booking Form */}
              <div
                className={`lg:col-span-7 p-7 sm:p-10 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xl`}
              >
                {bookingConfirmedId ? (
                  <div className="py-10 text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className={`${headingFontClass} text-[28px] font-bold`}>
                      Commission Request Received
                    </h3>
                    <p className={`text-[14px] max-w-md mx-auto ${theme.mutedText}`}>
                      Thank you, <strong>{clientName}</strong>. Your inquiry for{' '}
                      <strong>{selectedService}</strong> has been logged directly with{' '}
                      <strong>{profile.studio_name}</strong> (Ref: <code>{bookingConfirmedId}</code>
                      ).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingConfirmedId(null);
                        setProjectBrief('');
                      }}
                      className={`px-6 py-3 rounded-xl text-[13px] font-semibold ${accent.buttonClass}`}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Clara Vance"
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="clara@company.com"
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Brand / Agency / Couple Name
                        </label>
                        <input
                          type="text"
                          value={companyOrBrand}
                          onChange={(e) => setCompanyOrBrand(e.target.value)}
                          placeholder="Maison Verve / Private"
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Selected Service Package
                        </label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        >
                          {cfg.services.map((svc) => (
                            <option key={svc.id} value={svc.title}>
                              {svc.title} ({svc.price_label})
                            </option>
                          ))}
                          <option value="Custom Bespoke Production">
                            Custom Bespoke Production
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Shoot Category / Discipline
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        >
                          {profile.categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                          <option value="Commercial & Editorial">Commercial & Editorial</option>
                          <option value="Destination Wedding">Destination Wedding</option>
                          <option value="4K Cinema & Motion">4K Cinema & Motion</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Preferred Shoot Date
                        </label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                          Estimated Production Budget
                        </label>
                        <select
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                        >
                          <option value="$1,500 – $3,000">$1,500 – $3,000</option>
                          <option value="$3,000 – $5,000">$3,000 – $5,000</option>
                          <option value="$5,000 – $10,000">$5,000 – $10,000</option>
                          <option value="$10,000 – $25,000">$10,000 – $25,000</option>
                          <option value="$25,000+">$25,000+ Full Campaign</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                        Shoot Location / City
                      </label>
                      <input
                        type="text"
                        value={shootLocation}
                        onChange={(e) => setShootLocation(e.target.value)}
                        placeholder="e.g. London, New York, Lake Como..."
                        className={`w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[12px] font-medium mb-2 ${theme.mutedText}`}>
                        Project Vision, Moodboard Links & Deliverables *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={projectBrief}
                        onChange={(e) => setProjectBrief(e.target.value)}
                        placeholder="Tell us about your creative concept, timeline, locations, and desired photo/video deliverables..."
                        className={`w-full rounded-xl p-4 text-[14px] border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className={`w-full py-4 rounded-xl text-[14px] font-semibold transition-all shadow-xl flex items-center justify-center gap-2 ${accent.buttonClass}`}
                    >
                      <Send size={16} />
                      <span>
                        {submittingBooking
                          ? 'Sending Application…'
                          : 'Submit Commission Application'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-canvas/10 text-center text-[12px] opacity-70">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} <strong>{profile.studio_name}</strong> ({profile.legal_name}
            ). All rights reserved.
          </div>
          <div>
            Powered by <strong className="text-gold">Cabmora Studio Vault</strong> •{' '}
            <code>cabmora.com/creators/{profile.slug}</code>
          </div>
        </div>
      </footer>

      {/* PORTFOLIO ITEM LIGHTBOX MODAL (Nullable condition OUTSIDE Modal per Rule 4) */}
      {activePortfolioItem && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setActivePortfolioItem(null);
          }}
          size="xl"
          tone="dark"
          chrome="none"
          title={activePortfolioItem.title}
        >
          <div className="bg-panel-900 border border-canvas/15 rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl text-canvas">
            <div className="px-6 py-4 bg-panel-950 border-b border-canvas/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">
                  {activePortfolioItem.category}
                </span>
                <h3 className="font-serif text-[20px] font-bold text-white">
                  {activePortfolioItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePortfolioItem(null)}
                className="p-1.5 rounded-lg text-canvas/60 hover:text-white hover:bg-canvas/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 bg-noir flex flex-col justify-center relative min-h-[380px] sm:min-h-[480px]">
                {activePortfolioItem.media_type === 'video' && activePortfolioItem.video_url ? (
                  <video
                    src={activePortfolioItem.video_url}
                    poster={activePortfolioItem.media_url}
                    controls
                    autoPlay
                    className="w-full max-h-[540px] object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={lightboxSlides[activeSlideIndex] ?? activePortfolioItem.media_url}
                      alt={activePortfolioItem.title}
                      className="w-full max-h-[540px] object-contain"
                    />
                    {lightboxSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex(
                              (activeSlideIndex - 1 + lightboxSlides.length) %
                                lightboxSlides.length,
                            )
                          }
                          className="absolute left-3 p-2.5 rounded-full bg-noir/80 text-white border border-white/20 hover:bg-gold hover:text-ink transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex((activeSlideIndex + 1) % lightboxSlides.length)
                          }
                          className="absolute right-3 p-2.5 rounded-full bg-noir/80 text-white border border-white/20 hover:bg-gold hover:text-ink transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-6 bg-panel-900">
                <div className="space-y-4">
                  <div className="text-[12px] text-gold font-semibold uppercase tracking-wider">
                    {activePortfolioItem.subtitle}
                  </div>
                  <p className="text-[13.5px] text-canvas/80 leading-relaxed">
                    {activePortfolioItem.description}
                  </p>

                  <div className="pt-4 border-t border-canvas/10 grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <span className="text-canvas/40 block">Client</span>
                      <span className="text-white font-medium">
                        {activePortfolioItem.client_name || 'Private Commission'}
                      </span>
                    </div>
                    <div>
                      <span className="text-canvas/40 block">Location</span>
                      <span className="text-white font-medium">
                        {activePortfolioItem.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-canvas/40 block">Year</span>
                      <span className="text-white font-medium">
                        {activePortfolioItem.shoot_year}
                      </span>
                    </div>
                    <div>
                      <span className="text-canvas/40 block">Format</span>
                      <span className="text-gold font-medium uppercase">
                        {activePortfolioItem.media_type}
                      </span>
                    </div>
                  </div>

                  {lightboxSlides.length > 1 && (
                    <div className="pt-2">
                      <span className="text-[11px] text-canvas/40 block mb-2">
                        Series Frames ({lightboxSlides.length})
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {lightboxSlides.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                              idx === activeSlideIndex ? 'border-gold' : 'border-transparent opacity-60'
                            }`}
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const cat = activePortfolioItem.category;
                    setActivePortfolioItem(null);
                    setEventType(cat);
                    const el = document.getElementById('creator-booking-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 rounded-xl bg-gold text-ink font-semibold text-[13px] hover:bg-gold-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar size={15} />
                  <span>Request Similar Shoot</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* SHOWREEL VIDEO MODAL */}
      {isShowreelOpen && cfg.hero_video_url && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsShowreelOpen(false);
          }}
          size="xl"
          tone="dark"
          chrome="none"
          title={`${profile.studio_name} — Showreel`}
        >
          <div className="bg-panel-950 border border-canvas/15 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-canvas/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold text-[13px] font-semibold">
                <Film size={16} />
                <span>{profile.studio_name} — Official Director’s Showreel</span>
              </div>
              <button
                type="button"
                onClick={() => setIsShowreelOpen(false)}
                className="text-canvas/50 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
            <video
              src={cfg.hero_video_url}
              poster={profile.cover_url}
              controls
              autoPlay
              className="w-full aspect-video bg-noir"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

