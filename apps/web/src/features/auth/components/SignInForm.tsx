import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { DEV_CREDENTIALS } from '@/features/auth/devCredentials';

interface SignInFormProps {
  onForgotPassword: () => void;
}

/**
 * The sign-in half of the login screen.
 *
 * Inputs are uncontrolled and read via `FormData` on submit, matching
 * `features/enquiry/components/EnquiryForm`. Nothing here needs the value on
 * every keystroke, and controlled fields would re-render the whole screen as
 * the user types.
 */
export function SignInForm({ onForgotPassword }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { state, submit } = useLoginForm();

  const submitting = state.status === 'submitting';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void submit(String(form.get('email')), String(form.get('password')));
  }

  return (
    <>
      <div className="mb-12">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium block mb-4">
          Client Portal
        </span>
        <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
          Welcome back
        </h1>
        <p className="text-canvas/50 text-[15px] font-light leading-[1.6]">
          Sign in to access your private galleries and curate your visual stories.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {state.status === 'error' && (
          <div
            role="alert"
            className="border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-[13px] font-light"
          >
            {state.message}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-[11px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
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
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={DEV_CREDENTIALS?.email}
              autoFocus
              className="w-full bg-canvas/8 border border-canvas/25 text-canvas px-12 py-4 text-[15px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
              placeholder="hello@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[11px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] text-gold hover:text-canvas font-medium transition-colors duration-300 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
              size={18}
              strokeWidth={1.5}
            />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              defaultValue={DEV_CREDENTIALS?.password}
              /* Matches `Field(min_length=8)` on the API, so an obviously
                 too-short password fails in the browser rather than as a 422. */
              minLength={8}
              className="w-full bg-canvas/8 border border-canvas/25 text-canvas pl-12 pr-12 py-4 text-[15px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light"
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
          /* Dimmed while the form is incomplete, but deliberately NOT disabled:
             a disabled button swallows the click, so the browser never shows
             its "fill in this field" hint pointing at what is missing. */
          className="w-full group flex items-center justify-center gap-3 bg-gold text-ink px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-canvas transition-all duration-400 mt-4 cursor-pointer dim-until-valid disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold"
        >
          {submitting ? 'Signing In…' : 'Sign In'}
          {!submitting && (
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-canvas/10 flex flex-col items-center gap-4">
        <p className="text-[13px] text-canvas/40 font-light">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-canvas hover:text-gold transition-colors duration-300 border-b border-canvas/30 hover:border-gold pb-0.5"
          >
            Request access
          </Link>
        </p>
      </div>
    </>
  );
}
