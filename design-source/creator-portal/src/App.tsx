import { useState, useEffect, useRef, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import GalleriesPage from "./pages/GalleriesPage";
import MediaUploadPage from "./pages/MediaUploadPage";
import BillingPage from "./pages/BillingPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import StoragePage from "./pages/StoragePage";
import ProfilePage from "./pages/ProfilePage";

import {
  Menu, X, ArrowRight, Camera, Video, Building2, Calendar,
  Wind, Radio, Star, Check, Heart, Shield, Clock, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import LogoWhite from "./assets/cabmora_white_logo.svg";

/* ─────────────────────────────────────────────
   Intersection-observer fade-in
───────────────────────────────────────────── */
export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
  key?: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const initial: Record<string, string> = {
    up: "translateY(48px)",
    left: "translateX(-48px)",
    right: "translateX(48px)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : initial[direction],
        transition: `opacity 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Gold accent label
───────────────────────────────────────────── */
function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-8 h-px bg-[#C9A86A]" />
      <span className="text-[11px] tracking-[0.32em] uppercase text-[#C9A86A] font-medium">
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
export function Navigation({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: Array<{ label: string; href?: string; dropdown?: { label: string; href: string }[] }> = [
    { label: "Work", href: "/#work" },
    { label: "Services", href: "/#services" },
    { 
      label: "Learn", 
      dropdown: [
        { label: "Blog", href: "/blog" },
        { label: "Help desk and guides", href: "/help" },
        { label: "FAQs", href: "/help" },
      ]
    },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/contact" },
  ];

  const isLightText = theme === "dark" && !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#FAF9F6]/96 backdrop-blur-md shadow-[0_1px_0_rgba(17,17,17,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 flex items-center justify-between h-[100px]">
        {/* Logo mark */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src={LogoWhite}
            alt="Cabmora Logo"
            className={`h-[60px] w-auto object-contain transition-all duration-300 ${!isLightText ? 'invert' : ''}`}
          />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-9">
          {links.map((link) => (
            link.dropdown ? (
              <div key={link.label} className="relative group">
                <button
                  className={`flex items-center gap-1.5 text-[11.5px] tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:text-[#C9A86A] ${
                    !isLightText ? "text-[#111]/50" : "text-[#FAF9F6]/60"
                  }`}
                >
                  {link.label}
                  <svg className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-56">
                  <div className="bg-[#FAF9F6] border border-[#111]/10 p-2 shadow-lg flex flex-col">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="px-4 py-3 text-[11px] tracking-[0.14em] uppercase font-medium text-[#111]/60 hover:text-[#C9A86A] hover:bg-[#111]/5 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href!}
                className={`text-[11.5px] tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:text-[#C9A86A] ${
                  !isLightText ? "text-[#111]/50" : "text-[#FAF9F6]/60"
                }`}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login"
            className={`text-[11.5px] tracking-[0.14em] uppercase font-semibold transition-colors duration-300 hover:text-[#C9A86A] ${
              !isLightText ? "text-[#111]" : "text-[#FAF9F6]"
            }`}
          >
            Log in
          </Link>
          <Link to="/contact" className="text-[11px] tracking-[0.18em] uppercase font-semibold bg-[#C9A86A] text-[#111] px-7 py-[13px] hover:bg-[#B8965C] transition-colors duration-300 inline-block">
            Book Consultation
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden transition-colors duration-300 ${!isLightText ? "text-[#111]" : "text-[#FAF9F6]"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-y-auto transition-all duration-500 ${
          open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        } bg-[#FAF9F6] border-t border-[#111]/5`}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          {links.map((link) => (
            link.dropdown ? (
              <div key={link.label} className="flex flex-col gap-4">
                <div className="text-[12px] tracking-[0.18em] uppercase text-[#111]/40 font-semibold">
                  {link.label}
                </div>
                <div className="flex flex-col gap-4 pl-4 border-l border-[#111]/10">
                  {link.dropdown.map(item => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="text-[12px] tracking-[0.18em] uppercase text-[#111]/50 hover:text-[#111]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href!}
                onClick={() => setOpen(false)}
                className="text-[12px] tracking-[0.18em] uppercase text-[#111]/50 hover:text-[#111]"
              >
                {link.label}
              </Link>
            )
          ))}
          <div className="pt-2">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="text-[11px] tracking-[0.18em] uppercase font-semibold bg-[#C9A86A] text-[#111] px-6 py-4 text-center inline-block w-full"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-start pt-[156px] overflow-hidden bg-[#0E0C0A]">
      {/* Cinematic background video */}
      <div className="absolute inset-0 z-0">
        {videoError ? (
          <img
            src="https://images.unsplash.com/photo-1770301312392-d03cc3dede90?w=1920&h=1200&fit=crop&auto=format"
            alt="Bride and groom embracing tenderly at golden sunset"
            className="w-full h-full object-cover object-center"
            style={{
              opacity: 0.72,
            }}
          />
        ) : (
          <video
            src="https://assets.mixkit.co/videos/preview/mixkit-gorgeous-bride-posing-outdoors-in-the-sunlight-41594-large.mp4"
            autoPlay
            loop
            muted
            playsInline
            referrerPolicy="no-referrer"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center"
            style={{
              opacity: 0.72,
            }}
          />
        )}
        {/* Directional gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-[#0E0C0A]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C0A]/65 via-[#0E0C0A]/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-14 pb-20 lg:pb-32">
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(32px)",
            transition: "opacity 1.4s cubic-bezier(0.16,1,0.3,1) 400ms, transform 1.4s cubic-bezier(0.16,1,0.3,1) 400ms",
          }}
        >
          {/* Pre-label */}
          <div className="flex items-center gap-4 mb-10">
            <div
              className="h-px bg-[#C9A86A]"
              style={{
                width: loaded ? "32px" : "0px",
                transition: "width 1s cubic-bezier(0.16,1,0.3,1) 600ms",
              }}
            />
            <span className="text-[11px] tracking-[0.32em] uppercase text-[#C9A86A] font-medium">
              Premium Photography &amp; Videography
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[clamp(44px,7.5vw,110px)] text-[#FAF9F6] font-normal leading-[0.9] mb-8 max-w-5xl">
            Capture the Moment.
            <br />
            <em className="not-italic text-[#C9A86A]">Curate & Share</em>
            <br />
            Forever.
          </h1>

          {/* Sub */}
          <p className="text-[#FAF9F6]/55 text-[17px] lg:text-[19px] max-w-[460px] mb-12 leading-[1.7] font-light">
            Cabmora transforms life's most meaningful moments into timeless visual stories. Our digital platform offers a seamless experience to review, collaborate, and deliver your private galleries.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="group inline-flex items-center gap-3 bg-[#C9A86A] text-[#111] px-8 py-[15px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-colors duration-400">
              Book Consultation
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="inline-flex items-center gap-3 border border-[#FAF9F6]/25 text-[#FAF9F6] px-8 py-[15px] text-[11.5px] tracking-[0.18em] uppercase font-medium hover:border-[#FAF9F6]/55 hover:bg-[#FAF9F6]/5 transition-all duration-300">
              Explore Our Work
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue — right side */}
      <div
        className="absolute bottom-10 right-14 hidden lg:flex flex-col items-center gap-4"
        style={{
          opacity: loaded ? 0.4 : 0,
          transition: "opacity 1s ease 1400ms",
        }}
      >
        <span
          className="text-[9px] tracking-[0.36em] uppercase text-[#FAF9F6] writing-mode-vertical"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.32em" }}
        >
          Scroll
        </span>
        <div
          className="w-px bg-[#FAF9F6]/40"
          style={{
            height: loaded ? "60px" : "0px",
            transition: "height 1.2s cubic-bezier(0.16,1,0.3,1) 1000ms",
          }}
        />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Stats — Trusted By
───────────────────────────────────────────── */
function Stats() {
  const items = [
    { figure: "500+", label: "Happy Clients" },
    { figure: "8", label: "Years of Excellence" },
    { figure: "200+", label: "Events Covered" },
    { figure: "4.9 ★", label: "Google Rating" },
  ];

  return (
    <section className="py-20 lg:py-28 border-b border-[#111]/6">
      <FadeIn className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x lg:divide-[#111]/8">
          {items.map((item, i) => (
            <div key={i} className="lg:px-14 first:pl-0 last:pr-0 flex flex-col">
              <span
                className="font-serif text-[52px] lg:text-[68px] text-[#111] font-normal leading-none mb-3 tracking-tight"
                
              >
                {item.figure}
              </span>
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#111]/38 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Featured Stories
───────────────────────────────────────────── */
function FeaturedStories() {
  const images = [
    "https://images.unsplash.com/photo-1764499892443-90404cde4cdc?w=1200&h=1500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1680884150120-c944d0143401?w=1200&h=1500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1770301312795-abdc6deee5a8?w=1200&h=1500&fit=crop&auto=format"
  ];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section id="work" className="py-28 lg:py-44">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">

        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 lg:mb-24">
          <FadeIn direction="left">
            <EyebrowLabel>Selected Work</EyebrowLabel>
            <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#111] leading-[0.9]">
              Featured<br />
              <em>Stories</em>
            </h2>
          </FadeIn>
          <FadeIn direction="right" delay={100} className="lg:max-w-xs lg:pb-2">
            <p className="text-[#111]/48 leading-[1.75] text-[15px] mb-6">
              Every frame we deliver carries the weight of a real moment — crafted with intention, soul, and an eye for the extraordinary.
            </p>
            <button className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#111] border-b border-[#111]/18 pb-1 hover:border-[#C9A86A] hover:text-[#C9A86A] transition-colors duration-300 font-medium">
              View All Stories <ArrowRight size={11} />
            </button>
          </FadeIn>
        </div>

        {/* Main story grid — asymmetric 3:2 split */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 mb-5">
          {/* Hero story with sliding effect */}
          <FadeIn direction="left" className="relative overflow-hidden group bg-[#E8E4DC] aspect-[3/4] lg:aspect-auto lg:min-h-[680px]">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentIdx}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                src={images[currentIdx]}
                alt="Featured story"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/80 via-[#0E0C0A]/20 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 z-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] tracking-[0.28em] uppercase text-[#C9A86A] font-medium">Wedding</span>
                <span className="text-[#FAF9F6]/28 text-xs">—</span>
                <span className="text-[10px] tracking-[0.16em] text-[#FAF9F6]/45">Marbella, Spain</span>
              </div>
              <h3 className="font-serif text-[clamp(28px,4vw,52px)] text-[#FAF9F6] font-normal leading-[1.0] mb-3">
                Elena &amp; Marco
              </h3>
              <p className="text-[#FAF9F6]/50 text-sm mb-7 font-light">
                Seaside ceremony at the golden hour
              </p>
              <button className="inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-[#C9A86A] font-medium hover:gap-3 transition-all duration-300">
                View Story <ArrowRight size={11} />
              </button>
            </div>
          </FadeIn>

          {/* Side stack */}
          <div className="flex flex-col gap-5">
            <FadeIn direction="right" delay={100} className="relative overflow-hidden group bg-[#E8E4DC] flex-1 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1680884150120-c944d0143401?w=900&h=680&fit=crop&auto=format"
                alt="Bride and groom dancing in a sunlit field at sunset"
                className="w-full h-full object-cover transition-transform duration-[1800ms] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#C9A86A] font-medium block mb-2">Wedding Film</span>
                <h3 className="font-serif text-[22px] lg:text-[28px] text-[#FAF9F6] font-normal leading-tight">
                  Sofia &amp; James
                </h3>
                <p className="text-[#FAF9F6]/45 text-xs mt-1.5 font-light">Tuscany, Italy — Summer 2024</p>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={180} className="relative overflow-hidden group bg-[#E8E4DC] flex-1 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1768508950719-4d76978fdf44?w=900&h=680&fit=crop&auto=format"
                alt="Elegant formal dinner with floral centerpieces and candlelight"
                className="w-full h-full object-cover object-center transition-transform duration-[1800ms] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#C9A86A] font-medium block mb-2">Corporate Event</span>
                <h3 className="font-serif text-[22px] lg:text-[28px] text-[#FAF9F6] font-normal leading-tight">
                  Radiance Gala 2024
                </h3>
                <p className="text-[#FAF9F6]/45 text-xs mt-1.5 font-light">500-guest awards ceremony, London</p>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Third story — wide landscape strip */}
        <FadeIn delay={80} className="relative overflow-hidden group bg-[#E8E4DC] aspect-[21/9] min-h-[220px]">
          <img
            src="https://images.unsplash.com/photo-1770301312795-abdc6deee5a8?w=1800&h=700&fit=crop&auto=format"
            alt="Bride and groom holding hands at dusk, silhouetted against the sky"
            className="w-full h-full object-cover object-top transition-transform duration-[1800ms] group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C0A]/75 via-[#0E0C0A]/20 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-10 lg:px-16">
              <span className="text-[9px] tracking-[0.28em] uppercase text-[#C9A86A] font-medium block mb-3">Portrait Session</span>
              <h3 className="font-serif text-[28px] lg:text-[42px] text-[#FAF9F6] font-normal leading-tight mb-4">
                Amara &amp; Daniel
              </h3>
              <button className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-[#C9A86A] font-medium">
                View Story <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Services
───────────────────────────────────────────── */
function Services() {
  const primary = [
    {
      icon: Camera,
      label: "Photography",
      desc: "Timeless, editorial images that capture every nuance of emotion — from a stolen glance to a sweeping landscape.",
      index: "01",
    },
    {
      icon: Video,
      label: "Videography",
      desc: "Cinematic films that play back the feeling of your event, not just the sequence of events.",
      index: "02",
    },
  ];

  const secondary = [
    { icon: Building2, label: "Corporate", desc: "Brand imagery that communicates professionalism and personality in equal measure." },
    { icon: Calendar, label: "Events", desc: "Multi-photographer coordination so no angle, no emotion, goes uncaptured." },
    { icon: Wind, label: "Drone", desc: "Breathtaking aerial perspectives that transform the familiar into the extraordinary." },
    { icon: Radio, label: "Livestream", desc: "Broadcast your moments in real time to guests near and far, beautifully produced." },
  ];

  return (
    <section id="services" className="py-28 lg:py-44 bg-[#2C3E50]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20">
          <EyebrowLabel>What We Create</EyebrowLabel>
          <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#FAF9F6] leading-[0.9]">
            Services for<br />
            <em>Every Moment</em>
          </h2>
        </FadeIn>

        {/* Two hero service tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px mb-px bg-[#FAF9F6]/10">
          {primary.map((s, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="group relative bg-[#1E2B3C] p-12 lg:p-16 cursor-pointer hover:bg-[#243447] transition-colors duration-500 border border-[#FAF9F6]/5 h-full">
                <div className="flex items-start justify-between mb-12">
                  <s.icon className="text-[#C9A86A]" size={26} strokeWidth={1.5} />
                  <span className="text-[10px] tracking-[0.24em] text-[#FAF9F6]/18 font-medium">{s.index}</span>
                </div>
                <h3 className="font-serif text-[clamp(32px,4vw,52px)] text-[#FAF9F6] font-normal leading-tight mb-4">
                  {s.label}
                </h3>
                <p className="text-[#FAF9F6]/38 leading-[1.75] text-[15px] max-w-sm">
                  {s.desc}
                </p>
                <div className="mt-10 inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-[#C9A86A] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  Explore <ArrowRight size={11} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Four compact tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#FAF9F6]/10">
          {secondary.map((s, i) => (
            <FadeIn key={i} delay={i * 70}>
              <div className="group bg-[#1E2B3C] p-8 lg:p-10 cursor-pointer hover:bg-[#243447] transition-colors duration-500 border border-[#FAF9F6]/5 h-full">
                <s.icon className="text-[#C9A86A] mb-8" size={21} strokeWidth={1.5} />
                <h3 className="font-serif text-[22px] lg:text-[27px] text-[#FAF9F6] font-normal mb-3">
                  {s.label}
                </h3>
                <p className="text-[#FAF9F6]/32 text-[13px] leading-[1.72]">
                  {s.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Packages CTA strip */}
        <FadeIn delay={100} className="mt-px bg-[#C9A86A]/10 border border-[#C9A86A]/20 p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-[22px] lg:text-[28px] text-[#FAF9F6] font-normal mb-2">Tailored packages for every occasion</h3>
            <p className="text-[#FAF9F6]/40 text-sm">Photography, videography, drone, albums — mix and match to build your ideal coverage.</p>
          </div>
          <a href="#packages" className="flex-shrink-0 inline-flex items-center gap-3 bg-[#C9A86A] text-[#111] px-8 py-[14px] text-[11px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-colors duration-300">
            View Packages <ArrowRight size={12} />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Pricing (Packages)
───────────────────────────────────────────── */
function Pricing() {
  const plans = [
    { 
      name: "Essential", 
      price: "From £2,500", 
      desc: "Perfect for intimate gatherings and focused storytelling coverage.", 
      features: ["8 Hours Coverage", "Single Photographer", "Edited High-Res Images", "Private Cabmora Gallery"] 
    },
    { 
      name: "Comprehensive", 
      price: "From £4,800", 
      desc: "Our most popular offering for complete documentary and cinematic storytelling.", 
      features: ["10 Hours Coverage", "Photo & Video Team", "Highlight Film (5 mins)", "Drone Aerial Footage", "Priority Delivery"] 
    },
    { 
      name: "Cinematic", 
      price: "Custom", 
      desc: "Multi-day coverage and dedicated editorial curation for lavish celebrations.", 
      features: ["Multi-day Coverage", "Lead Photographer & Videographer", "Full Feature Film", "Express Same-Week Preview", "Fine Art Heirloom Album"] 
    }
  ];

  return (
    <section id="packages" className="py-28 lg:py-44 bg-[#F5F3EE]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20 flex flex-col items-center text-center">
          <EyebrowLabel>Investment</EyebrowLabel>
          <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#111] leading-[0.9] mb-6">
            Curated<br />
            <em>Collections</em>
          </h2>
          <p className="text-[#111]/45 text-[15px] leading-[1.75] max-w-md">
            Transparent pricing for uncompromising quality. Choose a foundation and let us tailor it perfectly to your event.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <FadeIn key={i} delay={i * 100} className="bg-[#FAF9F6] p-10 lg:p-14 border border-[#111]/5 flex flex-col hover:border-[#C9A86A]/40 transition-colors duration-500">
              <h3 className="font-serif text-[24px] lg:text-[28px] text-[#111] font-normal mb-2" >{plan.name}</h3>
              <p className="text-[#111]/45 text-[13.5px] leading-[1.6] mb-8 min-h-[44px]">{plan.desc}</p>
              <div className="text-[28px] text-[#111] mb-10 pb-10 border-b border-[#111]/10">{plan.price}</div>
              
              <ul className="space-y-5 flex-1 mb-12">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check size={14} className="text-[#C9A86A] mt-1 flex-shrink-0" />
                    <span className="text-[#111]/60 text-[14px]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full inline-flex items-center justify-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-[#111] border border-[#111]/15 py-4 hover:border-[#111] hover:bg-[#111] hover:text-[#FAF9F6] transition-all duration-300 font-medium">
                Inquire Now
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Why Cabmora
───────────────────────────────────────────── */
function WhyCabmora() {
  const reasons = [
    {
      tag: "Dedicated Planning",
      title: "Planning that feels like\na conversation, not a checklist.",
      body: "From our very first call, we work to understand not just the logistics but the feeling you want to carry with you forever. Your story guides every creative decision we make.",
      img: "https://images.unsplash.com/photo-1782787541129-94c8ce50e09c?w=900&h=680&fit=crop&auto=format",
      alt: "Bride and groom walking uphill at golden sunset",
    },
    {
      tag: "Client Portal",
      title: "A private gallery,\nbuilt around you.",
      body: "Every client receives a beautifully designed collaboration space — review your photos, mark favorites, leave comments, and approve your final collection entirely at your own pace.",
      img: "https://images.unsplash.com/photo-1677083969185-ae09e0881828?w=900&h=680&fit=crop&auto=format",
      alt: "Elegant portrait — woman in black dress seated gracefully",
    },
    {
      tag: "Fast Turnaround",
      title: "Memories delivered\nwithout the long wait.",
      body: "Our streamlined post-production means you see your images sooner without sacrificing a single detail of quality. Because memories shouldn't have to wait weeks to resurface.",
      img: "https://images.unsplash.com/photo-1632187981988-40f3cbaeef5e?w=900&h=680&fit=crop&auto=format",
      alt: "Professional film crew preparing for a shoot behind the scenes",
    },
    {
      tag: "Secure Delivery",
      title: "Your memories,\nprotected forever.",
      body: "Cloud-secured galleries with long-term storage, watermarked previews, and multiple download formats. Every image is safe, accessible, and yours — always.",
      img: "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?w=900&h=680&fit=crop&auto=format",
      alt: "Candle-lit luxury event table setting with floral arrangements",
    },
  ];

  return (
    <section id="about" className="py-28 lg:py-44 border-t border-[#111]/6">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-24 max-w-2xl">
          <EyebrowLabel>The Cabmora Way</EyebrowLabel>
          <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#111] leading-[0.9]">
            Why clients<br />
            <em>choose us</em>
          </h2>
        </FadeIn>

        <div>
          {reasons.map((r, i) => (
            <FadeIn key={i} delay={60}>
              <div className={`flex flex-col lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""} gap-0 border-t border-[#111]/6 py-16 lg:py-20 last:border-b last:border-[#111]/6`}>
                {/* Text */}
                <div className={`flex-1 flex flex-col justify-center ${i % 2 === 1 ? "lg:pl-0 lg:pr-20" : "lg:pr-0 lg:pl-0 lg:mr-20"} mb-10 lg:mb-0`}>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86A] font-medium block mb-5">
                    {r.tag}
                  </span>
                  <h3
                    className="font-serif text-[clamp(26px,3.5vw,44px)] text-[#111] font-normal leading-[1.12] mb-6 whitespace-pre-line"
                    
                  >
                    {r.title}
                  </h3>
                  <p className="text-[#111]/48 leading-[1.78] text-[15px] max-w-[420px]">
                    {r.body}
                  </p>
                  <button className="mt-8 inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-[#111] border-b border-[#111]/16 pb-1 hover:border-[#C9A86A] hover:text-[#C9A86A] transition-colors duration-300 font-medium w-fit">
                    Learn More <ArrowRight size={10} />
                  </button>
                </div>

                {/* Image */}
                <div className="flex-1 overflow-hidden bg-[#E8E4DC] aspect-[4/3] lg:aspect-auto lg:max-h-[480px]">
                  <img
                    src={r.img}
                    alt={r.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   How It Works
───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Enquiry", desc: "Reach out via our form or book a discovery call. Tell us about your event and what you envision." },
    { num: "02", title: "Consultation", desc: "We meet — in person or virtually — to understand your story, aesthetic preferences, and every meaningful detail." },
    { num: "03", title: "Coverage", desc: "On the day, our team is present but invisible — capturing every authentic moment as it unfolds." },
    { num: "04", title: "Review Online", desc: "Access your private Cabmora gallery through your client portal and begin browsing at your leisure." },
    { num: "05", title: "Approval", desc: "Select your favorites, leave comments for our editors, and approve your curated final collection." },
    { num: "06", title: "Delivery", desc: "Receive your beautifully edited images and cinematic films — securely delivered and stored forever." },
  ];

  return (
    <section className="py-28 lg:py-44 bg-[#F5F3EE]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 lg:gap-32">
          {/* Left — label + title */}
          <FadeIn direction="left" className="lg:sticky lg:top-32 lg:self-start">
            <EyebrowLabel>The Process</EyebrowLabel>
            <h2 className="font-serif text-[clamp(40px,5.5vw,72px)] text-[#111] leading-[0.9] mb-8">
              How it<br />
              <em>all unfolds</em>
            </h2>
            <p className="text-[#111]/45 leading-[1.75] text-[15px] max-w-xs">
              Six thoughtful steps that transform an initial enquiry into a lifelong archive of beautiful memories.
            </p>
          </FadeIn>

          {/* Right — steps */}
          <div>
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 60} direction="right">
                <div className="group flex items-start gap-6 lg:gap-10 py-8 lg:py-10 border-b border-[#111]/7 last:border-0 cursor-default">
                  {/* Number circle */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#111]/12 flex items-center justify-center group-hover:border-[#C9A86A] group-hover:bg-[#C9A86A]/6 transition-all duration-400 mt-1">
                    <span className="text-[10px] tracking-[0.24em] text-[#111]/35 group-hover:text-[#C9A86A] transition-colors duration-400 font-medium">
                      {step.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-[24px] lg:text-[30px] text-[#111] font-normal mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#111]/45 text-[14px] lg:text-[15px] leading-[1.72]">
                      {step.desc}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="flex-shrink-0 text-[#C9A86A] mt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Client Portal Mockup
───────────────────────────────────────────── */
function ClientPortal() {
  const features = [
    { icon: Shield, label: "Private, password-protected gallery" },
    { icon: Heart, label: "Mark favorites and leave comments" },
    { icon: MessageSquare, label: "Direct communication with your editor" },
    { icon: Clock, label: "Real-time delivery progress tracking" },
    { icon: Check, label: "Approve your collection in one click" },
  ];

  const photos = [
    { id: "photo-1770301312385-7a4ba2f12147", status: "approved" },
    { id: "photo-1762799585109-fd61a1aef92a", status: "favorite" },
    { id: "photo-1770301312795-abdc6deee5a8", status: "none" },
    { id: "photo-1782787540837-5a43b126073e", status: "none" },
    { id: "photo-1680884150120-c944d0143401", status: "approved" },
    { id: "photo-1764499892443-90404cde4cdc", status: "none" },
    { id: "photo-1782787541129-94c8ce50e09c", status: "favorite" },
    { id: "photo-1770301312392-d03cc3dede90", status: "none" },
  ];

  return (
    <section className="py-28 lg:py-44 bg-[#111] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Text column */}
          <FadeIn direction="left">
            <EyebrowLabel>Client Platform</EyebrowLabel>
            <h2 className="font-serif text-[clamp(40px,5.5vw,72px)] text-[#FAF9F6] leading-[0.9] mb-8">
              Your private<br />
              <em>gallery awaits</em>
            </h2>
            <p className="text-[#FAF9F6]/48 text-[15px] leading-[1.75] mb-10 max-w-[400px]">
              Every Cabmora client receives a beautifully designed digital space — purpose-built for collaboration, approval, and the joy of rediscovery.
            </p>
            <div className="space-y-4 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-[30px] h-[30px] border border-[#C9A86A]/35 flex items-center justify-center flex-shrink-0">
                    <f.icon size={12} className="text-[#C9A86A]" />
                  </div>
                  <span className="text-[#FAF9F6]/55 text-[13.5px]">{f.label}</span>
                </div>
              ))}
            </div>
            <button className="group inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase text-[#C9A86A] font-medium border-b border-[#C9A86A]/30 pb-1 hover:border-[#C9A86A] transition-colors duration-300">
              Explore the portal <ArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </FadeIn>

          {/* Mockup column */}
          <FadeIn direction="right" delay={150} className="relative">
            {/* Browser shell */}
            <div className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-[#FAF9F6]/8">
              {/* Browser chrome */}
              <div className="bg-[#1C1C1C] px-4 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C840]" />
                </div>
                <div className="flex-1 bg-[#2C2C2C] rounded-md px-3 py-1.5 flex items-center gap-2 mx-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#FAF9F6]/20 flex-shrink-0" />
                  <span className="text-[#FAF9F6]/35 text-[10.5px] truncate">
                    portal.cabmora.com/gallery/elena-marco
                  </span>
                </div>
              </div>

              {/* App shell */}
              <div className="bg-[#141210] flex overflow-hidden" style={{ height: "440px" }}>
                {/* Sidebar */}
                <div className="w-[190px] bg-[#0F0D0C] border-r border-[#FAF9F6]/5 flex-shrink-0 flex flex-col p-5">
                  <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-5 h-5 border border-[#C9A86A]/60 flex items-center justify-center">
                      <div className="w-[7px] h-[7px] bg-[#C9A86A]" />
                    </div>
                    <span className="text-[#FAF9F6]/70 text-[10.5px] tracking-[0.22em] uppercase font-medium">Cabmora</span>
                  </div>

                  <div className="text-[#FAF9F6]/22 text-[9px] tracking-[0.22em] uppercase mb-3 font-medium">Elena &amp; Marco</div>

                  {[
                    { label: "Gallery", glyph: "▣", active: true, count: "120" },
                    { label: "Favorites", glyph: "♡", active: false, count: "18" },
                    { label: "Approved", glyph: "✓", active: false, count: "45" },
                    { label: "Downloads", glyph: "↓", active: false, count: null },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-left ${
                        item.active
                          ? "bg-[#C9A86A]/14 text-[#C9A86A]"
                          : "text-[#FAF9F6]/28 hover:text-[#FAF9F6]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs">{item.glyph}</span>
                        <span className="text-[11px]">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className={`text-[9px] ${item.active ? "text-[#C9A86A]/70" : "text-[#FAF9F6]/20"}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}

                  <div className="mt-auto">
                    <div className="bg-[#1A1816] rounded-xl p-3.5 border border-[#FAF9F6]/5">
                      <div className="text-[9px] tracking-[0.2em] uppercase text-[#FAF9F6]/28 mb-2.5 font-medium">Review Progress</div>
                      <div className="h-1 bg-[#FAF9F6]/8 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-[#C9A86A] rounded-full" style={{ width: "68%" }} />
                      </div>
                      <div className="text-[9px] text-[#FAF9F6]/25">82 of 120 reviewed</div>
                    </div>
                  </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Toolbar */}
                  <div className="border-b border-[#FAF9F6]/5 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                    <span className="text-[#FAF9F6]/55 text-[11px] font-medium">All Photos</span>
                    <div className="flex-1" />
                    <span className="text-[#FAF9F6]/25 text-[10px]">120 photos</span>
                    <div className="w-6 h-6 bg-[#FAF9F6]/8 rounded flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-[2px] w-2.5 h-2.5">
                        {[0,1,2,3].map(x => <div key={x} className="bg-[#FAF9F6]/45 rounded-[1px]" />)}
                      </div>
                    </div>
                  </div>

                  {/* Photo grid */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((photo, i) => (
                        <div key={i} className="relative overflow-hidden bg-[#1A1816] group cursor-pointer" style={{ aspectRatio: "1" }}>
                          <img
                            src={`https://images.unsplash.com/${photo.id}?w=160&h=160&fit=crop&auto=format`}
                            alt={`Gallery photo ${i + 1}`}
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-200"
                          />
                          {photo.status === "approved" && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
                          )}
                          {photo.status === "favorite" && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C9A86A] flex items-center justify-center text-[8px]">♡</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="absolute -bottom-4 -right-2 lg:-right-8 bg-[#FAF9F6] shadow-[0_12px_40px_rgba(0,0,0,0.2)] rounded-2xl p-4 w-[210px]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C9A86A]/15 flex items-center justify-center flex-shrink-0">
                  <Heart size={15} className="text-[#C9A86A]" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#111] mb-0.5">Gallery Ready</div>
                  <div className="text-[10.5px] text-[#111]/40 leading-[1.4]">Your photos are ready to review and approve</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 pl-12">
                <div className="flex-1 h-1 bg-[#111]/6 rounded-full">
                  <div className="h-full w-[38%] bg-[#C9A86A] rounded-full" />
                </div>
                <span className="text-[9px] text-[#111]/35">38%</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Creator Platform (Independent Photographers)
───────────────────────────────────────────── */
function CreatorPlatform() {
  const features = [
    { label: "Lightning-fast media uploads directly from your drive" },
    { label: "100% white-labeled under your own brand identity" },
    { label: "Granular access control and secure, password-protected links" },
    { label: "Built-in review tools for your clients to select favorites" },
    { label: "High-resolution secure delivery without expiration" },
  ];

  return (
    <section id="creators" className="py-28 lg:py-44 bg-[#0A0908] overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86A]/5 via-transparent to-transparent opacity-50" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Visual Column */}
          <FadeIn direction="left" className="relative order-2 lg:order-1">
            <div className="bg-[#181614] border border-[#FAF9F6]/10 rounded-xl p-8 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] flex items-center justify-center">
                  <span className="text-[10px] font-bold tracking-widest text-[#111]">LOGO</span>
                </div>
              </div>
              <h3 className="font-serif text-[20px] text-[#FAF9F6] mb-8 font-light tracking-wide">Studio Dashboard</h3>
              <div className="space-y-6">
                <div className="bg-[#FAF9F6]/5 rounded-lg p-5 border border-[#FAF9F6]/5 flex justify-between items-center">
                  <div>
                    <div className="text-[12px] text-[#FAF9F6]/40 mb-1">Active Galleries</div>
                    <div className="text-[24px] text-[#FAF9F6]">24</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#C9A86A]/20 flex items-center justify-center text-[#C9A86A]">
                    <Camera size={16} />
                  </div>
                </div>
                <div className="bg-[#FAF9F6]/5 rounded-lg p-5 border border-[#FAF9F6]/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[13px] text-[#FAF9F6]">Harrison Wedding</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Approved</span>
                  </div>
                  <div className="h-1 bg-[#FAF9F6]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A86A] w-full" />
                  </div>
                </div>
                <div className="bg-[#FAF9F6]/5 rounded-lg p-5 border border-[#FAF9F6]/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[13px] text-[#FAF9F6]">Miller Engagement</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Awaiting Review</span>
                  </div>
                  <div className="h-1 bg-[#FAF9F6]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A86A] w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Text Column */}
          <FadeIn direction="right" className="order-1 lg:order-2">
            <EyebrowLabel>For Independent Creators</EyebrowLabel>
            <h2 className="font-serif text-[clamp(40px,5.5vw,72px)] text-[#FAF9F6] leading-[0.9] mb-8">
              Your work,<br />
              <em>delivered beautifully.</em>
            </h2>
            <p className="text-[#FAF9F6]/48 text-[15px] leading-[1.75] mb-10 max-w-[440px]">
              Cabmora isn't just for our own clients. We empower independent photographers and videographers with the very same platform we use to curate, share, and securely deliver galleries — fully white-labeled for your own studio.
            </p>
            <div className="space-y-4 mb-12">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#C9A86A]/10 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#C9A86A]" />
                  </div>
                  <span className="text-[#FAF9F6]/55 text-[13.5px]">{f.label}</span>
                </div>
              ))}
            </div>
            <Link to="/signup" className="group inline-flex items-center gap-3 bg-[#FAF9F6] text-[#111] px-8 py-[15px] text-[11px] tracking-[0.18em] uppercase font-semibold hover:bg-[#C9A86A] transition-colors duration-400">
              Join as a Creator
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    {
      text: "Cabmora didn't just photograph our wedding — they understood what it meant to us. Every single image made us cry in the most beautiful way possible.",
      name: "Priya & Arjun Sharma",
      role: "Wedding · Mumbai",
      avatar: "https://images.unsplash.com/photo-1677083969185-ae09e0881828?w=80&h=80&fit=crop&auto=format",
    },
    {
      text: "The corporate event coverage exceeded every expectation. Professional, discreet, and the turnaround was extraordinary. They are now our permanent partner.",
      name: "Daniel Okonkwo",
      role: "CEO · Radiance Group, London",
      avatar: "https://images.unsplash.com/photo-1576280314550-773c50583407?w=80&h=80&fit=crop&auto=format",
    },
    {
      text: "The client portal changed everything. Being able to browse, comment, and approve from my phone felt like the future of photography — and it made me feel completely cared for.",
      name: "Sarah Mitchell",
      role: "Engagement Session · Edinburgh",
      avatar: "https://images.unsplash.com/photo-1677083969591-fa83c49e123b?w=80&h=80&fit=crop&auto=format",
      isGoogle: true,
    },
  ];

  return (
    <section className="py-28 lg:py-44">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <FadeIn className="mb-20">
          <EyebrowLabel>What Clients Say</EyebrowLabel>
          <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#111] leading-[0.9]">
            Stories from<br />
            <em>those we served</em>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#111]/7 border-t border-[#111]/7 border-b">
          {quotes.map((q, i) => (
            <FadeIn key={i} delay={i * 100} className="p-8 lg:p-12 flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={11} className="fill-[#C9A86A] text-[#C9A86A]" />
                ))}
              </div>

              {/* Quote mark */}
              <div
                className="font-serif text-[64px] text-[#C9A86A]/20 leading-none mb-2 -ml-1 flex items-center justify-between"
                
                aria-hidden
              >
                &ldquo;
                {q.isGoogle && (
                  <div className="flex items-center gap-1 opacity-70">
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-[10px] tracking-wide text-[#111] uppercase font-sans font-medium">Google Review</span>
                  </div>
                )}
              </div>

              <blockquote
                className="font-serif text-[20px] lg:text-[22px] text-[#111] font-normal leading-[1.48] flex-1 mb-10"
                
              >
                {q.text}
              </blockquote>

              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={q.avatar}
                  alt={q.name}
                  className="w-11 h-11 rounded-full object-cover bg-[#E8E4DC] flex-shrink-0"
                />
                <div>
                  <div className="text-[13px] font-semibold text-[#111]">{q.name}</div>
                  <div className="text-[11px] text-[#111]/40 mt-0.5">{q.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Google badge */}
        <FadeIn delay={100} className="mt-10 flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} size={13} className="fill-[#C9A86A] text-[#C9A86A]" />
            ))}
          </div>
          <span className="text-[13px] text-[#111]/45">
            <strong className="text-[#111] font-semibold">4.9</strong> — Rated on Google Reviews across 500+ clients
          </span>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Latest Stories (Journal)
───────────────────────────────────────────── */
function LatestStories() {
  const articles = [
    {
      img: "https://images.unsplash.com/photo-1764255510960-deee566a91f0?w=700&h=500&fit=crop&auto=format",
      alt: "People dining under warm lights at an elegant event",
      tag: "Behind the Lens",
      date: "12 Jun 2025",
      title: "A day in the life of a Cabmora photographer",
    },
    {
      img: "https://images.unsplash.com/photo-1770301312795-abdc6deee5a8?w=700&h=500&fit=crop&auto=format",
      alt: "Bride and groom holding hands at dusk",
      tag: "Wedding Guide",
      date: "28 May 2025",
      title: "How to prepare for your wedding photography session",
    },
    {
      img: "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?w=700&h=500&fit=crop&auto=format",
      alt: "Candlelit luxury dinner table arrangement",
      tag: "Corporate",
      date: "14 May 2025",
      title: "Why professional event photography matters for your brand",
    },
  ];

  return (
    <section className="py-28 lg:py-44 bg-[#F5F3EE]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 lg:mb-20">
          <FadeIn direction="left">
            <EyebrowLabel>Journal</EyebrowLabel>
            <h2 className="font-serif text-[clamp(40px,6vw,84px)] text-[#111] leading-[0.9]">
              Latest<br />
              <em>Stories</em>
            </h2>
          </FadeIn>
          <FadeIn direction="right" delay={80} className="lg:mb-2">
            <button className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#111] border-b border-[#111]/18 pb-1 hover:border-[#C9A86A] hover:text-[#C9A86A] transition-colors duration-300 font-medium">
              Read All Articles <ArrowRight size={11} />
            </button>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {articles.map((a, i) => (
            <FadeIn key={i} delay={i * 80} className="group cursor-pointer">
              <div className="overflow-hidden aspect-[4/3] bg-[#E8E4DC] mb-6">
                <img
                  src={a.img}
                  alt={a.alt}
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[9.5px] tracking-[0.28em] uppercase text-[#C9A86A] font-medium">{a.tag}</span>
                <span className="text-[#111]/18">—</span>
                <span className="text-[10px] text-[#111]/35">{a.date}</span>
              </div>
              <h3
                className="font-serif text-[20px] lg:text-[22px] text-[#111] font-normal leading-[1.3] group-hover:text-[#111]/65 transition-colors duration-300"
                
              >
                {a.title}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#111]/35 group-hover:text-[#C9A86A] transition-colors duration-300 font-medium">
                Read More <ArrowRight size={9} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Final CTA
───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section id="contact" className="relative py-32 lg:py-52 bg-[#111] overflow-hidden">
      {/* Background image at low opacity */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1782787541129-94c8ce50e09c?w=1920&h=900&fit=crop&auto=format"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        <div className="absolute inset-0 bg-[#111]/70" />
      </div>

      {/* Decorative gold lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 lg:h-24 bg-gradient-to-b from-transparent to-[#C9A86A]/40" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-14 text-center">
        <FadeIn>
          <EyebrowLabel>
            <span className="text-[#C9A86A] text-center w-full block">Begin Your Story</span>
          </EyebrowLabel>

          <h2 className="font-serif text-[clamp(48px,8vw,120px)] text-[#FAF9F6] font-normal leading-[0.88] mb-8 max-w-5xl mx-auto">
            Ready to preserve<br />
            <em className="text-[#C9A86A]">your memories?</em>
          </h2>

          <p className="text-[#FAF9F6]/45 text-[16px] lg:text-[18px] max-w-md mx-auto mb-14 leading-[1.75] font-light">
            Let's create something timeless together. Book your consultation and begin a journey you'll want to relive forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group inline-flex items-center justify-center gap-3 bg-[#C9A86A] text-[#111] px-10 py-[17px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-colors duration-400">
              Book Your Session
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="inline-flex items-center justify-center gap-3 border border-[#FAF9F6]/22 text-[#FAF9F6] px-10 py-[17px] text-[11.5px] tracking-[0.18em] uppercase font-medium hover:border-[#FAF9F6]/50 hover:bg-[#FAF9F6]/4 transition-all duration-300">
              View Packages
            </button>
          </div>

          {/* Contact details */}
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-16">
            {[
              { label: "Email", value: "hello@cabmora.com" },
              { label: "Phone", value: "+44 20 7946 0958" },
              { label: "Based in", value: "London, United Kingdom" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[9px] tracking-[0.28em] uppercase text-[#C9A86A]/70 mb-1.5 font-medium">{item.label}</div>
                <div className="text-[#FAF9F6]/45 text-[13px]">{item.value}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-t from-transparent to-[#C9A86A]/40" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
export function Footer() {
  const footerCols = [
    {
      title: "Services",
      links: ["Wedding Photography", "Videography", "Corporate Events", "Drone Coverage", "Livestreaming", "Photo Albums"],
    },
    {
      title: "Explore",
      links: ["Portfolio", "Packages & Pricing", "Client Portal", "Journal", "Help Center", "About Cabmora"],
    },
    {
      title: "Contact",
      links: ["hello@cabmora.com", "+44 20 7946 0958", "London, United Kingdom", "Book a Consultation"],
    },
  ];

  return (
    <footer className="bg-[#0A0908] border-t border-[#FAF9F6]/4">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 pt-16 lg:pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <img
                src={LogoWhite}
                alt="Cabmora Logo"
                className="h-[54px] w-auto object-contain"
              />
            </div>
            <p className="text-[#FAF9F6]/28 text-[13.5px] leading-[1.78] max-w-[260px] mb-8">
              Premium photography and videography for life's most meaningful moments — beautifully captured, forever preserved.
            </p>
            <div className="flex gap-6">
              {["Instagram", "Facebook", "Pinterest"].map((s) => (
                <a
                  key={s}
                  href="/"
                  className="text-[10px] tracking-[0.16em] uppercase text-[#FAF9F6]/25 hover:text-[#C9A86A] transition-colors duration-300 font-medium"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <div className="text-[9.5px] tracking-[0.28em] uppercase text-[#FAF9F6]/25 mb-6 font-medium">
                {col.title}
              </div>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    {link === "Book a Consultation" ? (
                      <Link
                        to="/contact"
                        className="text-[13px] text-[#FAF9F6]/42 hover:text-[#FAF9F6]/80 transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    ) : link === "Help Center" ? (
                      <Link
                        to="/help"
                        className="text-[13px] text-[#FAF9F6]/42 hover:text-[#FAF9F6]/80 transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    ) : link === "Journal" ? (
                      <Link
                        to="/blog"
                        className="text-[13px] text-[#FAF9F6]/42 hover:text-[#FAF9F6]/80 transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    ) : (
                      <a
                        href="/"
                        className="text-[13px] text-[#FAF9F6]/42 hover:text-[#FAF9F6]/80 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#FAF9F6]/5 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-[#FAF9F6]/18">
            © 2025 Cabmora Ltd. All rights reserved.
          </span>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a
                key={l}
                href="/"
                className="text-[11px] text-[#FAF9F6]/18 hover:text-[#FAF9F6]/45 transition-colors duration-200"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   Root App
───────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#111] overflow-x-hidden">
      <Navigation />
      <Hero />
      <Stats />
      <FeaturedStories />
      <Services />
      <Pricing />
      <WhyCabmora />
      <HowItWorks />
      <ClientPortal />
      <CreatorPlatform />
      <Testimonials />
      <LatestStories />
      <FinalCTA />
      <Footer />
    </div>
  );
}


/* ─────────────────────────────────────────────
   Root App
───────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/galleries" element={<GalleriesPage />} />
        <Route path="/upload" element={<MediaUploadPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/storage" element={<StoragePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/client/dashboard" element={<ClientPortalPage />} />
      </Routes>
    </BrowserRouter>
  );
}
