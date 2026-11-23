import { useState, type FormEvent } from 'react';
import { ArrowRight, Mail, MailCheck } from 'lucide-react';

import { ApiError, authApi } from '@cabmora/api-client';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

/**
 * Account recovery.
 *
 * The confirmation deliberately does not say whether that address has an
 * account. The API answers identically either way, and a screen that said
 * "no account found" would undo that in one sentence — turning the sign-in
 * page into a way to ask whether a given person is a Cabmora client.
 */
export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!email) return;

    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Only a transport or server failure can land here — a missing account
      // is a success as far as this endpoint is concerned.
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    'w-full bg-canvas/8 border border-canvas/15 text-canvas pl-12 pr-4 py-4 text-[15px] outline-none focus:border-gold focus:bg-canvas/12 focus:ring-1 focus:ring-gold/30 transition-all duration-300 placeholder:text-canvas/25 font-light';

  return (
    <>
      <div className="mb-12">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium block mb-4">
          Password Recovery
        </span>
        <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal leading-tight mb-4">
          Recover access
        </h1>
        <p className="text-canvas/50 text-[15px] font-light leading-[1.6]">
          {sent
            ? 'Check your inbox.'
            : 'Enter the email address on your account and we will send you a link to choose a new password.'}
        </p>
      </div>

      {sent ? (
        <div className="bg-canvas/5 border border-gold/30 p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto">
            <MailCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-[20px] font-normal text-canvas">Link on its way</h2>
            <p className="text-canvas/60 text-[14px] font-light leading-[1.6]">
              If that address has a Cabmora account, a reset link is on its way. It works once and
              expires in an hour.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <p role="alert" className="text-[13px] text-red-300 font-light">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="recovery-email"
              className="text-[11px] tracking-[0.15em] uppercase text-canvas/50 font-semibold block mb-3"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-canvas/30"
                aria-hidden
              />
              <input
                id="recovery-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={submitting}
                placeholder="you@example.com"
                className={field}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full group inline-flex items-center justify-center gap-3 bg-gold text-ink px-8 py-[18px] text-[11.5px] tracking-[0.18em] uppercase font-semibold hover:bg-canvas transition-all duration-400 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </form>
      )}

      <div className="text-center pt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] tracking-[0.15em] uppercase text-canvas/50 hover:text-gold transition-colors duration-300 font-semibold cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
