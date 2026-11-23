import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

import { ApiError, authApi } from '@cabmora/api-client';

import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { landingPath } from '@/shared/auth';

/**
 * Where a colleague's invite link lands.
 *
 * The console has its own copy of this rather than sharing the public site's,
 * because the session cookie is scoped to the host that sets it: a coordinator
 * who chose a password on cabmoramedia.com would have to sign in again here,
 * on a screen the public site never mentions. Setting it on this origin means
 * the one act gets them to their work.
 *
 * Accepting signs them straight in. They have just proved they hold a
 * single-use link sent to their address and chosen a password; a login form
 * after that is friction with no security.
 */
export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

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
      // A full load rather than a client-side navigation: the response set the
      // session cookie, and the auth provider only asks who you are on mount.
      window.location.replace(landingPath(result.user.role));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.',
      );
      setSubmitting(false);
    }
  }

  const field =
    'w-full bg-canvas/8 border border-canvas/15 text-canvas pl-12 pr-12 py-4 text-[16.5px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light rounded-lg';

  if (!token) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center text-canvas px-6">
        <div className="max-w-[420px] text-center">
          <h1 className="text-[24px] font-sans font-medium mb-2">This link is incomplete</h1>
          <p className="text-canvas/60 text-[15.5px] mb-6">
            Open the link from your invitation email exactly as it was sent. If it has already been
            used, ask an administrator to invite you again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="text-[13.5px] font-bold uppercase tracking-[0.05em] text-gold hover:text-canvas transition-colors cursor-pointer"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center text-canvas px-6 py-16">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-4 mb-10">
          <img src={LogoWhite} alt="Cabmora" className="h-[52px] w-auto object-contain" />
          <div className="h-6 w-px bg-canvas/20" />
          <span className="text-[12.5px] uppercase tracking-[0.2em] text-canvas/50 font-bold">
            Admin Console
          </span>
        </div>

        <h1 className="text-[32px] font-sans font-medium mb-2">Choose a password</h1>
        <p className="text-canvas/55 text-[15.5px] mb-8">
          Your account is ready. Set a password and you will be taken straight in.
        </p>

        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-[14.5px] mb-6"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/35"
              aria-hidden
            />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="New password"
              aria-label="New password"
              className={field}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-canvas/35 hover:text-canvas/70 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/35"
              aria-hidden
            />
            <input
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm password"
              aria-label="Confirm password"
              className={field}
            />
          </div>

          {mismatch && (
            <p role="alert" className="text-[14.5px] text-red-300">
              Those two passwords are not the same.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-noir px-6 py-4 text-[13.5px] font-bold tracking-[0.15em] uppercase hover:bg-canvas transition-colors cursor-pointer disabled:opacity-50 rounded-lg flex items-center justify-center gap-2"
          >
            {submitting ? 'Setting up…' : 'Set password and continue'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-canvas/40 text-[13.5px] mt-8 flex items-start gap-2">
          <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" aria-hidden />
          This link works once. Nobody at Cabmora sees the password you choose.
        </p>
      </div>
    </div>
  );
}
