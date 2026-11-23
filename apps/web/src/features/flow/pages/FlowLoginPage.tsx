import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Layers } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { CrossEcosystemBanner } from '@/shared/site';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';

export default function FlowLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // The same hook the Cabmora sign-in uses, rather than a second
  // implementation: one place decides what a failure means and where a role
  // lands afterwards. This form previously ignored what was typed, waited
  // half a second and navigated — so it "succeeded" for any input and the
  // route guard then bounced you straight back out, with no session and no
  // explanation.
  const { state, submit } = useLoginForm();
  const isLoading = state.status === 'submitting';

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(email, password);
  };

  return (
    <div className="min-h-screen bg-flow-950 flex flex-col justify-between text-canvas font-sans selection:bg-gold selection:text-ink">
      {/* Banner cross-linking to Cabmora Media / Studio */}
      <CrossEcosystemBanner target="media" />

      {/* Top Header */}
      <header className="p-6 sm:p-10 flex items-center justify-between">
        <Link to="/flow" className="flex items-center gap-2.5">
          <img src={LogoWhite} alt="Cabmora Logo" className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-1.5 pl-2 border-l border-canvas/20">
            <span className="text-[13px] tracking-[0.25em] font-semibold text-gold uppercase font-mono">
              FLOW
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs tracking-wider uppercase">
          <span className="hidden sm:inline text-white/40">Couples / Media Clients:</span>
          <Link
            to="/login"
            className="text-gold font-semibold hover:underline inline-flex items-center gap-1"
          >
            Client Portal <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="max-w-[460px] w-full mx-auto px-6 py-8 my-auto">
        <div className="bg-flow-900 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] tracking-[0.25em] uppercase text-gold font-semibold mb-3">
              <Layers size={12} />
              Studio Workspace
            </div>
            <h1 className="font-serif text-[28px] text-white font-normal mb-2">Creator Log In</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Sign in to manage your 4K client galleries, RAW media vaults, contracts, and milestone
              invoices.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">
                Studio Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@yourstudio.com"
                  className="w-full py-3 pl-10 pr-4 bg-flow-950 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-gold"
                />
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-white/60">
                  Password
                </label>
                {/* Sends them to the one reset flow that exists, on the
                    Cabmora sign-in. This used to alert "reset link dispatched
                    to your studio email" and send nothing — worse than no
                    link, because somebody then waits for an email that was
                    never written. Flow deserves its own, which is a separate
                    piece of work. */}
                <Link to="/login" className="text-[11px] text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-3 pl-10 pr-10 bg-flow-950 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-gold"
                />
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {state.status === 'error' && (
              <p
                role="alert"
                className="text-[12.5px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5"
              >
                {state.message}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark text-flow-900 font-bold text-xs tracking-[0.2em] uppercase rounded transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* New studio sign up note */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/50 space-y-2">
            <p>Don't have an approved studio workspace yet?</p>
            <div>
              <Link
                to="/flow/apply"
                className="text-gold font-semibold hover:underline uppercase tracking-wider text-[11px]"
              >
                Apply for access →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-white/30 border-t border-white/5">
        <span>© 2025 Cabmora Flow • High-performance visual studio infrastructure.</span>
      </footer>
    </div>
  );
}
