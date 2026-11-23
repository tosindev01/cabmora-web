import { Link } from 'react-router-dom';
import {
  Sparkles,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  CalendarClock,
  PhoneIncoming,
  ArrowRight,
  X,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import type { CreatorBriefingDto } from '@cabmora/api-client';

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
    label: 'Comment',
  },
};

export function CreatorWelcomeModal({ briefing, open, onClose }: CreatorWelcomeModalProps) {
  if (!open) return null;

  const primaryTaskUrl = briefing.action_items[0]?.url ?? '/projects';

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
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-forest-dark via-forest to-forest-light border-b border-canvas/10 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.14em]">
              <Sparkles size={13} /> AI Studio Briefing • Live Workspace Data
            </span>
            <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-white leading-snug">
              {briefing.headline}
            </h2>
            <p className="text-[13.5px] text-canvas/75 leading-relaxed">{briefing.summary_text}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close welcome briefing"
            className="p-2 rounded-xl text-canvas/50 hover:text-white hover:bg-canvas/10 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-canvas/10 border-b border-canvas/10">
          {[
            {
              label: 'In Progress',
              value: briefing.projects_in_progress,
              icon: FolderKanban,
              to: '/projects',
            },
            {
              label: 'Pending Tasks',
              value: briefing.pending_tasks_count,
              icon: CheckSquare,
              to: briefing.action_items[0]?.url ?? '/projects',
            },
            {
              label: 'Revisions',
              value: briefing.revision_requests_count,
              icon: AlertCircle,
              to:
                briefing.action_items.find((i) => i.kind === 'revision')?.url ?? '/projects',
            },
            {
              label: 'Design Comments',
              value: briefing.unread_comments_count,
              icon: MessageSquare,
              to:
                briefing.action_items.find((i) => i.kind === 'comment')?.url ?? '/projects',
            },
            {
              label: 'Deadlines / Calls',
              value: briefing.upcoming_deadlines_count + briefing.pending_calls_count,
              icon: CalendarClock,
              to:
                briefing.action_items.find(
                  (i) => i.kind === 'deadline' || i.kind === 'call',
                )?.url ?? '/projects',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.to}
                onClick={onClose}
                className="bg-forest-dark hover:bg-forest-light/70 p-4 text-center space-y-1 cursor-pointer transition-colors group"
              >
                <Icon size={15} className="text-gold mx-auto group-hover:scale-110 transition-transform" />
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

        {/* Prioritised Action Items */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[340px] overflow-y-auto">
          <div className="text-[11px] uppercase tracking-[0.14em] text-gold font-bold">
            Items Requiring Your Attention
          </div>

          {briefing.action_items.length === 0 ? (
            <div className="p-6 rounded-2xl bg-forest-light/40 border border-canvas/10 text-center text-[13px] text-canvas/60">
              No urgent tasks, revisions, or pending calls right now.
            </div>
          ) : (
            <div className="space-y-2.5">
              {briefing.action_items.map((item, idx) => {
                const style = KIND_STYLE[item.kind] ?? KIND_STYLE.task;
                const Icon = style.icon;
                return (
                  <Link
                    key={`${item.project_id}-${idx}`}
                    to={item.url}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl bg-forest-light/50 hover:bg-forest-light border border-canvas/10 hover:border-gold/50 flex items-center justify-between gap-4 transition-all group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.badge}`}
                      >
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-forest-dark border-t border-canvas/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] text-canvas/60 hover:text-white transition-colors"
          >
            Dismiss for now
          </button>

          <div className="flex items-center gap-3">
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
