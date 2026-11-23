import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

import { useSignupForm } from '@/features/auth/hooks/useSignupForm';

/**
 * Customer account creation — the PRD's "[M] Account Creation".
 *
 * This did not exist: `/signup` was the creator application, so a customer had
 * nowhere to register. Customers are the self-serve B2C funnel the PRD measures
 * adoption by, so this account is ACTIVE immediately — no acceptance queue.
 * Only creators are vetted.
 */
export function CustomerSignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const { state, submit } = useSignupForm();

  const submitting = state.status === 'submitting';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));

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
      'customer',
    );
  }

  const field =
    'w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light';
  const label = 'text-[10.5px] tracking-[0.15em] uppercase text-canvas/60 font-medium block';
  const icon =
    'absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300';

  return (
    <div className="min-h-screen bg-noir flex text-canvas overflow-hidden relative">
      <Link to="/" className="hidden lg:block lg:absolute lg:top-12 lg:left-12 lg:z-50">
        <img
          src={LogoWhite}
          alt="Cabmora"
          className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-80 transition-opacity duration-300"
        />
      </Link>

      <div className="hidden lg:block lg:w-[45%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1200&fit=crop&auto=format"
            alt="Couple celebrating at their wedding reception"
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-16 left-14 max-w-[320px]">
          <div className="w-8 h-px bg-gold mb-6" />
          <p className="font-serif text-[24px] font-normal leading-[1.3] text-canvas mb-4">
            "Every frame arrived exactly as we'd imagined — and we watched it all come together."
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
            Amara &amp; Tolu
          </span>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative">
        <div className="max-w-[440px] w-full mx-auto lg:mx-0 lg:ml-12">
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
              Client Portal
            </span>
            <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
              Create your account
            </h1>
            <p className="text-canvas/50 text-[15px] font-light leading-[1.6]">
              Track your booking, preview your gallery, request changes and approve the final films
              all in one place.
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
                <label htmlFor="cust-first-name" className={label}>
                  First Name
                </label>
                <div className="relative group">
                  <User className={icon} size={18} strokeWidth={1.5} />
                  <input
                    id="cust-first-name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    maxLength={120}
                    className={field}
                    placeholder="Amara"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cust-last-name" className={label}>
                  Last Name
                </label>
                <div className="relative group">
                  <User className={icon} size={18} strokeWidth={1.5} />
                  <input
                    id="cust-last-name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    maxLength={120}
                    className={field}
                    placeholder="Okafor"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cust-email" className={label}>
                Email Address
              </label>
              <div className="relative group">
                <Mail className={icon} size={18} strokeWidth={1.5} />
                <input
                  id="cust-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={field}
                  placeholder="hello@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cust-password" className={label}>
                Choose Password
              </label>
              <div className="relative group">
                <Lock className={icon} size={18} strokeWidth={1.5} />
                <input
                  id="cust-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  className={`${field} pr-12`}
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
              <label htmlFor="cust-confirm-password" className={label}>
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className={icon} size={18} strokeWidth={1.5} />
                <input
                  id="cust-confirm-password"
                  name="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  aria-invalid={mismatch}
                  aria-describedby={mismatch ? 'cust-confirm-error' : undefined}
                  onChange={() => mismatch && setMismatch(false)}
                  className={`w-full bg-canvas/8 border text-canvas px-12 py-3.5 text-[14.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light ${mismatch ? 'border-danger' : 'border-canvas/25'}`}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              {mismatch && (
                <p
                  id="cust-confirm-error"
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
              {submitting ? 'Creating Account…' : 'Create Account'}
              {!submitting && (
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-canvas/10 flex flex-col items-center gap-3">
            <p className="text-[13px] text-canvas/40 font-light">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-canvas hover:text-gold transition-colors duration-300 border-b border-canvas/30 hover:border-gold pb-0.5"
              >
                Sign In
              </Link>
            </p>
            <p className="text-[13px] text-canvas/40 font-light">
              Are you a photographer or videographer?{' '}
              <Link
                to="/signup/creator"
                className="text-canvas hover:text-gold transition-colors duration-300 border-b border-canvas/30 hover:border-gold pb-0.5"
              >
                Join as a creator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
