import { useState, FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Globe } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

export default function FlowSetupPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || 'FLOW_INV_OFFICIAL';
  const studioName = searchParams.get('studio') || 'Luminary Creative Studio';
  const email = searchParams.get('email') || 'creator@lensandlight.co';
  const plan = searchParams.get('plan') || 'pro';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subdomain, setSubdomain] = useState(
    studioName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mystudio',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Store session state or navigate to dashboard
      localStorage.setItem(
        'cabmora_flow_auth',
        JSON.stringify({
          studio: studioName,
          email: email,
          subdomain: subdomain,
          plan: plan,
          active: true,
        }),
      );
      navigate('/dashboard');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-flow-900 text-canvas font-sans flex flex-col justify-between selection:bg-gold selection:text-ink">
      {/* Header */}
      <header className="p-6 sm:p-10 flex items-center justify-between">
        <Link to="/flow" className="flex items-center gap-2.5">
          <img src={LogoWhite} alt="Cabmora Logo" className="h-8 w-auto object-contain" />
          <span className="text-[13px] tracking-[0.25em] font-semibold text-gold uppercase font-mono pl-2 border-l border-white/20">
            FLOW
          </span>
        </Link>
        <span className="text-xs uppercase font-mono text-gold bg-gold/10 px-3 py-1 rounded border border-gold/20">
          Token: {token.substring(0, 14)}...
        </span>
      </header>

      {/* Main Form Box */}
      <main className="max-w-[500px] w-full mx-auto px-6 py-10">
        <div className="bg-flow-900 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-emerald-400 block font-semibold">
                INVITATION VERIFIED
              </span>
              <h1 className="font-serif text-2xl text-white font-normal">
                Set Your Studio Password
              </h1>
            </div>
          </div>

          <div className="bg-flow-950 p-4 rounded-lg border border-white/5 mb-6 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-white/50">Studio Brand:</span>
              <span className="text-white font-medium">{studioName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Account Email:</span>
              <span className="text-white font-mono">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Trial Allocation:</span>
              <span className="text-gold font-semibold uppercase">{plan} (14 Days Free)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">
                Choose Studio Subdomain
              </label>
              <div className="flex items-center bg-flow-950 border border-white/15 rounded-lg overflow-hidden focus-within:border-gold">
                <span className="pl-3.5 pr-1 text-white/40">
                  <Globe size={15} />
                </span>
                <input
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) =>
                    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  className="w-full py-3 px-2 bg-transparent text-sm text-white focus:outline-none"
                />
                <span className="pr-3 text-xs text-white/40 font-mono">.cabmoraflow.com</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">
                Create Workspace Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full py-3 pl-4 pr-11 bg-flow-950 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-gold"
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

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full py-3 px-4 bg-flow-950 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gold hover:bg-gold-dark text-flow-900 font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Initializing Studio Workspace...</span>
                ) : (
                  <>
                    <span>Activate Workspace & Enter Dashboard</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-white/30 border-t border-white/5">
        © 2025 Cabmora Flow Studio Engine • Secure End-to-End Encryption
      </footer>
    </div>
  );
}
