import { useEffect, useState, type FormEvent } from 'react';
import {
  Gift,
  Copy,
  Check,
  Sparkles,
  UserPlus,
  HardDrive,
  DollarSign,
  TrendingUp,
  Send,
  Award,
  QrCode,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { useAuth } from '@/shared/auth';
import {
  collaborationApi,
  type CreatorReferralSummaryDto,
} from '@cabmora/api-client';
import {
  STUDIO_WORKSPACE_EVENT,
  addCreatorReferralInvite,
  getCreatorReferralSummary,
} from '@/shared/collaboration/studioWorkspaceStore';

export default function CreatorReferralsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CreatorReferralSummaryDto>(() =>
    getCreatorReferralSummary(user?.first_name),
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'creator' | 'client'>('creator');
  const [personalNote, setPersonalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    collaborationApi
      .getMyCreatorReferrals()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        if (active) setSummary(getCreatorReferralSummary(user?.first_name));
      });

    const handleSync = () => setSummary(getCreatorReferralSummary(user?.first_name));
    window.addEventListener(STUDIO_WORKSPACE_EVENT, handleSync);

    return () => {
      active = false;
      window.removeEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    };
  }, [user?.first_name]);

  const handleCopy = (text: string, mode: 'code' | 'link') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }
    if (mode === 'code') {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || submitting) return;
    setSubmitting(true);
    try {
      const updated = await addCreatorReferralInvite({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        personalNote: personalNote.trim(),
        firstName: user?.first_name,
      });
      setSummary(updated);
      setInviteSuccess(
        `Referral invitation sent to ${inviteName.trim()} (${inviteEmail.trim()})!`,
      );
      setInviteName('');
      setInviteEmail('');
      setPersonalNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar
            title="Creator Referral Program & Rewards"
            subtitle="Invite fellow photographers, videographers, and luxury clients to earn studio payouts & Cloud Vault storage"
            icon={Gift}
            onToggleSidebar={toggleSidebar}
          >
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1240px] mx-auto space-y-8">
              {/* Hero Referral Banner */}
              <div className="bg-forest text-canvas border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.14em]">
                      <Award size={13} /> {summary.tier}
                    </span>
                    <h2 className="font-serif text-[26px] sm:text-[32px] font-bold text-white leading-snug">
                      Earn $350 + 250 GB Cloud Vault for Every Referred Creator or Client
                    </h2>
                    <p className="text-[14px] text-canvas/75 leading-relaxed">
                      Grow the Cabmora creative network. When a photographer, videographer, or brand
                      client books their first studio project using your referral link, you both
                      unlock cash payouts and permanent NVMe Cloud Vault upgrades.
                    </p>
                  </div>

                  {/* Ambassador Tier Progress Card */}
                  <div className="bg-forest-dark/90 border border-gold/30 rounded-2xl p-5 min-w-[280px] space-y-3 cursor-pointer hover:-translate-y-0.5 hover:border-gold transition-all">
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-gold font-bold uppercase tracking-wider">
                        Next Tier Milestone
                      </span>
                      <span className="text-white font-semibold">
                        {summary.tier_progress_percent}%
                      </span>
                    </div>
                    <div className="font-serif text-[17px] font-bold text-white">
                      {summary.next_tier}
                    </div>
                    <div className="w-full h-2 bg-forest rounded-full overflow-hidden border border-canvas/10">
                      <div
                        className="h-full bg-gold transition-all duration-500"
                        style={{ width: `${summary.tier_progress_percent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-canvas/60">
                      1 more active creator referral unlocks 0% platform commission for 6 months.
                    </div>
                  </div>
                </div>

                {/* Copy Referral Code & Link Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                  <div className="lg:col-span-4 bg-forest-dark border border-canvas/15 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-canvas/55">
                        Your VIP Referral Code
                      </div>
                      <div className="font-mono text-[16px] font-bold text-gold truncate mt-0.5">
                        {summary.referral_code}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(summary.referral_code, 'code')}
                      className="px-3.5 py-2 rounded-xl bg-forest-light hover:bg-gold hover:text-ink text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-forest-dark border border-canvas/15 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-canvas/55">
                        Direct Studio Referral Link
                      </div>
                      <div className="text-[13px] font-medium text-white truncate mt-0.5">
                        {summary.referral_link}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(summary.referral_link, 'link')}
                      className="px-4 py-2 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <div className="lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="w-full h-full min-h-[58px] rounded-2xl bg-forest-light/80 hover:bg-gold hover:text-ink border border-gold/30 text-gold font-semibold text-[12.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <QrCode size={16} />
                      <span>Referral QR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Interactive Referral Metric Cards with Mouse Pointer Hover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 border border-ink/10 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 hover:border-gold hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink/50 font-semibold">
                      Total Referral Earnings
                    </span>
                    <DollarSign size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-bold text-ink">
                    ${summary.total_earnings.toLocaleString()}
                  </div>
                  <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp size={13} /> +{summary.referrals.length} referred studios & clients
                  </div>
                </div>

                <div className="bg-white p-6 border border-ink/10 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 hover:border-gold hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink/50 font-semibold">
                      Pending Reward Payouts
                    </span>
                    <Gift size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-bold text-ink">
                    ${summary.pending_payouts.toLocaleString()}
                  </div>
                  <div className="text-[12px] text-ink/55 mt-1">
                    Auto-released with next studio payout
                  </div>
                </div>

                <div className="bg-white p-6 border border-ink/10 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 hover:border-gold hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink/50 font-semibold">
                      Bonus Vault Storage Earned
                    </span>
                    <HardDrive size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-bold text-ink">
                    +{summary.bonus_storage_gb.toLocaleString()} GB
                  </div>
                  <div className="text-[12px] text-emerald-600 mt-1">
                    Permanent High-Speed NVMe Allocation
                  </div>
                </div>

                <div className="bg-white p-6 border border-ink/10 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 hover:border-gold hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink/50 font-semibold">
                      Invite Conversion Rate
                    </span>
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div className="font-serif text-[32px] font-bold text-ink">
                    {summary.conversion_rate}%
                  </div>
                  <div className="text-[12px] text-ink/55 mt-1">Top 5% of Cabmora Partners</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left 5 Columns: Send Direct Referral Invitation Form */}
                <div className="xl:col-span-5 bg-white border border-ink/10 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold flex items-center gap-1.5">
                      <UserPlus size={14} /> Send VIP Referral Invitation
                    </div>
                    <h3 className="font-serif text-[22px] font-semibold mt-0.5">
                      Invite a Creator or Client
                    </h3>
                    <p className="text-[12.5px] text-ink/60">
                      We will send a personalized studio invitation carrying your VIP referral code.
                    </p>
                  </div>

                  {inviteSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[12.5px] flex items-center gap-2">
                      <Check size={15} />
                      <span>{inviteSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setInviteRole('creator')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          inviteRole === 'creator'
                            ? 'bg-forest text-canvas border-gold shadow-sm'
                            : 'bg-canvas border-ink/10 text-ink/70 hover:border-gold'
                        }`}
                      >
                        <div className="text-[12.5px] font-semibold">Partner Creator</div>
                        <div className="text-[10.5px] opacity-75">
                          Earn $350 + 250 GB Vault
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInviteRole('client')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          inviteRole === 'client'
                            ? 'bg-forest text-canvas border-gold shadow-sm'
                            : 'bg-canvas border-ink/10 text-ink/70 hover:border-gold'
                        }`}
                      >
                        <div className="text-[12.5px] font-semibold">Luxury Client</div>
                        <div className="text-[10.5px] opacity-75">
                          0% Fee + $250 Print Credit
                        </div>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                        Recipient Name or Studio
                      </label>
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="e.g., Atelier Lumière or Sophia Laurent"
                        className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="studio@example.com"
                        className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                        Personal Note (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        placeholder="Add a personal note with your studio invitation..."
                        className="w-full border border-ink/15 rounded-xl p-3 text-[13px] outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send size={15} />
                      <span>{submitting ? 'Sending Invitation…' : 'Send Referral Invitation'}</span>
                    </button>
                  </form>
                </div>

                {/* Right 7 Columns: Referral History & Rewards Ledger */}
                <div className="xl:col-span-7 bg-white border border-ink/10 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-4">
                    <div>
                      <h3 className="font-serif text-[22px] font-semibold">
                        Referred Creators & Clients ({summary.referrals.length})
                      </h3>
                      <p className="text-[12.5px] text-ink/60">
                        Real-time tracking of your invitations, studio onboardings, and reward
                        payouts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {summary.referrals.map((ref) => (
                      <div
                        key={ref.id}
                        className="p-4 rounded-xl border border-ink/10 bg-canvas hover:border-gold hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[14.5px] text-ink">
                              {ref.referred_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-ink text-[10px] font-bold uppercase tracking-wider">
                              {ref.role === 'creator' ? 'Partner Creator' : 'Studio Client'}
                            </span>
                          </div>
                          <div className="text-[12px] text-ink/55">
                            {ref.referred_email} • Referred {ref.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-serif text-[17px] font-bold text-ink">
                              +${ref.reward_amount.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-gold font-semibold">
                              +{ref.bonus_storage_gb} GB Vault
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              ref.status === 'Reward Paid'
                                ? 'bg-emerald-500/15 text-emerald-700'
                                : ref.status === 'First Project Booked'
                                  ? 'bg-gold/20 text-ink'
                                  : 'bg-sand text-ink/70 border border-ink/10'
                            }`}
                          >
                            {ref.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Referral QR Code Share Modal */}
          {isQrModalOpen && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsQrModalOpen(false);
              }}
              size="sm"
              title="Your Creator Referral QR Pass"
            >
              <div className="text-center space-y-4">
                <p className="text-[13px] text-ink/65">
                  Have fellow creators or clients scan this QR pass on set to join Cabmora with your
                  VIP referral code (<strong className="text-ink">{summary.referral_code}</strong>).
                </p>
                <div className="p-5 bg-forest text-canvas rounded-2xl inline-flex flex-col items-center gap-3 border border-gold/40">
                  <div className="p-3 bg-white rounded-xl">
                    <QrCode size={132} className="text-ink" />
                  </div>
                  <div className="font-mono text-[13px] font-bold text-gold">
                    {summary.referral_code}
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </PortalShell>
  );
}
