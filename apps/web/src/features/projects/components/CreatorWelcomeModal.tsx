import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  CalendarClock,
  PhoneIncoming,
  ArrowRight,
  X,
  CloudSun,
  UserPlus,
  FileText,
  Check,
  Bot,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import type { CreatorBriefingDto } from '@cabmora/api-client';
import { CreatorAiAssistantPanel } from '@/features/projects/components/CreatorAiAssistantPanel';
import {
  PROJECT_WEATHER_FORECASTS,
  buildAiInvoiceDraft,
  ensureRichBriefing,
  getNewClientNotifications,
  getPendingMessages,
  getStudioCalls,
  saveStudioInvoice,
  updateStudioCallStatus,
} from '@/shared/collaboration/studioWorkspaceStore';

interface CreatorWelcomeModalProps {
  briefing: CreatorBriefingDto;
  open: boolean;
  onClose: () => void;
}

const KIND_STYLE: Record<string, { icon: typeof AlertCircle; badge: string; label: string }> = {
  call: {
    icon: PhoneIncoming,
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    label: 'Call Request',
  },
  revision: {
    icon: AlertCircle,
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    label: 'Revision',
  },
  deadline: {
    icon: CalendarClock,
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    label: 'Deadline',
  },
  task: {
    icon: CheckSquare,
    badge: 'bg-gold/15 text-gold border-gold/30',
    label: 'Task',
  },
  comment: {
    icon: MessageSquare,
    badge: 'bg-flow-sky/15 text-flow-sky border-flow-sky/30',
    label: 'Message',
  },
  client: {
    icon: UserPlus,
    badge: 'bg-gold/15 text-gold border-gold/30',
    label: 'New Client',
  },
};

export function CreatorWelcomeModal({ briefing, open, onClose }: CreatorWelcomeModalProps) {
  const richBriefing = ensureRichBriefing(briefing);
  const [showChat, setShowChat] = useState(false);
  const [calls, setCalls] = useState(() => getStudioCalls());
  const [newClients] = useState(() => getNewClientNotifications());
  const [messages] = useState(() => getPendingMessages());
  const [invoiceToast, setInvoiceToast] = useState<string | null>(null);

  if (!open) return null;

  const weather = PROJECT_WEATHER_FORECASTS[0]!;
  const primaryTaskUrl = richBriefing.action_items[0]?.url ?? '/projects';
  const pendingCalls = calls.filter((c) => c.status === 'pending');
  const unreadMessages = messages.filter((m) => m.unread);

  const handleQuickInvoice = (clientName: string, clientEmail: string, projectTitle: string, amount: number) => {
    const draft = buildAiInvoiceDraft({
      clientName,
      clientEmail,
      projectTitle,
      amount,
      includeDrone: true,
    });
    saveStudioInvoice(draft);
    setInvoiceToast(`Invoice ${draft.id} ($${draft.amount.toLocaleString()}) issued for ${clientName}`);
    window.setTimeout(() => setInvoiceToast(null), 3500);
  };

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="lg"
      tone="dark"
      chrome="none"
      title="Creator AI Daily Briefing"
    >
      <div className="bg-forest border border-gold/30 rounded-3xl overflow-hidden shadow-2xl text-canvas max-w-3xl w-full">
        {/* Clean Original Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-forest-dark via-forest to-forest-light border-b border-canvas/10 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Sleek Single-Line Next Project Weather Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-dark/80 border border-canvas/15 text-canvas/85 text-[11px] font-medium">
                <CloudSun size={13} className="text-gold" />
                <span>
                  Next Shoot ({weather.location.split(',')[0]}):{' '}
                  <strong className="text-gold">{weather.tempC}°C</strong> {weather.condition}
                </span>
              </span>
            </div>

            <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-white leading-snug">
              {richBriefing.headline}
            </h2>
            <p className="text-[13.5px] text-canvas/75 leading-relaxed">
              {richBriefing.summary_text}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close welcome briefing"
            className="p-2 rounded-xl text-canvas/50 hover:text-white hover:bg-canvas/10 transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Original 5-Column Live Metrics Strip with Mouse Pointer Hover */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-canvas/10 border-b border-canvas/10">
          {[
            {
              label: 'In Progress',
              value: richBriefing.projects_in_progress,
              icon: FolderKanban,
              to: '/projects',
            },
            {
              label: 'New Clients',
              value: newClients.length,
              icon: UserPlus,
              to: '/bookings',
            },
            {
              label: 'Revisions',
              value: richBriefing.revision_requests_count,
              icon: AlertCircle,
              to: '/projects/2',
            },
            {
              label: 'Messages',
              value: Math.max(unreadMessages.length, richBriefing.unread_comments_count),
              icon: MessageSquare,
              to: '/messages',
            },
            {
              label: 'Deadlines / Calls',
              value: richBriefing.upcoming_deadlines_count + pendingCalls.length,
              icon: CalendarClock,
              to: '/projects/1',
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
                  size={15}
                  className="text-gold mx-auto group-hover:scale-110 transition-transform"
                />
                <div className="font-serif text-[22px] font-bold text-white group-hover:text-gold transition-colors">
                  {stat.value}
                </div>
                <div className="text-[10.5px] uppercase tracking-wider text-canvas/55 group-hover:text-canvas/85 transition-colors">
                  {stat.label}
                </div>
              </Link>
            );
          })}
        </div>

        {invoiceToast && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 flex items-center justify-between text-[12px] text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <Check size={14} /> {invoiceToast}
            </span>
            <Link to="/billing" onClick={onClose} className="text-gold underline font-semibold">
              View in Billing →
            </Link>
          </div>
        )}

        {/* Body: Clean Unified Attention List OR Embedded AI Chat */}
        {showChat ? (
          <div className="p-5">
            <CreatorAiAssistantPanel briefing={richBriefing} compact />
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-3.5 max-h-[340px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
                Items Requiring Your Attention
              </div>
              <span className="text-[11px] text-canvas/50">
                Golden Hour {weather.goldenHour} • {weather.droneStatus}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* 1. Top New Client Notification Row with 1-Click AI Invoice */}
              {newClients[0] && (
                <div className="p-3.5 rounded-2xl bg-forest-light/50 hover:bg-forest-light border border-canvas/10 hover:border-gold/50 hover:-translate-y-0.5 transition-all flex items-center justify-between gap-4 cursor-pointer">
                  <Link
                    to="/bookings"
                    onClick={onClose}
                    className="flex items-start gap-3 min-w-0 flex-1"
                  >
                    <span className={`p-2 rounded-xl border shrink-0 mt-0.5 ${KIND_STYLE.client.badge}`}>
                      <UserPlus size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-white">
                          New Client: {newClients[0].clientName} (${newClients[0].packageAmount.toLocaleString()})
                        </span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-canvas/10 text-canvas/70">
                          {newClients[0].projectTitle}
                        </span>
                      </div>
                      <p className="text-[12px] text-canvas/60 truncate mt-0.5">
                        {newClients[0].location} • {newClients[0].shootDate}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickInvoice(
                        newClients[0]!.clientName,
                        newClients[0]!.clientEmail,
                        newClients[0]!.projectTitle,
                        Math.round(newClients[0]!.packageAmount / 2),
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-gold text-ink text-[11px] font-semibold hover:bg-gold-dark flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>Invoice</span>
                  </button>
                </div>
              )}

              {/* 2. Top Pending Call Row with Accept / Decline */}
              {pendingCalls[0] && (
                <div className="p-3.5 rounded-2xl bg-forest-light/50 hover:bg-forest-light border border-canvas/10 hover:border-gold/50 hover:-translate-y-0.5 transition-all flex items-center justify-between gap-4 cursor-pointer">
                  <Link
                    to={`/projects/${pendingCalls[0].project_id}`}
                    onClick={onClose}
                    className="flex items-start gap-3 min-w-0 flex-1"
                  >
                    <span className={`p-2 rounded-xl border shrink-0 mt-0.5 ${KIND_STYLE.call.badge}`}>
                      <PhoneIncoming size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-white">
                          Call Request: {pendingCalls[0].title}
                        </span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-canvas/10 text-canvas/70">
                          {pendingCalls[0].requester_name}
                        </span>
                      </div>
                      <p className="text-[12px] text-canvas/60 truncate mt-0.5">
                        {pendingCalls[0].project_title} • {pendingCalls[0].duration_minutes} mins
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCalls(updateStudioCallStatus(pendingCalls[0]!.id, 'accept'))}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      title="Accept Call"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalls(updateStudioCallStatus(pendingCalls[0]!.id, 'decline'))}
                      className="p-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                      title="Decline Call"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Standard Action Items (Messages, Revisions, Tasks) */}
              {richBriefing.action_items.slice(0, 3).map((item, idx) => {
                const style = KIND_STYLE[item.kind] ?? KIND_STYLE.task;
                const Icon = style.icon;
                return (
                  <Link
                    key={`${item.project_id}-${idx}`}
                    to={item.url}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl bg-forest-light/50 hover:bg-forest-light border border-canvas/10 hover:border-gold/50 hover:-translate-y-0.5 flex items-center justify-between gap-4 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.badge}`}>
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-white group-hover:text-gold transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-canvas/10 text-canvas/70">
                            {item.project_title}
                          </span>
                        </div>
                        <p className="text-[12px] text-canvas/60 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-canvas/40 group-hover:text-gold shrink-0 transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Original Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-forest-dark border-t border-canvas/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] text-canvas/60 hover:text-white transition-colors cursor-pointer"
          >
            Dismiss for now
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowChat((v) => !v)}
              className="px-4 py-2.5 rounded-xl border border-gold/40 text-[12.5px] font-medium text-gold hover:bg-gold/15 flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={14} />
              <span>{showChat ? 'Back to Briefing' : 'Ask AI Chat'}</span>
            </button>
            <Link
              to="/projects"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-canvas/15 text-[12.5px] font-medium text-canvas/85 hover:border-gold"
            >
              All Projects
            </Link>
            <Link
              to={primaryTaskUrl}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gold text-ink text-[12.5px] font-semibold hover:bg-gold-dark flex items-center gap-2 shadow-lg"
            >
              <span>View My Tasks</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
