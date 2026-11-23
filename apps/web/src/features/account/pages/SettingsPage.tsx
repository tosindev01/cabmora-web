import { useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Image as ImageIcon,
  User,
  Upload,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Type,
  Layers,
  Grid,
  Save,
  Eye,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { PortalShell, PortalTopbar } from '@/shared/portal';
import {
  PRESET_LOGOS,
  SAMPLE_MEDIA,
  WatermarkConfig,
  WatermarkPosition,
} from '@/features/account/data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'watermark' | 'account' | 'branding'>('watermark');

  // Watermark State
  const [config, setConfig] = useState<WatermarkConfig>({
    type: 'image',
    imageUrl: LogoWhite,
    imageName: 'cabmora_white_logo.svg',
    text: '© CABMORA STUDIO — PROOF COPY',
    fontFamily: 'Playfair Display',
    textColor: '#FFFFFF',
    opacity: 65,
    scale: 22,
    position: 'bottom-right',
    rotation: 0,
    blendMode: 'normal',
    margin: 5,
    applyToProofGalleries: true,
    applyToWebExports: true,
    removeOnPaidDownload: true,
  });

  const [selectedSample, setSelectedSample] = useState(SAMPLE_MEDIA[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
          setConfig((prev) => ({
            ...prev,
            type: 'image',
            imageUrl: event.target!.result as string,
            imageName: file.name,
          }));
          triggerToast(`Uploaded logo: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    triggerToast('Watermark protection rules & layout updated across all client galleries!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setConfig({
      type: 'image',
      imageUrl: LogoWhite,
      imageName: 'cabmora_white_logo.svg',
      text: '© CABMORA STUDIO — PROOF COPY',
      fontFamily: 'Playfair Display',
      textColor: '#FFFFFF',
      opacity: 65,
      scale: 22,
      position: 'bottom-right',
      rotation: 0,
      blendMode: 'normal',
      margin: 5,
      applyToProofGalleries: true,
      applyToWebExports: true,
      removeOnPaidDownload: true,
    });
    triggerToast('Reset watermark settings to factory defaults');
  };

  // Dynamic inline styles for watermark position on live preview canvas
  const getWatermarkPositionStyle = () => {
    const marginPct = `${config.margin}%`;
    const transformRot = `rotate(${config.rotation}deg)`;

    if (config.position === 'repeat-tile') {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '1.5rem',
        inset: 0,
        alignItems: 'center',
        justifyItems: 'center',
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
      case 'top-left':
        posStyles.top = marginPct;
        posStyles.left = marginPct;
        break;
      case 'top-center':
        posStyles.top = marginPct;
        posStyles.left = '50%';
        posStyles.transform = `translateX(-50%) ${transformRot}`;
        break;
      case 'top-right':
        posStyles.top = marginPct;
        posStyles.right = marginPct;
        break;
      case 'center-left':
        posStyles.top = '50%';
        posStyles.left = marginPct;
        posStyles.transform = `translateY(-50%) ${transformRot}`;
        break;
      case 'center':
        posStyles.top = '50%';
        posStyles.left = '50%';
        posStyles.transform = `translate(-50%, -50%) ${transformRot}`;
        break;
      case 'center-right':
        posStyles.top = '50%';
        posStyles.right = marginPct;
        posStyles.transform = `translateY(-50%) ${transformRot}`;
        break;
      case 'bottom-left':
        posStyles.bottom = marginPct;
        posStyles.left = marginPct;
        break;
      case 'bottom-center':
        posStyles.bottom = marginPct;
        posStyles.left = '50%';
        posStyles.transform = `translateX(-50%) ${transformRot}`;
        break;
      case 'bottom-right':
      default:
        posStyles.bottom = marginPct;
        posStyles.right = marginPct;
        break;
    }

    return posStyles;
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

          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <PortalTopbar title="Studio Settings" variant="dark" onToggleSidebar={toggleSidebar}>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 text-[12px] text-canvas/60 hover:text-white flex items-center gap-2 border border-canvas/10 rounded-lg hover:bg-canvas/5 transition-colors"
              >
                <RotateCcw size={14} />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                className="bg-gold text-ink px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2 shadow-lg"
              >
                <Save size={16} />
                {isSaved ? 'Settings Saved!' : 'Save Protection Rules'}
              </button>
            </PortalTopbar>

            {/* Sub-Navigation Tabs */}
            <div className="bg-panel-900 border-b border-canvas/5 px-8 flex items-center gap-8 shrink-0">
              <button
                onClick={() => setActiveTab('watermark')}
                className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
                  activeTab === 'watermark'
                    ? 'text-gold font-semibold'
                    : 'text-canvas/50 hover:text-white'
                }`}
              >
                <ShieldCheck size={16} />
                Watermark & Copyright Protection
                {activeTab === 'watermark' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
                  activeTab === 'account'
                    ? 'text-gold font-semibold'
                    : 'text-canvas/50 hover:text-white'
                }`}
              >
                <SettingsIcon size={16} />
                Account Profile
                {activeTab === 'account' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            </div>

            {/* Scrollable Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
              {/* TAB 1: WATERMARK SETTINGS */}
              {activeTab === 'watermark' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                  {/* LEFT CONFIGURATION PANELS (7 COLS) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* 1. Watermark Type Selector */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-canvas/5 pb-4">
                        <div>
                          <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                            <Layers className="text-gold w-5 h-5" /> Watermark Source
                          </h3>
                          <p className="text-[12px] text-canvas/50 mt-0.5">
                            Choose between a custom brand graphic/logo or dynamic copyright
                            typography.
                          </p>
                        </div>

                        <div className="flex bg-panel-800 p-1 rounded-xl border border-canvas/10">
                          <button
                            onClick={() => setConfig((prev) => ({ ...prev, type: 'image' }))}
                            className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                              config.type === 'image'
                                ? 'bg-gold text-ink font-semibold shadow-xs'
                                : 'text-canvas/60 hover:text-white'
                            }`}
                          >
                            <ImageIcon size={14} /> Logo Graphic
                          </button>
                          <button
                            onClick={() => setConfig((prev) => ({ ...prev, type: 'text' }))}
                            className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                              config.type === 'text'
                                ? 'bg-gold text-ink font-semibold shadow-xs'
                                : 'text-canvas/60 hover:text-white'
                            }`}
                          >
                            <Type size={14} /> Text Notice
                          </button>
                        </div>
                      </div>

                      {/* Logo Graphic Uploader */}
                      {config.type === 'image' ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-panel-800 border border-dashed border-canvas/15 rounded-xl">
                            <div className="w-16 h-16 bg-noir rounded-xl border border-canvas/10 flex items-center justify-center p-2 shrink-0">
                              <img
                                src={config.imageUrl}
                                alt="Watermark Logo Preview"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="text-[13px] font-medium text-white">
                                {config.imageName}
                              </h4>
                              <p className="text-[11px] text-canvas/40 mt-0.5">
                                Recommended: High-resolution PNG or SVG with transparent background.
                              </p>
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
                              className="bg-canvas/10 hover:bg-canvas/20 text-white px-4 py-2.5 rounded-xl text-[12px] font-medium transition-colors flex items-center gap-2 shrink-0 border border-canvas/10"
                            >
                              <Upload size={14} className="text-gold" /> Upload Custom Logo
                            </button>
                          </div>

                          {/* Presets */}
                          <div>
                            <span className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-2">
                              Brand Preset Library
                            </span>
                            <div className="grid grid-cols-3 gap-3">
                              {PRESET_LOGOS.map((pl) => (
                                <button
                                  key={pl.id}
                                  onClick={() =>
                                    setConfig((prev) => ({
                                      ...prev,
                                      imageUrl: pl.url,
                                      imageName: pl.name,
                                    }))
                                  }
                                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 bg-panel-800 ${
                                    config.imageUrl === pl.url
                                      ? 'border-gold ring-1 ring-gold'
                                      : 'border-canvas/10 hover:border-canvas/30'
                                  }`}
                                >
                                  <div className="w-7 h-7 bg-black rounded-lg p-1 border border-white/10 flex items-center justify-center shrink-0">
                                    <img
                                      src={pl.url}
                                      alt={pl.name}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                  <span className="text-[11px] font-medium text-white truncate">
                                    {pl.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Custom Text Notice Form */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-1">
                              Copyright Text Notice
                            </label>
                            <input
                              type="text"
                              value={config.text}
                              onChange={(e) =>
                                setConfig((prev) => ({ ...prev, text: e.target.value }))
                              }
                              placeholder="e.g. © 2026 CABMORA STUDIO"
                              className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-gold transition-colors tracking-wide font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-1">
                                Font Style
                              </label>
                              <select
                                value={config.fontFamily}
                                onChange={(e) =>
                                  setConfig((prev) => ({ ...prev, fontFamily: e.target.value }))
                                }
                                className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-gold"
                              >
                                <option value="Playfair Display">
                                  Playfair Display (Luxury Serif)
                                </option>
                                <option value="Plus Jakarta Sans">
                                  Plus Jakarta Sans (Modern Clean)
                                </option>
                                <option value="Space Mono">Space Mono (Technical / Code)</option>
                                <option value="Cinzel">Cinzel (Classic Editorial)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-1">
                                Text Color
                              </label>
                              <div className="flex items-center gap-3 bg-panel-800 border border-canvas/10 rounded-xl p-2">
                                <input
                                  type="color"
                                  value={config.textColor}
                                  onChange={(e) =>
                                    setConfig((prev) => ({ ...prev, textColor: e.target.value }))
                                  }
                                  className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                                />
                                <span className="text-[12px] font-mono text-white uppercase">
                                  {config.textColor}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Position Matrix Anchor Grid */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 space-y-5 shadow-sm">
                      <div className="border-b border-canvas/5 pb-4">
                        <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                          <Grid className="text-gold w-5 h-5" /> Placement Anchor & Tiling
                        </h3>
                        <p className="text-[12px] text-canvas/50 mt-0.5">
                          Select a precise 9-point anchor spot or enable full diagonal repeated
                          proof matrix.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        {/* 9-Point Grid Controls */}
                        <div className="space-y-2">
                          <span className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold">
                            9-Point Grid Matrix
                          </span>
                          <div className="grid grid-cols-3 gap-2 bg-panel-800 p-3 rounded-2xl border border-canvas/10 w-fit">
                            {[
                              'top-left',
                              'top-center',
                              'top-right',
                              'center-left',
                              'center',
                              'center-right',
                              'bottom-left',
                              'bottom-center',
                              'bottom-right',
                            ].map((pos) => (
                              <button
                                key={pos}
                                onClick={() =>
                                  setConfig((prev) => ({
                                    ...prev,
                                    position: pos as WatermarkPosition,
                                  }))
                                }
                                className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center border ${
                                  config.position === pos
                                    ? 'bg-gold text-ink border-gold shadow-md font-bold'
                                    : 'bg-noir text-canvas/40 border-canvas/10 hover:border-canvas/30 hover:text-white'
                                }`}
                                title={`Anchor: ${pos}`}
                              >
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${config.position === pos ? 'bg-ink' : 'bg-current'}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Full Matrix Repeater Mode */}
                        <div className="space-y-3">
                          <button
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                position:
                                  config.position === 'repeat-tile'
                                    ? 'bottom-right'
                                    : 'repeat-tile',
                              }))
                            }
                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                              config.position === 'repeat-tile'
                                ? 'bg-gold/15 border-gold text-canvas'
                                : 'bg-panel-800 border-canvas/10 hover:border-canvas/30 text-canvas/70'
                            }`}
                          >
                            <ShieldCheck
                              size={24}
                              className={
                                config.position === 'repeat-tile' ? 'text-gold' : 'text-canvas/40'
                              }
                            />
                            <div>
                              <div className="font-semibold text-[13px] text-white">
                                Diagonal Repeat Matrix
                              </div>
                              <div className="text-[11px] text-canvas/50 mt-1">
                                Tiles watermark repeatedly across whole canvas for bulletproof
                                screenshot protection.
                              </div>
                            </div>
                          </button>

                          <div>
                            <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-1">
                              <span>Margin Offset</span>
                              <span className="text-gold font-mono">{config.margin}%</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="15"
                              value={config.margin}
                              onChange={(e) =>
                                setConfig((prev) => ({ ...prev, margin: Number(e.target.value) }))
                              }
                              className="w-full accent-gold cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Opacity, Scale & Blend Mode Sliders */}
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 space-y-6 shadow-sm">
                      <div className="border-b border-canvas/5 pb-4">
                        <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                          <Sliders className="text-gold w-5 h-5" /> Transparency & Scale Fine-Tuning
                        </h3>
                        <p className="text-[12px] text-canvas/50 mt-0.5">
                          Adjust visual opacity, size scaling, and blend modes for seamless
                          protection.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Opacity Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                            <span className="text-canvas/60">Opacity Level</span>
                            <span className="text-gold font-mono">{config.opacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={config.opacity}
                            onChange={(e) =>
                              setConfig((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                            }
                            className="w-full accent-gold cursor-pointer"
                          />
                        </div>

                        {/* Scale / Size Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                            <span className="text-canvas/60">Watermark Scale</span>
                            <span className="text-gold font-mono">{config.scale}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={config.scale}
                            onChange={(e) =>
                              setConfig((prev) => ({ ...prev, scale: Number(e.target.value) }))
                            }
                            className="w-full accent-gold cursor-pointer"
                          />
                        </div>

                        {/* Rotation Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] font-semibold">
                            <span className="text-canvas/60">Rotation Angle</span>
                            <span className="text-gold font-mono">{config.rotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            value={config.rotation}
                            onChange={(e) =>
                              setConfig((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                            }
                            className="w-full accent-gold cursor-pointer"
                          />
                        </div>

                        {/* Blend Mode */}
                        <div className="space-y-2">
                          <label className="block text-[11px] uppercase tracking-[0.1em] text-canvas/60 font-semibold">
                            Blend Mode
                          </label>
                          <select
                            value={config.blendMode}
                            onChange={(e) =>
                              setConfig((prev) => ({ ...prev, blendMode: e.target.value as any }))
                            }
                            className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-gold"
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
                    <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="border-b border-canvas/5 pb-4">
                        <h3 className="font-serif text-[18px] text-white flex items-center gap-2">
                          <Zap className="text-gold w-5 h-5" /> Automation & Delivery Rules
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3.5 bg-panel-800 border border-canvas/10 rounded-xl cursor-pointer hover:border-canvas/30 transition-colors">
                          <div>
                            <span className="block text-[13px] font-medium text-white">
                              Apply on Client Proofing Galleries
                            </span>
                            <span className="text-[11px] text-canvas/40">
                              Embeds watermark automatically on web client proofs.
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.applyToProofGalleries}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                applyToProofGalleries: e.target.checked,
                              }))
                            }
                            className="w-5 h-5 accent-gold rounded-md cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3.5 bg-panel-800 border border-canvas/10 rounded-xl cursor-pointer hover:border-canvas/30 transition-colors">
                          <div>
                            <span className="block text-[13px] font-medium text-white">
                              Auto-Remove on Paid Client Downloads
                            </span>
                            <span className="text-[11px] text-canvas/40">
                              High-resolution downloads are clean once client invoices are settled.
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.removeOnPaidDownload}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                removeOnPaidDownload: e.target.checked,
                              }))
                            }
                            className="w-5 h-5 accent-gold rounded-md cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT LIVE PREVIEW CANVAS STAGE (5 COLS) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-6 space-y-4">
                      {/* Stage Header */}
                      <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="text-gold w-5 h-5" />
                            <h3 className="font-serif text-[18px] text-white">
                              Live Protection Canvas
                            </h3>
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-md">
                            Real-Time
                          </span>
                        </div>

                        {/* Sample Photo Switcher */}
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.1em] text-canvas/50 font-semibold mb-2">
                            Test Media Background
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {SAMPLE_MEDIA.map((sm) => (
                              <button
                                key={sm.id}
                                onClick={() => setSelectedSample(sm)}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2.5 bg-panel-800 ${
                                  selectedSample.id === sm.id
                                    ? 'border-gold ring-1 ring-gold'
                                    : 'border-canvas/10 hover:border-canvas/30'
                                }`}
                              >
                                <img
                                  src={sm.url}
                                  alt={sm.name}
                                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                                />
                                <span className="text-[11px] font-medium text-white truncate">
                                  {sm.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* The Visual Stage Frame */}
                        <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black border border-canvas/15 shadow-2xl group">
                          <img
                            src={selectedSample.url}
                            alt="Test Canvas Frame"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />

                          {/* WATERMARK OVERLAY ELEMENT */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {config.position === 'repeat-tile' ? (
                              <div style={getWatermarkPositionStyle()}>
                                {Array.from({ length: 9 }).map((_, idx) => (
                                  <div key={idx} className="flex items-center justify-center p-2">
                                    {config.type === 'image' ? (
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
                                          fontSize: `${config.scale * 0.55}px`,
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
                                {config.type === 'image' ? (
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
                                      fontSize: `${config.scale * 0.8}px`,
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
                        <div className="p-4 bg-panel-800 rounded-xl border border-canvas/10 space-y-2">
                          <div className="flex items-center gap-2 text-gold text-[12px] font-semibold">
                            <ShieldCheck size={16} /> Protection Active
                          </div>
                          <p className="text-[11px] text-canvas/50">
                            This custom watermark profile will render dynamically on high-resolution
                            web assets without modifying source files.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GENERAL ACCOUNT SETTINGS */}
              {activeTab === 'account' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-panel-900 border border-canvas/10 rounded-2xl p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-canvas/10 pb-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                          Creator Settings
                        </div>
                        <h2 className="font-serif text-[20px] text-white">
                          Account Profile & Studio Identity
                        </h2>
                      </div>
                      <Link
                        to="/profile"
                        className="bg-gold text-ink px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2"
                      >
                        <User size={15} /> Open Full Creator Profile
                      </Link>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] text-canvas/60 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          defaultValue="Sarah Cabmora"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-canvas/60 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full bg-panel-800 border border-canvas/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-gold transition-colors"
                          defaultValue="sarah@cabmora.com"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => triggerToast('Account details updated successfully!')}
                          className="bg-gold text-ink px-6 py-3 rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition-colors"
                        >
                          Save Changes
                        </button>
                        <Link
                          to="/profile"
                          className="text-[12px] text-gold hover:underline flex items-center gap-1"
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
        </>
      )}
    </PortalShell>
  );
}
