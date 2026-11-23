import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, User, Globe, Camera, Check, Eye, EyeOff } from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [specialty, setSpecialty] = useState("wedding");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] flex text-[#FAF9F6] items-center justify-center p-6">
        <div className="max-w-[480px] w-full text-center bg-[#181614] border border-[#FAF9F6]/10 p-10 lg:p-14 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86A]/5 via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/30 flex items-center justify-center text-[#C9A86A] mb-8">
              <Check size={32} strokeWidth={1.5} />
            </div>
            
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86A] font-medium block mb-4">
              Application Received
            </span>
            
            <h1 className="font-serif text-[clamp(28px,3vw,36px)] font-normal leading-tight mb-4">
              Welcome, {name.split(" ")[0]}
            </h1>
            
            <p className="text-[#FAF9F6]/60 text-[15px] font-light leading-[1.6] mb-10">
              Your creator studio request is being reviewed. We will contact you at <strong className="text-[#FAF9F6]">{email}</strong> within 24 hours to set up your custom white-labeled portal.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-[#C9A86A] text-[#111] px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-all duration-400 w-full justify-center"
            >
              Return Home
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0C0A] flex text-[#FAF9F6] overflow-hidden relative">
      {/* Brand Logo - Desktop Absolute Placement (overlays left image) */}
      <Link to="/" className="hidden lg:block lg:absolute lg:top-12 lg:left-12 lg:z-50">
        <img
          src={LogoWhite}
          alt="Cabmora Logo"
          className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-80 transition-opacity duration-300"
        />
      </Link>

      {/* Left Image Section */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&h=1200&fit=crop&auto=format"
            alt="Photographer holding professional camera overlooking scenery"
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0E0C0A]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-transparent to-transparent" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-16 left-14 max-w-[320px]">
          <div className="w-8 h-px bg-[#C9A86A] mb-6" />
          <p className="font-serif text-[24px] font-normal leading-[1.3] text-[#FAF9F6] mb-4">
            "Delivering high-resolution, luxury galleries to our clients has never been more effortless."
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-medium">
            Studio Partner
          </span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative">
        
        <div className="max-w-[440px] w-full mx-auto lg:mx-0 lg:ml-12">
          {/* Brand Logo - Mobile/Tablet Inline Placement */}
          <div className="lg:hidden mb-12 sm:mb-14">
            <Link to="/" className="inline-block">
              <img
                src={LogoWhite}
                alt="Cabmora Logo"
                className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-85 transition-opacity duration-300"
              />
            </Link>
          </div>
          <div className="mb-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86A] font-medium block mb-4">
              Creator Studio Hub
            </span>
            <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
              Join as a Creator
            </h1>
            <p className="text-[#FAF9F6]/50 text-[15px] font-light leading-[1.6]">
              Elevate your studio. Deliver beautiful, high-speed, white-labeled client galleries under your own brand name.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10.5px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                Studio / Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] px-12 py-3.5 text-[14.5px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                  placeholder="e.g. John Doe / Apex Studios"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] px-12 py-3.5 text-[14.5px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                  placeholder="hello@studio.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                  Portfolio / Website
                </label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] px-12 py-3.5 text-[14.5px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                  Primary Specialty
                </label>
                <div className="relative group">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] pl-12 pr-4 py-3.5 text-[14.5px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 font-light appearance-none"
                  >
                    <option value="wedding" className="bg-[#181614]">Wedding & Couples</option>
                    <option value="portrait" className="bg-[#181614]">Portraits & Fashion</option>
                    <option value="commercial" className="bg-[#181614]">Commercial & Brands</option>
                    <option value="landscape" className="bg-[#181614]">Landscape & Fine Art</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                Choose Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] pl-12 pr-12 py-3.5 text-[14.5px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 hover:text-[#C9A86A] focus:text-[#C9A86A] transition-colors duration-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group flex items-center justify-center gap-3 bg-[#C9A86A] text-[#111] px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-all duration-400 mt-4 cursor-pointer"
            >
              Apply as Creator
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#FAF9F6]/10 flex flex-col items-center gap-4">
            <p className="text-[13px] text-[#FAF9F6]/40 font-light">
              Already have an account?{" "}
              <Link to="/login" className="text-[#FAF9F6] hover:text-[#C9A86A] transition-colors duration-300 border-b border-[#FAF9F6]/30 hover:border-[#C9A86A] pb-0.5">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
