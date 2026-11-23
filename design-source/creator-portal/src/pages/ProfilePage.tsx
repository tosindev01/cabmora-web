import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Building2, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
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
  Smartphone, 
  LogOut, 
  Upload, 
  Trash2, 
  Sparkles, 
  Briefcase, 
  Save, 
  RotateCcw, 
  HardDrive, 
  CreditCard, 
  MessageSquare, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  Lock, 
  Eye, 
  X, 
  ChevronRight, 
  Share2,
  Sliders
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

interface SocialLinks {
  instagram: string;
  behance: string;
  vimeo: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  website: string;
}

interface BusinessDetails {
  studioName: string;
  legalName: string;
  handle: string;
  specialization: string;
  categories: string[];
  bio: string;
  experienceYears: number;
  teamSize: string;
  currency: string;
  dayRate: number;
  taxId: string;
}

interface ContactDetails {
  primaryEmail: string;
  secondaryEmail: string;
  phone: string;
  allowSmsAlerts: boolean;
  address: string;
  city: string;
  country: string;
  timezone: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"business" | "contact" | "security" | "branding">("business");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile Image State
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces"
  );
  const [coverUrl, setCoverUrl] = useState<string>(
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&h=600&fit=crop"
  );

  // Business Details State
  const [business, setBusiness] = useState<BusinessDetails>({
    studioName: "Cabmora Creative Studios",
    legalName: "Cabmora Visual Arts LLC",
    handle: "sarah-cabmora",
    specialization: "Editorial & Fine Art Commercial Photography",
    categories: ["Editorial Photography", "4K Video Reels", "Wedding Proofing", "Drone Aerials"],
    bio: "Passionate visual artist specializing in high-fashion editorial spreads, commercial branding campaigns, and atmospheric cinematic storytelling across London & New York.",
    experienceYears: 8,
    teamSize: "2 - 5 Creatives",
    currency: "USD ($)",
    dayRate: 2500,
    taxId: "US-94820193-TX"
  });

  // Contact Details State
  const [contact, setContact] = useState<ContactDetails>({
    primaryEmail: "sarah@cabmora.com",
    secondaryEmail: "studio.inquiries@cabmora.com",
    phone: "+1 (555) 382-9012",
    allowSmsAlerts: true,
    address: "450 Fashion Avenue, Suite 1200",
    city: "New York, NY 10001",
    country: "United States",
    timezone: "UTC-05:00 (Eastern Time)"
  });

  // Social Links State
  const [socials, setSocials] = useState<SocialLinks>({
    instagram: "@sarah.cabmora",
    behance: "behance.net/sarahcabmora",
    vimeo: "vimeo.com/cabmorastudios",
    youtube: "youtube.com/@cabmoravisuals",
    linkedin: "linkedin.com/in/sarah-cabmora",
    twitter: "@cabmorastudio",
    website: "https://cabmorastudios.com"
  });

  // Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI Feedback State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAvatarUrl(evt.target.result as string);
          setHasUnsavedChanges(true);
          triggerToast("Profile photo updated! Save changes to apply across client portals.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setCoverUrl(evt.target.result as string);
          setHasUnsavedChanges(true);
          triggerToast("Studio cover banner updated!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyProfileLink = () => {
    const link = `https://cabmora.com/creators/${business.handle}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerToast("Public profile URL copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setHasUnsavedChanges(false);
    triggerToast("Creator profile, business details & contact info saved successfully!");
  };

  const handlePasswordUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      triggerToast("Please enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      triggerToast("Password must be at least 8 characters long.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Account password changed successfully!");
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#FAF9F6] flex font-sans relative overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#C9A86A] text-[#111] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-[13px] animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={handleCoverChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-[#141210] border-r border-[#FAF9F6]/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shrink-0`}>
        <div className="h-20 px-8 flex items-center border-b border-[#FAF9F6]/5">
          <Link to="/">
            <img src={LogoWhite} alt="Cabmora Logo" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">Overview</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Briefcase size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Projects</span>
          </Link>
          <Link to="/galleries" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <ImageIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Galleries</span>
          </Link>
          <Link to="/messages" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <MessageSquare size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Messages</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <CreditCard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Billing</span>
          </Link>
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <HardDrive size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#C9A86A]/10 text-[#C9A86A] transition-colors">
            <User size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Creator Profile</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[#FAF9F6]/5 space-y-2">
          <Link to="/client/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">View as Client</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <SettingsIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Settings</span>
          </Link>
          <Link to="/" className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400/80 hover:bg-red-400/10 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:ml-[280px] min-w-0 min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 px-6 lg:px-10 flex items-center justify-between border-b border-[#FAF9F6]/5 shrink-0 bg-[#141210] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#FAF9F6]/70 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <User size={22} className="text-[#C9A86A]" />
              <h1 className="font-serif text-[22px] lg:text-[24px]">Creator & Studio Profile</h1>
            </div>
            <span className="hidden sm:inline-flex bg-[#C9A86A]/20 text-[#C9A86A] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-[#C9A86A]/30">
              Verified Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-4 py-2 text-[12px] font-medium text-[#FAF9F6]/80 hover:text-white border border-[#FAF9F6]/10 rounded-xl hover:bg-[#FAF9F6]/5 transition-colors flex items-center gap-2"
            >
              <Eye size={15} className="text-[#C9A86A]" />
              <span className="hidden sm:inline">Preview Public Card</span>
            </button>

            <button 
              onClick={() => handleSaveProfile()}
              className="bg-[#C9A86A] text-[#111] px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2 shadow-lg"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </header>

        {/* Cover Photo & Studio Avatar Hero */}
        <div className="relative bg-[#141210] border-b border-[#FAF9F6]/5">
          
          {/* Banner Image */}
          <div className="h-48 sm:h-64 w-full relative overflow-hidden group">
            <img 
              src={coverUrl} 
              alt="Studio Cover" 
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/30" />
            
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 px-3.5 py-2 rounded-xl text-[11px] font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
            >
              <Camera size={14} className="text-[#C9A86A]" /> Change Cover Banner
            </button>
          </div>

          {/* Profile Header Details Bar */}
          <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              
              {/* Avatar + Name */}
              <div className="flex items-end gap-5">
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-[#141210] shadow-2xl bg-[#1A1816] relative shrink-0">
                    <img 
                      src={avatarUrl} 
                      alt={business.studioName} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Hover Overlay */}
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <Upload size={20} className="text-[#C9A86A] mb-1" />
                      <span className="text-[10px] uppercase tracking-wider font-bold">Update Photo</span>
                    </button>
                  </div>

                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-[#141210] rounded-full" title="Online & Booking Inquiries Open" />
                </div>

                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-white leading-none">
                      {business.studioName}
                    </h2>
                    <ShieldCheck size={20} className="text-[#C9A86A]" title="Verified Creator Account" />
                  </div>
                  
                  <p className="text-[13px] text-[#FAF9F6]/60 flex items-center gap-2">
                    <span>{business.specialization}</span>
                    <span>•</span>
                    <span className="text-[#C9A86A] font-medium">{contact.city}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pb-1">
                <button 
                  onClick={handleCopyProfileLink}
                  className="px-4 py-2 bg-[#1A1816] hover:bg-[#FAF9F6]/10 border border-[#FAF9F6]/10 text-[#FAF9F6] rounded-xl text-[12px] font-medium transition-colors flex items-center gap-2"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-[#C9A86A]" />}
                  <span>{copiedLink ? "Link Copied!" : "Share Profile Link"}</span>
                </button>

                <a 
                  href={socials.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#C9A86A]/10 hover:bg-[#C9A86A]/20 border border-[#C9A86A]/30 text-[#C9A86A] rounded-xl text-[12px] font-medium transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Website</span>
                </a>
              </div>

            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-[#FAF9F6]/5 px-6 lg:px-10 flex items-center gap-8 bg-[#141210] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("business")}
              className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                activeTab === "business" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
              }`}
            >
              <Building2 size={16} />
              Business & Studio Details
              {activeTab === "business" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />}
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                activeTab === "contact" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
              }`}
            >
              <Mail size={16} />
              Contact Details & Socials
              {activeTab === "contact" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />}
            </button>

            <button
              onClick={() => setActiveTab("branding")}
              className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                activeTab === "branding" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
              }`}
            >
              <Sparkles size={16} />
              Avatar & Visual Assets
              {activeTab === "branding" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 shrink-0 ${
                activeTab === "security" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
              }`}
            >
              <Lock size={16} />
              Account & Security
              {activeTab === "security" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />}
            </button>
          </div>

        </div>

        {/* Tab Content Container */}
        <div className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8">

          {/* TAB 1: BUSINESS & STUDIO DETAILS */}
          {activeTab === "business" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <form onSubmit={handleSaveProfile} className="space-y-8">
                
                {/* Core Business Info Card */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Primary Information</div>
                      <h3 className="font-serif text-[20px] text-white">Studio & Business Identity</h3>
                    </div>
                    <span className="text-[11px] text-[#FAF9F6]/40">Publicly visible to clients</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">
                        Studio / Business Name <span className="text-[#C9A86A]">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={business.studioName}
                        onChange={e => {
                          setBusiness({ ...business, studioName: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">
                        Legal Entity / Billing Name
                      </label>
                      <input 
                        type="text" 
                        value={business.legalName}
                        onChange={e => {
                          setBusiness({ ...business, legalName: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">
                        Custom Handle / URL Slug
                      </label>
                      <div className="flex items-center bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl overflow-hidden focus-within:border-[#C9A86A] transition-colors">
                        <span className="px-3 text-[12px] text-[#FAF9F6]/40 select-none bg-black/20 py-3 border-r border-[#FAF9F6]/10">
                          cabmora.com/creators/
                        </span>
                        <input 
                          type="text" 
                          value={business.handle}
                          onChange={e => {
                            setBusiness({ ...business, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-transparent px-3 py-3 text-[14px] text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">
                        Primary Creative Specialization
                      </label>
                      <input 
                        type="text" 
                        value={business.specialization}
                        onChange={e => {
                          setBusiness({ ...business, specialization: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[12px] text-[#FAF9F6]/70 font-medium">
                        Studio Bio & Pitch
                      </label>
                      <span className="text-[11px] text-[#FAF9F6]/40">
                        {business.bio.length} / 500 characters
                      </span>
                    </div>
                    <textarea 
                      rows={4}
                      maxLength={500}
                      value={business.bio}
                      onChange={e => {
                        setBusiness({ ...business, bio: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl p-4 text-[13.5px] text-white outline-none focus:border-[#C9A86A] transition-colors leading-relaxed"
                      placeholder="Describe your studio's creative philosophy, awards, or signature aesthetic..."
                    />
                  </div>
                </div>

                {/* Professional Rates & Operations */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Operational Metrics</div>
                      <h3 className="font-serif text-[20px] text-white">Rates, Tax & Team Structure</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Years of Experience</label>
                      <input 
                        type="number" 
                        value={business.experienceYears}
                        onChange={e => {
                          setBusiness({ ...business, experienceYears: parseInt(e.target.value) || 0 });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Team Scale</label>
                      <select 
                        value={business.teamSize}
                        onChange={e => {
                          setBusiness({ ...business, teamSize: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[13.5px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      >
                        <option value="Solo Principal Creator">Solo Principal Creator</option>
                        <option value="2 - 5 Creatives">2 - 5 Creatives</option>
                        <option value="6 - 15 Studio Team">6 - 15 Studio Team</option>
                        <option value="Enterprise Production Agency">Enterprise Production Agency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Base Standard Day Rate ($)</label>
                      <input 
                        type="number" 
                        value={business.dayRate}
                        onChange={e => {
                          setBusiness({ ...business, dayRate: parseInt(e.target.value) || 0 });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Business Tax / VAT Registration</label>
                      <input 
                        type="text" 
                        value={business.taxId}
                        onChange={e => {
                          setBusiness({ ...business, taxId: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Footer Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[12px] text-[#FAF9F6]/50">
                    {hasUnsavedChanges ? (
                      <span className="text-[#C9A86A] font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C9A86A] animate-pulse" />
                        You have unsaved profile changes
                      </span>
                    ) : (
                      <span>All business details synchronized with studio cloud.</span>
                    )}
                  </div>

                  <button 
                    type="submit"
                    className="bg-[#C9A86A] text-[#111] px-8 py-3 rounded-xl text-[13px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Save size={16} /> Save Business Profile
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 2: CONTACT DETAILS & SOCIALS */}
          {activeTab === "contact" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <form onSubmit={handleSaveProfile} className="space-y-8">
                
                {/* Contact Coordinates */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Communication Channels</div>
                      <h3 className="font-serif text-[20px] text-white">Direct Contact Coordinates</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Primary Business Email</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={contact.primaryEmail}
                          onChange={e => {
                            setContact({ ...contact, primaryEmail: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors pr-24"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Verified ✓
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Secondary Booking Email</label>
                      <input 
                        type="email" 
                        value={contact.secondaryEmail}
                        onChange={e => {
                          setContact({ ...contact, secondaryEmail: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Studio Phone Number</label>
                      <input 
                        type="text" 
                        value={contact.phone}
                        onChange={e => {
                          setContact({ ...contact, phone: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Studio Location & City</label>
                      <input 
                        type="text" 
                        value={contact.city}
                        onChange={e => {
                          setContact({ ...contact, city: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>
                  </div>

                  {/* SMS Alert Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={contact.allowSmsAlerts} 
                        onChange={e => {
                          setContact({ ...contact, allowSmsAlerts: e.target.checked });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-4 h-4 rounded border-[#FAF9F6]/20 bg-[#1A1816] text-[#C9A86A] focus:ring-[#C9A86A]"
                      />
                      <span className="text-[13px] text-[#FAF9F6]/80">
                        Receive instant SMS notifications when clients submit inquiry forms or approve photo proofs.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Social Networks */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Social Reach & Web Presence</div>
                      <h3 className="font-serif text-[20px] text-white">Online Profiles & Platforms</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium flex items-center gap-1.5">
                        <Instagram size={14} className="text-[#C9A86A]" /> Instagram Handle
                      </label>
                      <input 
                        type="text" 
                        value={socials.instagram}
                        onChange={e => {
                          setSocials({ ...socials, instagram: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium flex items-center gap-1.5">
                        <Globe size={14} className="text-[#C9A86A]" /> Main Studio Website
                      </label>
                      <input 
                        type="text" 
                        value={socials.website}
                        onChange={e => {
                          setSocials({ ...socials, website: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium flex items-center gap-1.5">
                        <Video size={14} className="text-[#C9A86A]" /> Vimeo Showcase
                      </label>
                      <input 
                        type="text" 
                        value={socials.vimeo}
                        onChange={e => {
                          setSocials({ ...socials, vimeo: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium flex items-center gap-1.5">
                        <Youtube size={14} className="text-[#C9A86A]" /> YouTube Channel
                      </label>
                      <input 
                        type="text" 
                        value={socials.youtube}
                        onChange={e => {
                          setSocials({ ...socials, youtube: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#C9A86A] text-[#111] px-8 py-3 rounded-xl text-[13px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Save size={16} /> Save Contact Info
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 3: AVATAR & VISUAL ASSETS */}
          {activeTab === "branding" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Profile Avatar Card */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Profile Portrait</div>
                    <h3 className="font-serif text-[20px] text-white">Creator Avatar Image</h3>
                    <p className="text-[12px] text-[#FAF9F6]/50 mt-1">
                      Appears on client proofing galleries, watermarks, and direct messages.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#C9A86A] shadow-2xl relative">
                      <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="bg-[#C9A86A] text-[#111] px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2"
                      >
                        <Upload size={14} /> Upload New Photo
                      </button>

                      <button 
                        onClick={() => {
                          setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces");
                          triggerToast("Reset avatar to default sample photo");
                        }}
                        className="p-2 border border-[#FAF9F6]/10 rounded-xl text-[#FAF9F6]/60 hover:text-white hover:bg-[#FAF9F6]/5 transition-colors"
                        title="Reset to sample"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#FAF9F6]/40 text-center">
                      Recommended size: 400x400px • JPG, PNG or WEBP (Max 10MB)
                    </p>
                  </div>
                </div>

                {/* Banner Photo Card */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Hero Showcase</div>
                    <h3 className="font-serif text-[20px] text-white">Studio Cover Banner</h3>
                    <p className="text-[12px] text-[#FAF9F6]/50 mt-1">
                      Sets the artistic tone for your public portfolio and client hub.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 rounded-xl overflow-hidden border border-[#FAF9F6]/10 relative">
                      <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => coverInputRef.current?.click()}
                        className="bg-[#1A1816] border border-[#FAF9F6]/10 text-white px-4 py-2 rounded-xl text-[12px] font-medium hover:border-[#C9A86A] transition-colors flex items-center gap-2"
                      >
                        <Camera size={14} className="text-[#C9A86A]" /> Replace Cover Banner
                      </button>

                      <span className="text-[11px] text-[#FAF9F6]/40">1600x600px suggested</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: ACCOUNT & SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Change Password */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#FAF9F6]/10 pb-4">
                    <Key size={18} className="text-[#C9A86A]" />
                    <h3 className="font-serif text-[20px] text-white">Change Account Password</h3>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-[#FAF9F6]/70 mb-2 font-medium">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#C9A86A] text-[#111] py-3 rounded-xl text-[13px] font-semibold hover:bg-[#B8965C] transition-colors shadow-lg"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* 2FA & Active Sessions */}
                <div className="space-y-6">
                  
                  <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                      <div className="flex items-center gap-2">
                        <Smartphone size={18} className="text-[#C9A86A]" />
                        <h3 className="font-serif text-[18px] text-white">Two-Factor Authentication (2FA)</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        twoFactorEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400"
                      }`}>
                        {twoFactorEnabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[#FAF9F6]/60 leading-relaxed">
                      Protect high-resolution client RAW deliverables and financial billing controls with TOTP Authenticator apps.
                    </p>

                    <button 
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        triggerToast(twoFactorEnabled ? "2FA authentication disabled" : "2FA authentication activated!");
                      }}
                      className="w-full py-2.5 bg-[#1A1816] hover:bg-[#FAF9F6]/10 border border-[#FAF9F6]/10 text-white rounded-xl text-[12px] font-medium transition-colors"
                    >
                      {twoFactorEnabled ? "Manage 2FA Settings" : "Enable 2FA Protection"}
                    </button>
                  </div>

                  {/* Active Login Session */}
                  <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-[16px] text-white">Current Active Session</h4>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        This Device
                      </span>
                    </div>

                    <div className="p-3 bg-[#1A1816] rounded-xl border border-[#FAF9F6]/5 text-[12px] space-y-1">
                      <div className="font-medium text-white">MacBook Pro • Chrome on macOS</div>
                      <div className="text-[11px] text-[#FAF9F6]/40">New York, USA • IP 192.168.1.1 (Last active: Just now)</div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* PUBLIC CREATOR CARD PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-[#FAF9F6]/10 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl space-y-0 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#FAF9F6]/10 flex items-center justify-between bg-[#1A1816]">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#C9A86A]">
                <Eye size={15} /> Public Creator Card Preview
              </div>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-[#FAF9F6]/40 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Public Card Graphic */}
            <div className="p-6 space-y-6">
              
              {/* Card Banner */}
              <div className="h-28 rounded-xl overflow-hidden relative">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210] to-transparent" />
              </div>

              {/* Card Info */}
              <div className="flex items-start gap-4 -mt-12 px-2 relative z-10">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-xl object-cover border-2 border-[#C9A86A] shadow-xl bg-[#1A1816]" 
                />
                <div className="pt-8">
                  <h3 className="font-serif text-[20px] font-bold text-white flex items-center gap-1.5">
                    {business.studioName}
                    <ShieldCheck size={16} className="text-[#C9A86A]" />
                  </h3>
                  <p className="text-[12px] text-[#FAF9F6]/60">{business.specialization}</p>
                </div>
              </div>

              <p className="text-[12.5px] text-[#FAF9F6]/80 leading-relaxed italic px-2">
                "{business.bio}"
              </p>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#1A1816] rounded-xl border border-[#FAF9F6]/5 text-[12px]">
                <div>
                  <span className="text-[10px] text-[#FAF9F6]/40 uppercase tracking-wider block">Day Rate</span>
                  <span className="font-serif font-bold text-[#C9A86A] text-[15px]">${business.dayRate} USD</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#FAF9F6]/40 uppercase tracking-wider block">Location</span>
                  <span className="font-medium text-white">{contact.city}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-[#C9A86A] text-[#111] px-6 py-2 rounded-xl text-[12px] font-semibold hover:bg-[#B8965C] transition-colors"
                >
                  Close Preview
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

    </div>
  );
}
