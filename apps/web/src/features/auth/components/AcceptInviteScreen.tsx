import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

import { ApiError, authApi } from '@cabmora/api-client';

import { homePathForRole, useAuth } from '@/shared/auth';

/**
 * Where an invite link lands.
 *
 * An admin created this account so the client would not have to sign up; all
 * that is left is choosing a password. Accepting signs them straight in — they
 * have just proved they hold a single-use link sent to their address and picked
 * a password, so a login form afterwards is friction with no security.
 */
export function AcceptInviteScreen() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));

    if (password !== String(form.get('confirm_password'))) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    setError(null);
    setSubmitting(true);

    try {
      const result = await authApi.acceptInvite(token, password);
      // The response set the session cookie; tell the provider to pick it up
      // rather than leaving the app believing it is signed out.
      await refresh();
      navigate(homePathForRole(result.user.role), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.',
      );
      setSubmitting(false);
    }
  }

  const field =
    'w-full bg-canvas/8 border text-canvas pl-12 pr-12 py-4 text-[15px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light';

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center text-canvas px-6 py-16">
      <div className="max-w-[440px] w-full">
        <Link to="/" className="inline-block mb-12">
          <img src={LogoWhite} alt="Cabmora" className="h-[56px] w-auto object-contain" />
        </Link>

        {!token ? (
          <>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-tight mb-4">
              This link is incomplete
            </h1>
            <p className="text-canvas/55 text-[15px] font-light leading-[1.7]">
              Open the link from your invitation email exactly as it was sent. If it keeps failing,{' '}
              <Link to="/contact" className="text-gold hover:text-canvas border-b border-gold/30">
                let us know
              </Link>{' '}
              and we will send a new one.
            </p>
          </>
        ) : (
          <>
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium block mb-4">
              Set your password
            </span>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-tight mb-4">
              Welcome to Cabmora
            </h1>
            <p className="text-canvas/55 text-[15px] font-light leading-[1.7] mb-10">
              Your account is ready. Choose a password and your galleries will be waiting.
            </p>

            <form className="space-y-6 group/form" onSubmit={handleSubmit}>
              {error && (
                <div
                  role="alert"
                  className="border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-[13px] font-light"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="invite-password"
                  className="text-[11px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  Choose a password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    id="invite-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    className={`${field} border-canvas/25`}
                    placeholder="At least 8 characters"
                    required
                    autoFocus
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

              <div className="space-y-2">
                <label
                  htmlFor="invite-confirm"
                  className="text-[11px] tracking-[0.15em] uppercase text-canvas/60 font-medium block"
                >
                  Confirm password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/40 group-focus-within:text-gold transition-colors duration-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    id="invite-confirm"
                    name="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    aria-invalid={mismatch}
                    aria-describedby={mismatch ? 'invite-confirm-error' : undefined}
                    onChange={() => mismatch && setMismatch(false)}
                    className={`${field} ${mismatch ? 'border-danger' : 'border-canvas/25'}`}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
                {mismatch && (
                  <p
                    id="invite-confirm-error"
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
                {submitting ? 'Setting up…' : 'Set password and continue'}
                {!submitting && (
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
