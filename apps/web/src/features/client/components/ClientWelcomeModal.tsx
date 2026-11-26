import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FolderOpen,
  Images,
  CheckSquare,
  PhoneIncoming,
  ArrowRight,
  X,
  MapPin,
  Clock,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import type { ClientBriefingDto } from '@cabmora/api-client';
import { ClientAiAssistantPanel } from '@/features/client/components/ClientAiAssistantPanel';
import { formatLiveCountdown } from '@/shared/collaboration/studioWorkspaceStore';

interface ClientWelcomeModalProps {
  briefing: ClientBriefingDto;
  open: boolean;
  onClose: () => void;
}

export function ClientWelcomeModal({ briefing, open, onClose }: ClientWelcomeModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  if (!open) return null;

  const countdown = formatLiveCountdown(58, tick);

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="xl"
      tone="dark"
      chrome="none"
      title="Client AI Concierge Daily Briefing"
    >
      <div className="bg-forest border border-gold/30 rounded-3xl overflow-hidden shadow-2xl text-canvas max-w-4xl w-full">
        {/* Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-br from-forest-dark via-forest to-forest-light border-b border-canvas/10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.14em]">
                <Sparkles size={13} /> Client AI Concierge • Live Project Delivery & Countdown
              </span>
              <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-white leading-snug">
                {briefing.headline}
              </h2>
              <p className="text-[13px] text-canvas/75 leading-relaxed">{briefing.summary_text}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close client welcome briefing"
              className="p-2 rounded-xl text-canvas/50 hover:text-white hover:bg-canvas/10 transition-colors shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gold text-ink'
                  : 'bg-forest-dark/70 text-canvas/75 hover:text-white border border-canvas/10'
              }`}
            >
              <Sparkles size={13} />
              <span>Project Countdown, Venue Distance & Deliverables</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-gold text-ink'
                  : 'bg-forest-dark/70 text-canvas/75 hover:text-white border border-canvas/10'
              }`}
            >
              <Bot size={13} />
              <span>Chat with Client AI Concierge</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Client Metric Cards with Mouse Pointer Hover */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-canvas/10 border-b border-canvas/10">
          {[
            {
              label: 'Active Projects',
              value: briefing.active_projects_count,
              icon: FolderOpen,
              to: '/client/projects',
            },
            {
              label: 'Photos Ready',
              value: briefing.photos_ready_count,
              icon: Images,
              to: '/client/media',
            },
            {
              label: 'Pending Approvals',
              value: briefing.pending_approvals_count,
              icon: CheckSquare,
              to: '/client/projects?show=review',
            },
            {
              label: 'Upcoming Calls',
              value: briefing.upcoming_calls_count,
              icon: PhoneIncoming,
              to: '/client/messages',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.to}
                onClick={onClose}
                className="bg-forest-dark hover:bg-forest-light/80 hover:-translate-y-0.5 hover:shadow-lg p-4 text-center space-y-1 cursor-pointer transition-all duration-200 group border-b-2 border-transparent hover:border-gold"
              >
                <Icon
                  size={16}
                  className="text-gold mx-auto group-hover:scale-110 transition-transform"
                />
                <div className="font-serif text-[22px] font-bold text-white group-hover:text-gold transition-colors">
                  {stat.value}
                </div>
                <div className="text-[10.5px] uppercase tracking-wider text-canvas/60 group-hover:text-canvas/90">
                  {stat.label}
                </div>
              </Link>
            );
          })}
        </div>

        {activeTab === 'overview' ? (
          <div className="p-6 sm:p-7 space-y-5 max-h-[430px] overflow-y-auto">
            {/* Project Countdown, Venue Distance & Deadline Warning Strip */}
            <div className="rounded-2xl bg-forest-dark/90 border border-gold/35 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.14em] text-gold font-bold flex items-center gap-1.5">
                    <Clock size={13} /> Live Project Countdown & Venue Logistics
                  </div>
                  <h3 className="font-serif text-[19px] font-bold text-white mt-0.5">
                    {briefing.next_project_title}
                  </h3>
                  <div className="text-[12px] text-canvas/75 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={13} className="text-gold shrink-0" />
                    <span>
                      {briefing.next_project_venue} •{' '}
                      <strong className="text-emerald-400">
                        {briefing.venue_distance_km} km to reach venue
                      </strong>{' '}
                      ({briefing.venue_travel_time})
                    </span>
                  </div>
                </div>

                {/* Live Ticking Countdown */}
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Days', val: countdown.days },
                    { label: 'Hrs', val: countdown.hours },
                    { label: 'Mins', val: countdown.mins },
                    { label: 'Secs', val: countdown.secs },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="px-3 py-2 rounded-xl bg-forest border border-gold/40 text-center min-w-[54px]"
                    >
                      <div className="font-mono text-[18px] font-bold text-gold leading-none">
                        {unit.val}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-canvas/55 mt-1">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Deadline Warning */}
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-[12px] flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span className="font-medium">{briefing.deadline_warning}</span>
              </div>
            </div>

            {/* Client Priority Action Items */}
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                Items Waiting on Your Review
              </div>
              <div className="space-y-2">
                {briefing.action_items.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.url}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl bg-forest-light/50 hover:bg-forest-light border border-canvas/10 hover:border-gold hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-between gap-4 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-gold transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[12px] text-canvas/65 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-canvas/40 group-hover:text-gold shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <ClientAiAssistantPanel briefing={briefing} compact />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-forest-dark border-t border-canvas/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] text-canvas/60 hover:text-white transition-colors cursor-pointer"
          >
            Dismiss for now
          </button>
          <div className="flex items-center gap-3">
            <Link
              to="/client/community"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gold/40 text-[12.5px] font-medium text-gold hover:bg-gold/15"
            >
              Explore Creator Community
            </Link>
            <Link
              to="/client/projects"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gold text-ink text-[12.5px] font-semibold hover:bg-gold-dark flex items-center gap-2 shadow-lg"
            >
              <span>Open My Gallery</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
