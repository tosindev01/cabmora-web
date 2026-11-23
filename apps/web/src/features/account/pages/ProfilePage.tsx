import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';

import { useAuth } from '@/shared/auth';
import { AvatarField } from '@/shared/account/components/AvatarField';
import {
  User,
  Building2,
  Camera,
  Mail,
  Globe,
  Instagram,
  Youtube,
  Video,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Key,
  Sparkles,
  Save,
  Lock,
  Eye,
  LayoutTemplate,
  Inbox,
  Calendar,
  MapPin,
} from 'lucide-react';
import { PortalShell, PortalTopbar } from '@/shared/portal';
import { accountApi, ApiError } from '@cabmora/api-client';
import { Modal } from '@cabmora/ui';
import {
  BusinessDetails,
  ContactDetails,
  SocialLinks,
  DEFAULT_LANDING_CONFIG,
  DEFAULT_PORTFOLIO_ITEMS,
  DEFAULT_STUDIO_PROFILE,
  loadCreatorStudioProfile,
  saveCreatorStudioProfile,
  loadCreatorBookings,
  updateCreatorBookingStatus,
  type CreatorBookingRequestDto,
  type CreatorPortfolioItemDto,
  type CreatorStudioProfileDto,
  type LandingConfigDto,
} from '@/features/account/data';
import { LandingPageBuilder } from '@/features/account/components/LandingPageBuilder';
import { CreatorLandingRenderer } from '@/features/account/components/CreatorLandingRenderer';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    'landing' | 'business' | 'contact' | 'branding' | 'bookings' | 'security'
  >('landing');

  /* The signed URL the server returned, not a stock photograph.
  
     This page used to hold its own avatar state, seeded from Unsplash, and
     its picker read the chosen file into a data URL and told you the photo
     was "updated". Nothing was ever sent. A screen that reports success for
     work it did not do is worse than one that fails, because there is
     nothing to report. The upload now goes through `AvatarField`, the same
     control the settings page uses, and `avatar_url` expires in about
     fifteen minutes so it is read fresh rather than cached. */
  const { user, refresh } = useAuth();
  const avatarUrl = user?.avatar_url ?? '';
  const [coverUrl, setCoverUrl] = useState<string>(
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&h=600&fit=crop',
  );

  // Business Details State
  const [business, setBusiness] = useState<BusinessDetails>({
    studioName: 'Cabmora Creative Studios',
    legalName: 'Cabmora Visual Arts LLC',
    handle: 'sarah-cabmora',
    specialization: 'Editorial & Fine Art Commercial Photography',
    categories: ['Editorial Photography', '4K Video Reels', 'Wedding Proofing', 'Drone Aerials'],
    bio: 'Passionate visual artist specializing in high-fashion editorial spreads, commercial branding campaigns, and atmospheric cinematic storytelling across London & New York.',
    experienceYears: 8,
    teamSize: '2 - 5 Creatives',
    currency: 'USD ($)',
    dayRate: 2500,
    taxId: 'US-94820193-TX',
  });

  // Contact Details State
  const [contact, setContact] = useState<ContactDetails>({
    primaryEmail: 'sarah@cabmora.com',
    secondaryEmail: 'studio.inquiries@cabmora.com',
    phone: '+1 (555) 382-9012',
    allowSmsAlerts: true,
    address: '450 Fashion Avenue, Suite 1200',
    city: 'New York, NY 10001',
    country: 'United States',
    timezone: 'UTC-05:00 (Eastern Time)',
  });

  // Social Links State
  const [socials, setSocials] = useState<SocialLinks>({
    instagram: '@sarah.cabmora',
    behance: 'behance.net/sarahcabmora',
    vimeo: 'vimeo.com/cabmorastudios',
    youtube: 'youtube.com/@cabmoravisuals',
    linkedin: 'linkedin.com/in/sarah-cabmora',
    twitter: '@cabmorastudio',
    website: 'https://cabmorastudios.com',
  });

  // Security Settings State
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Feedback State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Advanced Landing Page & Portfolio State
  const [isPublished, setIsPublished] = useState(true);
  const [landingConfig, setLandingConfig] = useState<LandingConfigDto>(DEFAULT_LANDING_CONFIG);
  const [portfolioItems, setPortfolioItems] =
    useState<CreatorPortfolioItemDto[]>(DEFAULT_PORTFOLIO_ITEMS);
  const [bookings, setBookings] = useState<CreatorBookingRequestDto[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    loadCreatorStudioProfile().then(({ profile }) => {
      if (!active) return;
      setIsPublished(profile.is_published);
      setCoverUrl(profile.cover_url || DEFAULT_STUDIO_PROFILE.cover_url);
      setBusiness({
        studioName: profile.studio_name || DEFAULT_STUDIO_PROFILE.studio_name,
        legalName: profile.legal_name || DEFAULT_STUDIO_PROFILE.legal_name,
        handle: profile.slug || DEFAULT_STUDIO_PROFILE.slug,
        specialization: profile.specialization || DEFAULT_STUDIO_PROFILE.specialization,
        categories:
          profile.categories?.length > 0 ? profile.categories : DEFAULT_STUDIO_PROFILE.categories,
        bio: profile.bio || DEFAULT_STUDIO_PROFILE.bio,
        experienceYears: profile.experience_years ?? DEFAULT_STUDIO_PROFILE.experience_years,
        teamSize: profile.team_size || DEFAULT_STUDIO_PROFILE.team_size,
        currency: profile.currency || DEFAULT_STUDIO_PROFILE.currency,
        dayRate: profile.day_rate ?? DEFAULT_STUDIO_PROFILE.day_rate,
        taxId: profile.tax_id || DEFAULT_STUDIO_PROFILE.tax_id,
      });
      setContact({
        primaryEmail: profile.primary_email || DEFAULT_STUDIO_PROFILE.primary_email,
        secondaryEmail: profile.secondary_email || DEFAULT_STUDIO_PROFILE.secondary_email,
        phone: profile.phone || DEFAULT_STUDIO_PROFILE.phone,
        allowSmsAlerts: profile.allow_sms_alerts ?? true,
        address: profile.address || DEFAULT_STUDIO_PROFILE.address,
        city: profile.city || DEFAULT_STUDIO_PROFILE.city,
        country: profile.country || DEFAULT_STUDIO_PROFILE.country,
        timezone: profile.timezone || DEFAULT_STUDIO_PROFILE.timezone,
      });
      setSocials({
        ...DEFAULT_STUDIO_PROFILE.socials,
        ...(profile.socials ?? {}),
      });
      setLandingConfig({
        ...DEFAULT_LANDING_CONFIG,
        ...(profile.landing_config ?? {}),
        sections_visibility: {
          ...DEFAULT_LANDING_CONFIG.sections_visibility,
          ...(profile.landing_config?.sections_visibility ?? {}),
        },
      });
      setPortfolioItems(
        profile.portfolio_items?.length > 0 ? profile.portfolio_items : DEFAULT_PORTFOLIO_ITEMS,
      );
    });

    loadCreatorBookings().then((rows) => {
      if (active) setBookings(rows);
    });

    return () => {
      active = false;
    };
  }, []);

  const buildStudioPayload = (): CreatorStudioProfileDto => ({
    slug: business.handle || 'sarah-cabmora',
    is_published: isPublished,
    studio_name: business.studioName,
    legal_name: business.legalName,
    specialization: business.specialization,
    categories: business.categories,
    bio: business.bio,
    experience_years: business.experienceYears,
    team_size: business.teamSize,
    currency: business.currency,
    day_rate: business.dayRate,
    tax_id: business.taxId,
    cover_url: coverUrl,
    avatar_url: avatarUrl || DEFAULT_STUDIO_PROFILE.avatar_url,
    primary_email: contact.primaryEmail,
    secondary_email: contact.secondaryEmail,
    phone: contact.phone,
    allow_sms_alerts: contact.allowSmsAlerts,
    address: contact.address,
    city: contact.city,
    country: contact.country,
    timezone: contact.timezone,
    socials,
    landing_config: landingConfig,
    portfolio_items: portfolioItems,
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setCoverUrl(evt.target.result as string);
          setHasUnsavedChanges(true);
          triggerToast('Studio cover banner updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/creators/${business.handle}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerToast('Public landing page URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { syncedWithApi } = await saveCreatorStudioProfile(buildStudioPayload());
      setHasUnsavedChanges(false);
      triggerToast(
        syncedWithApi
          ? 'Studio profile, landing page & portfolio saved to database!'
          : 'Landing page & profile saved locally (start backend API to sync to database).',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleBookingStatusChange = async (
    bookingId: string,
    status: CreatorBookingRequestDto['status'],
  ) => {
    const updated = await updateCreatorBookingStatus(bookingId, status);
    setBookings(updated);
    triggerToast(`Booking marked as ${status}.`);
  };

  /* This used to validate the three boxes, clear them, and announce "Account
     password changed successfully!" without calling anything. Somebody could
     change their password, be told it worked, and still have the old one. */
  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      triggerToast('Please enter your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('New passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      triggerToast('Password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await accountApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Account password changed.');
    } catch (err: unknown) {
      // The server's own words: it knows whether the current password was
      // wrong, too short, or the same as before, and saying so beats a generic
      // failure the reader cannot act on.
      triggerToast(err instanceof ApiError ? err.message : 'Your password could not be changed.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PortalShell variant="dark">
      {({ toggleSidebar }) => (
        <>
          {/* Toast Notification */}
          {toastMsg && (
            <div className="fixed top-6 right-6 z-50 bg-gold text-ink px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-[13px] animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 size={18} />
              {toastMsg}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <main className="flex-1 flex flex-col min-w-0 min-h-screen">
            <PortalTopbar
              title="Creator & Studio Profile"
              icon={User}
              variant="dark"
              onToggleSidebar={toggleSidebar}
            >
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="px-4 py-2 text-[12px] font-medium text-canvas/80 hover:text-white border border-canvas/10 rounded-xl hover:bg-canvas/5 transition-colors flex items-center gap-2"
              >
                <Eye size={15} className="text-gold" />
                <span className="hidden sm:inline">Preview Landing Page</span>
              </button>

              <button
                onClick={() => void handleSaveProfile()}
                disabled={isSavingProfile}
                className="bg-gold text-ink px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2 shadow-lg disabled:opacity-60"
              >
                <Save size={16} />
                <span>{isSavingProfile ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </PortalTopbar>

            {/* Cover Photo & Studio Avatar Hero */}
            <div className="relative bg-panel-900 border-b border-canvas/5">
              {/* Banner Image */}
              <div className="h-48 sm:h-64 w-full relative overflow-hidden group">
                <img
                  src={coverUrl}
                  alt="Studio Cover"
                  className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel-900 via-transparent to-black/30" />

                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 px-3.5 py-2 rounded-xl text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
                >
                  <Camera size={14} className="text-gold" /> Change Cover Banner
                </button>
              </div>

              {/* Profile Header Details Bar */}
              <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
                  {/* Avatar + Name */}
                  <div className="flex items-end gap-5">
                    <div className="relative group">
                      {user && <AvatarField user={user} onUploaded={() => void refresh()} />}

                      <span
                        className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-panel-900 rounded-full"
                        title="Online & Booking Inquiries Open"
                      />
                    </div>

                    <div className="space-y-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-white leading-none">
                          {business.studioName}
                        </h2>
                        <ShieldCheck
                          size={20}
                          className="text-gold"
                          aria-label="Verified Creator Account"
                        />
                      </div>

                      <p className="text-[13px] text-canvas/60 flex items-center gap-2">
                        <span>{business.specialization}</span>
                        <span>•</span>
                        <span className="text-gold font-medium">{contact.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pb-1">
                    <button
                      onClick={handleCopyProfileLink}
                      className="px-4 py-2 bg-panel-800 hover:bg-canvas/10 border border-canvas/10 text-canvas rounded-xl text-[12px] font-medium transition-colors flex items-center gap-2"
                    >
                      {copiedLink ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} className="text-gold" />
                      )}
                      <span>{copiedLink ? 'Link Copied!' : 'Share Profile Link'}</span>
                    </button>

                    <a
                      href={`/creators/${business.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold rounded-xl text-[12px] font-medium transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} />
                      <span>Open Landing Page</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-t border-canvas/5 px-6 lg:px-10 flex items-center gap-8 bg-panel-900 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'landing'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <LayoutTemplate size={16} />
                  Landing Page Studio
                  {activeTab === 'landing' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('business')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'business'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <Building2 size={16} />
                  Business & Studio Details
                  {activeTab === 'business' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'bookings'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <Inbox size={16} />
                  Client Bookings
                  {bookings.filter((b) => b.status === 'new').length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gold text-ink">
                      {bookings.filter((b) => b.status === 'new').length}
                    </span>
                  )}
                  {activeTab === 'bookings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('contact')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'contact'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <Mail size={16} />
                  Contact Details & Socials
                  {activeTab === 'contact' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'branding'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <Sparkles size={16} />
                  Avatar & Visual Assets
                  {activeTab === 'branding' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                    activeTab === 'security'
                      ? 'text-gold font-semibold'
                      : 'text-canvas/50 hover:text-white'
                  }`}
                >
                  <Lock size={16} />
                  Account & Security
                  {activeTab === 'security' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8">
              {/* TAB 0: ADVANCED LANDING PAGE STUDIO */}
              {activeTab === 'landing' && (
                <LandingPageBuilder
                  slug={business.handle}
                  isPublished={isPublished}
                  onSlugChange={(nextSlug) => {
                    setBusiness({ ...business, handle: nextSlug });
                    setHasUnsavedChanges(true);
                  }}
                  onPublishedChange={(nextPublished) => {
                    setIsPublished(nextPublished);
                    setHasUnsavedChanges(true);
                  }}
                  config={landingConfig}
                  onConfigChange={(nextConfig) => {
                    setLandingConfig(nextConfig);
                    setHasUnsavedChanges(true);
                  }}
                  portfolioItems={portfolioItems}
                  onPortfolioChange={(nextItems) => {
                    setPortfolioItems(nextItems);
                    setHasUnsavedChanges(true);
                  }}
                  onOpenFullPreview={() => setIsPreviewModalOpen(true)}
                />
              )}

              {/* TAB 1: BUSINESS & STUDIO DETAILS */}
              {activeTab === 'business' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    {/* Core Business Info Card */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                            Primary Information
                          </div>
                          <h3 className="font-serif text-[20px] text-white">
                            Studio & Business Identity
                          </h3>
                        </div>
                        <span className="text-[11px] text-canvas/40">
                          Publicly visible to clients
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Studio / Business Name <span className="text-gold">*</span>
                          </label>
                          <input
                            type="text"
                            value={business.studioName}
                            onChange={(e) => {
                              setBusiness({ ...business, studioName: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Legal Entity / Billing Name
                          </label>
                          <input
                            type="text"
                            value={business.legalName}
                            onChange={(e) => {
                              setBusiness({ ...business, legalName: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Custom Handle / URL Slug
                          </label>
                          <div className="flex items-center bg-panel-800 border border-canvas/10 rounded-xl overflow-hidden focus-within:border-gold transition-colors">
                            <span className="px-3 text-[12px] text-canvas/40 select-none bg-black/20 py-3 border-r border-canvas/10">
                              cabmora.com/creators/
                            </span>
                            <input
                              type="text"
                              value={business.handle}
                              onChange={(e) => {
                                setBusiness({
                                  ...business,
                                  handle: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                                });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full bg-transparent px-3 py-3 text-[14px] text-white outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Primary Creative Specialization
                          </label>
                          <input
                            type="text"
                            value={business.specialization}
                            onChange={(e) => {
                              setBusiness({ ...business, specialization: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[12px] text-canvas/70 font-medium">
                            Studio Bio & Pitch
                          </label>
                          <span className="text-[11px] text-canvas/40">
                            {business.bio.length} / 500 characters
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          maxLength={500}
                          value={business.bio}
                          onChange={(e) => {
                            setBusiness({ ...business, bio: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-panel-800 border border-canvas/10 rounded-xl p-4 text-[13.5px] text-white outline-none focus:border-gold transition-colors leading-relaxed"
                          placeholder="Describe your studio's creative philosophy, awards, or signature aesthetic..."
                        />
                      </div>
                    </div>

                    {/* Professional Rates & Operations */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                            Operational Metrics
                          </div>
                          <h3 className="font-serif text-[20px] text-white">
                            Rates, Tax & Team Structure
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            value={business.experienceYears}
                            onChange={(e) => {
                              setBusiness({
                                ...business,
                                experienceYears: parseInt(e.target.value) || 0,
                              });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Team Scale
                          </label>
                          <select
                            value={business.teamSize}
                            onChange={(e) => {
                              setBusiness({ ...business, teamSize: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-gold transition-colors"
                          >
                            <option value="Solo Principal Creator">Solo Principal Creator</option>
                            <option value="2 - 5 Creatives">2 - 5 Creatives</option>
                            <option value="6 - 15 Studio Team">6 - 15 Studio Team</option>
                            <option value="Enterprise Production Agency">
                              Enterprise Production Agency
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Base Standard Day Rate ($)
                          </label>
                          <input
                            type="number"
                            value={business.dayRate}
                            onChange={(e) => {
                              setBusiness({ ...business, dayRate: parseInt(e.target.value) || 0 });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Business Tax / VAT Registration
                          </label>
                          <input
                            type="text"
                            value={business.taxId}
                            onChange={(e) => {
                              setBusiness({ ...business, taxId: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Footer Action */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[12px] text-canvas/50">
                        {hasUnsavedChanges ? (
                          <span className="text-gold font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                            You have unsaved profile changes
                          </span>
                        ) : (
                          <span>All business details synchronized with studio cloud.</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-gold text-ink px-8 py-3 rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <Save size={16} /> Save Business Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: CONTACT DETAILS & SOCIALS */}
              {activeTab === 'contact' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    {/* Contact Coordinates */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                            Communication Channels
                          </div>
                          <h3 className="font-serif text-[20px] text-white">
                            Direct Contact Coordinates
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Primary Business Email
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={contact.primaryEmail}
                              onChange={(e) => {
                                setContact({ ...contact, primaryEmail: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors pr-24"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              Verified ✓
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Secondary Booking Email
                          </label>
                          <input
                            type="email"
                            value={contact.secondaryEmail}
                            onChange={(e) => {
                              setContact({ ...contact, secondaryEmail: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Studio Phone Number
                          </label>
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => {
                              setContact({ ...contact, phone: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Studio Location & City
                          </label>
                          <input
                            type="text"
                            value={contact.city}
                            onChange={(e) => {
                              setContact({ ...contact, city: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      {/* SMS Alert Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={contact.allowSmsAlerts}
                            onChange={(e) => {
                              setContact({ ...contact, allowSmsAlerts: e.target.checked });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-4 h-4 rounded border-canvas/20 bg-panel-800 text-gold focus:ring-gold"
                          />
                          <span className="text-[13px] text-canvas/80">
                            Receive instant SMS notifications when clients submit inquiry forms or
                            approve photo proofs.
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Social Networks */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                            Social Reach & Web Presence
                          </div>
                          <h3 className="font-serif text-[20px] text-white">
                            Online Profiles & Platforms
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium flex items-center gap-1.5">
                            <Instagram size={14} className="text-gold" /> Instagram Handle
                          </label>
                          <input
                            type="text"
                            value={socials.instagram}
                            onChange={(e) => {
                              setSocials({ ...socials, instagram: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium flex items-center gap-1.5">
                            <Globe size={14} className="text-gold" /> Main Studio Website
                          </label>
                          <input
                            type="text"
                            value={socials.website}
                            onChange={(e) => {
                              setSocials({ ...socials, website: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium flex items-center gap-1.5">
                            <Video size={14} className="text-gold" /> Vimeo Showcase
                          </label>
                          <input
                            type="text"
                            value={socials.vimeo}
                            onChange={(e) => {
                              setSocials({ ...socials, vimeo: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium flex items-center gap-1.5">
                            <Youtube size={14} className="text-gold" /> YouTube Channel
                          </label>
                          <input
                            type="text"
                            value={socials.youtube}
                            onChange={(e) => {
                              setSocials({ ...socials, youtube: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-gold text-ink px-8 py-3 rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <Save size={16} /> Save Contact Info
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: AVATAR & VISUAL ASSETS */}
              {activeTab === 'branding' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Avatar Card */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                          Profile Portrait
                        </div>
                        <h3 className="font-serif text-[20px] text-white">Creator Avatar Image</h3>
                        <p className="text-[12px] text-canvas/50 mt-1">
                          Appears on client proofing galleries, watermarks, and direct messages.
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gold shadow-2xl relative">
                          <img
                            src={avatarUrl}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* One uploader on the page. The second control here
                            pointed at the same mockup, and "reset to sample"
                            set the picture back to a stock photograph of a
                            stranger — which was only ever sensible while
                            nothing was being saved. */}
                        <p className="text-[11px] text-canvas/40 text-center">
                          Change your picture at the top of this page. JPEG, PNG or WebP, up to 8
                          MB.
                        </p>
                      </div>
                    </div>

                    {/* Banner Photo Card */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                          Hero Showcase
                        </div>
                        <h3 className="font-serif text-[20px] text-white">Studio Cover Banner</h3>
                        <p className="text-[12px] text-canvas/50 mt-1">
                          Sets the artistic tone for your public portfolio and client hub.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="h-32 rounded-xl overflow-hidden border border-canvas/10 relative">
                          <img
                            src={coverUrl}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => coverInputRef.current?.click()}
                            className="bg-panel-800 border border-canvas/10 text-white px-4 py-2 rounded-xl text-[12px] font-medium hover:border-gold transition-colors flex items-center gap-2"
                          >
                            <Camera size={14} className="text-gold" /> Replace Cover Banner
                          </button>

                          <span className="text-[11px] text-canvas/40">1600x600px suggested</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CLIENT BOOKINGS INBOX */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-canvas/10 pb-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                          Incoming Commissions
                        </div>
                        <h3 className="font-serif text-[20px] text-white">
                          Client Booking Applications ({bookings.length})
                        </h3>
                      </div>
                      <a
                        href={`/creators/${business.handle}#creator-booking-section`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-panel-800 border border-canvas/15 text-[12px] text-gold hover:border-gold flex items-center gap-2"
                      >
                        <span>View Live Booking Form</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="py-12 text-center text-canvas/50 text-[13.5px]">
                        No booking requests yet. Share your landing page link to start receiving
                        client applications.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((bk) => (
                          <div
                            key={bk.id}
                            className="p-5 rounded-2xl bg-panel-800 border border-canvas/10 space-y-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <h4 className="font-serif text-[18px] font-bold text-white">
                                    {bk.client_name}
                                  </h4>
                                  {bk.company_or_brand && (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-canvas/10 text-canvas/80">
                                      {bk.company_or_brand}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[12px] text-canvas/60 mt-1 flex flex-wrap items-center gap-3">
                                  <span>{bk.client_email}</span>
                                  {bk.client_phone && <span>• {bk.client_phone}</span>}
                                  {bk.service_title && (
                                    <span className="text-gold font-medium">
                                      • {bk.service_title}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <select
                                value={bk.status}
                                onChange={(e) =>
                                  void handleBookingStatusChange(
                                    bk.id,
                                    e.target.value as CreatorBookingRequestDto['status'],
                                  )
                                }
                                className="bg-panel-900 border border-gold/30 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-gold outline-none"
                              >
                                <option value="new">New Inquiry</option>
                                <option value="contacted">Contacted</option>
                                <option value="booked">Booked</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>

                            <p className="text-[13px] text-canvas/85 leading-relaxed bg-panel-900/70 p-3.5 rounded-xl border border-canvas/5">
                              {bk.project_brief}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-canvas/55">
                              {bk.preferred_date && (
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={12} className="text-gold" />
                                  {bk.preferred_date}
                                </span>
                              )}
                              {bk.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={12} className="text-gold" />
                                  {bk.location}
                                </span>
                              )}
                              {bk.budget_range && (
                                <span className="text-gold font-semibold">
                                  Budget: {bk.budget_range}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ACCOUNT & SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Change Password */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                      <div className="flex items-center gap-2 border-b border-canvas/10 pb-4">
                        <Key size={18} className="text-gold" />
                        <h3 className="font-serif text-[20px] text-white">
                          Change Account Password
                        </h3>
                      </div>

                      <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] text-canvas/70 mb-2 font-medium">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="w-full bg-gold text-ink py-3 rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {changingPassword ? 'Changing…' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* FULL INTERACTIVE LANDING PAGE PREVIEW MODAL */}
          {isPreviewModalOpen && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsPreviewModalOpen(false);
              }}
              layout="fullscreen"
              tone="dark"
              chrome="none"
              title="Creator landing page preview"
            >
              <div className="w-full h-full overflow-y-auto">
                <CreatorLandingRenderer
                  profile={buildStudioPayload()}
                  isPreview
                  onClosePreview={() => setIsPreviewModalOpen(false)}
                />
              </div>
            </Modal>
          )}
        </>
      )}
    </PortalShell>
  );
}
