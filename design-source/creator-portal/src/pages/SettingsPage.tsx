import { useState, useRef, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  Briefcase, 
  Image as ImageIcon, 
  MessageSquare, 
  CreditCard, 
  HardDrive,
  User,
  Upload, 
  Sliders, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Type, 
  Layers, 
  Grid, 
  Sparkles, 
  Save, 
  Eye, 
  Lock, 
  Info,
  Maximize2,
  Minimize2,
  FileCheck,
  Zap,
  CheckCircle2,
  X
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

type WatermarkPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "center-left" 
  | "center" 
  | "center-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right" 
  | "repeat-tile";

interface WatermarkConfig {
  type: "image" | "text";
  imageUrl: string;
  imageName: string;
  text: string;
  fontFamily: string;
  textColor: string;
  opacity: number; // 0 - 100
  scale: number; // 5 - 60
  position: WatermarkPosition;
  rotation: number; // -90 to 90
  blendMode: "normal" | "overlay" | "screen" | "multiply" | "soft-light";
  margin: number; // 2 - 12 (%)
  applyToProofGalleries: boolean;
  applyToWebExports: boolean;
  removeOnPaidDownload: boolean;
}

const SAMPLE_MEDIA = [
  { id: "s1", name: "Wedding Portrait (Light)", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop" },
  { id: "s2", name: "Moody Editorial (Dark)", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=800&fit=crop" },
  { id: "s3", name: "Commercial Architecture", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&h=800&fit=crop" },
  { id: "s4", name: "Golden Hour Sunset", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=800&fit=crop" },
];

const PRESET_LOGOS = [
  { id: "pl1", name: "Cabmora Studio Crest", url: LogoWhite },
  { id: "pl2", name: "Minimal Copyright Mark", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop" },
  { id: "pl3", name: "Signature Script", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=300&fit=crop" }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"watermark" | "account" | "branding">("watermark");
  
  // Watermark State
  const [config, setConfig] = useState<WatermarkConfig>({
    type: "image",
    imageUrl: LogoWhite,
    imageName: "cabmora_white_logo.svg",
    text: "© CABMORA STUDIO — PROOF COPY",
    fontFamily: "Playfair Display",
    textColor: "#FFFFFF",
    opacity: 65,
    scale: 22,
    position: "bottom-right",
    rotation: 0,
    blendMode: "normal",
    margin: 5,
    applyToProofGalleries: true,
    applyToWebExports: true,
    removeOnPaidDownload: true,
  });

  const [selectedSample, setSelectedSample] = useState(SAMPLE_MEDIA[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setConfig(prev => ({
            ...prev,
            type: "image",
            imageUrl: event.target!.result as string,
            imageName: file.name
          }));
          triggerToast(`Uploaded logo: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    triggerToast("Watermark protection rules & layout updated across all client galleries!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setConfig({
      type: "image",
      imageUrl: LogoWhite,
      imageName: "cabmora_white_logo.svg",
      text: "© CABMORA STUDIO — PROOF COPY",
      fontFamily: "Playfair Display",
      textColor: "#FFFFFF",
      opacity: 65,
      scale: 22,
      position: "bottom-right",
      rotation: 0,
      blendMode: "normal",
      margin: 5,
      applyToProofGalleries: true,
      applyToWebExports: true,
      removeOnPaidDownload: true,
    });
    triggerToast("Reset watermark settings to factory defaults");
  };

  // Dynamic inline styles for watermark position on live preview canvas
  const getWatermarkPositionStyle = () => {
    const marginPct = `${config.margin}%`;
    const transformRot = `rotate(${config.rotation}deg)`;

    if (config.position === "repeat-tile") {
      return {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "1.5rem",
        inset: 0,
        alignItems: "center",
        justifyItems: "center",
        opacity: config.opacity / 100,
        mixBlendMode: config.blendMode,
      };
    }

    let posStyles: Record<string, string> = {
      opacity: (config.opacity / 100).toString(),
      mixBlendMode: config.blendMode,
      transform: transformRot,
    };

    switch (config.position) {
      case "top-left":
        posStyles.top = marginPct;
        posStyles.left = marginPct;
        break;
      case "top-center":
        posStyles.top = marginPct;
        posStyles.left = "50%";
        posStyles.transform = `translateX(-50%) ${transformRot}`;
        break;
      case "top-right":
        posStyles.top = marginPct;
        posStyles.right = marginPct;
        break;
      case "center-left":
        posStyles.top = "50%";
        posStyles.left = marginPct;
        posStyles.transform = `translateY(-50%) ${transformRot}`;
        break;
      case "center":
        posStyles.top = "50%";
        posStyles.left = "50%";
        posStyles.transform = `translate(-50%, -50%) ${transformRot}`;
        break;
      case "center-right":
        posStyles.top = "50%";
        posStyles.right = marginPct;
        posStyles.transform = `translateY(-50%) ${transformRot}`;
        break;
      case "bottom-left":
        posStyles.bottom = marginPct;
        posStyles.left = marginPct;
        break;
      case "bottom-center":
        posStyles.bottom = marginPct;
        posStyles.left = "50%";
        posStyles.transform = `translateX(-50%) ${transformRot}`;
        break;
      case "bottom-right":
      default:
        posStyles.bottom = marginPct;
        posStyles.right = marginPct;
        break;
    }

    return posStyles;
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#FAF9F6] flex font-sans relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#C9A86A] text-[#111] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-[13px] animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-[#141210] border-r border-[#FAF9F6]/5 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 px-8 flex items-center border-b border-[#FAF9F6]/5">
          <img src={LogoWhite} alt="Cabmora Logo" className="h-7 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
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
          <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <User size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Creator Profile</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[#FAF9F6]/5 space-y-2">
          <Link to="/client/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">View as Client</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#C9A86A]/10 text-[#C9A86A] transition-colors">
            <SettingsIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400/80 hover:bg-red-400/10 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-[#FAF9F6]/5 shrink-0 bg-[#141210]">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-[24px]">Studio Settings</h1>
            <span className="bg-[#C9A86A]/20 text-[#C9A86A] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-[#C9A86A]/30">
              Pro Protection Engine
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleResetDefaults}
              className="px-4 py-2 text-[12px] text-[#FAF9F6]/60 hover:text-white flex items-center gap-2 border border-[#FAF9F6]/10 rounded-lg hover:bg-[#FAF9F6]/5 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Defaults
            </button>
            <button 
              onClick={handleSaveSettings}
              className="bg-[#C9A86A] text-[#111] px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2 shadow-lg"
            >
              <Save size={16} />
              {isSaved ? "Settings Saved!" : "Save Protection Rules"}
            </button>
          </div>
        </header>

        {/* Sub-Navigation Tabs */}
        <div className="bg-[#141210] border-b border-[#FAF9F6]/5 px-8 flex items-center gap-8 shrink-0">
          <button
            onClick={() => setActiveTab("watermark")}
            className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
              activeTab === "watermark" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
            }`}
          >
            <ShieldCheck size={16} />
            Watermark & Copyright Protection
            {activeTab === "watermark" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
              activeTab === "account" ? "text-[#C9A86A] font-semibold" : "text-[#FAF9F6]/50 hover:text-white"
            }`}
          >
            <SettingsIcon size={16} />
            Account Profile
            {activeTab === "account" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A86A]" />
            )}
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

          {/* TAB 1: WATERMARK SETTINGS */}
          {activeTab === "watermark" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
              
              {/* LEFT CONFIGURATION PANELS (7 COLS) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Watermark Type Selector */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#FAF9F6]/5 pb-4">
                    <div>
                      <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                        <Layers className="text-[#C9A86A] w-5 h-5" /> Watermark Source
                      </h3>
                      <p className="text-[12px] text-[#FAF9F6]/50 mt-0.5">
                        Choose between a custom brand graphic/logo or dynamic copyright typography.
                      </p>
                    </div>

                    <div className="flex bg-[#1A1816] p-1 rounded-xl border border-[#FAF9F6]/10">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, type: "image" }))}
                        className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                          config.type === "image" 
                            ? "bg-[#C9A86A] text-[#111] font-semibold shadow-xs" 
                            : "text-[#FAF9F6]/60 hover:text-white"
                        }`}
                      >
                        <ImageIcon size={14} /> Logo Graphic
                      </button>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, type: "text" }))}
                        className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                          config.type === "text" 
                            ? "bg-[#C9A86A] text-[#111] font-semibold shadow-xs" 
                            : "text-[#FAF9F6]/60 hover:text-white"
                        }`}
                      >
                        <Type size={14} /> Text Notice
                      </button>
                    </div>
                  </div>

                  {/* Logo Graphic Uploader */}
                  {config.type === "image" ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#1A1816] border border-dashed border-[#FAF9F6]/15 rounded-xl">
                        <div className="w-16 h-16 bg-[#0E0C0A] rounded-xl border border-[#FAF9F6]/10 flex items-center justify-center p-2 shrink-0">
                          <img src={config.imageUrl} alt="Watermark Logo Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[13px] font-medium text-white">{config.imageName}</h4>
                          <p className="text-[11px] text-[#FAF9F6]/40 mt-0.5">Recommended: High-resolution PNG or SVG with transparent background.</p>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleLogoUpload} 
                          accept="image/png,image/svg+xml,image/webp" 
                          className="hidden" 
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#FAF9F6]/10 hover:bg-[#FAF9F6]/20 text-white px-4 py-2.5 rounded-xl text-[12px] font-medium transition-colors flex items-center gap-2 shrink-0 border border-[#FAF9F6]/10"
                        >
                          <Upload size={14} className="text-[#C9A86A]" /> Upload Custom Logo
                        </button>
                      </div>

                      {/* Presets */}
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-2">
                          Brand Preset Library
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {PRESET_LOGOS.map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => setConfig(prev => ({ ...prev, imageUrl: pl.url, imageName: pl.name }))}
                              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 bg-[#1A1816] ${
                                config.imageUrl === pl.url 
                                  ? "border-[#C9A86A] ring-1 ring-[#C9A86A]" 
                                  : "border-[#FAF9F6]/10 hover:border-[#FAF9F6]/30"
                              }`}
                            >
                              <div className="w-7 h-7 bg-black rounded-lg p-1 border border-white/10 flex items-center justify-center shrink-0">
                                <img src={pl.url} alt={pl.name} className="max-h-full max-w-full object-contain" />
                              </div>
                              <span className="text-[11px] font-medium text-white truncate">{pl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Custom Text Notice Form */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-1">
                          Copyright Text Notice
                        </label>
                        <input 
                          type="text" 
                          value={config.text}
                          onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="e.g. © 2026 CABMORA STUDIO"
                          className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-[#C9A86A] transition-colors tracking-wide font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-1">
                            Font Style
                          </label>
                          <select
                            value={config.fontFamily}
                            onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-[#C9A86A]"
                          >
                            <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                            <option value="Space Mono">Space Mono (Technical / Code)</option>
                            <option value="Cinzel">Cinzel (Classic Editorial)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-1">
                            Text Color
                          </label>
                          <div className="flex items-center gap-3 bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl p-2">
                            <input 
                              type="color" 
                              value={config.textColor}
                              onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                            />
                            <span className="text-[12px] font-mono text-white uppercase">{config.textColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Position Matrix Anchor Grid */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div className="border-b border-[#FAF9F6]/5 pb-4">
                    <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                      <Grid className="text-[#C9A86A] w-5 h-5" /> Placement Anchor & Tiling
                    </h3>
                    <p className="text-[12px] text-[#FAF9F6]/50 mt-0.5">
                      Select a precise 9-point anchor spot or enable full diagonal repeated proof matrix.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* 9-Point Grid Controls */}
                    <div className="space-y-2">
                      <span className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold">
                        9-Point Grid Matrix
                      </span>
                      <div className="grid grid-cols-3 gap-2 bg-[#1A1816] p-3 rounded-2xl border border-[#FAF9F6]/10 w-fit">
                        {[
                          "top-left", "top-center", "top-right",
                          "center-left", "center", "center-right",
                          "bottom-left", "bottom-center", "bottom-right"
                        ].map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setConfig(prev => ({ ...prev, position: pos as WatermarkPosition }))}
                            className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center border ${
                              config.position === pos 
                                ? "bg-[#C9A86A] text-[#111] border-[#C9A86A] shadow-md font-bold" 
                                : "bg-[#0E0C0A] text-[#FAF9F6]/40 border-[#FAF9F6]/10 hover:border-[#FAF9F6]/30 hover:text-white"
                            }`}
                            title={`Anchor: ${pos}`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${config.position === pos ? "bg-[#111]" : "bg-current"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Matrix Repeater Mode */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, position: config.position === "repeat-tile" ? "bottom-right" : "repeat-tile" }))}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                          config.position === "repeat-tile" 
                            ? "bg-[#C9A86A]/15 border-[#C9A86A] text-[#FAF9F6]" 
                            : "bg-[#1A1816] border-[#FAF9F6]/10 hover:border-[#FAF9F6]/30 text-[#FAF9F6]/70"
                        }`}
                      >
                        <ShieldCheck size={24} className={config.position === "repeat-tile" ? "text-[#C9A86A]" : "text-[#FAF9F6]/40"} />
                        <div>
                          <div className="font-semibold text-[13px] text-white">Diagonal Repeat Matrix</div>
                          <div className="text-[11px] text-[#FAF9F6]/50 mt-1">
                            Tiles watermark repeatedly across whole canvas for bulletproof screenshot protection.
                          </div>
                        </div>
                      </button>

                      <div>
                        <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-1">
                          <span>Margin Offset</span>
                          <span className="text-[#C9A86A] font-mono">{config.margin}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="15" 
                          value={config.margin}
                          onChange={(e) => setConfig(prev => ({ ...prev, margin: Number(e.target.value) }))}
                          className="w-full accent-[#C9A86A] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Opacity, Scale & Blend Mode Sliders */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="border-b border-[#FAF9F6]/5 pb-4">
                    <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                      <Sliders className="text-[#C9A86A] w-5 h-5" /> Transparency & Scale Fine-Tuning
                    </h3>
                    <p className="text-[12px] text-[#FAF9F6]/50 mt-0.5">
                      Adjust visual opacity, size scaling, and blend modes for seamless protection.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Opacity Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                        <span className="text-[#FAF9F6]/60">Opacity Level</span>
                        <span className="text-[#C9A86A] font-mono">{config.opacity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={config.opacity}
                        onChange={(e) => setConfig(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                        className="w-full accent-[#C9A86A] cursor-pointer"
                      />
                    </div>

                    {/* Scale / Size Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                        <span className="text-[#FAF9F6]/60">Watermark Scale</span>
                        <span className="text-[#C9A86A] font-mono">{config.scale}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={config.scale}
                        onChange={(e) => setConfig(prev => ({ ...prev, scale: Number(e.target.value) }))}
                        className="w-full accent-[#C9A86A] cursor-pointer"
                      />
                    </div>

                    {/* Rotation Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                        <span className="text-[#FAF9F6]/60">Rotation Angle</span>
                        <span className="text-[#C9A86A] font-mono">{config.rotation}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-45" 
                        max="45" 
                        value={config.rotation}
                        onChange={(e) => setConfig(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                        className="w-full accent-[#C9A86A] cursor-pointer"
                      />
                    </div>

                    {/* Blend Mode */}
                    <div className="space-y-2">
                      <label className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/60 font-semibold">
                        Blend Mode
                      </label>
                      <select
                        value={config.blendMode}
                        onChange={(e) => setConfig(prev => ({ ...prev, blendMode: e.target.value as any }))}
                        className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-[#C9A86A]"
                      >
                        <option value="normal">Normal (Standard Opacity)</option>
                        <option value="overlay">Overlay (High Contrast Blend)</option>
                        <option value="screen">Screen (Light Ambient)</option>
                        <option value="multiply">Multiply (Dark Ambient)</option>
                        <option value="soft-light">Soft Light (Subtle Protection)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Automated Scope & Application Rules */}
                <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="border-b border-[#FAF9F6]/5 pb-4">
                    <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                      <Zap className="text-[#C9A86A] w-5 h-5" /> Automation & Delivery Rules
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl cursor-pointer hover:border-[#FAF9F6]/30 transition-colors">
                      <div>
                        <span className="block text-[13px] font-medium text-white">Apply on Client Proofing Galleries</span>
                        <span className="text-[11px] text-[#FAF9F6]/40">Embeds watermark automatically on web client proofs.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.applyToProofGalleries}
                        onChange={(e) => setConfig(prev => ({ ...prev, applyToProofGalleries: e.target.checked }))}
                        className="w-5 h-5 accent-[#C9A86A] rounded-md cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl cursor-pointer hover:border-[#FAF9F6]/30 transition-colors">
                      <div>
                        <span className="block text-[13px] font-medium text-white">Auto-Remove on Paid Client Downloads</span>
                        <span className="text-[11px] text-[#FAF9F6]/40">High-resolution downloads are clean once client invoices are settled.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.removeOnPaidDownload}
                        onChange={(e) => setConfig(prev => ({ ...prev, removeOnPaidDownload: e.target.checked }))}
                        className="w-5 h-5 accent-[#C9A86A] rounded-md cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* RIGHT LIVE PREVIEW CANVAS STAGE (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-6 space-y-4">
                  
                  {/* Stage Header */}
                  <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="text-[#C9A86A] w-5 h-5" />
                        <h3 className="font-serif text-[18px] text-white">Live Protection Canvas</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A86A] bg-[#C9A86A]/10 px-2 py-0.5 rounded-md">
                        Real-Time
                      </span>
                    </div>

                    {/* Sample Photo Switcher */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.1em] text-[#FAF9F6]/50 font-semibold mb-2">
                        Test Media Background
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {SAMPLE_MEDIA.map((sm) => (
                          <button
                            key={sm.id}
                            onClick={() => setSelectedSample(sm)}
                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2.5 bg-[#1A1816] ${
                              selectedSample.id === sm.id 
                                ? "border-[#C9A86A] ring-1 ring-[#C9A86A]" 
                                : "border-[#FAF9F6]/10 hover:border-[#FAF9F6]/30"
                            }`}
                          >
                            <img src={sm.url} alt={sm.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            <span className="text-[11px] font-medium text-white truncate">{sm.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* The Visual Stage Frame */}
                    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black border border-[#FAF9F6]/15 shadow-2xl group">
                      <img 
                        src={selectedSample.url} 
                        alt="Test Canvas Frame" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                      />

                      {/* WATERMARK OVERLAY ELEMENT */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {config.position === "repeat-tile" ? (
                          <div style={getWatermarkPositionStyle()}>
                            {Array.from({ length: 9 }).map((_, idx) => (
                              <div key={idx} className="flex items-center justify-center p-2">
                                {config.type === "image" ? (
                                  <img 
                                    src={config.imageUrl} 
                                    alt="Watermark Tile" 
                                    style={{ width: `${config.scale * 1.8}px` }} 
                                    className="object-contain"
                                  />
                                ) : (
                                  <span 
                                    style={{ 
                                      fontFamily: config.fontFamily, 
                                      color: config.textColor, 
                                      fontSize: `${config.scale * 0.55}px` 
                                    }}
                                    className="font-bold tracking-widest whitespace-nowrap drop-shadow-md"
                                  >
                                    {config.text}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            className="absolute transition-all duration-200"
                            style={getWatermarkPositionStyle()}
                          >
                            {config.type === "image" ? (
                              <img 
                                src={config.imageUrl} 
                                alt="Watermark Mark" 
                                style={{ width: `${config.scale * 4.5}px` }}
                                className="object-contain drop-shadow-lg"
                              />
                            ) : (
                              <span 
                                style={{ 
                                  fontFamily: config.fontFamily, 
                                  color: config.textColor, 
                                  fontSize: `${config.scale * 0.8}px` 
                                }}
                                className="font-bold tracking-widest whitespace-nowrap drop-shadow-lg"
                              >
                                {config.text}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Canvas Overlay Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] text-white/80 font-mono">
                        {config.position.toUpperCase()} • {config.opacity}% OPACITY
                      </div>
                    </div>

                    {/* Protection Status Summary Box */}
                    <div className="p-4 bg-[#1A1816] rounded-xl border border-[#FAF9F6]/10 space-y-2">
                      <div className="flex items-center gap-2 text-[#C9A86A] text-[12px] font-semibold">
                        <ShieldCheck size={16} /> Protection Active
                      </div>
                      <p className="text-[11px] text-[#FAF9F6]/50">
                        This custom watermark profile will render dynamically on high-resolution web assets without modifying source files.
                      </p>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GENERAL ACCOUNT SETTINGS */}
          {activeTab === "account" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#141210] border border-[#FAF9F6]/10 rounded-2xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">Creator Settings</div>
                    <h2 className="font-serif text-[20px] text-white">Account Profile & Studio Identity</h2>
                  </div>
                  <Link 
                    to="/profile" 
                    className="bg-[#C9A86A] text-[#111] px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-[#B8965C] transition-colors flex items-center gap-2"
                  >
                    <User size={15} /> Open Full Creator Profile
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-[#FAF9F6]/60 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors" 
                      defaultValue="Sarah Cabmora" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#FAF9F6]/60 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-[#1A1816] border border-[#FAF9F6]/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#C9A86A] transition-colors" 
                      defaultValue="sarah@cabmora.com" 
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => triggerToast("Account details updated successfully!")}
                      className="bg-[#C9A86A] text-[#111] px-6 py-3 rounded-xl text-[13px] font-semibold hover:bg-[#B8965C] transition-colors"
                    >
                      Save Changes
                    </button>
                    <Link 
                      to="/profile" 
                      className="text-[12px] text-[#C9A86A] hover:underline flex items-center gap-1"
                    >
                      Manage Business Info, Contact Details & Avatar <User size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
