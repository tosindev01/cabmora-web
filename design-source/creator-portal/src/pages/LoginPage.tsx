import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSubmitted, setResetSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    setResetSubmitted(true);
  };

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
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920&h=1200&fit=crop&auto=format"
            alt="Cinematic wedding moment"
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0E0C0A]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-transparent to-transparent" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-16 left-14 max-w-[320px]">
          <div className="w-8 h-px bg-[#C9A86A] mb-6" />
          <p className="font-serif text-[24px] font-normal leading-[1.3] text-[#FAF9F6] mb-4">
            "Cabmora preserved our memories with a cinematic elegance we will cherish forever."
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-medium">
            Elena & Marco
          </span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative">
        
        <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:ml-12">
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
          {mode === "login" ? (
            <>
              <div className="mb-12">
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86A] font-medium block mb-4">
                  Client Portal
                </span>
                <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
                  Welcome back
                </h1>
                <p className="text-[#FAF9F6]/50 text-[15px] font-light leading-[1.6]">
                  Sign in to access your private galleries and curate your visual stories.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] px-12 py-4 text-[15px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                      placeholder="hello@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setResetSubmitted(false);
                      }}
                      className="text-[11px] text-[#C9A86A] hover:text-[#FAF9F6] font-medium transition-colors duration-300 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] pl-12 pr-12 py-4 text-[15px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
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
                  Sign In
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-[#FAF9F6]/10 flex flex-col items-center gap-4">
                <p className="text-[13px] text-[#FAF9F6]/40 font-light">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-[#FAF9F6] hover:text-[#C9A86A] transition-colors duration-300 border-b border-[#FAF9F6]/30 hover:border-[#C9A86A] pb-0.5">
                    Create a Creator account
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-12">
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86A] font-medium block mb-4">
                  Password Recovery
                </span>
                <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
                  Recover access
                </h1>
                <p className="text-[#FAF9F6]/50 text-[15px] font-light leading-[1.6]">
                  Enter your email address and we will send you instructions to safely reset your password.
                </p>
              </div>

              {resetSubmitted ? (
                <div className="bg-[#FAF9F6]/5 border border-[#C9A86A]/30 p-8 text-center space-y-6">
                  <div className="w-12 h-12 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/30 flex items-center justify-center text-[#C9A86A] mx-auto">
                    <Check size={24} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-[20px] font-normal text-[#FAF9F6]">Check your inbox</h3>
                    <p className="text-[#FAF9F6]/60 text-[14px] font-light leading-[1.6]">
                      We have sent a secure recovery link to <strong className="text-[#FAF9F6] font-medium">{email}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setResetSubmitted(false);
                    }}
                    className="text-[11px] tracking-[0.15em] uppercase text-[#C9A86A] hover:text-[#FAF9F6] border-b border-[#C9A86A]/30 pb-0.5 transition-colors duration-300 font-semibold cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleResetSubmit}>
                  <div className="space-y-2">
                    <label className="text-[11px] tracking-[0.15em] uppercase text-[#FAF9F6]/60 font-medium block">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/40 group-focus-within:text-[#C9A86A] transition-colors duration-300" size={18} strokeWidth={1.5} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF9F6]/8 border border-[#FAF9F6]/25 text-[#FAF9F6] px-12 py-4 text-[15px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6]/12 focus:ring-1 focus:ring-[#C9A86A]/30 transition-all duration-300 placeholder:text-[#FAF9F6]/25 font-light"
                        placeholder="hello@example.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full group flex items-center justify-center gap-3 bg-[#C9A86A] text-[#111] px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-[#FAF9F6] transition-all duration-400 mt-4 cursor-pointer"
                  >
                    Send Instructions
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-[11px] tracking-[0.15em] uppercase text-[#FAF9F6]/50 hover:text-[#C9A86A] transition-colors duration-300 font-semibold cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
