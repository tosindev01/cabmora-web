import { Clock, LogOut, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/shared/auth';

/**
 * Shown in place of the portal while a creator application is being reviewed.
 *
 * Rendered from `ProtectedRoute`, so it covers every protected route at once —
 * a per-page check is something a newly added screen can forget.
 *
 * This is the courteous version of the gate, not the enforcing one. The API
 * refuses pending accounts through `CurrentActiveUserDep`; a div does not
 * survive curl.
 */
export function PendingApproval() {
  const { user, logout } = useAuth();
  // Every account is reviewed now, customers included, so the copy cannot
  // assume a creator application.
  const isCreator = user?.role === 'creator';

  return (
    <div className="min-h-screen bg-noir text-canvas flex items-center justify-center px-6 py-16">
      <div className="max-w-[520px] w-full text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-8">
          <Clock size={30} strokeWidth={1.5} />
        </div>

        <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium block mb-4">
          {isCreator ? 'Application Under Review' : 'Account Under Review'}
        </span>
        <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-tight mb-4">
          Welcome, {user?.first_name}
        </h1>
        <p className="text-canvas/55 text-[15px] font-light leading-[1.7] mb-10">
          Your creator studio application is with our team. Once it is approved your dashboard,
          galleries and storage will unlock automatically. There is nothing else for you to do.
        </p>

        <div className="bg-canvas/5 border border-canvas/10 p-6 text-left space-y-3 mb-10">
          <div className="flex items-center gap-3 text-[13px] text-canvas/70 font-light">
            <Mail size={16} className="text-gold flex-shrink-0" strokeWidth={1.5} />
            <span>
              We will write to <strong className="text-canvas font-medium">{user?.email}</strong>{' '}
              when a decision is made.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="text-[11px] tracking-[0.15em] uppercase text-canvas/60 hover:text-gold transition-colors duration-300 font-semibold"
          >
            Back to site
          </Link>
          <span className="hidden sm:block w-px h-4 bg-canvas/15" />
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-canvas/60 hover:text-gold transition-colors duration-300 font-semibold cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
