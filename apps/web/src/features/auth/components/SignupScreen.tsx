import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Eye, EyeOff, Globe, Lock, Mail, User } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

import { useSignupForm } from '@/features/auth/hooks/useSignupForm';

/**
 * Creator-signup screen.
 *
 * Two caveats worth knowing before this is treated as a creator onboarding:
 *
 * 1. `RegisterUser` defaults every account to `UserRole.CUSTOMER` and
 *    `RegisterRequest` has no `role` field, so this creates a customer. That is
 *    deliberate for now — a public endpoint that lets the caller pick its own
 *    role is how you get self-service admins. Promotion to creator is an admin
 *    action until a real application flow exists.
 * 2. `website` and `specialty` are collected because the design asks for them,
 *    but the API has nowhere to put them yet, so they are not sent. They stay
 *    in the markup so the fields do not have to be re-added later.
 */
export function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const { state, submit } = useSignupForm();

  const submitting = state.status === 'submitting';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));

    // Checked here and never sent. A confirm field catches a typo, which is a
    // browser-side problem — the API has nothing to compare it against, and
    // sending it would only put the secret on the wire twice.
    if (password !== String(form.get('confirm_password'))) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    void submit(
      String(form.get('email')),
      String(form.get('first_name')),
      String(form.get('last_name')),
      password,
      'creator',
    );
  }

  return (
    <div className="min-h-screen bg-noir flex text-canvas overflow-hidden relative">
      {/* Desktop logo overlay */}
      <Link to="/" className="hidden lg:block lg:absolute lg:top-12 lg:left-12 lg:z-50">
        <img
          src={LogoWhite}
          alt="Cabmora"
          className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-80 transition-opacity duration-300"
        />
      </Link>

      {/* Left image */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&h=1200&fit=crop&auto=format"
            alt="Photographer holding professional camera overlooking scenery"
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-16 left-14 max-w-[320px]">
          <div className="w-8 h-px bg-gold mb-6" />
          <p className="font-serif text-[24px] font-normal leading-[1.3] text-canvas mb-4">
            "Delivering high-resolution, luxury galleries to our clients has never been more
            effortless."
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
            Studio Partner
          </span>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative">
        <div className="max-w-[440px] w-full mx-auto lg:mx-0 lg:ml-12">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 sm:mb-14">
            <Link to="/" className="inline-block">
              <img
                src={LogoWhite}
                alt="Cabmora"
                className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-85 transition-opacity duration-300"
              />
            </Link>
          </div>

          <div className="mb-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium block mb-4">
              Creator Studio Hub
            </span>
            <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
              Join as a Creator
            </h1>
            <p className="text-canvas/50 text-[15px] font-light leading-[1.6]">
              Elevate your studio. Deliver beautiful, high-speed, white-labeled client galleries
              under your own brand name. Applications are reviewed by our team before your studio
              goes live.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {state.status === 'error' && (
              <div
                role="alert"
                className="border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-[13px] font-light"
              >
                {state.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-first-name"
                  className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  First Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    id="signup-first-name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    maxLength={120}
                    className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-last-name"
                  className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  Last Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    id="signup-last-name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    maxLength={120}
                    className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                  placeholder="hello@studio.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-website"
                  className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  Portfolio / Website
                </label>
                <div className="relative group">
                  <Globe
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    id="signup-website"
                    name="website"
                    type="url"
                    className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-specialty"
                  className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  Primary Specialty
                </label>
                <div className="relative group">
                  <Camera
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <select
                    id="signup-specialty"
                    name="specialty"
                    defaultValue="wedding"
                    className="w-full bg-canvas/8 border border-canvas/25 text-canvas pl-12 pr-4 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 font-light appearance-none"
                  >
                    <option value="wedding" className="bg-panel">
                      Wedding &amp; Couples
                    </option>
                    <option value="portrait" className="bg-panel">
                      Portraits &amp; Fashion
                    </option>
                    <option value="commercial" className="bg-panel">
                      Commercial &amp; Brands
                    </option>
                    <option value="landscape" className="bg-panel">
                      Landscape &amp; Fine Art
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
              >
                Choose Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  /* Mirrors `Field(min_length=8, max_length=128)` on the API. */
                  minLength={8}
                  maxLength={128}
                  className="w-full bg-canvas/8 border border-canvas/25 text-canvas pl-12 pr-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
                  placeholder="At least 8 characters"
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

            <div className="space-y-1.5">
              <label
                htmlFor="signup-confirm-password"
                className="text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  id="signup-confirm-password"
                  name="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  aria-invalid={mismatch}
                  aria-describedby={mismatch ? 'signup-confirm-error' : undefined}
                  /* Clear as soon as they start fixing it — an error that sits
                     there while you retype reads as though the fix isn't working. */
                  onChange={() => mismatch && setMismatch(false)}
                  className={`w-full bg-canvas/8 border text-canvas pl-12 pr-4 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light ${
                    mismatch ? 'border-danger' : 'border-canvas/25'
                  }`}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              {mismatch && (
                <p
                  id="signup-confirm-error"
                  role="alert"
                  className="text-danger text-[12px] font-light"
                >
                  Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full group flex items-center justify-center gap-3 bg-gold text-ink px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-canvas transition-all duration-400 mt-4 cursor-pointer dim-until-valid disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold"
            >
              {submitting ? 'Creating Account…' : 'Apply as Creator'}
              {!submitting && (
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-canvas/10 flex flex-col items-center gap-4">
            <p className="text-[13px] text-canvas/40 font-light">
              Booking a shoot instead?{' '}
              <Link
                to="/signup"
                className="text-canvas hover:text-gold transition-colors duration-300 border-b border-canvas/30 hover:border-gold pb-0.5"
              >
                Create a client account
              </Link>
            </p>
            <p className="text-[13px] text-canvas/40 font-light">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-canvas hover:text-gold transition-colors duration-300 border-b border-canvas/30 hover:border-gold pb-0.5"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
