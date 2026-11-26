import { useEffect, useState, type ReactNode } from 'react';
import { CreditCard as CardIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { ReportIssueButton } from '@/shared/account';
import { CLIENT_NAV, CLIENT_NAV_FOOTER, CLIENT_NAV_SECONDARY } from '@/shared/portal/data';
import { useAuth } from '@/shared/auth';
import { formatMinor } from '@cabmora/ui';
import { collaborationApi, type ClientBriefingDto } from '@cabmora/api-client';
import { ClientScreenSecurityShield } from '@/shared/collaboration/ClientScreenSecurityShield';
import { ensureRichClientBriefing } from '@/shared/collaboration/studioWorkspaceStore';
import { ClientWelcomeModal } from '@/features/client/components/ClientWelcomeModal';

import { getMyBillingSummary, type BillingSummary } from '@/features/client/api';

interface Props {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Chrome for the customer portal.
 *
 * The same `PortalShell` / `PortalSidebar` / `PortalTopbar` the creator portal
 * uses, so both sides share one off-canvas implementation, one hamburger, one
 * sign-out and one set of tokens. Two chrome styles in one product is a
 * maintenance cost paid forever for no benefit.
 *
 * `variant="light"` because it is already the client palette: a deep-teal
 * sidebar against the warm canvas, which is exactly what the client header
 * used before this moved into the shared shell.
 */
export function ClientPortalShell({ title, subtitle, children }: Props) {
  const { user } = useAuth();

  // Only somebody who has a creator studio is offered the way back into it.
  // A customer seeing the link would either bounce off the route guard or —
  // worse, before that guard existed — land in a portal full of storage plans
  // and a media library that are not theirs.
  const canCrossOver = user?.role === 'creator' || user?.role === 'admin';

  // Fetched here because the figure belongs to the chrome, not to any one
  // screen. A failure leaves it absent rather than showing a wrong number.
  const [balance, setBalance] = useState<BillingSummary | null>(null);
  const [clientBriefing, setClientBriefing] = useState<ClientBriefingDto>(() =>
    ensureRichClientBriefing(null, user?.first_name),
  );
  const [isClientWelcomeOpen, setIsClientWelcomeOpen] = useState(false);

  useEffect(() => {
    let active = true;
    collaborationApi
      .getClientBriefing()
      .then((data) => {
        if (!active) return;
        setClientBriefing(ensureRichClientBriefing(data, user?.first_name));
        if (!window.sessionStorage.getItem('cabmora_client_briefing_seen_v1')) {
          setIsClientWelcomeOpen(true);
          window.sessionStorage.setItem('cabmora_client_briefing_seen_v1', '1');
        }
      })
      .catch(() => {
        if (!active) return;
        setClientBriefing(ensureRichClientBriefing(null, user?.first_name));
        if (!window.sessionStorage.getItem('cabmora_client_briefing_seen_v1')) {
          setIsClientWelcomeOpen(true);
          window.sessionStorage.setItem('cabmora_client_briefing_seen_v1', '1');
        }
      });
    return () => {
      active = false;
    };
  }, [user?.first_name]);

  useEffect(() => {
    if (user?.role !== 'customer') return;
    let cancelled = false;
    getMyBillingSummary()
      .then((summary) => !cancelled && setBalance(summary))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((part) => part![0]!.toUpperCase())
      .join('') || '?';

  return (
    <PortalShell
      variant="light"
      nav={{
        items: CLIENT_NAV,
        secondary: canCrossOver ? CLIENT_NAV_SECONDARY : [],
        footer: CLIENT_NAV_FOOTER,
      }}
    >
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar title={title} subtitle={subtitle} onToggleSidebar={toggleSidebar}>
            {/* Their real balance, totalled by the API. This was the
                designer's fixture for a long time — the same figure for every
                client, on a button that did nothing — which is worse than no
                button, because it is the number somebody plans around.
                Absent entirely when nothing is owed rather than showing a
                cheerful zero. */}
            {/* Customers only. For a creator the same endpoint scopes to
                invoices *they* issued, so this was labelling money owed to
                them as money they owe — and linking to a page to pay it. */}
            {user?.role === 'customer' && balance !== null && balance.outstanding_minor > 0 && (
              <Link
                to="/client/billing"
                className="hidden md:flex items-center gap-2 bg-gold text-ink px-4 py-2 rounded-full text-[12px] font-medium hover:bg-gold-dark transition-colors"
              >
                <CardIcon size={14} />
                Pay balance ({formatMinor(balance.outstanding_minor, balance.currency)})
              </Link>
            )}

            {/* Hidden on the narrowest screens: the balance and the avatar
                are what a cramped header must keep. It is also in Settings
                under Help & Support, so it is never the only way through. */}
            <button
              type="button"
              onClick={() => setIsClientWelcomeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-[12px] font-semibold hover:bg-gold/25 transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              <span>AI Client Briefing</span>
            </button>

            <ReportIssueButton className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-medium text-ink/55 hover:text-ink transition-colors" />

            <PortalBell />

            {/* Their own picture when they have uploaded one, initials
                otherwise. The monogram used to be the only option because the
                API had no avatar; it does now, and inventing a stock face for
                a real client would still be worse than a monogram. */}
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                aria-hidden
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                aria-hidden
                className="w-9 h-9 rounded-full bg-forest text-canvas flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              >
                {initials}
              </div>
            )}
          </PortalTopbar>

          <main className="flex-1 overflow-y-auto">
            <ClientScreenSecurityShield
              clientLabel={
                user?.first_name ? `${user.first_name}'s Client Account` : 'Protected Client Account'
              }
            >
              <div className="p-6 lg:p-10">
                <div className="max-w-[1200px] mx-auto">{children}</div>
              </div>
            </ClientScreenSecurityShield>
          </main>

          <ClientWelcomeModal
            briefing={clientBriefing}
            open={isClientWelcomeOpen}
            onClose={() => setIsClientWelcomeOpen(false)}
          />
        </>
      )}
    </PortalShell>
  );
}
