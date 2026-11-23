import { useState } from 'react';
import {
  Palette,
  Layout,
  Type,
  Sparkles,
  Image as ImageIcon,
  Film,
  Plus,
  Trash2,
  Star,
  Check,
  Eye,
  EyeOff,
  Briefcase,
  HelpCircle,
  MessageSquareQuote,
  Link2,
  ExternalLink,
} from 'lucide-react';
import {
  type CreatorPortfolioItemDto,
  type LandingConfigDto,
  type LandingThemePreset,
  type LandingAccentToken,
  type LandingHeroLayout,
  type LandingHeadingFont,
  type LandingServicePackage,
  type LandingFaqItem,
  type LandingTestimonial,
  type LandingSectionsVisibility,
  LANDING_THEME_PRESETS,
  LANDING_ACCENT_TOKENS,
} from '@/features/account/data';
import { RichTextEditor } from '@/features/account/components/RichTextEditor';

interface LandingPageBuilderProps {
  slug: string;
  isPublished: boolean;
  onSlugChange: (slug: string) => void;
  onPublishedChange: (published: boolean) => void;
  config: LandingConfigDto;
  onConfigChange: (next: LandingConfigDto) => void;
  portfolioItems: CreatorPortfolioItemDto[];
  onPortfolioChange: (next: CreatorPortfolioItemDto[]) => void;
  onOpenFullPreview: () => void;
}

type BuilderSection = 'theme' | 'hero-copy' | 'portfolio' | 'packages' | 'trust';

export function LandingPageBuilder({
  slug,
  isPublished,
  onSlugChange,
  onPublishedChange,
  config,
  onConfigChange,
  portfolioItems,
  onPortfolioChange,
  onOpenFullPreview,
}: LandingPageBuilderProps) {
  const [section, setSection] = useState<BuilderSection>('theme');
  const [editingWorkId, setEditingWorkId] = useState<string | null>(
    portfolioItems[0]?.id ?? null,
  );

  const updateConfig = <K extends keyof LandingConfigDto>(
    key: K,
    value: LandingConfigDto[K],
  ) => {
    onConfigChange({ ...config, [key]: value });
  };

  const toggleVisibility = (key: keyof LandingSectionsVisibility) => {
    updateConfig('sections_visibility', {
      ...config.sections_visibility,
      [key]: !config.sections_visibility[key],
    });
  };

  const addPortfolioItem = (mediaType: 'photo' | 'video') => {
    const newItem: CreatorPortfolioItemDto = {
      id: `work-${Date.now()}`,
      title: mediaType === 'video' ? 'New Cinema Production' : 'New Editorial Series',
      subtitle: 'Shot on location • Medium format & 4K motion',
      category: 'Editorial',
      media_type: mediaType,
      media_url:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&auto=format&fit=crop&q=80',
      video_url:
        mediaType === 'video'
          ? 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-model-in-a-studio-34487-large.mp4'
          : null,
      description: 'Describe the creative direction, lighting setup, and deliverables.',
      client_name: 'Client Name',
      location: 'London, UK',
      shoot_year: '2026',
      aspect_ratio: mediaType === 'video' ? 'cinema' : 'portrait',
      featured: true,
      sort_order: portfolioItems.length + 1,
      gallery_images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&auto=format&fit=crop&q=80',
      ],
    };
    onPortfolioChange([newItem, ...portfolioItems]);
    setEditingWorkId(newItem.id);
  };

  const updatePortfolioItem = (id: string, patch: Partial<CreatorPortfolioItemDto>) => {
    onPortfolioChange(
      portfolioItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removePortfolioItem = (id: string) => {
    const remaining = portfolioItems.filter((item) => item.id !== id);
    onPortfolioChange(remaining);
    if (editingWorkId === id) {
      setEditingWorkId(remaining[0]?.id ?? null);
    }
  };

  const addServicePackage = () => {
    const pkg: LandingServicePackage = {
      id: `svc-${Date.now()}`,
      title: 'Bespoke Production Package',
      tagline: 'Tailored full-day photography and motion direction.',
      price_label: 'From $3,500',
      duration: 'Full Day (8 Hours)',
      deliverables: [
        'Creative direction & moodboard',
        '60+ retouched high-res stills',
        'Private Cabmora proofing gallery',
      ],
      featured: false,
    };
    updateConfig('services', [...config.services, pkg]);
  };

  const updateService = (id: string, patch: Partial<LandingServicePackage>) => {
    updateConfig(
      'services',
      config.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const removeService = (id: string) => {
    updateConfig(
      'services',
      config.services.filter((s) => s.id !== id),
    );
  };

  const addFaq = () => {
    const next: LandingFaqItem = {
      id: `faq-${Date.now()}`,
      question: 'What is included in your licensing and delivery?',
      answer: 'All galleries include private cloud proofing and full-resolution downloads.',
    };
    updateConfig('faqs', [...config.faqs, next]);
  };

  const addTestimonial = () => {
    const next: LandingTestimonial = {
      id: `test-${Date.now()}`,
      quote: 'An unforgettable creative collaboration from brief to final gallery delivery.',
      author: 'Client Name',
      role: 'Brand / Role',
      project_type: 'Editorial Campaign',
      rating: 5,
    };
    updateConfig('testimonials', [...config.testimonials, next]);
  };

  const activeWork = portfolioItems.find((w) => w.id === editingWorkId) ?? portfolioItems[0];
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/creators/${slug}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Unique Address & Live Status Bar */}
      <div className="bg-panel-900 border border-gold/25 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
            <Link2 size={14} /> Unique Public Landing Page Address
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center bg-panel-800 border border-canvas/15 rounded-xl overflow-hidden focus-within:border-gold transition-colors flex-1">
              <span className="px-3.5 py-3 text-[12.5px] text-canvas/45 bg-black/30 border-r border-canvas/10 select-none shrink-0">
                cabmora.com/creators/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  onSlugChange(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, '-')
                      .replace(/^-+/, ''),
                  )
                }
                placeholder="your-studio-name"
                className="w-full bg-transparent px-3.5 py-3 text-[14px] text-white font-medium outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => onPublishedChange(!isPublished)}
              className={`px-4 py-3 rounded-xl text-[12px] font-semibold border transition-colors flex items-center gap-2 shrink-0 ${
                isPublished
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-panel-800 text-canvas/60 border-canvas/15'
              }`}
            >
              {isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>{isPublished ? 'Published & Live' : 'Draft (Hidden)'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenFullPreview}
            className="px-5 py-3 rounded-xl bg-panel-800 hover:bg-canvas/10 border border-canvas/15 text-white text-[12.5px] font-semibold flex items-center gap-2 transition-colors"
          >
            <Eye size={15} className="text-gold" />
            <span>Interactive Page Preview</span>
          </button>

          <a
            href={`/creators/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[12.5px] font-semibold flex items-center gap-2 shadow-lg transition-colors"
          >
            <span>Open Live Page</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Sub-navigation for the Landing Page Studio */}
      <div className="flex flex-wrap items-center gap-2 bg-panel-900 p-2 rounded-2xl border border-canvas/10">
        {(
          [
            { id: 'theme', label: 'Theme, Colors & Layout', icon: Palette },
            { id: 'hero-copy', label: 'Hero & About Us', icon: Type },
            {
              id: 'portfolio',
              label: `Gallery (${portfolioItems.length})`,
              icon: ImageIcon,
            },
            {
              id: 'packages',
              label: `Service Packages (${config.services.length})`,
              icon: Briefcase,
            },
            { id: 'trust', label: 'Testimony, FAQs & Booking', icon: MessageSquareQuote },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[12.5px] font-medium flex items-center gap-2 transition-all ${
                active
                  ? 'bg-gold text-ink font-semibold shadow'
                  : 'text-canvas/65 hover:text-white hover:bg-canvas/5'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. THEME, COLORS, FONTS & SECTION VISIBILITY */}
      {section === 'theme' && (
        <div className="space-y-8">
          {/* Theme Presets */}
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                Visual Aesthetic
              </div>
              <h3 className="font-serif text-[20px] text-white">
                Color Palette & Surface Theme
              </h3>
              <p className="text-[12.5px] text-canvas/55 mt-1">
                Every preset uses Cabmora’s primary design tokens for WCAG-compliant contrast.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(LANDING_THEME_PRESETS) as LandingThemePreset[]).map((presetKey) => {
                const preset = LANDING_THEME_PRESETS[presetKey];
                const selected = config.theme_preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateConfig('theme_preset', preset.id)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-3 ${
                      selected
                        ? 'border-gold bg-gold/10 ring-1 ring-gold/40'
                        : 'border-canvas/10 bg-panel-800 hover:border-canvas/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg border border-white/20 ${preset.swatchBgClass}`}
                        />
                        <span
                          className={`w-6 h-6 rounded-lg border border-white/20 ${preset.swatchAccentClass}`}
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-canvas/10 text-canvas/80 font-semibold">
                        {preset.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        {selected && <Check size={16} className="text-gold" />}
                      </div>
                      <p className="text-[11.5px] text-canvas/55 mt-1">{preset.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Accent Color & Heading Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-canvas/10">
              <div className="space-y-3">
                <label className="block text-[12px] text-canvas/75 font-medium">
                  Primary Accent Color
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(LANDING_ACCENT_TOKENS) as LandingAccentToken[]).map((key) => {
                    const tok = LANDING_ACCENT_TOKENS[key];
                    const selected = config.accent_token === tok.id;
                    return (
                      <button
                        key={tok.id}
                        type="button"
                        onClick={() => updateConfig('accent_token', tok.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-[12.5px] font-medium transition-colors ${
                          selected
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-canvas/10 bg-panel-800 text-canvas/70 hover:text-white'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${tok.swatchClass}`} />
                        <span>{tok.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[12px] text-canvas/75 font-medium">
                  Display Heading Typography
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        id: 'serif',
                        title: 'Playfair Editorial',
                        sample: 'Timeless Luxury Serif',
                        fontClass: 'font-serif',
                      },
                      {
                        id: 'sans',
                        title: 'Jost Architectural',
                        sample: 'Clean Modern Geometric',
                        fontClass: 'font-sans',
                      },
                    ] as {
                      id: LandingHeadingFont;
                      title: string;
                      sample: string;
                      fontClass: string;
                    }[]
                  ).map((f) => {
                    const selected = config.heading_font === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateConfig('heading_font', f.id)}
                        className={`p-3.5 rounded-xl border text-left transition-colors ${
                          selected
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-canvas/10 bg-panel-800 text-canvas/70 hover:text-white'
                        }`}
                      >
                        <div className={`${f.fontClass} text-[16px] font-bold text-white`}>
                          {f.title}
                        </div>
                        <div className="text-[11px] text-canvas/55 mt-0.5">{f.sample}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Layout + Section Visibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-5">
              <div className="flex items-center gap-2 text-gold text-[11px] uppercase tracking-[0.14em] font-bold">
                <Layout size={14} /> Hero Composition
              </div>
              <div className="space-y-3">
                {(
                  [
                    {
                      id: 'cinematic-full',
                      name: 'Cinematic Full-Bleed Hero',
                      desc: 'Edge-to-edge studio cover photo with dramatic gradient & floating CTAs.',
                    },
                    {
                      id: 'split-editorial',
                      name: 'Split Editorial Showcase',
                      desc: 'Asymmetric 2-column layout with crisp headline on left & portrait frame on right.',
                    },
                    {
                      id: 'minimal-centered',
                      name: 'Minimalist Gallery Centerpiece',
                      desc: 'Centered manifesto typography above a widescreen panoramic showcase.',
                    },
                  ] as { id: LandingHeroLayout; name: string; desc: string }[]
                ).map((layoutOpt) => {
                  const selected = config.hero_layout === layoutOpt.id;
                  return (
                    <button
                      key={layoutOpt.id}
                      type="button"
                      onClick={() => updateConfig('hero_layout', layoutOpt.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-gold bg-gold/10'
                          : 'border-canvas/10 bg-panel-800 hover:border-canvas/25'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[13.5px] font-semibold text-white">
                        <span>{layoutOpt.name}</span>
                        {selected && <Check size={16} className="text-gold" />}
                      </div>
                      <p className="text-[12px] text-canvas/55 mt-1">{layoutOpt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-5">
              <div className="flex items-center gap-2 text-gold text-[11px] uppercase tracking-[0.14em] font-bold">
                <Sparkles size={14} /> Page Sections Visibility
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { key: 'hero', label: 'Hero Banner & Showreel' },
                    { key: 'stats', label: 'Studio Credentials Bar' },
                    { key: 'gallery', label: 'Gallery (Photos & Videos)' },
                    { key: 'about', label: 'About Us (Rich Text)' },
                    { key: 'services', label: 'Packages & Pricing Tiers' },
                    { key: 'testimonials', label: 'Testimony' },
                    { key: 'faq', label: 'Production FAQ' },
                    { key: 'booking', label: 'Client Booking Form' },
                  ] as { key: keyof LandingSectionsVisibility; label: string }[]
                ).map((sec) => {
                  const enabled = config.sections_visibility[sec.key];
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => toggleVisibility(sec.key)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-[12.5px] font-medium transition-colors ${
                        enabled
                          ? 'border-gold/40 bg-panel-800 text-white'
                          : 'border-canvas/10 bg-panel-950 text-canvas/40'
                      }`}
                    >
                      <span>{sec.label}</span>
                      {enabled ? (
                        <Eye size={15} className="text-gold" />
                      ) : (
                        <EyeOff size={15} className="text-canvas/35" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO & RICH TEXT MANIFESTO */}
      {section === 'hero-copy' && (
        <div className="space-y-8">
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                Hero Section Copy
              </div>
              <h3 className="font-serif text-[20px] text-white">
                Headlines, Availability & Showreel
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Hero Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={config.hero_eyebrow}
                  onChange={(e) => updateConfig('hero_eyebrow', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Availability Status Badge
                </label>
                <input
                  type="text"
                  value={config.availability_badge}
                  onChange={(e) => updateConfig('availability_badge', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] text-canvas/70 font-medium">
                  Main Hero Headline
                </label>
                <span className="text-[11px] text-gold">
                  Tip: wrap words in *asterisks* for italic accent styling
                </span>
              </div>
              <input
                type="text"
                value={config.hero_headline}
                onChange={(e) => updateConfig('hero_headline', e.target.value)}
                className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[15px] text-white font-serif outline-none focus:border-gold"
              />
            </div>

            <RichTextEditor
              label="Hero Subheadline (Rich Text)"
              value={config.hero_subheadline}
              onChange={(val) => updateConfig('hero_subheadline', val)}
              minHeightClass="min-h-[110px]"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Primary CTA Button
                </label>
                <input
                  type="text"
                  value={config.hero_cta_primary}
                  onChange={(e) => updateConfig('hero_cta_primary', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Secondary CTA Button
                </label>
                <input
                  type="text"
                  value={config.hero_cta_secondary}
                  onChange={(e) => updateConfig('hero_cta_secondary', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Showreel MP4 Video URL (Optional)
                </label>
                <input
                  type="url"
                  value={config.hero_video_url}
                  onChange={(e) => updateConfig('hero_video_url', e.target.value)}
                  placeholder="https://.../showreel.mp4"
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Rich Text About Us */}
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                About Us
              </div>
              <h3 className="font-serif text-[20px] text-white">About Us (Rich Text)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  About Us Heading
                </label>
                <input
                  type="text"
                  value={config.about_heading}
                  onChange={(e) => updateConfig('about_heading', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                  Editorial Pull Quote
                </label>
                <input
                  type="text"
                  value={config.about_pull_quote}
                  onChange={(e) => updateConfig('about_pull_quote', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold"
                />
              </div>
            </div>

            <RichTextEditor
              label="About Us & Workflow Narrative"
              helperText="Supports headings, bold, italic, blockquotes, and bullet lists"
              value={config.about_rich_text}
              onChange={(val) => updateConfig('about_rich_text', val)}
              minHeightClass="min-h-[220px]"
            />
          </div>
        </div>
      )}

      {/* 3. PORTFOLIO GALLERIES & VIDEOS */}
      {section === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Item List */}
          <div className="lg:col-span-5 bg-panel-900 border border-canvas/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-canvas/10">
              <h3 className="font-serif text-[18px] text-white">Portfolio Works</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addPortfolioItem('photo')}
                  className="px-3 py-1.5 rounded-lg bg-gold text-ink text-[11.5px] font-semibold flex items-center gap-1 hover:bg-gold-dark"
                >
                  <Plus size={13} /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => addPortfolioItem('video')}
                  className="px-3 py-1.5 rounded-lg bg-panel-800 border border-gold/30 text-gold text-[11.5px] font-semibold flex items-center gap-1 hover:bg-gold/10"
                >
                  <Film size={13} /> Video
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {portfolioItems.map((item) => {
                const isSelected = activeWork?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setEditingWorkId(item.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'border-gold bg-gold/10'
                        : 'border-canvas/10 bg-panel-800 hover:border-canvas/25'
                    }`}
                  >
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 bg-noir"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-white truncate">
                          {item.title}
                        </span>
                        {item.featured && (
                          <Star size={12} className="text-gold shrink-0" fill="currentColor" />
                        )}
                      </div>
                      <div className="text-[11px] text-canvas/55 flex items-center gap-2 mt-0.5">
                        <span className="uppercase text-gold">{item.media_type}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePortfolioItem(item.id);
                      }}
                      className="p-1.5 text-canvas/40 hover:text-danger transition-colors"
                      title="Remove work"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Item Editor */}
          <div className="lg:col-span-7 bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8">
            {activeWork ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                      Edit Portfolio Showcase
                    </span>
                    <h3 className="font-serif text-[20px] text-white">{activeWork.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updatePortfolioItem(activeWork.id, { featured: !activeWork.featured })
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border flex items-center gap-1.5 ${
                      activeWork.featured
                        ? 'bg-gold text-ink border-gold'
                        : 'bg-panel-800 text-canvas/70 border-canvas/15'
                    }`}
                  >
                    <Star size={13} fill={activeWork.featured ? 'currentColor' : 'none'} />
                    {activeWork.featured ? 'Featured' : 'Feature Work'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">Project Title</label>
                    <input
                      type="text"
                      value={activeWork.title}
                      onChange={(e) => updatePortfolioItem(activeWork.id, { title: e.target.value })}
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={activeWork.category}
                      onChange={(e) =>
                        updatePortfolioItem(activeWork.id, { category: e.target.value })
                      }
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">Media Format</label>
                    <select
                      value={activeWork.media_type}
                      onChange={(e) =>
                        updatePortfolioItem(activeWork.id, {
                          media_type: e.target.value as 'photo' | 'video',
                        })
                      }
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                    >
                      <option value="photo">Photography Series</option>
                      <option value="video">Cinema / Video Reel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">Card Aspect Ratio</label>
                    <select
                      value={activeWork.aspect_ratio}
                      onChange={(e) =>
                        updatePortfolioItem(activeWork.id, {
                          aspect_ratio: e.target.value as CreatorPortfolioItemDto['aspect_ratio'],
                        })
                      }
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                    >
                      <option value="portrait">Portrait (4:5)</option>
                      <option value="landscape">Landscape (4:3)</option>
                      <option value="cinema">Cinema (16:10)</option>
                      <option value="square">Square (1:1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">Client Name</label>
                    <input
                      type="text"
                      value={activeWork.client_name}
                      onChange={(e) =>
                        updatePortfolioItem(activeWork.id, { client_name: e.target.value })
                      }
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">
                      Location & Year
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={activeWork.location}
                        onChange={(e) =>
                          updatePortfolioItem(activeWork.id, { location: e.target.value })
                        }
                        placeholder="Milan"
                        className="col-span-2 bg-panel-800 border border-canvas/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                      />
                      <input
                        type="text"
                        value={activeWork.shoot_year}
                        onChange={(e) =>
                          updatePortfolioItem(activeWork.id, { shoot_year: e.target.value })
                        }
                        placeholder="2026"
                        className="bg-panel-800 border border-canvas/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-canvas/70 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={activeWork.media_url}
                    onChange={(e) =>
                      updatePortfolioItem(activeWork.id, { media_url: e.target.value })
                    }
                    className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                  />
                </div>

                {activeWork.media_type === 'video' && (
                  <div>
                    <label className="block text-[12px] text-canvas/70 mb-1.5">
                      Video Stream / MP4 URL
                    </label>
                    <input
                      type="url"
                      value={activeWork.video_url ?? ''}
                      onChange={(e) =>
                        updatePortfolioItem(activeWork.id, { video_url: e.target.value })
                      }
                      className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[12px] text-canvas/70 mb-1.5">
                    Gallery Frame URLs (one URL per line for multi-photo lightbox)
                  </label>
                  <textarea
                    rows={3}
                    value={(activeWork.gallery_images ?? []).join('\n')}
                    onChange={(e) =>
                      updatePortfolioItem(activeWork.id, {
                        gallery_images: e.target.value
                          .split('\n')
                          .map((u) => u.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full bg-panel-800 border border-canvas/10 rounded-xl p-3 text-[12.5px] text-white outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-canvas/70 mb-1.5">
                    Project Story / Production Notes
                  </label>
                  <textarea
                    rows={3}
                    value={activeWork.description}
                    onChange={(e) =>
                      updatePortfolioItem(activeWork.id, { description: e.target.value })
                    }
                    className="w-full bg-panel-800 border border-canvas/10 rounded-xl p-3 text-[13px] text-white outline-none focus:border-gold"
                  />
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-canvas/50 text-[13px]">
                Select or add a photo/video portfolio item on the left to configure it.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SERVICE PACKAGES */}
      {section === 'packages' && (
        <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-canvas/10 pb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                Client Services & Pricing
              </div>
              <h3 className="font-serif text-[20px] text-white">
                Packages Displayed on Your Landing Page
              </h3>
            </div>
            <button
              type="button"
              onClick={addServicePackage}
              className="px-4 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold flex items-center gap-1.5 hover:bg-gold-dark"
            >
              <Plus size={14} /> Add Package
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {config.services.map((svc) => (
              <div
                key={svc.id}
                className="p-5 rounded-2xl bg-panel-800 border border-canvas/10 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => updateService(svc.id, { featured: !svc.featured })}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                      svc.featured
                        ? 'bg-gold text-ink border-gold'
                        : 'border-canvas/15 text-canvas/60'
                    }`}
                  >
                    {svc.featured ? '★ Highlighted Package' : 'Standard Package'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeService(svc.id)}
                    className="text-canvas/40 hover:text-danger p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={svc.title}
                    onChange={(e) => updateService(svc.id, { title: e.target.value })}
                    placeholder="Package Title"
                    className="sm:col-span-2 bg-panel-900 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    value={svc.price_label}
                    onChange={(e) => updateService(svc.id, { price_label: e.target.value })}
                    placeholder="From $4,500"
                    className="bg-panel-900 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13px] text-gold font-semibold outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    value={svc.duration}
                    onChange={(e) => updateService(svc.id, { duration: e.target.value })}
                    placeholder="Full Day (10 Hours)"
                    className="bg-panel-900 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                  />
                </div>

                <input
                  type="text"
                  value={svc.tagline}
                  onChange={(e) => updateService(svc.id, { tagline: e.target.value })}
                  placeholder="Short package summary"
                  className="w-full bg-panel-900 border border-canvas/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-gold"
                />

                <div>
                  <label className="block text-[11px] text-canvas/55 mb-1">
                    Deliverables (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={svc.deliverables.join('\n')}
                    onChange={(e) =>
                      updateService(svc.id, {
                        deliverables: e.target.value
                          .split('\n')
                          .map((d) => d.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full bg-panel-900 border border-canvas/10 rounded-xl p-3 text-[12.5px] text-white outline-none focus:border-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TESTIMONIALS, FAQS & BOOKING HEADING */}
      {section === 'trust' && (
        <div className="space-y-8">
          {/* Booking Form Copy */}
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-5">
            <h3 className="font-serif text-[20px] text-white">Booking Section Copy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] text-canvas/70 mb-1.5">Booking Heading</label>
                <input
                  type="text"
                  value={config.booking_heading}
                  onChange={(e) => updateConfig('booking_heading', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[12px] text-canvas/70 mb-1.5">
                  Booking Subtext
                </label>
                <input
                  type="text"
                  value={config.booking_subtext}
                  onChange={(e) => updateConfig('booking_subtext', e.target.value)}
                  className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="text-[12px] text-canvas/55">
              Shareable URL: <strong className="text-gold">{publicUrl}</strong>
            </div>
          </div>

          {/* Testimony */}
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[20px] text-white">Testimony</h3>
              <button
                type="button"
                onClick={addTestimonial}
                className="px-3.5 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Testimony
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {config.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-panel-800 border border-canvas/10 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={t.author}
                      onChange={(e) =>
                        updateConfig(
                          'testimonials',
                          config.testimonials.map((item) =>
                            item.id === t.id ? { ...item, author: e.target.value } : item,
                          ),
                        )
                      }
                      className="bg-panel-900 border border-canvas/10 rounded-lg px-3 py-1.5 text-[13px] text-white font-semibold outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          'testimonials',
                          config.testimonials.filter((item) => item.id !== t.id),
                        )
                      }
                      className="text-canvas/40 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) =>
                      updateConfig(
                        'testimonials',
                        config.testimonials.map((item) =>
                          item.id === t.id ? { ...item, role: e.target.value } : item,
                        ),
                      )
                    }
                    className="w-full bg-panel-900 border border-canvas/10 rounded-lg px-3 py-1.5 text-[12px] text-canvas/80 outline-none focus:border-gold"
                  />
                  <textarea
                    rows={3}
                    value={t.quote}
                    onChange={(e) =>
                      updateConfig(
                        'testimonials',
                        config.testimonials.map((item) =>
                          item.id === t.id ? { ...item, quote: e.target.value } : item,
                        ),
                      )
                    }
                    className="w-full bg-panel-900 border border-canvas/10 rounded-lg p-3 text-[12.5px] text-white outline-none focus:border-gold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-gold" />
                <h3 className="font-serif text-[20px] text-white">Frequently Asked Questions</h3>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="px-3.5 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add FAQ
              </button>
            </div>
            <div className="space-y-4">
              {config.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 rounded-xl bg-panel-800 border border-canvas/10 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) =>
                        updateConfig(
                          'faqs',
                          config.faqs.map((f) =>
                            f.id === faq.id ? { ...f, question: e.target.value } : f,
                          ),
                        )
                      }
                      className="flex-1 bg-panel-900 border border-canvas/10 rounded-lg px-3 py-2 text-[13px] text-white font-semibold outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          'faqs',
                          config.faqs.filter((f) => f.id !== faq.id),
                        )
                      }
                      className="text-canvas/40 hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) =>
                      updateConfig(
                        'faqs',
                        config.faqs.map((f) =>
                          f.id === faq.id ? { ...f, answer: e.target.value } : f,
                        ),
                      )
                    }
                    className="w-full bg-panel-900 border border-canvas/10 rounded-lg p-3 text-[12.5px] text-canvas/85 outline-none focus:border-gold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

