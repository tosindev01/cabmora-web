import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { DEV_CREDENTIALS } from '@/features/auth/devCredentials';
import { landingPath, toSignInMessage, useAdminAuth } from '@/shared/auth';

export default function AdminLoginPage() {
  const { signIn } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Uncontrolled inputs read on submit: nothing here needs the value on every
  // keystroke, and a password does not want to live in React state or a render
  // tree any longer than it must.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const user = await signIn(String(form.get('email')), String(form.get('password')));
      navigate(landingPath(user.role), { replace: true });
    } catch (err) {
      // Covers both "wrong credentials" and "correct credentials, not staff" —
      // the provider has already surrendered the session cookie in the latter
      // case. The copy stays vague on purpose: telling a stranger that an
      // account exists but lacks admin rights is more than they need to know.
      setErrorMsg(toSignInMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir flex text-canvas overflow-hidden relative">
      {/* Brand Logo - Top Left */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-50 flex items-center gap-4">
        <img
          src={LogoWhite}
          alt="Cabmora Logo"
          className="h-[52px] sm:h-[60px] w-auto object-contain"
        />
        <div className="h-6 w-px bg-canvas/20 hidden sm:block" />
        <span className="text-[11.5px] tracking-[0.25em] uppercase text-gold font-bold hidden sm:inline-block">
          ADMINISTRATOR PORTAL
        </span>
      </div>

      {/* Left Visual Cinematic Panel */}
      <div className="hidden lg:block lg:w-[48%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920&h=1200&fit=crop&auto=format"
            alt="Cinematic production studio"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir" />
        </div>

        <div className="absolute bottom-16 left-14 max-w-[400px]">
          <div className="w-12 h-px bg-gold mb-6" />
          <p className="font-sans text-[28px] font-normal leading-[1.3] text-canvas mb-4">
            Command Center for High-End Creators & Media Infrastructure.
          </p>
          <div className="flex items-center gap-2 text-[12.5px] tracking-[0.2em] uppercase text-gold font-semibold">
            <ShieldCheck size={16} />
            Encrypted Admin Gateway
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-20 relative">
        <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:ml-12">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11.5px] font-bold uppercase tracking-[0.2em] mb-4">
              <KeyRound size={12} />
              Authorised Access Only
            </div>
            <h1 className="font-sans text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-3">
              Admin Sign In
            </h1>
            <p className="text-canvas/55 text-[16px] font-light leading-[1.6]">
              Sign in with your administrative key to oversee users, creators, project workflows,
              moderation, and financials.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-6 p-4 bg-danger/10 border border-danger/40 text-danger text-[14.5px] rounded"
            >
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[12.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block">
                Administrator Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={DEV_CREDENTIALS?.email}
                  autoFocus
                  className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-4 text-[16px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                  placeholder="admin@cabmora.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block">
                  Security Passcode
                </label>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  defaultValue={DEV_CREDENTIALS?.password}
                  minLength={8}
                  className="w-full bg-canvas/8 border border-canvas/25 text-canvas pl-12 pr-12 py-4 text-[16px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-canvas/40 hover:text-gold focus:text-gold transition-colors duration-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full group flex items-center justify-center gap-3 bg-gold text-ink px-8 py-[18px] text-[13px] tracking-[0.18em] uppercase font-bold hover:bg-canvas transition-all duration-300 mt-6 cursor-pointer shadow-lg dim-until-valid disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold"
            >
              {submitting ? 'Signing In…' : 'Access Admin Dashboard'}
              {!submitting && (
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
